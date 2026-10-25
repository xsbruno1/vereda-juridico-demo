(function(root){
  'use strict';
  const legalGuides={
    contratos:['Identificar o tipo de relação ou compromisso a discutir','Localizar a versão atual do contrato, sem enviar aqui','Anotar perguntas sobre o próximo passo'],
    socios:['Identificar o objetivo da conversa entre os envolvidos','Localizar os documentos de constituição, sem enviar aqui','Anotar decisões ou mudanças que precisam ser discutidas'],
    trabalho:['Identificar o assunto geral, sem nomes ou dados pessoais','Separar as perguntas sobre a rotina da empresa','Localizar os registros que a equipe solicitar posteriormente'],
    conflito:['Organizar uma linha do tempo para conversar em ambiente reservado','Localizar comunicações relevantes, sem anexar neste site','Informar à equipe se já existe um prazo comunicado'],
    digital:['Descrever o produto ou a relação digital em termos gerais','Localizar documentos e políticas que serão solicitados','Listar os envolvidos na operação, sem dados pessoais aqui'],
    familia:['Identificar o assunto geral da conversa','Anotar dúvidas para um encontro reservado','Aguardar orientação sobre documentos e forma de envio'],
    patrimonio:['Organizar as perguntas sobre o objetivo da conversa','Localizar os registros que o profissional pedir posteriormente','Evitar compartilhar dados patrimoniais no primeiro contato']
  };
  const careGuides={
    primeira:['Perguntar como funciona o primeiro encontro','Conferir profissional, modalidade e local com a recepção','Separar suas perguntas para conversar com o profissional'],
    facial:['Conhecer como funciona a avaliação profissional','Perguntar sobre etapas, limites e condições do atendimento','Levar suas dúvidas para o encontro, sem dados clínicos neste site'],
    corporal:['Entender o que acontece na primeira avaliação','Perguntar quem atende e quais são as condições','Reservar tempo para conversar sobre dúvidas e expectativas'],
    rotina:['Confirmar como chegar ou acessar o atendimento online','Perguntar sobre acessibilidade e necessidades de organização','Conferir as orientações enviadas pela equipe'],
    retorno:['Conferir a orientação de retorno já definida pelo profissional','Consultar disponibilidade com a recepção','Confirmar data, modalidade e local antes de se organizar'],
    online:['Confirmar se a modalidade é adequada com o profissional','Separar um local reservado e conferir conexão, áudio e vídeo','Aguardar o link e a confirmação enviados pela equipe'],
    presencial:['Confirmar endereço, acesso e orientações de chegada','Perguntar sobre acessibilidade e modalidade de atendimento','Aguardar a confirmação de horário pela recepção']
  };
  function guideFor(family,key){const source=family==='dossier'?legalGuides:careGuides;return [...(source[key] || (family==='dossier'?legalGuides.conflito:careGuides.primeira))];}
  function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const [y,m,d]=value.split('-').map(Number);if(y<1900||y>9999)return false;return new Date(Date.UTC(y,m-1,d)).toISOString().slice(0,10)===value;}
  function escapeICS(value){return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
  function reminderICS(date,time,today,stamp,uid){
    if(!validDate(date)||!validDate(today)||date<today||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time||''))throw new RangeError('Escolha hoje ou uma data futura e um horário válido.');
    const compact=date.replaceAll('-','')+'T'+time.replace(':','')+'00';
    // Floating local time: the calendar uses the user's device timezone, shown before export.
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Vereda//Lembrete pessoal//PT-BR','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:'+escapeICS(uid),'DTSTAMP:'+stamp,'DTSTART:'+compact,'DURATION:PT15M','SUMMARY:Lembrete pessoal - confirmar retorno','DESCRIPTION:'+escapeICS('Demonstração Vereda. Lembrete para falar com a recepção. Não é consulta confirmada e não reserva um horário. Horário local do seu calendário.'),'STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR',''].join('\r\n');
  }
  const api={guideFor,validDate,reminderICS};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof document==='undefined')return;
  const configNode=document.getElementById('professional-config');
  if(!configNode)return;
  const config=JSON.parse(configNode.textContent);
  const form=document.getElementById('prepare-form');
  const topic=form.elements.topic;
  const result=document.getElementById('prepare-result');
  const status=document.getElementById('record-status');
  let prepared=null;
  const allowedTopics=new Map(config.topics);
  function updateGuide(){
    const title=allowedTopics.get(topic.value)||config.topics[0][1];
    document.getElementById('checklist-title').textContent=title;
    const container=document.getElementById('checklist-items');container.replaceChildren();
    guideFor(config.family,topic.value).forEach((text,i)=>{const label=document.createElement('label');label.className='check-item';const input=document.createElement('input');input.type='checkbox';input.name='guide-'+i;const span=document.createElement('span');span.textContent=text;label.append(input,span);container.append(label);input.addEventListener('change',updateCount);});
    updateCount();
    if(form.elements.deadline)document.getElementById('deadline-note').hidden=form.elements.deadline.value!=='yes';
  }
  function updateCount(){const checks=[...document.querySelectorAll('.check-item input')];document.getElementById('checklist-count').textContent=checks.filter(c=>c.checked).length+' de '+checks.length+' itens organizados nesta página.';}
  function invalidate(){prepared=null;result.hidden=true;status.textContent='';delete status.dataset.demoRecorded;document.getElementById('record-example').disabled=false;}
  topic.addEventListener('change',()=>{updateGuide();invalidate();});
  form.addEventListener('input',invalidate);
  form.elements.deadline?.addEventListener('change',()=>{document.getElementById('deadline-note').hidden=form.elements.deadline.value!=='yes';});
  document.querySelectorAll('[data-topic-choice]').forEach(button=>button.addEventListener('click',()=>{if(!allowedTopics.has(button.dataset.topicChoice))return;topic.value=button.dataset.topicChoice;updateGuide();invalidate();form.scrollIntoView({behavior:'smooth',block:'center'});topic.focus({preventScroll:true});}));
  form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity()||!allowedTopics.has(topic.value))return;
    prepared={topic:allowedTopics.get(topic.value),mode:form.elements.mode?.value||'',period:form.elements.period?.value||'',deadline:form.elements.deadline?.value||''};
    document.getElementById('prepared-title').textContent=config.family==='dossier'?'Seu roteiro está preparado.':'Sua preferência está preparada.';
    document.getElementById('prepared-summary').textContent=prepared.topic+(prepared.mode?' · '+prepared.mode:'')+(prepared.period?' · '+prepared.period:'')+(prepared.deadline==='yes'?'. Há um prazo a informar diretamente à equipe.':'.');
    status.textContent='Nenhuma mensagem foi enviada. Você pode registrar um exemplo no painel deste navegador.';
    result.hidden=false;result.focus({preventScroll:true});
  });
  document.getElementById('record-example').addEventListener('click',()=>{if(!prepared)return;
    if(status.dataset.demoRecorded==='true'){status.textContent='Este exemplo já foi registrado. Altere a preferência para preparar outro.';return;}
    status.textContent='Preparando a simulação local…';
    document.dispatchEvent(new CustomEvent('vereda:demo-inquiry',{detail:{name:'Contato exemplo',context:prepared.topic,service:prepared.topic,period:prepared.period,channel:prepared.mode,result:status}}));
    if(status.dataset.demoRecorded==='true')document.getElementById('record-example').disabled=true;
    else if(status.textContent==='Preparando a simulação local…')status.textContent='O painel local não está disponível nesta página. Nenhuma informação foi enviada.';
  });
  function download(filename,type,text){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  document.getElementById('download-guide').addEventListener('click',()=>{
    const lines=[config.name+' — roteiro demonstrativo',allowedTopics.get(topic.value),'',...guideFor(config.family,topic.value).map((item,i)=>(document.querySelectorAll('.check-item input')[i].checked?'[x] ':'[ ] ')+item),'','Preparação administrativa. Não é orientação jurídica ou clínica.','Nenhum documento ou dado pessoal foi enviado. Marcas e informações ilustrativas.'];
    download('roteiro-'+config.slug+'.txt','text/plain;charset=utf-8',lines.join('\r\n'));
  });
  const returnForm=document.getElementById('return-form');
  if(returnForm){const date=returnForm.elements.returnDate;const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());date.min=today;const output=document.getElementById('return-status');output.textContent='Lembrete pessoal no horário local do seu calendário. Não reserva nem confirma consulta.';
    returnForm.addEventListener('submit',event=>{event.preventDefault();if(!returnForm.reportValidity())return;
      try{const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');const uid=(root.crypto?.randomUUID?.()||String(Date.now()))+'@vereda-demo';const text=reminderICS(date.value,returnForm.elements.returnTime.value,today,stamp,uid);download('lembrete-pessoal-vereda.ics','text/calendar;charset=utf-8',text);output.textContent='Arquivo preparado para importar no calendário. É um lembrete pessoal de confirmação, não uma consulta agendada. O horário usa o fuso do seu calendário.';}catch(error){output.textContent=error.message;}
    });
    returnForm.addEventListener('input',()=>{output.textContent='Lembrete pessoal no horário local do seu calendário. Nenhuma consulta está confirmada.';});
  }
  updateGuide();
})(typeof globalThis!=='undefined'?globalThis:this);
