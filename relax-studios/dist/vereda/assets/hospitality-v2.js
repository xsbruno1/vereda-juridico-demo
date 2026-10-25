(function(root){
  'use strict';
  const DAY=86400000;
  function dateStamp(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('Informe uma data válida.');
    const timestamp=Date.parse(value+'T00:00:00Z');
    if(!Number.isFinite(timestamp)||new Date(timestamp).toISOString().slice(0,10)!==value)throw Error('Informe uma data válida.');
    return timestamp;
  }
  function stayQuote(config,values){
    if(!config||!Array.isArray(config.periods)||!config.periods.includes(values.period)||!Array.isArray(config.rooms)||!config.rooms.includes(values.service))throw Error('Escolha uma acomodação e um período válidos.');
    const base=config.base_cents?.[values.period],multiplier=Number(config.rate_multiplier);
    if(!Number.isSafeInteger(base)||base<0||!Number.isFinite(multiplier)||multiplier<=0||multiplier>10)throw Error('Não foi possível consultar a referência de preço.');
    const arrival=dateStamp(values.date);
    if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.time))throw Error('Informe um horário válido.');
    let units=1;
    if(values.period==='diaria'){
      units=(dateStamp(values.checkout)-arrival)/DAY;
      if(!Number.isInteger(units)||units<1||units>30)throw Error('Nesta demonstração, escolha uma estadia de 1 a 30 noites.');
    }
    const unitCents=Math.round(base*multiplier),totalCents=unitCents*units;
    if(!Number.isSafeInteger(totalCents))throw Error('Não foi possível calcular o exemplo.');
    return {units,unitCents,totalCents};
  }
  root.VeredaHospitalityV2={dateStamp,stayQuote};
  if(typeof module!=='undefined')module.exports=root.VeredaHospitalityV2;
  if(typeof document==='undefined')return;
  const form=document.querySelector('#request-form');if(!form)return;
  const price=document.querySelector('#price'),detail=document.querySelector('#rate-detail'),status=document.querySelector('#request-status'),submit=document.querySelector('#request-button');
  const money=cents=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
  const addDays=(iso,n)=>new Date(dateStamp(iso)+n*DAY).toISOString().slice(0,10);
  form.elements.date.min=today();form.elements.date.value=addDays(today(),1);
  if(form.elements.checkout){form.elements.checkout.min=addDays(form.elements.date.value,1);form.elements.checkout.value=addDays(form.elements.date.value,2);}
  let config=null;
  function values(){return Object.fromEntries(new FormData(form));}
  function update(){
    status.dataset.demoRecorded='false';status.textContent='Simulação, sem envio. A recepção precisaria confirmar disponibilidade e valor final.';
    if(!config)return;
    try{const v=values();if(v.date<today())throw Error('Escolha hoje ou uma data futura.');const quote=stayQuote(config,v);price.textContent=money(quote.totalCents);detail.textContent=v.period==='diaria'?`${quote.units} ${quote.units===1?'noite':'noites'} × ${money(quote.unitCents)}. Referência do exemplo, sujeita à confirmação.`:`Período ${v.period==='pernoite'?'pernoite (12h neste exemplo)':v.period}. Quarto e limpeza sob confirmação.`;submit.disabled=false;}
    catch(e){price.textContent='Revise sua escolha';detail.textContent=e.message;submit.disabled=true;}
  }
  form.addEventListener('input',()=>{
    if(form.elements.checkout){form.elements.checkout.min=form.elements.date.value?addDays(form.elements.date.value,1):today();}
    update();
  });
  form.addEventListener('change',update);
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!config||!form.reportValidity())return;
    try{const v=values();if(v.date<today())throw Error('Escolha hoje ou uma data futura.');const quote=stayQuote(config,v);status.textContent=`Consulta fictícia preparada: ${v.service}, ${v.date.split('-').reverse().join('/')} às ${v.time}. Referência: ${money(quote.totalCents)}. Nenhuma reserva confirmada.`;document.dispatchEvent(new CustomEvent('vereda:demo-inquiry',{detail:{name:'Contato exemplo',context:'Consulta administrativa de hospedagem',requestedDate:v.date,requestedTime:v.time,service:v.service,period:v.period,result:status}}));}
    catch(e){status.textContent=e.message;}
  });
  document.querySelectorAll('[data-room]').forEach(button=>button.addEventListener('click',()=>{if(!config)return;form.elements.service.value=button.dataset.room;update();document.querySelector('#contato').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});form.elements.service.focus({preventScroll:true});}));
  fetch(document.body.dataset.config).then(response=>{if(!response.ok)throw Error('Configuração indisponível. Tente novamente mais tarde.');return response.json();}).then(value=>{
    config=value;
    if(!Array.isArray(config.rooms)||!config.rooms.length||!Array.isArray(config.periods)||!config.periods.length)throw Error('Configuração de acomodação indisponível.');
    form.elements.service.replaceChildren(...config.rooms.map(room=>new Option(room,room)));form.elements.service.disabled=false;
    if(form.elements.period.tagName==='SELECT'){form.elements.period.replaceChildren(...config.periods.map(period=>new Option(period==='pernoite'?'Pernoite · 12h (exemplo)':period,period)));form.elements.period.disabled=false;}
    update();
  }).catch(e=>{price.textContent='Consulta indisponível';detail.textContent=e.message;status.textContent='A demonstração não pode preparar a solicitação agora.';submit.disabled=true;});
})(typeof window!=='undefined'?window:globalThis);
