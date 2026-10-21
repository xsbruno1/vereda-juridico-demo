(() => {
 'use strict';
 const tabs=[...document.querySelectorAll('[role="tab"]')], panels=[...document.querySelectorAll('.showcase-panel')], list=document.querySelector('[role="tablist"]'), controls=document.querySelector('.showcase-controls');
 let active=0;
 function show(index,focus=false,update=true){active=(index+tabs.length)%tabs.length;tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===active));t.tabIndex=i===active?0:-1;panels[i].hidden=i!==active;});document.getElementById('showcase-count').textContent=String(active+1).padStart(2,'0')+' / 03';if(focus)tabs[active].focus();if(update)history.replaceState(null,'','#'+tabs[active].id.replace('guia-',''));}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>show(i));tab.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=i+1;else if(e.key==='ArrowLeft')n=i-1;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();show(n,true);});});
 document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>show(active+Number(b.dataset.step))));
 function fromHash(){const match=tabs.findIndex(t=>'#'+t.id.replace('guia-','')===location.hash);show(match<0?0:match,false,false);}
 fromHash();function reserveHeight(){const area=document.querySelector(".showcase-panels");area.classList.add("enhanced");area.style.minHeight="";panels.forEach(p=>p.hidden=false);const height=Math.ceil(area.getBoundingClientRect().height);panels.forEach((p,i)=>p.hidden=i!==active);area.style.minHeight=height+"px";} reserveHeight();window.addEventListener("resize",reserveHeight);list.hidden=false;controls.hidden=false;window.addEventListener('hashchange',fromHash);
 const toggle=document.querySelector('.menu-toggle'),nav=document.getElementById('main-nav');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});document.addEventListener('keydown',e=>{if(e.key==='Escape'){toggle.setAttribute('aria-expanded','false');nav.classList.remove('open');}});document.getElementById('year').textContent=new Date().getFullYear();
})();

