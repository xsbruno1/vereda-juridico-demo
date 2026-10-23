let config;
const form=document.querySelector('#request-form');
const status=document.querySelector('#request-status');
fetch(document.body.dataset.config).then(r=>{if(!r.ok)throw Error('Configuração indisponível');return r.json()}).then(c=>{config=c;updatePrice()}).catch(e=>{status.textContent=e.message;form.querySelector('button').disabled=true});
function updatePrice(){if(!config||!document.querySelector('#price'))return;const period=form.elements.period.value;const base=config.base_cents[period];const cents=Math.round(base*Number(config.rate_multiplier));document.querySelector('#price').textContent=`Referência demonstrativa: ${(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} / ${period}. Valor final e limpeza sujeitos à confirmação.`}
form?.elements.period?.addEventListener('change',updatePrice);
form?.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity()||!config)return;if(config.demo||!config.whatsapp){status.textContent='Solicitação demonstrada. Nenhuma mensagem foi enviada: o contato real será configurado pelo cliente.';return}const text=config.contact_message;const link=document.createElement('a');link.href=`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;link.target='_blank';link.rel='noopener noreferrer';link.click();status.textContent='WhatsApp solicitado. Aguarde a confirmação da recepção.'});
