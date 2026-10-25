(() => {
  'use strict';
  const C=window.MoradaCore;
  const $=id=>document.getElementById(id);
  const money=cents=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const today=['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');
  const add=days=>C.addDays(today,days);
  const properties=[
    {id:'vrt-101',intent:'sale',name:'Luz natural, espaço para ficar.',neighborhood:'Pinheiros',bedrooms:2,area:86,parking:1,price:92000000,condo:92000,tax:28000,image:'../assets/urban.jpg',tag:'Apartamento · pronto',description:'Um exemplo de apartamento com ambientes integrados, varanda e espaço para trabalhar em casa.',features:'2 dormitórios · 1 suíte · varanda · 1 vaga. Características ilustrativas para demonstrar a ficha técnica.',rules:'Visita acompanhada, com horário a confirmar. Valores, documentos, condições e encargos precisam ser conferidos antes de uma proposta.',pin:[37,27]},
    {id:'vrt-102',intent:'sale',name:'Mais espaço para novos planos.',neighborhood:'Vila Mariana',bedrooms:3,area:112,parking:2,price:128000000,condo:125000,tax:39000,image:'../assets/suite.jpg',tag:'Apartamento · pronto',description:'Uma referência de planta com três quartos, área social ampla e boa circulação.',features:'3 dormitórios · 2 suítes · área de serviço · 2 vagas. Metragens e fotos são apenas demonstrativas.',rules:'Visita acompanhada. Não há oferta vinculante, disponibilidade real ou condição de financiamento nesta vitrine.',pin:[68,52]},
    {id:'vrt-201',intent:'rent',name:'Um novo ritmo para seus dias.',neighborhood:'Brooklin',bedrooms:1,area:48,parking:1,price:320000,condo:67000,tax:14000,image:'../assets/urban.jpg',tag:'Locação residencial',description:'Um exemplo de apartamento compacto, com espaço definido para descanso e rotina.',features:'1 dormitório · 48 m² · 1 vaga · mobiliário a combinar na proposta. Não corresponde a um imóvel real.',rules:'O prazo e as condições da locação residencial serão definidos na proposta. Garantias e análise documental dependem do responsável.',pin:[31,76]},
    {id:'vrt-202',intent:'rent',name:'Espaço para viver bem.',neighborhood:'Vila Mariana',bedrooms:2,area:75,parking:1,price:460000,condo:80000,tax:22000,image:'../assets/hotel.jpg',tag:'Locação residencial',description:'Uma referência de imóvel para uma rotina com mais espaço e tranquilidade.',features:'2 dormitórios · 75 m² · varanda · 1 vaga. Imagens, metragens e valores são fictícios.',rules:'A solicitação de visita não reserva o imóvel. Aluguel e encargos apresentados são referências mensais da demonstração.',pin:[68,52]},
    {id:'mor-301',intent:'stay',name:'Uma pausa com vista para a cidade.',neighborhood:'Pinheiros',bedrooms:1,area:42,parking:0,price:35000,weekday:35000,weekend:48000,cleaning:15000,capacity:2,minimumNights:2,specialRates:{'2026-11-02':58000,'2026-11-20':62000,'2026-12-25':68000,'2027-01-01':75000},blocked:[{start:add(3),end:add(6)},{start:add(13),end:add(16)}],image:'../assets/suite.jpg',tag:'Morada · temporada',description:'Uma referência de espaço mobiliado para residências temporárias, com informações de chegada reunidas.',features:'1 dormitório · 42 m² · até 2 pessoas · cozinha de apoio · internet ilustrativa. Sem endereço real ou reserva ativa.',rules:'Exemplo: não fumar, não realizar festas e respeitar o silêncio entre 22h e 8h. Entrada a partir de 15h; saída até 11h. Política de cancelamento e inventário de móveis devem ser apresentados e aceitos antes da contratação.',pin:[37,27]},
    {id:'mor-302',intent:'stay',name:'Sua estadia, com mais espaço.',neighborhood:'Brooklin',bedrooms:2,area:76,parking:1,price:52000,weekday:52000,weekend:68000,cleaning:22000,capacity:4,minimumNights:2,specialRates:{'2026-11-02':79000,'2026-11-20':85000,'2026-12-25':95000,'2027-01-01':99000},blocked:[{start:add(7),end:add(10)},{start:add(19),end:add(22)}],image:'../assets/hotel.jpg',tag:'Morada · temporada',description:'Uma referência de estadia mobiliada para até quatro pessoas, com valores por noite e regras claras.',features:'2 dormitórios · 76 m² · até 4 pessoas · 1 vaga. Todos os dados são demonstrativos e dependem de substituição na implantação.',rules:'Exemplo: não fumar, não realizar festas e informar todos os ocupantes ao responsável. Entrada a partir de 15h e saída até 11h. Serviços extras, cancelamento e inventário dependem de condições escritas.',pin:[31,76]}
  ];
  let intent='sale',current=null,quote=null,month=today.slice(0,7)+'-01',imports={},lastOpener=null,config=null;
  const make=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
  function announce(text){$('toast').textContent=text;setTimeout(()=>{$('toast').textContent='';},5000);}
  function formatDate(value){return new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC',day:'2-digit',month:'2-digit',year:'numeric'}).format(C.dateValue(value));}
  function priceLabel(p){return p.intent==='sale'?money(p.price):p.intent==='rent'?money(p.price)+' / mês':money(p.price)+' / noite';}
  function filtered(){return C.filterProperties(properties,{intent,neighborhood:$('neighborhood').value,bedrooms:$('bedrooms').value,maximum:$('maximum').value});}
  function render(){
    const items=filtered();$('results').replaceChildren();$('map-pins').replaceChildren();
    $('results-count').textContent=`${items.length} ${items.length===1?'imóvel demonstrativo':'imóveis demonstrativos'} · São Paulo`;
    if(!items.length){const empty=make('div',undefined,'empty-results');empty.append(make('h2','Vamos ampliar a busca?'),make('p','Não encontramos exemplos com esses filtros. Troque o bairro, o número de quartos ou o valor máximo.'));$('results').append(empty);}
    items.forEach(p=>{
      const card=make('article',undefined,'property-card');
      const imageButton=make('button',undefined,'property-image');imageButton.type='button';imageButton.setAttribute('aria-label',`Ver ${p.name} em ${p.neighborhood}`);imageButton.style.width='100%';imageButton.style.border='0';imageButton.style.padding='0';
      const img=make('img');img.src=p.image;img.alt='Interior ilustrativo; o imóvel anunciado é fictício.';img.width=800;img.height=600;img.loading='lazy';imageButton.append(img,make('span',p.tag,'image-badge'));imageButton.addEventListener('click',()=>openProperty(p,imageButton));
      const content=make('div',undefined,'property-content'),line=make('div',undefined,'property-line');line.append(make('span',p.neighborhood+' · São Paulo'),make('span',p.id.toUpperCase()));
      const heading=make('h2'),name=make('button',p.name);name.type='button';name.addEventListener('click',()=>openProperty(p,name));heading.append(name);
      const specs=make('div',undefined,'mini-specs');specs.append(make('span',p.area+' m²'),make('span',p.bedrooms+' '+(p.bedrooms===1?'quarto':'quartos')),make('span',p.intent==='stay'?`Até ${p.capacity} pessoas`:p.parking+' '+(p.parking===1?'vaga':'vagas')));
      const value=make('div',undefined,'property-value'),price=make('div');price.append(make('strong',money(p.price)),make('small',p.intent==='sale'?'Valor demonstrativo':p.intent==='rent'?'Aluguel/mês · encargos na ficha':'A partir de / noite + limpeza'));
      const open=make('button',p.intent==='stay'?'Ver datas ↗':'Conhecer ↗','open-property');open.type='button';open.addEventListener('click',()=>openProperty(p,open));value.append(price,open);content.append(line,heading,specs,value);card.append(imageButton,content);$('results').append(card);
      const pin=make('button',money(p.price),'map-pin');pin.type='button';pin.style.left=p.pin[0]+'%';pin.style.top=p.pin[1]+'%';pin.setAttribute('aria-label',`Ver imóvel fictício ${p.id}, ${p.neighborhood}, ${priceLabel(p)}`);pin.addEventListener('click',()=>openProperty(p,pin));$('map-pins').append(pin);
    });
  }
  document.querySelectorAll('[data-intent]').forEach(button=>button.addEventListener('click',()=>{
    intent=button.dataset.intent;$('maximum').value='';
    const url=new URL(location.href);url.searchParams.set('modo',{sale:'comprar',rent:'alugar',stay:'temporada'}[intent]);history.replaceState(null,'',url);
    document.querySelectorAll('[data-intent]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    $('price-label').textContent=intent==='stay'?'Diária até (R$)':intent==='rent'?'Aluguel até (R$)':'Até quanto? (R$)';
    $('request-result').hidden=true;render();
  }));
  $('search-form').addEventListener('submit',e=>{e.preventDefault();if(e.currentTarget.reportValidity())render();});
  $('clear-filters').addEventListener('click',()=>{$('search-form').reset();render();});
  $('map-toggle').addEventListener('click',()=>{const open=!$('map-panel').classList.contains('mobile-open');$('map-panel').classList.toggle('mobile-open',open);$('map-toggle').setAttribute('aria-expanded',String(open));$('map-toggle').textContent=open?'Ocultar mapa':'Ver mapa ilustrativo';});
  function resetQuote(text='Período alterado. Calcule novamente para atualizar os valores.'){
    quote=null;$('prepare-stay').hidden=true;$('stay-quote').classList.remove('error');$('stay-quote').textContent=text;$('stay-breakdown').replaceChildren();$('request-result').hidden=true;
  }
  function openProperty(p,opener){
    current=p;lastOpener=opener;quote=null;$('request-result').hidden=true;$('copy-result').textContent='';$('request-text').value='';
    $('property-title').textContent=p.name;$('detail-location').textContent=p.neighborhood+' / '+p.id.toUpperCase();$('detail-description').textContent=p.description;$('detail-image').src=p.image;
    $('detail-specs').replaceChildren();[[p.area+' m²','área ilustrativa'],[p.bedrooms,'quartos'],[p.intent==='stay'?p.capacity:p.parking,p.intent==='stay'?'pessoas':'vagas']].forEach(([value,label])=>{const item=make('div');item.append(make('strong',String(value)),make('span',label));$('detail-specs').append(item);});
    $('detail-price').replaceChildren(make('span',priceLabel(p)));
    const info=p.intent==='sale'?`Condomínio: ${money(p.condo)}/mês · IPTU: ${money(p.tax)}/mês, referências ilustrativas. Custos de aquisição não calculados.`:p.intent==='rent'?`Condomínio: ${money(p.condo)}/mês · IPTU: ${money(p.tax)}/mês. Referência mensal total: ${money(p.price+p.condo+p.tax)}. Demais condições na proposta.`:`Noites de domingo a quinta: ${money(p.weekday)}. Sexta e sábado: ${money(p.weekend)}. Datas especiais têm tarifa própria. Limpeza: ${money(p.cleaning)} por estadia.`;
    $('detail-price').append(make('small',info));$('detail-features').textContent=p.features;$('detail-rules').textContent=p.rules;
    $('neighborhood-map').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.neighborhood+', São Paulo, Brasil');
    $('visit-section').hidden=p.intent==='stay';$('stay-section').hidden=p.intent!=='stay';$('visit-date').min=today;$('visit-date').value=add(1);
    document.querySelectorAll('.document-checklist input').forEach(i=>{i.checked=false;});
    if(p.intent==='stay'){
      $('checkin').min=today;$('checkout').min=add(1);$('checkin').value='';$('checkout').value='';$('guests').replaceChildren();
      for(let i=1;i<=p.capacity;i++){const opt=make('option',i+' '+(i===1?'pessoa':'pessoas'));opt.value=String(i);$('guests').append(opt);}
      month=today.slice(0,7)+'-01';resetQuote('Escolha um período para ver a composição do preço.');renderCalendar();renderImportStatus();
    }
    if(!$('property-dialog').open)$('property-dialog').showModal();$('property-dialog').scrollTop=0;
  }
  document.querySelector('.dialog-close').addEventListener('click',()=>$('property-dialog').close());
  $('property-dialog').addEventListener('close',()=>{lastOpener?.focus();});
  function prepare(text){$('request-text').value=text;$('request-result').hidden=false;$('copy-result').textContent='';$('request-result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});}
  $('visit-form').addEventListener('submit',e=>{e.preventDefault();if(!$('visit-form').reportValidity())return;try{if(C.dateValue($('visit-date').value)<C.dateValue(today))throw Error('Escolha uma visita a partir de hoje.');prepare(`Olá! Gostaria de consultar uma visita ao imóvel demonstrativo ${current.id.toUpperCase()}, em ${current.neighborhood}.\nPreferência: ${formatDate($('visit-date').value)}, ${$('visit-period').value.toLowerCase()}.\nReferência: ${priceLabel(current)}.\nAguardo confirmação do responsável. Esta é uma mensagem de teste; não representa uma oferta real.`);}catch(err){announce(err.message);}});
  $('visit-form').addEventListener('input',()=>{$('request-result').hidden=true;});
  $('copy-request').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('request-text').value);$('copy-result').textContent='Mensagem copiada. Nenhum envio foi realizado.';}catch{$('request-text').focus();$('request-text').select();$('copy-result').textContent='Selecione e copie o texto. Nenhum envio foi realizado.';}});
  function allBlocks(){return [...(current.blocked||[]),...(imports[current.id]?.ranges||[])];}
  function isBlocked(date){return allBlocks().some(r=>C.dateValue(date)>=C.dateValue(r.start)&&C.dateValue(date)<C.dateValue(r.end));}
  function renderCalendar(){
    const start=new Date(month+'T00:00:00Z'),year=start.getUTCFullYear(),m=start.getUTCMonth();
    $('calendar-month').textContent=new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric',timeZone:'UTC'}).format(start);
    $('calendar-grid').replaceChildren();
    for(let i=0;i<start.getUTCDay();i++)$('calendar-grid').append(make('span'));
    const days=new Date(Date.UTC(year,m+1,0)).getUTCDate();
    for(let day=1;day<=days;day++){
      const date=`${year}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,blocked=isBlocked(date),rate=C.rateFor(current,date);
      const button=make('button');button.type='button';button.append(make('span',String(day)),make('small',blocked?'bloqueado':String(rate/100)));
      button.setAttribute('aria-label',`${formatDate(date)}, ${blocked?'entrada bloqueada':money(rate)+' por noite'}`);
      button.disabled=C.dateValue(date)<C.dateValue(today);button.classList.toggle('blocked',blocked);
      button.classList.toggle('selected',date===$('checkin').value||date===$('checkout').value);
      button.classList.toggle('in-range',Boolean($('checkin').value&&$('checkout').value&&date>$('checkin').value&&date<$('checkout').value));
      button.addEventListener('click',()=>{
        if(!$('checkin').value||$('checkout').value||date<=$('checkin').value){if(blocked){announce('Entrada bloqueada nesse dia. Escolha outra data.');return;}$('checkin').value=date;$('checkout').value='';$('checkout').min=C.addDays(date,1);}
        else{$('checkout').value=date;}
        resetQuote();renderCalendar();
      });$('calendar-grid').append(button);
    }
    $('previous-month').disabled=month<=today.slice(0,7)+'-01';
  }
  function changeMonth(offset){const date=new Date(month+'T00:00:00Z');date.setUTCMonth(date.getUTCMonth()+offset);month=date.toISOString().slice(0,10);renderCalendar();}
  $('previous-month').addEventListener('click',()=>changeMonth(-1));$('next-month').addEventListener('click',()=>changeMonth(1));
  $('stay-form').addEventListener('input',()=>{resetQuote();if($('checkin').value)$('checkout').min=C.addDays($('checkin').value,1);renderCalendar();});
  $('stay-form').addEventListener('submit',e=>{
    e.preventDefault();if(!$('stay-form').reportValidity())return;
    try{
      quote=C.quoteStay(current,$('checkin').value,$('checkout').value,Number($('guests').value),imports[current.id]?.ranges||[],today);
      $('stay-quote').classList.remove('error');$('stay-quote').replaceChildren(make('span','Referência para '+quote.nights+' noites'),make('strong',money(quote.total)));
      const dl=make('dl');[['Diárias',money(quote.subtotal)],['Limpeza',money(quote.cleaning)]].forEach(([key,value])=>dl.append(make('dt',key),make('dd',value)));$('stay-quote').append(dl,make('small','Total demonstrativo: diárias + limpeza. Não há pagamento, reserva ou caução cobrada nesta página.'));
      const breakdown=make('details'),sum=make('summary','Ver preço de cada noite');breakdown.append(sum);const list=make('ul');quote.daily.forEach(d=>list.append(make('li',formatDate(d.date)+' · '+money(d.cents))));breakdown.append(list);$('stay-breakdown').replaceChildren(breakdown);$('prepare-stay').hidden=false;renderCalendar();
    }catch(err){quote=null;$('prepare-stay').hidden=true;$('stay-quote').classList.add('error');$('stay-quote').textContent=err.message;$('stay-breakdown').replaceChildren();}
  });
  $('prepare-stay').addEventListener('click',()=>{if(!quote)return;prepare(`Olá! Gostaria de confirmar a disponibilidade do imóvel demonstrativo ${current.id.toUpperCase()}, em ${current.neighborhood}.\nEntrada: ${formatDate($('checkin').value)}. Saída: ${formatDate($('checkout').value)}.\n${$('guests').value} pessoa(s), ${quote.nights} noites.\nReferência de diárias + limpeza: ${money(quote.total)}.\nAguardo confirmação de disponibilidade, regras e condições. Esta é uma simulação, sem reserva ou pagamento.`);});
  function renderImportStatus(){const item=imports[current.id];$('ical-status').textContent=item?`${item.ranges.length} bloqueio(s) de teste aplicado(s) nesta página. Leitura: ${new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}).format(item.at)} (Brasília).`:'Sem leitura externa. Apenas bloqueios demonstrativos.';}
  function applyIcal(text){const ranges=C.parseIcal(text);imports[current.id]={ranges,at:new Date()};resetQuote('Calendário alterado. Calcule o período novamente.');renderCalendar();renderImportStatus();}
  $('ical-file').addEventListener('change',async()=>{
    const file=$('ical-file').files[0];if(!file)return;
    try{if(file.size>262144)throw Error('Use um arquivo de até 256 KB.');const propertyId=current.id,text=await file.text();if(current.id!==propertyId)return;applyIcal(text);}catch(err){$('ical-status').textContent=err.message+' O calendário anterior foi mantido.';}finally{$('ical-file').value='';}
  });
  $('sample-ical').addEventListener('click',()=>{applyIcal(C.exportIcal([{start:add(24),end:add(27)}],current.id));});
  $('export-ical').addEventListener('click',()=>{const content=C.exportIcal(allBlocks(),current.id),blob=new Blob([content],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=make('a');a.href=url;a.download=current.id+'-bloqueios-demo.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  function publisherFields(){
    const owner=$('publisher-type').value==='owner';$('registration-fields').hidden=owner;$('owner-field').hidden=!owner;$('registration-kind').textContent=$('publisher-type').value==='agency'?'CRECI-J':'CRECI-F';
    $('registration').required=!owner;$('incorporation-fields').hidden=!$('incorporation').checked;$('condominium-field').hidden=!$('publisher-stay').checked;
    $('publisher-result').className='form-feedback';$('publisher-result').textContent='Dados alterados. Faça a revisão novamente.';
  }
  $('publisher-form').addEventListener('input',publisherFields);
  $('publisher-form').addEventListener('submit',e=>{
    e.preventDefault();const form=$('publisher-form');if(!form.reportValidity())return;
    const v=Object.fromEntries(new FormData(form));['ownProperty','registrationChecked','authorization','incorporation','shortStay','condominiumReviewed'].forEach(k=>v[k]=Boolean(v[k]));v.suffix=v.type==='agency'?'J':'F';
    const errors=C.publicationIssues(v);$('publisher-result').replaceChildren();
    if(errors.length){$('publisher-result').className='form-feedback problem';$('publisher-result').append(make('strong','A revisão encontrou pendências:'));const ul=make('ul');errors.forEach(error=>ul.append(make('li',error)));$('publisher-result').append(ul);}
    else{$('publisher-result').className='form-feedback success';$('publisher-result').append(make('strong','Campos de teste preenchidos.'),make('p','A conferência real de identidade, registro, autorização e documentos continua necessária. Nenhum anúncio foi publicado e nenhuma regularidade foi certificada.'));}
  });
  fetch('client-config.json').then(r=>{if(!r.ok)throw Error('Configuração indisponível');return r.json();}).then(value=>{config=value;if(typeof config.brand==='string'&&config.brand.length<=60)$('brand-name').textContent=config.brand+'.';}).catch(()=>{});
  publisherFields();render();
  const initialIntent={comprar:'sale',alugar:'rent',temporada:'stay'}[new URLSearchParams(location.search).get('modo')];
  if(initialIntent)document.querySelector(`[data-intent="${initialIntent}"]`).click();
})();
