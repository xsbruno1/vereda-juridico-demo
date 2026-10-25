SALA DE ATENDIMENTO — REFERÊNCIA LOCAL DO DOMÍNIO
Atualização: 25/10/2026

O módulo consultation.py acrescenta regras executáveis ao núcleo existente do portal.
É uma referência local testada, não um serviço de teleconsulta em produção. A tela
pública demonstra a experiência separadamente, com dados fictícios. Este módulo não
abre servidor, autentica usuários, recebe arquivos, acessa câmera ou microfone, envia
mensagens pela rede nem conecta um provedor de vídeo.

COMO FUNCIONA

O profissional autorizado cria uma sala clínica ou jurídica para um titular ativo ao
qual está vinculado. A sala inclui explicitamente esse profissional e o próprio
paciente/cliente. Profissionais adicionais precisam ser incluídos pelo responsável e
ter vínculo com o mesmo titular, na categoria correta. Não existe entrada automática
para todos os funcionários. Recepção, financeiro e proprietário do negócio não ganham
acesso ao conteúdo clínico/jurídico por serem funcionários ou administradores.

Cada leitura, envio, abertura de documento e solicitação de entrada em vídeo verifica
novamente identidade, expiração, sala ativa, participante ativo, titular ativo, vínculo
e categoria. Profissionais precisam de autenticação com segundo fator. Pacientes
acessam somente a própria sala. O verificador de identidade continua sendo o contrato
confiável de core.py; valores enviados pelo navegador não podem construir identidade
ou conceder papéis. Uma sala dura até oito horas e o responsável pode encerrá-la.

Revogar um participante bloqueia leituras e novos envios, inclusive a repetição de um
pedido anteriormente aceito. A mesma participação revogada não é reativada por uma
inclusão repetida. Salas encerradas ou expiradas também bloqueiam as operações desta
interface. Os registros não são apagados automaticamente: conservação, acesso posterior
ao histórico e atendimento aos direitos do titular devem usar uma política e uma
interface próprias, ainda não implementadas neste módulo.

MENSAGENS

O texto tem limite de 2.000 caracteres e 8.000 bytes. Há limite local de trinta novas
mensagens por minuto, por participante e sala. Repetir a mesma chave de envio com o
mesmo texto retorna a mensagem existente; alterar o texto sob essa chave é recusado.
Envios simultâneos equivalentes geram uma mensagem e um evento pendente apenas.

O corpo usa AES-256-GCM com nonce aleatório e chaves externas ao banco, pela mesma
fronteira Store.cipher dos registros. A autenticação do conteúdo inclui organização,
sala, mensagem, remetente, chave de repetição, data e versão da chave. Trocar conteúdo
cifrado ou metadados entre mensagens falha na verificação. O texto não entra no log,
na fila de avisos, em marketing ou em IA. Não há diagnóstico, resumo ou resposta
automática, nem análise clínica do texto.

O retorno da API de domínio é texto puro. A tela deve inserir o valor com textContent;
nunca com innerHTML. A função render_message_text faz escape para eventual HTML
renderizado no servidor. Ela não é um sanitizador de HTML arbitrário: rich text e
HTML enviado pelo cliente não são suportados.

A mensagem e seu evento pendente são persistidos na mesma transação. A fila contém
somente identificadores, não o conteúdo. Um futuro distribuidor de eventos deverá
rever o vínculo de cada destinatário antes da entrega e não poderá enviar conteúdo
sensível em notificações externas. Distribuição em tempo real, confirmação de entrega,
reprocessamento, filas compartilhadas, proteção distribuída contra abuso e acesso por
vários servidores não fazem parte deste módulo. A limitação atual é local à base.

DOCUMENTOS

O compartilhamento é uma referência ao registro já existente, liberado, do mesmo
titular e categoria da sala. Não se copia o documento para chat e não se cria URL
pública. O paciente pode compartilhar um registro liberado ao qual já tem acesso;
isso não transforma um arquivo recebido em registro clínico validado.

Toda abertura confere de novo a participação, o vínculo do profissional ou identidade
do titular, a categoria, a liberação do registro e a revogação do compartilhamento da
sala. Revogar a referência impede novas aberturas por essa referência. Retirar a
liberação do registro também bloqueia sua abertura pela sala, mesmo para a equipe.
Não se recupera conteúdo que um destinatário já viu ou copiou.

Uploads, armazenamento de objetos, quarentena, análise de arquivos, nomes/tamanhos/
tipos permitidos, download privado, acessibilidade de PDFs e visualizador ainda
precisam de implementação e testes próprios. A sala não concede acesso automático a
anotações internas ou ao prontuário completo. O direito de solicitar cópia permanece
atendido pela fronteira existente do portal e pelo fluxo do controlador.

VÍDEO: CONTRATO DE INTEGRAÇÃO, DESABILITADO POR PADRÃO

join_video só funciona se o servidor fornecer VideoProvider e binding_resolver. A
configuração resolve organização + sala local para uma sala externa e provedor
previamente autorizados. O navegador não fornece o endereço externo ou a sala de
destino na solicitação de entrada. Falta de configuração resulta em VideoDisabled.

