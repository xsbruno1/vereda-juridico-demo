import {SERVICES,TABS,serviceKey,freshVisit,setTab,setRole,templates,addMessage,visibleDocuments,simulateAttachment,releaseDocument,removeShare,closeVisit,transcript,documentBody} from './core.js';
const $=selector=>document.querySelector(selector);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const query=new URLSearchParams(location.search);
let state=freshVisit(serviceKey(query.get('setor')));
if(query.get('visao')==='equipe')setRole(state,'professional');
const panel=$('#workspace-panel');
let selectedDocumentId=null;
$('#service').innerHTML=Object.entries(SERVICES).map(([key,spec])=>`<option value="${key}">${spec.label}</option>`).join('');
function feedback(message,error=false){$('#feedback').textContent=message;$('#feedback').classList.toggle('error',error);}
function closeDocument(){selectedDocumentId=null;}
function clearMeet(){const link=$('#open-meet');link.hidden=true;link.removeAttribute('href');$('#meet-output').textContent='';}
function reflectIdentity(){
 const spec=SERVICES[state.service];$('#service').value=state.service;
 $('#business').textContent=spec.business;$('#meeting').textContent=spec.meeting;
 $('#professional-initials').textContent=spec.initials;$('#professional-name').textContent=spec.professional;
 $('#professional-boundary').textContent=spec.note;
 $('#workspace-person').textContent=state.role==='professional'?spec.person:'Seu espaço compartilhado.';
 $('#tab-history').textContent=state.service==='advocacia'?'Meu caso':'Meu histórico';
 const sector=state.service==='psicologia'?'psiquiatria':state.service;
 $('#portal-back').href='../portal/?setor='+sector+(state.role==='professional'?'&visao=equipe':'');
 document.querySelectorAll('[data-role]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.role===state.role)));
 $('#call-state').textContent=state.closed?'Exemplo encerrado':'Não conectada';
 $('#mute').disabled=state.closed;$('#camera').disabled=state.closed;$('#end').disabled=state.closed;
 $('#mute').setAttribute('aria-pressed',String(state.muted));$('#camera').setAttribute('aria-pressed',String(state.cameraOff));
 $('#mute-label').textContent=state.muted?'Microfone · simulação desligada':'Microfone · simular';
 $('#camera-label').textContent=state.cameraOff?'Câmera · simulação desligada':'Câmera · simular';
 $('#self-camera-state').textContent='Câmera não acessada';
}
function closedNotice(){return state.closed?'<p class="closed-banner">Exemplo encerrado. Você ainda pode consultar as informações fictícias. Reinicie para experimentar outra conversa.</p>':'';}
function renderChat(){
 const messages=transcript(state);const legal=state.service==='advocacia';
 return `${closedNotice()}<p class="panel-description">Uma conversa vinculada apenas a este atendimento. Nesta demonstração, você escolhe as mensagens dos dois lados.</p><div class="chat-log" aria-label="Mensagens demonstrativas">${messages.length?messages.map(message=>`<article class="bubble ${message.role===state.role?'mine':''}"><strong>${message.role==='professional'?esc(SERVICES[state.service].professional):legal?'Marina · cliente fictícia':'Marina · pessoa atendida fictícia'}</strong><p>${esc(message.text)}</p><small>Registrada somente neste exemplo · sem envio</small></article>`).join(''):'<div class="empty-chat"><span class="empty-icon" aria-hidden="true">↗</span><h3>A conversa acompanha o cuidado.</h3><p>Informações no contexto do atendimento.<br>Sem resposta automática atribuída ao profissional.</p></div>'}</div><div class="compose-box"><label for="message-choice">Escolha uma mensagem fictícia<select id="message-choice" ${state.closed?'disabled':''}>${templates(state).map(message=>`<option value="${message.id}">${esc(message.text)}</option>`).join('')}</select></label><button class="button" type="button" data-action="message" ${state.closed?'disabled':''}>Adicionar ao exemplo <span aria-hidden="true">↑</span></button><p class="hint">${state.role==='client'?'Para experimentar a resposta, mude para “Profissional”.':'Esta mensagem será adicionada como profissional fictício.'} Nada é transmitido ou salvo fora da memória desta página.</p></div>`;
}
function docCard(doc){
 const shared=doc.shared;const labels={released:'Disponibilizado',draft:'Em revisão',submitted:'Compartilhado para revisão'};
 const status=shared?labels[doc.status]:'Fora da conversa';
 return `<article class="doc-card"><div class="doc-top"><span class="doc-icon" aria-hidden="true">DOC</span><div><h3>${esc(doc.title)}</h3><p>${doc.origin==='client'?'Enviado pela pessoa atendida · exemplo':'Documento do profissional · exemplo'}</p><span class="tag ${!shared?'withdrawn':doc.status==='released'?'':'draft'}">${status}</span></div></div><div class="doc-actions"><button type="button" class="button subtle small" data-action="read" data-id="${doc.id}">Abrir exemplo</button>${state.role==='professional'&&!state.closed&&['draft','submitted'].includes(doc.status)?`<button type="button" class="button small" data-action="release" data-id="${doc.id}">Disponibilizar para revisão conjunta</button>`:''}${shared&&!state.closed&&(state.role==='professional'||doc.origin==='client')?`<button type="button" class="button small danger" data-action="remove" data-id="${doc.id}">Retirar da conversa</button>`:''}</div></article>`;
}
function renderDocuments(){
 const ownFile=state.documents.some(doc=>doc.id==='uploaded');
 return `${closedNotice()}<p class="panel-eyebrow">COMPARTILHAMENTO CONSCIENTE</p><h3 class="panel-title">Documentos, no contexto.</h3><p class="panel-description">${state.role==='professional'?'Confira o material antes de disponibilizar para a pessoa atendida. Anotações privativas não entram nesta lista.':'Veja o que foi disponibilizado para você e experimente compartilhar um documento fictício.'}</p><div class="doc-list">${visibleDocuments(state).map(docCard).join('')}</div>${state.role==='client'?`<button type="button" class="button secondary" data-action="attachment" ${ownFile||state.closed?'disabled':''}>${ownFile?'Documento fictício já adicionado':'+ Compartilhar documento fictício'}</button>`:''}<p class="panel-notice">Não há envio de arquivos reais. Retirar um documento deste exemplo remove sua exibição compartilhada; não representa exclusão de prontuário ou de registros profissionais.</p>`;
}
function renderHistory(){
 const spec=SERVICES[state.service];const released=visibleDocuments({...state,role:'client'}).filter(doc=>doc.status==='released'&&doc.shared);
 return `<p class="panel-eyebrow">SOMENTE O QUE FOI DISPONIBILIZADO</p><h3 class="panel-title">${esc(spec.history)}</h3><div class="history-header"><span class="small-avatar">MA</span><div><h3>${esc(spec.person)}</h3><p>Vínculo fictício · acompanhamento demonstrativo</p></div></div><div class="timeline"><article class="timeline-item"><small>NESTE ATENDIMENTO · EXEMPLO</small><h3>${esc(spec.meeting)}</h3><p>${state.service==='advocacia'?'A atualização do caso é apresentada pela advogada. Nenhuma senha ou informação de tribunal é consultada nesta sala.':'Documentos apresentados e orientações disponibilizadas pelo profissional ficam juntos para consulta.'}</p></article>${released.map(doc=>`<article class="timeline-item"><small>DOCUMENTO DISPONIBILIZADO · EXEMPLO</small><h3>${esc(doc.title)}</h3><p>Conteúdo fictício, autorizado para a revisão conjunta deste atendimento.</p><button class="button secondary small" type="button" data-action="read" data-id="${doc.id}">Consultar documento</button></article>`).join('')}</div><p class="panel-notice">Esta visão é da pessoa atendida. ${state.service==='advocacia'?'Estratégia e notas internas do escritório':'Anotações privativas e documentos ainda em elaboração'} não são exibidos aqui.</p>`;
}
function renderNext(){return `${closedNotice()}<p class="panel-eyebrow">CONTINUIDADE</p><h3 class="panel-title">O próximo passo fica claro.</h3><p class="panel-description">Uma lista simples para combinar durante a conversa. Marcar um item apenas atualiza este exemplo.</p><div class="check-list">${SERVICES[state.service].next.map((label,index)=>`<label class="check-row"><input type="checkbox" data-next="${index}" ${state.next.includes(index)?'checked':''} ${state.closed?'disabled':''}><span>${esc(label)}</span></label>`).join('')}</div><p class="panel-notice">O próximo horário deve ser confirmado pela equipe. Nenhum compromisso ou lembrete é agendado nesta demonstração.</p><a class="button secondary" href="${esc($('#portal-back').getAttribute('href'))}">Voltar ao meu espaço →</a>`;}
function renderPanel(){
 document.querySelectorAll('[data-tab]').forEach(button=>{const selected=button.dataset.tab===state.tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
 panel.setAttribute('aria-labelledby','tab-'+state.tab);
 let preview='';
 if(selectedDocumentId){try{const doc=documentBody(state,selectedDocumentId);preview=`<section class="inline-document" aria-labelledby="document-title"><div class="dialog-head"><span class="eyebrow">DOCUMENTO FICTÍCIO</span><button type="button" class="quiet" data-action="close-document">Voltar aos documentos ×</button></div><h3 id="document-title">${esc(doc.title)}</h3><p>${esc(doc.text)}</p><span class="fake-stamp">EXEMPLO · SEM VALIDADE CLÍNICA OU JURÍDICA</span></section>`;}catch{selectedDocumentId=null;}}
 panel.innerHTML=preview+({chat:renderChat,documents:renderDocuments,history:renderHistory,next:renderNext})[state.tab]();
}
function render(){reflectIdentity();renderPanel();}
function action(fn,message){closeDocument();try{fn();render();feedback(message);}catch(error){render();feedback(error.message,true);}}
document.querySelectorAll('[data-tab]').forEach(button=>{
 button.addEventListener('click',()=>{closeDocument();setTab(state,button.dataset.tab);renderPanel();panel.scrollTop=0;});
 button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();let index=TABS.indexOf(state.tab);index=event.key==='Home'?0:event.key==='End'?TABS.length-1:(index+(event.key==='ArrowRight'?1:-1)+TABS.length)%TABS.length;closeDocument();setTab(state,TABS[index]);renderPanel();$('#tab-'+state.tab).focus();});
});
document.querySelectorAll('[data-role]').forEach(button=>button.addEventListener('click',()=>{closeDocument();setRole(state,button.dataset.role);render();feedback('Perspectiva demonstrativa alterada. Isso não corresponde a uma autenticação real.');}));
$('#service').addEventListener('change',event=>{closeDocument();state=freshVisit(event.target.value);clearMeet();$('#meet-link').value='';render();feedback('Novo exemplo, com documentos e conversa separados por área.');});
$('#reset').addEventListener('click',()=>{closeDocument();state=freshVisit(state.service);clearMeet();$('#meet-link').value='';render();feedback('Exemplo reiniciado. As mensagens anteriores foram descartadas.');});
$('#mute').addEventListener('click',()=>{if(state.closed)return;state.muted=!state.muted;reflectIdentity();feedback('Controle visual de microfone alterado. Nenhum microfone está em uso.');});
$('#camera').addEventListener('click',()=>{if(state.closed)return;state.cameraOff=!state.cameraOff;reflectIdentity();feedback('Controle visual de câmera alterado. Nenhuma câmera está em uso.');});
$('#end').addEventListener('click',()=>action(()=>closeVisit(state),'Exemplo encerrado. Não havia chamada conectada.'));
panel.addEventListener('change',event=>{if(event.target.matches('[data-next]')&&!state.closed){const index=Number(event.target.dataset.next);state.next=event.target.checked?[...new Set([...state.next,index])]:state.next.filter(item=>item!==index);feedback('Lista atualizada somente neste exemplo.');}});
panel.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');if(!button||button.disabled)return;
 const id=button.dataset.id;
 if(button.dataset.action==='message')action(()=>addMessage(state,$('#message-choice').value),'Mensagem adicionada somente ao exemplo. Não foi enviada.');
 if(button.dataset.action==='attachment')action(()=>simulateAttachment(state),'Documento fictício incluído. Nenhum arquivo foi acessado ou enviado.');
 if(button.dataset.action==='release')action(()=>releaseDocument(state,id),'Documento fictício disponibilizado para a revisão conjunta deste atendimento.');
 if(button.dataset.action==='remove')action(()=>removeShare(state,id),'Compartilhamento retirado deste exemplo. Nenhum registro profissional real foi excluído.');
 if(button.dataset.action==='read'){try{documentBody(state,id);selectedDocumentId=id;renderPanel();panel.scrollTop=0;panel.querySelector('[data-action="close-document"]').focus({preventScroll:true});}catch(error){feedback(error.message,true);}}
 if(button.dataset.action==='close-document'){closeDocument();renderPanel();panel.focus({preventScroll:true});}
});
$('#meet-link').addEventListener('input',clearMeet);
$('#meet-form').addEventListener('submit',event=>{
 event.preventDefault();clearMeet();const url=globalThis.VeredaRoom?.meetingURL($('#meet-link').value);
 if(!url){$('#meet-output').textContent='Use um link direto no formato https://meet.google.com/abc-defg-hij, sem parâmetros extras.';return;}
 const link=$('#open-meet');link.href=url;link.hidden=false;$('#meet-output').textContent='Formato conferido. Isso não verifica quem organiza a reunião ou quem está autorizado a entrar. Abra somente se recebeu o link da sua equipe.';
});
render();
