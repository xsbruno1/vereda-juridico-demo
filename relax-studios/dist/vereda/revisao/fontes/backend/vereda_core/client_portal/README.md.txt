# Núcleo do portal — referência local, 25/10/2026

Esta pasta implementa regras executáveis para a futura área de clientes e pacientes. **Não é um serviço de produção.** Não abre portas, não recebe dados da internet, não cria contas reais, não faz cobranças e não altera a nuvem. As telas públicas são demonstrações independentes com dados fictícios.

## Experiência que estas regras sustentam

- O cliente entra com a própria identidade e acessa somente os registros liberados do seu atendimento. Um identificador adivinhado não dá acesso a outro paciente ou negócio.
- O proprietário com MFA pode emitir convite de ativação para um vínculo de cliente previamente provisionado e ainda inativo. Ele expira em até 48 horas, vale uma vez e só pode ser aceito pelo destinatário autenticado esperado, no negócio correto. Reemitir invalida o convite anterior. Não cria senhas, não concede papel de equipe e não envia e-mail automaticamente; o provedor real de identidade e o canal de entrega ainda precisam ser conectados.
- Recepção organiza dados administrativos. Financeiro emite ordens de cobrança. Esses papéis e o proprietário do negócio não recebem acesso clínico automático.
- Profissionais acessam as pessoas às quais estão vinculados, apenas na sua alçada clínica ou jurídica. O vínculo e a situação ativa são conferidos em cada operação. Revogar a atribuição ou a participação retira o acesso sem depender de um novo login.
- Registros clínicos e jurídicos exigem revisão de um profissional autorizado para aparecerem no portal. Essa apresentação não restringe o direito do titular: `request_complete_copy` permite solicitar a cópia integral, inclusive antes da liberação de um resumo. A entrega completa, eventuais exceções e a proteção de terceiros dependem do controlador e de conferência de identidade.
- Compartilhamento é específico para um registro, um destinatário autenticado, uma ação e uma validade de até 24 horas. Pode ser revogado. Possuir o link sozinho não é suficiente; o token não fica em texto aberto na base.
- Cada autorização ou recusa de uma operação conhecida deixa um evento com identificadores e resultado. O log não inclui sintomas, receitas, anotações, contatos, credenciais nem o conteúdo do documento.

## Arquivos e fronteiras

| Arquivo | Responsabilidade |
| --- | --- |
| `core.py` | Identidade fornecida por adaptador confiável, convite de ativação, vínculos vivos, alçada por categoria, registros cifrados, liberação, solicitação de cópia, compartilhamento e auditoria |
| `payments.py` | Contrato de gateway, ordens emitidas no servidor, checkout idempotente, validação de eventos, recusa de regressão de estado e conciliação de casos ambíguos |
| `tests/test_client_portal.py`, na raiz do projeto | Verificador e gateway fictícios exclusivos de teste; testes adversariais do domínio |

`IdentityVerifier.verify` é uma fronteira de confiança, não uma implementação de login. O adaptador real deve verificar assinatura, emissor, destinatário, validade, sessão revogada e a condição não anônima da conta. Os valores recebidos em JSON, parâmetros de URL, armazenamento do navegador ou metadados editáveis pelo usuário não podem criar uma `Identity`. Os papéis são lidos da base, não do pedido do cliente. Operações da equipe exigem `aal2`.

O repositório SQLite é uma referência para testes locais. Não foi construído como banco distribuído ou prova de isolamento de um serviço hospedado. O isolamento testado aqui é o do domínio Python. Nenhuma nova política RLS foi implantada ou validada na conta de nuvem. O desenho de armazenamento definitivo deve acrescentar políticas por organização **e** titular, autorizações para objetos e testes de ponta a ponta com identidades reais de teste.

## Proteção dos registros

O conteúdo usa AES-256-GCM com nonce aleatório de 96 bits e dados autenticados que vinculam organização, titular, registro, categoria e versão da chave. Trocar o conteúdo cifrado entre registros falha na verificação de integridade. A chave deve ser fornecida por um resolvedor externo; não há chave padrão nem geração silenciosa para dados persistentes. A chave de cada organização precisa ter gestão, rotação, recuperação e limites de uso definidos em um cofre gerenciado. Os testes usam chaves artificiais, sem valor de produção.

Identificadores, relações e eventos administrativos permanecem como metadados da base; cifrar o conteúdo não torna a base anônima. O disco, as cópias, o trânsito, o armazenamento de objetos e a observabilidade exigem proteção própria. A trilha local impede atualização/exclusão pelas operações normais do módulo; um administrador que controla o arquivo ainda pode alterá-lo. Produção precisa de trilha externa com retenção e integridade verificável.

Os registros administrativos têm lista de campos permitidos e não aceitam campos livres de diagnóstico, medicamentos ou relato clínico. Essa validação estrutural não identifica semanticamente todo dado sensível colocado indevidamente em um campo permitido. O serviço que classifica e encaminha os dados continua responsável pela minimização. O módulo não envia dados clínicos à IA, ao marketing ou a farmácias.