O adaptador recebe somente sala externa, identificador aleatório de participante
daquela sala, papel de anfitrião/participante e validade máxima de 120 segundos,
limitada também pela sessão e participação. Não recebe nome, prontuário, diagnóstico,
documento, e-mail ou conversa. Identificadores ainda são metadados pessoais e precisam
de tratamento adequado; minimizar conteúdo não torna a operação anônima.

JoinGrant representa uma credencial opaca do provedor, não um JWT implementado aqui.
O adaptador deve usar o contrato oficial do provedor, autenticar sua resposta e
validar destinatário, assinatura, sala, participante, papel, validade e escopo antes
de devolver a concessão. O módulo confere o resultado esperado e verifica novamente
a sessão e vínculos após a emissão. Se essa conferência falhar, a credencial não é
devolvida e o adaptador recebe a tentativa de revogação.

As concessões aceitas são registradas cifradas, com chaves externas e dados
autenticados ligados à organização, sala, participante e provedor. Não entram no log.
Revogar um participante pela sala primeiro bloqueia seu acesso local e cria uma tarefa
persistente de revogação; depois solicita ao adaptador revogação das credenciais e
expulsão/bloqueio da chamada em andamento. Encerrar a sala solicita também encerramento
da sala externa. O adaptador é recusado se não oferecer emitir, revogar, expulsar e
encerrar. Todas essas operações precisam ser idempotentes no fornecedor real.

Falha externa mantém a proibição local e a tarefa pendente; o chamador recebe
VideoRevocationPending, sem detalhes sensíveis do erro. A rotina interna
_attempt_video_cleanup permite repetir a tarefa sem reabrir o acesso. As concessões
são consideradas mesmo depois da validade de entrada, porque uma chamada estabelecida
pode continuar. Uma futura política de retenção deve preservar os dados necessários
até confirmar o encerramento e depois eliminá-los conforme a finalidade.

Os testes demonstram chamadas ao adaptador fictício, não expulsão remota efetiva.
O provedor precisa de monitoramento e reconciliação próprios. No caso de rejeição
durante a emissão, uma credencial inválida nunca é devolvida; se a tentativa imediata
de revogá-la falhar, o adaptador deve reconciliar a emissão. Mudanças externas de
vínculo, encerramento por expiração e revogação de sessão também precisam alimentar
um trabalhador de encerramento: alterar uma linha fora das operações desta sala não
dispara ações no fornecedor. Esse trabalhador agendado não foi implementado.

Expulsão, bloqueio da sala, duração máxima da chamada, renovação controlada de
credenciais, processamento das pendências e revogação remota precisam ser testados
no adaptador real antes de dados reais. O prazo curto de entrada não limita sozinho
a duração de uma chamada já estabelecida.

Nenhum adaptador oficial foi implementado para Google Meet ou outro fornecedor.
ProviderFixture é exclusivamente de teste, com credencial sem valor operacional.
O contrato não garante incorporação em página ou continuidade em segundo plano no
iPhone. Essas propriedades dependem do fornecedor, navegador e testes nos aparelhos.

LIMITES DA DEMONSTRAÇÃO E PRODUÇÃO

A base usa o Store SQLite existente. Os testes verificam regras locais, não políticas
de isolamento implantadas em nuvem. Autorização no transporte, isolamento no banco e
armazenamento, backups cifrados, recuperação testada, rotação das chaves, retenção,
eliminação, auditoria externa e detecção de abuso ainda exigem implantação própria.

O log registra identificadores e resultado, nunca texto, documento ou credencial.
Identificadores não são anônimos. O administrador do arquivo local não é contido pela
trilha append-only; produção exige controles externos. A integração de vídeo desta
referência é síncrona dentro do bloqueio local para demonstrar a regra de autorização.
O serviço distribuído deverá adotar intenções persistentes, cancelamento, retomada,
limites de tempo e revogação no provedor, mantendo as mesmas invariantes.

Não há promessa de segurança absoluta, prontuário certificado, conformidade integral,
entrega de mensagens em tempo real ou chamada ativa. O uso clínico ou jurídico real
depende também das regras profissionais e do modelo operacional do contratante.

VERIFICAÇÃO

Na raiz outreach-vereda:
python -m unittest discover -s tests -p test_consultation.py -v

Os testes cobrem: isolamento entre negócios e titulares; acesso explícito de equipe;
categoria clínica/jurídica; recepção e administrador sem acesso clínico; MFA; sessão,
participação e atribuição revogadas; expiração; encerramento; cifragem e adulteração;
limite e escape de mensagens; repetição concorrente; fila transacional; paginação
restrita à sala; liberação/revogação de documentos; contrato de vídeo desabilitado;
escopo e prazo da credencial; redução de validade e revogação durante emissão;
concessões cifradas; revogação/expulsão e encerramento no adaptador fictício;
falha externa mantendo proibição local e tarefa persistente; retomada; log sem
conteúdo sensível. Nesta entrega, 42 testes deste módulo passaram, além dos 44
testes existentes do núcleo, convites e pagamentos.
