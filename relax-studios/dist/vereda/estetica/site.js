(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menu && nav) {
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }));
    document.addEventListener('keydown', e => { if(e.key === 'Escape') { menu.setAttribute('aria-expanded','false'); nav.classList.remove('is-open'); } });
  }
  const dialog = document.querySelector('#appointment');
  const form = dialog && dialog.querySelector('form');
  const result = dialog && dialog.querySelector('.form-result');
  document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
    form.hidden = false; result.hidden = true; form.reset();
    const select = form.querySelector('select');
    if (button.dataset.book && [...select.options].some(o => o.value === button.dataset.book)) select.value = button.dataset.book;
    dialog.showModal();
  }));
  if (dialog) {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if(e.target === dialog) { const r = dialog.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close(); } });
    form.addEventListener('submit', e => {
      e.preventDefault(); const name = form.querySelector('[name="name"]').value.trim();
      form.hidden = true; result.hidden = false;
      result.textContent = `Simulação concluída${name ? ', '+name : ''}. Em um site conectado, sua solicitação seguiria para a recepção e para o CRM. Este modelo não enviou nem armazenou dados e não confirmou nenhum agendamento.`;
      document.dispatchEvent(new CustomEvent('vereda:demo-inquiry', {detail:{name,context:form.querySelector('select').value,result}}));
      result.focus();
    });
  }
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.querySelectorAll('.viva-card').forEach(card => card.hidden = button.dataset.filter !== 'todos' && card.dataset.category !== button.dataset.filter);
    const count = [...document.querySelectorAll('.viva-card')].filter(c=>!c.hidden).length;
    const status = document.querySelector('#catalog-status'); if(status) status.textContent = count===1?'1 opção exibida.':`${count} opções exibidas.`;
  }));
  const careContent = {
    Facial: {label:'01 / CUIDADO FACIAL', title:'Comece pela sua pele.', detail:'O cuidado atual, as necessidades percebidas e as dúvidas sobre a pele. A avaliação ajuda a compreender o que pode ou não ser indicado.', question:'“O que faz sentido para a minha pele e para a minha rotina?”', next:'Próximo passo: conhecer o escopo da avaliação facial e esclarecer como ela funciona.', action:'Conversar sobre cuidado facial ↗'},
    Corporal: {label:'02 / CUIDADO CORPORAL', title:'Contexto antes de escolher.', detail:'Seus objetivos, suas dúvidas e as condições que precisam ser consideradas. A conversa apresenta possibilidades e limites, sem antecipar indicação.', question:'“Como meus objetivos serão avaliados e quais condições devo conhecer?”', next:'Próximo passo: esclarecer o formato da avaliação corporal e as informações necessárias.', action:'Conversar sobre cuidado corporal ↗'},
    Rotina: {label:'03 / ROTINA DE AUTOCUIDADO', title:'Organize suas perguntas.', detail:'Os hábitos de cuidado que já fazem parte do dia a dia e os pontos que você deseja esclarecer. O profissional orienta quais informações são relevantes.', question:'“O que preciso entender melhor sobre a minha rotina atual?”', next:'Próximo passo: organizar as dúvidas e conversar sobre o escopo da orientação profissional.', action:'Conversar sobre a minha rotina ↗'}
  };
  document.querySelectorAll('[data-care]').forEach(button => button.addEventListener('click', () => {
    const key=button.dataset.care, data=careContent[key]; if(!data)return;
    document.querySelectorAll('[data-care]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    ['label','title','detail','question','next'].forEach(field=>{document.querySelector(`[data-care-${field}]`).textContent=data[field];});
    const action=document.querySelector('[data-care-action]'); action.dataset.book=key; action.textContent=data.action;
  }));
  const flowContent = {
    opcoes: {title:'Primeiro, conheça o escopo.', summary:'O catálogo apresenta áreas de cuidado. A indicação de um atendimento depende da avaliação profissional.', steps:['Identifique a área sobre a qual deseja conversar.','Confira o que é abordado na avaliação e prepare suas dúvidas.','Solicite à recepção informações sobre escopo e disponibilidade.'], book:'Avaliação', action:'Conversar sobre as opções ↗'},
    avaliacao: {title:'Saiba o que esperar da avaliação.', summary:'A avaliação é o momento de compreender a necessidade e receber explicações. Seu formato e escopo devem ser confirmados previamente.', steps:['Confirme duração, valor, profissional responsável e escopo do encontro.','Prepare suas perguntas e as informações solicitadas pela equipe.','Peça esclarecimentos sobre opções, limites e próximos passos antes de decidir.'], book:'Avaliação', action:'Entender a avaliação ↗'},
    retorno: {title:'Organize a revisão do cuidado.', summary:'Um retorno serve para revisar orientações com o profissional. A necessidade e as condições devem ser combinadas no atendimento.', steps:['Confira a orientação recebida e o objetivo do retorno.','Liste dúvidas que gostaria de revisar, sem enviá-las neste formulário.','Combine com a recepção o tipo de contato e a disponibilidade.'], book:'Revisão', action:'Conversar sobre um retorno ↗'}
  };
  document.querySelectorAll('[data-flow]').forEach(button=>button.addEventListener('click',()=>{
    const data=flowContent[button.dataset.flow]; if(!data)return;
    document.querySelectorAll('[data-flow]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    document.querySelector('[data-flow-title]').textContent=data.title;
    document.querySelector('[data-flow-summary]').textContent=data.summary;
    document.querySelectorAll('[data-flow-step]').forEach((item,index)=>item.textContent=data.steps[index]);
    const action=document.querySelector('[data-flow-action]'); action.dataset.book=data.book; action.textContent=data.action;
  }));
})();
