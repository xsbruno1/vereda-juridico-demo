VEREDA — PORTAL DE CLIENTES E PACIENTES
Atualização: 25/10/2026

ESCOPO DESTA ENTREGA
Demonstração navegável em HTML/CSS/JavaScript, com dados totalmente fictícios, para dez áreas: odontologia, medicina, psicologia/psiquiatria, estética, advocacia, pizzarias, petshops, salões, hotelaria e imobiliárias/temporada.

ENTRADA
index.html?setor=odontologia
index.html?setor=advocacia&visao=equipe
Os demais valores de setor são medicina, psiquiatria, estetica, petshop, salao, pizzaria, hotelaria, imobiliaria. Entradas inválidas retornam à odontologia. A visão equipe contém responsável e recepção. A troca de visão é uma simulação visível, não é login, autorização real ou isolamento de dados no navegador.

O QUE FUNCIONA NESTE EXEMPLO
- Troca de setor e perspectiva com estado independente em memória para cada setor.
- Solicitação de horário em estado pendente, conferência pela equipe e cancelamento; bloqueio de repetição do mesmo horário ativo na demonstração.
- Liberação/retirada de documentos fictícios; a visão cliente apresenta somente os conteúdos liberados. A visão de recepção omite documentos e conteúdo restrito. Uma retirada cancela o compartilhamento ilustrativo associado.
- Visualização de documento fictício em diálogo acessível, simulação de permissão de compartilhamento de 24h e revogação. Nenhum arquivo real ou link compartilhável é gerado; a validade declarada é ilustrativa.
- Solicitação demonstrativa de cópia completa do prontuário, distinta dos resumos compartilhados. Na implantação, direitos de acesso e exceções legais exigem identidade verificada, revisão e fluxo de entrega.
- Mapa ilustrativo de regiões dentais, intensidade fictícia e fila de revisão do relato. Números não correspondem a nomenclatura clínica; não é odontograma, diagnóstico, triagem ou orientação médica.
- Fluxo estadia/cozinha em memória: adicionar itens de exemplo, solicitar, iniciar preparo e registrar entrega. Não é uma reserva real ou integração de cozinha.
- Checklists administrativos, preferências de tema, espaço de leitura e canal de lembrete em memória.
- Solicitações administrativas específicas por área entram em fila de revisão da equipe. Exemplos: reposição de ração, revisão de repetição de pedido, modalidade de encontro, preferência de profissional e conversa de acompanhamento. Não confirmam compra ou contratação.
- Roteiros "O que você prepara / O que recebe" próprios de cada ramo, com limites para coleta desnecessária. A empresa contratante, a equipe e a pessoa atendida são contextos distintos.
- Psicologia é o padrão da área de saúde mental e não apresenta o módulo de medicamentos. Selecionar explicitamente Psiquiatria muda o serviço e apresenta um histórico demonstrativo de documentos prescritos pelo médico, com integração desativada. Estética, petshop e outros setores não recebem módulo de prescrição. Odontologia e medicina apresentam somente a preparação de histórico; habilitação, escopo e elegibilidade precisam ser verificados.
- Registro demonstrativo de ações. Não é log de auditoria imutável e não identifica pessoas reais.
- Exportação de um evento iCalendar fictício e explicitamente marcado como tentativa. O arquivo não confirma uma reserva, não contém conteúdo clínico e não sincroniza alterações.
- Linha do tempo jurídica com exemplo de origem, revisão e próxima providência. Não há cálculo de andamento percentual, previsão de êxito ou prazo. Links abrem os serviços oficiais e-SAJ e eproc. No eproc, selecionar Consulta Unificada.

O QUE NÃO ESTÁ ATIVADO
Não existem contas de pacientes, armazenamento de prontuários, envio de exames, login de tribunal, busca de andamento real, geração de receitas, venda de medicamentos, comissão de farmácias, pagamentos, calendário sincronizado, e-mail, WhatsApp ou notificações de produção nesta página. Mensagens de confirmação identificam a demonstração. O botão de pagamento permanece indisponível e não coleta dados bancários.

SEGURANÇA E PRIVACIDADE
Não inserir dados reais. Não há campos de senha, texto clínico livre ou upload. Os exemplos e preferências ficam apenas em memória e desaparecem ao recarregar. Não usa localStorage, sessionStorage, cookies, service worker, analytics ou chamadas de API. A página é estática, e qualquer visitante pode ler seu código-fonte e os dados fictícios. Esconder controles por perspectiva não protege dados; controles reais exigem serviço autenticado, isolamento por organização e titular, políticas de acesso testadas, retenção, auditoria, verificação de identidade e revisão técnica antes de produção.

Registros clínicos devem permanecer separados do marketing. Medicamentos aparecem como formato de histórico de um documento emitido pelo profissional; nenhum nome/dose é sugerido e nenhuma receita é criada. A integração com prescrição e farmácias permanece desativada. Acesso a prontuário completo não deve ser limitado arbitrariamente ao resumo da tela.

ARQUIVOS
index.html: estrutura e avisos permanentes.
portal.css: composição responsiva e três paletas de contraste escuro sobre claro.
core.js: catálogo fictício e transições puras demonstrativas.
app.js: apresentação, controles e eventos.

TESTES
Testes locais: work/portal-v3/portal-core.test.mjs, executados com node --test.
Esses testes validam estados da demonstração. Não comprovam autenticação, RLS, isolamento em nuvem, conformidade integral ou segurança de prontuário real.

REFERÊNCIA JURÍDICA DE NAVEGAÇÃO
Manual oficial TJSP: https://www.tjsp.jus.br/Download/EPROC/ManuaisPublicoExterno/3.1-EPROC-CIDADAO-EXTERNO-TJSP-Consulta-Processual_26.01.2026.pdf
Entrada eproc: https://eproc1g.tjsp.jus.br/eproc/
Entrada e-SAJ: https://esaj.tjsp.jus.br/cpopg/open.do

CONDIÇÃO DE PUBLICAÇÃO
Esta pasta pode ser publicada como demonstração pública, pois contém exclusivamente dados fictícios. Não publicar credenciais, bancos operacionais, segredos, dados de pacientes ou documentos de clientes junto destes arquivos.
