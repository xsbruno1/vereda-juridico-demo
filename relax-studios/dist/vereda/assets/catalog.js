const models=[
['advocacia','atlas','Atlas','Institucional editorial','Conteúdo, índice de atuação e contato por contexto.'],
['advocacia','prisma','Prisma','Boutique especializada','Escopos navegáveis para explicar uma atuação específica.'],
['advocacia','acordo','Acordo','Orientação consultiva','Perguntas de entrada ajudam a organizar a primeira conversa.'],
['estetica','aurora','Aurora','Cuidado consultivo','Leitura editorial e orientação conforme o interesse.'],
['estetica','essentia','Essentia','Informação clínica','A avaliação explicada por etapas navegáveis.'],
['estetica','viva','Viva','Catálogo interativo','Escolha por categoria com informações para cada cuidado.'],
['saude','elo','Elo','Consultório médico','Jornadas para diferentes momentos do atendimento.'],
['saude','sorriso','Forma','Consultório odontológico','Exploração de cuidados e próximos passos da avaliação.'],
['saude','integra','Íntegra','Clínica integrada','Busca de especialidades em destaque para facilitar o acesso.']];
const categories={advocacia:'Advocacia',estetica:'Estética',saude:'Saúde'};
document.getElementById('catalog').innerHTML=models.map(([cat,slug,name,type,desc],i)=>`<article class="model" data-category="${cat}"><a class="preview" href="${cat}/${slug}.html" aria-label="Explorar modelo ${name}"><iframe src="${cat}/${slug}.html" title="Prévia visual do modelo ${name}" loading="lazy" tabindex="-1" aria-hidden="true" inert></iframe></a><div class="model-info"><div class="category"><span>${categories[cat]} / ${String(i+1).padStart(2,'0')}</span><span>↗</span></div><h3>${name} <span style="font-size:12px;color:#788075;font-weight:400">/ ${type}</span></h3><p>${desc}</p><a href="${cat}/${slug}.html">Explorar modelo</a></div></article>`).join('');
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});let total=0;document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='todos'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)total++;});document.getElementById('count').textContent=`${total} modelos disponíveis`;}));
if('ResizeObserver' in window){const previews=new ResizeObserver(entries=>{for(const entry of entries){const width=entry.contentRect.width;if(!width)continue;entry.target.querySelector('iframe').style.transform=`scale(${width/1300})`;entry.target.style.height=Math.round(width*.7)+'px';}});document.querySelectorAll('.preview').forEach(el=>previews.observe(el));}
