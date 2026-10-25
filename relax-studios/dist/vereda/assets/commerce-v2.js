(function(root){
  'use strict';
  function groomingQuote(size,care){
    const base={p:{minutes:45,cents:6500},m:{minutes:60,cents:8500},g:{minutes:90,cents:11500}};
    if(!Object.hasOwn(base,size)||!['banho','tosa'].includes(care)) throw Error('Escolha o porte e o cuidado.');
    return {minutes:base[size].minutes+(care==='tosa'?45:0),cents:base[size].cents+(care==='tosa'?4500:0)};
  }
  function feedDays(kg,grams){
    if(!Number.isFinite(kg)||!Number.isFinite(grams)||kg<.1||kg>100||grams<1||grams>10000) throw Error('Informe a embalagem restante e o consumo total diário.');
    return Math.floor(kg*1000/grams);
  }
  root.VeredaCommerceV2={groomingQuote,feedDays};
  if(typeof module!=='undefined')module.exports=root.VeredaCommerceV2;
  if(typeof document==='undefined')return;
  const $=s=>document.querySelector(s),C=root.VeredaCommerce;
  if(document.body.dataset.sector==='pizzaria'&&C){
    const form=$('#pizza-builder');
    function syncVisual(){
      const a=$('#flavor-a'),b=$('#flavor-b'),half=form.elements.mode.value==='metades';
      $('#visual-flavor-a').textContent=a.selectedOptions[0]?.textContent||'Escolha um sabor';
      $('#visual-flavor-b').textContent=half?(b.selectedOptions[0]?.textContent||'Escolha outro sabor'):'Pizza inteira';
      $('.half-a').dataset.flavor=a.value;$('.half-b').dataset.flavor=half?b.value:a.value;
      $('.pizza-divider').hidden=!half;
      $('.pizza-dial').setAttribute('aria-label','Pizza napoletana em imagem ilustrativa. Sabores selecionados no configurador: '+$('#visual-flavor-a').textContent+(half?' e '+$('#visual-flavor-b').textContent:''));
      try{const result=C.pizzaTotal(C.load('pizzaria'),Object.fromEntries(new FormData(form)));$('#dock-total').textContent=C.money(result.total_centavos);$('#dock-order').disabled=false;}
      catch{ $('#dock-total').textContent='Revise os sabores';$('#dock-order').disabled=true; }
    }
    new MutationObserver(syncVisual).observe($('#pizza-total'),{childList:true,subtree:true});
    form.addEventListener('change',syncVisual);
    document.querySelectorAll('[data-pizza-category]').forEach(button=>button.addEventListener('click',()=>{
      const category=button.dataset.pizzaCategory;
      document.querySelectorAll('[data-pizza-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      const catalogue=C.load('pizzaria');
      document.querySelectorAll('#flavor-menu .flavor').forEach(card=>{const sku=card.querySelector('[data-flavor]')?.dataset.flavor;card.hidden=!!category&&catalogue.find(p=>p.sku===sku)?.categoria!==category;});
    }));syncVisual();
  }
  if(document.body.dataset.sector==='petshop'){
    const form=$('#grooming-form'),result=$('#grooming-result');
    const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
    form.elements.date.min=today();
    function estimate(){const q=groomingQuote(form.elements.size.value,form.elements.care.value);$('#grooming-estimate').textContent=q.minutes+' min estimados · '+C.money(q.cents)+' de referência';result.textContent='';}
    form.addEventListener('input',estimate);
    form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const date=form.elements.date.value;if(date<today()){result.textContent='Escolha hoje ou uma data futura.';return;}const q=groomingQuote(form.elements.size.value,form.elements.care.value);result.textContent='Exemplo preparado para '+date.split('-').reverse().join('/')+', com '+form.elements.professional.value+'. '+q.minutes+' minutos de referência. A equipe precisaria confirmar. Nenhum horário reservado ou aviso enviado.';});estimate();
    let step=0;const names=['Recepção','Em cuidado','Finalização','Pronto para retirada'];
    $('#advance-grooming').addEventListener('click',()=>{step=(step+1)%4;$('#grooming-stages').querySelectorAll('li').forEach((li,i)=>{if(i===step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});$('#tracker-status').textContent=names[step]+' — simulação, nenhum aviso enviado.';$('#advance-grooming').textContent=step===3?'Reiniciar exemplo':'Simular próxima etapa';});
    const feed=$('#feed-form');function calculate(){if(!feed.reportValidity())return;try{const days=feedDays(Number(feed.elements.kg.value),Number(feed.elements.grams.value));$('#feed-estimate').textContent=days?`Cerca de ${days} ${days===1?'dia':'dias'}`:'Menos de um dia';}catch(e){$('#feed-estimate').textContent=e.message;}}
    feed.addEventListener('submit',e=>{e.preventDefault();calculate();});feed.addEventListener('input',()=>{$('#feed-estimate').textContent='Dados alterados. Recalcule a duração.';});calculate();
  }
})(typeof window!=='undefined'?window:globalThis);
