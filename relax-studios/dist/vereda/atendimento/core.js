/** Demonstration only. This state is neither identity nor an authorization boundary. */
export const SERVICES = Object.freeze({
  medicina: {label:'Medicina',business:'Elo Medicina',professional:'Dra. Helena · médica fictícia',initials:'HE',person:'Marina · paciente fictícia',meeting:'Consulta de acompanhamento',history:'Meu histórico de cuidado',record:'Resumo da consulta',attachment:'Resultado demonstrativo',draft:'Orientação em revisão',note:'A modalidade e a necessidade de avaliação presencial são definidas pela médica.',next:['Conferir orientações disponibilizadas','Reunir as dúvidas para o retorno','Combinar o próximo atendimento']},
  odontologia: {label:'Odontologia',business:'Forma Odontologia',professional:'Dra. Lara · dentista fictícia',initials:'LA',person:'Marina · paciente fictícia',meeting:'Acompanhamento odontológico',history:'Meu histórico odontológico',record:'Resumo da avaliação',attachment:'Exame odontológico demonstrativo',draft:'Plano em revisão',note:'O atendimento remoto tem limites. A dentista define a indicação e a necessidade de exame presencial.',next:['Conferir o resumo liberado','Separar exames solicitados pela dentista','Combinar avaliação ou retorno presencial']},
  psicologia: {label:'Psicologia',business:'Anima Psicologia',professional:'Camila · psicóloga fictícia',initials:'CA',person:'Marina · pessoa atendida fictícia',meeting:'Encontro de acompanhamento',history:'Meus encontros e documentos',record:'Orientações do atendimento',attachment:'Documento demonstrativo',draft:'Documento em revisão',note:'Anotações privativas não aparecem no espaço compartilhado. Psicologia não inclui prescrição de medicamentos.',next:['Conferir o próximo encontro','Ler os documentos disponibilizados','Revisar preferências de modalidade']},
  psiquiatria: {label:'Psiquiatria',business:'Institucional · Psiquiatria',professional:'Dra. Sofia · psiquiatra fictícia',initials:'SO',person:'Marina · paciente fictícia',meeting:'Consulta de acompanhamento',history:'Meu histórico de cuidado',record:'Resumo de acompanhamento',attachment:'Documento demonstrativo',draft:'Orientação em revisão',note:'Prescrições dependem de profissional habilitado e integração homologada. Esta sala não emite receitas.',next:['Conferir orientações liberadas','Reunir dúvidas para a psiquiatra','Combinar o próximo atendimento']},
  advocacia: {label:'Advocacia',business:'Atlas Advocacia',professional:'Dra. Clara · advogada fictícia',initials:'CL',person:'Marina · cliente fictícia',meeting:'Reunião de acompanhamento',history:'Meu caso e documentos',record:'Resumo do acompanhamento',attachment:'Documento demonstrativo do caso',draft:'Documento em revisão',note:'Só os documentos do próprio caso são compartilhados. Senhas de tribunal e notas internas permanecem fora da conversa.',next:['Revisar os documentos solicitados','Ler a atualização da advogada','Confirmar o próximo contato']}
});
export const TABS = Object.freeze(['chat','documents','history','next']);
export function serviceKey(value){return Object.hasOwn(SERVICES,value)?value:'medicina';}
export function roleKey(value){return value==='professional'?'professional':'client';}
export function freshVisit(service){
  service=serviceKey(service);const spec=SERVICES[service];
  return {service,visitId:'demo-visit-'+service,role:'client',tab:'chat',closed:false,muted:false,cameraOff:false,next:[],messages:[],sequence:0,
    documents:[
      {id:'summary',title:spec.record,status:'released',origin:'professional',shared:true,private:false,visitId:'demo-visit-'+service},
      {id:'plan',title:spec.draft,status:'draft',origin:'professional',shared:false,private:false,visitId:'demo-visit-'+service},
      {id:'internal',title:service==='advocacia'?'Nota interna da advogada':'Anotação privativa do profissional',status:'draft',origin:'professional',shared:false,private:true,visitId:'demo-visit-'+service}
    ]};
}
export function setTab(state,tab){if(!TABS.includes(tab))throw Error('Seção inválida.');state.tab=tab;return state;}
export function setRole(state,role){if(!['client','professional'].includes(role))throw Error('Perspectiva inválida.');state.role=role;return state;}
export function templates(state){
  const legal=state.service==='advocacia';
  return state.role==='client' ? [
    {id:'received',text:'Consegui abrir o documento compartilhado.'},
    {id:'question',text:legal?'Gostaria de entender o próximo passo do meu caso.':'Gostaria de esclarecer uma orientação do atendimento.'},
    {id:'attach',text:legal?'Separei o documento que foi solicitado.':'Separei o documento solicitado para esta conversa.'}
  ] : [
    {id:'review',text:'Vou conferir o documento que você compartilhou.'},
    {id:'summary',text:'Disponibilizei um resumo para revisarmos juntos.'},
    {id:'next',text:'Vamos conferir os próximos passos antes de encerrar.'}
  ];
}
function active(state){if(state.closed)throw Error('O exemplo foi encerrado. Reinicie para experimentar outra conversa.');}
export function addMessage(state,templateId){
  active(state);const message=templates(state).find(x=>x.id===templateId);
  if(!message)throw Error('Escolha uma mensagem de exemplo desta perspectiva.');
  if(state.messages.length>=30)throw Error('Limite deste exemplo atingido. Reinicie a sala.');
  const last=state.messages.at(-1);if(last&&last.role===state.role&&last.template===templateId)throw Error('Essa mensagem já foi adicionada. Escolha outro exemplo.');
  state.messages.push({id:++state.sequence,role:state.role,template:templateId,text:message.text,status:'local',visitId:state.visitId});
  return state;
}
export function visibleDocuments(state){return state.documents.filter(doc=>doc.visitId===state.visitId&&!doc.private&&(doc.shared||(state.role==='professional'?doc.origin==='professional':doc.origin==='client')));}
export function professionalDrafts(state){return state.role==='professional'?state.documents.filter(doc=>doc.visitId===state.visitId&&!doc.private&&doc.status==='draft'):[];}
export function simulateAttachment(state){
  active(state);if(state.role!=='client')throw Error('O envio de exemplo parte da pessoa atendida.');
  if(state.documents.some(doc=>doc.id==='uploaded'))throw Error('Este documento de exemplo já foi apresentado.');
  state.documents.push({id:'uploaded',title:SERVICES[state.service].attachment,status:'submitted',origin:'client',shared:true,private:false,visitId:state.visitId});
  return state;
}
export function releaseDocument(state,id){
  active(state);if(state.role!=='professional')throw Error('Somente o profissional pode disponibilizar este documento no exemplo.');
  const doc=state.documents.find(doc=>doc.id===id&&doc.visitId===state.visitId);
  if(!doc||doc.private||!['draft','submitted'].includes(doc.status)||(doc.origin==='client'&&!doc.shared))throw Error('Documento indisponível para esta ação.');
  doc.status='released';doc.shared=true;return state;
}
export function removeShare(state,id){
  active(state);const doc=state.documents.find(doc=>doc.id===id&&doc.visitId===state.visitId);
  if(!doc||doc.private||!doc.shared||(state.role!=='professional'&&doc.origin!=='client'))throw Error('Esta perspectiva não pode retirar o compartilhamento.');
  doc.shared=false;return state;
}
export function closeVisit(state){state.closed=true;return state;}
export function transcript(state){return state.messages.filter(message=>message.visitId===state.visitId).map(message=>({...message}));}
export function documentBody(state,id){
  const doc=visibleDocuments(state).find(doc=>doc.id===id);
  if(!doc)throw Error('Documento não disponível nesta perspectiva.');
  return {title:doc.title,text:'Este é um documento inteiramente fictício para demonstrar a consulta durante o atendimento. Não contém exame, resultado, diagnóstico, receita, processo ou informação de uma pessoa real.',status:doc.status};
}