Não há upload nem download de anexos reais. Para implantá-los: armazenamento privado, verificação de autorização na entrega, quarentena e varredura de arquivos, tipo/tamanho validados, resposta sem cache público e URLs de curta duração. Revogar uma autorização não recupera uma cópia que o destinatário já tenha baixado.

## Pagamentos: o que está preparado

1. Um responsável financeiro autorizado emite uma ordem imutável em centavos de real. O navegador não escolhe o valor a pagar.
2. O titular solicita checkout para a sua ordem. A associação do negócio à conta do provedor vem da configuração do servidor.
3. A intenção é gravada antes da chamada externa. Repetições e pedidos simultâneos retornam a mesma intenção; o identificador enviado ao provedor também é estável.
4. O adaptador recebe apenas conta, valor, moeda e chave de repetição. Não recebe prontuário, diagnóstico, exame, CPF, e-mail ou dados de cartão deste módulo. A página de pagamento é do provedor e precisa usar um endereço HTTPS permitido na configuração.
5. Cada evento precisa da verificação oficial de assinatura e validade pelo adaptador. A intenção, conta, negócio, valor e moeda devem coincidir. A identidade da conta recebedora deve vir de evidência autenticada do provedor, nunca ser copiada do endereço de recebimento: uma chave de assinatura compartilhada de plataforma não distingue lojistas sozinha. Eventos repetidos não alteram a cobrança duas vezes e falhas tardias não desfazem um pagamento liquidado.
6. Timeout ou resultado desconhecido não dispara nova cobrança. Uma devolução recebida antes do pagamento, ou um pagamento recebido depois de falha/cancelamento terminal, exige conciliação. O trabalhador de conciliação e a consulta autenticada ao provedor ainda não estão implementados. Até lá, a intenção permanece sinalizada e não deve autorizar entrega de serviço automaticamente.

`verify_reference_hmac` demonstra e testa uma assinatura HMAC sobre corpo bruto e horário, com janela máxima de cinco minutos. **Não é o contrato de assinatura de Asaas, Stripe, Mercado Pago ou qualquer gateway real.** Cada adaptador futuro deve seguir a documentação oficial do respectivo provedor e ter seus próprios testes com eventos reais do ambiente de testes. `FixtureGateway` existe apenas em testes. Sem adaptador e vínculo explicitamente instalados no servidor, a operação falha fechada com `GatewayDisabled`.

Não foi conectado gateway, cobrado cartão/Pix, criado recebedor, cadastrado webhook ou contratado serviço. Split, estorno parcial, parcelamento, emissão fiscal, contestação, taxas, assinatura recorrente e conciliação bancária não estão implementados. Checkout hospedado reduz o contato com dados de cartão, mas não substitui a avaliação das obrigações aplicáveis ao comerciante.

## Verificação local

```text
python -m unittest discover -s tests -p test_client_portal.py -v
```

44 testes passaram nesta entrega: titular errado, negócio errado, recepção/financeiro sem acesso clínico, profissional sem atribuição, revogação, MFA, sessão inválida, cifragem vinculada ao registro, auditoria sem conteúdo, cópia integral, destinatário/ação/expiração/revogação de compartilhamento, convite restrito e de uso único, reemissão invalidando convite anterior, preço confiável, pedido repetido e simultâneo, timeout, endereço de checkout não permitido, assinatura inválida/antiga, valor ou conta divergente, repetição entre lojistas com chave compartilhada, evento duplicado, regressão, estorno fora de ordem, pagamento antigo após falha nova e colisão de identificador de evento.

## Antes de dados reais

Implantar e testar login, recuperação segura de conta, MFA da equipe, gestão de sessões e convites, papéis e vínculos, proteção de transporte e de objetos, proteção contra abuso, isolamento no banco definitivo, filas persistentes, retenção e descarte, registro de bases legais/finalidades, atendimento aos direitos do titular, cópias externas e restauração ensaiada. A base legal para atendimento e prontuário não pode ser substituída por um único consentimento genérico; marketing e compartilhamentos opcionais precisam de tratamento separado. A classificação final depende da operação e da análise jurídica/ética do cliente.

Definir responsáveis por incidentes e resposta a indisponibilidade; testar recuperação e revogação entre aparelhos; revisar dependências e realizar avaliação independente antes do aceite. Não prometer segurança absoluta, prontuário certificado, disponibilidade contínua, conformidade integral ou RLS comprovado em nuvem com base nestes testes locais.

## Referências técnicas consultadas

- [OWASP — autorização e verificação por requisição](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- [OWASP — autorização de transações](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html).
- [Cryptography — cifragem autenticada e dados associados](https://cryptography.io/en/latest/hazmat/primitives/aead/). O projeto mantém a dependência existente `cryptography==50.0.2`; não houve atualização de pacotes nesta entrega.

Estas referências orientam o desenho. Não representam certificação ou auditoria externa do código.
