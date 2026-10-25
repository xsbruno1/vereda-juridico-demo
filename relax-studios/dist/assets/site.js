(() => {
  'use strict';
  const $ = id => document.getElementById(id), cfg = window.RELAX_CONFIG || {}, nav = $('main-nav'), toggle = document.querySelector('.menu-toggle');
  toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { nav?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); } });
  const intents = {
    presenca: ['COMECE PELO VEREDA', 'Um site que explica o valor do seu trabalho.', 'Escolha uma direção visual. Adaptamos a identidade, o conteúdo e os canais à realidade do seu negócio.', '#vereda', 'Explorar a coleção'],
    operacao: ['SITE + RELACIONAMENTO', 'O primeiro contato merece um próximo passo.', 'Conecte apresentação e rotina. Contatos, etapas, responsáveis e agenda são definidos conforme sua operação.', 'vereda/crm.html?nicho=advocacia', 'Experimentar o CRM'],
    produto: ['DA HIPÓTESE AO PROTÓTIPO', 'Sua ideia precisa encontrar quem vai usar.', 'Ferramentas de estudo, jogos e experiências interativas mostram diferentes maneiras de transformar uma ideia em produto.', '#projetos', 'Conhecer os projetos']
  };
  document.querySelectorAll('[data-intent]').forEach(button => button.addEventListener('click', () => { const [kicker, title, copy, href, label] = intents[button.dataset.intent]; document.querySelectorAll('[data-intent]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); $('intent-kicker').textContent = kicker; $('intent-title').textContent = title; $('intent-copy').textContent = copy; $('intent-link').href = href; $('intent-link').replaceChildren(document.createTextNode(label + ' ')); const arrow = document.createElement('span'); arrow.textContent = '→'; $('intent-link').append(arrow); }));
  const models = {
    advocacia: [['atlas', 'Atlas', 'Institucional editorial', 'Áreas de atuação, conteúdo e contato com contexto.'], ['prisma', 'Prisma', 'Boutique especializada', 'Escopos navegáveis para explicar uma atuação específica.'], ['acordo', 'Acordo', 'Orientação consultiva', 'Uma entrada guiada pelo assunto da primeira conversa.']],
    estetica: [['aurora', 'Aurora', 'Cuidado consultivo', 'Conteúdo editorial e descoberta conforme o interesse.'], ['essentia', 'Essentia', 'Clareza na avaliação', 'Um guia de atendimento para entender cada etapa.'], ['viva', 'Viva', 'Catálogo interativo', 'Categorias de cuidado, perguntas e próximos passos.']],
    saude: [['elo', 'Elo', 'Consultório médico', 'Diferentes momentos de uma jornada de cuidado.'], ['sorriso', 'Forma', 'Consultório odontológico', 'Prevenção, avaliação e continuidade em uma composição própria.'], ['integra', 'Íntegra', 'Clínica integrada', 'Busca de especialidades para chegar ao atendimento.']]
  };
  let observer;
  function renderModels(niche) {
    observer?.disconnect();
    $('model-list').innerHTML = models[niche].map(([slug, name, kind, text]) => `<article class="model-card"><a class="model-frame" href="vereda/${niche}/${slug}.html" aria-label="Explorar ${name}"><iframe src="vereda/${niche}/${slug}.html" title="Prévia do modelo ${name}" loading="lazy" tabindex="-1" aria-hidden="true" inert></iframe></a><div class="model-card-top"><h3>${name}</h3><span class="micro">${kind}</span></div><p>${text}</p><div class="model-card-links"><a href="vereda/${niche}/${slug}.html">Explorar site ↗</a><a href="vereda/personalizar.html?modelo=${slug}">Personalizar ↗</a><a href="vereda/crm.html?nicho=${niche}">Ver CRM ↗</a></div></article>`).join('');
    if ('ResizeObserver' in window) { observer = new ResizeObserver(entries => { for (const entry of entries) { const frame = entry.target.querySelector('iframe'); if (frame) frame.style.transform = `scale(${entry.contentRect.width / 1300})`; } }); document.querySelectorAll('.model-frame').forEach(el => observer.observe(el)); }
  }
  document.querySelectorAll('[data-niche]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-niche]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); renderModels(button.dataset.niche); }));
  if ($('model-list')) renderModels('advocacia');
  if ($('year')) $('year').textContent = new Date().getFullYear();
  const form = $('brief-form');
  if (!form) return;
  const interests = { presenca: 'Site personalizado', atendimento: 'Organização do atendimento', continuidade: 'Acompanhamento mensal' };
  const selectedInterest = interests[new URLSearchParams(location.search).get('interesse')];
  if (selectedInterest) form.elements.package.value = selectedInterest;
  if (cfg.emailActive === true && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.email || '')) {
    $('contact-email').href = 'mailto:' + cfg.email; $('contact-email').removeAttribute('aria-disabled');
    $('email-state').textContent = 'Escreva para o estúdio ou prepare seu briefing no formulário.';
  }
  document.querySelectorAll('[data-package]').forEach(a => a.addEventListener('click', () => { form.elements.package.value = a.dataset.package; }));
  function brief() {
    if (!form.reportValidity()) return null;
    const data = new FormData(form), val = key => String(data.get(key) || '').trim();
    return ['BRIEFING / RELAX STUDIOS', '', 'Nome: ' + val('name'), 'Empresa ou projeto: ' + val('company'), 'E-mail de retorno: ' + val('email'), 'Interesse: ' + val('package'), '', 'Objetivo:', val('goal'), '', 'Proposta sujeita à definição e aprovação de escopo.'].join('\n');
  }
  form.addEventListener('submit', e => { e.preventDefault(); const text = brief(); if (!text) return; $('brief-text').value = text; $('brief-result').hidden = false; if (cfg.emailActive === true && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.email || '')) { $('send-brief').href = `mailto:${cfg.email}?subject=${encodeURIComponent('Projeto / Relax Studios')}&body=${encodeURIComponent(text)}`; $('send-brief').hidden = false; } $('brief-status').textContent = 'Briefing preparado neste navegador. Nenhuma mensagem foi enviada automaticamente.'; });
  form.addEventListener('input', () => { if (!$('brief-result').hidden) { $('brief-result').hidden = true; $('send-brief').hidden = true; $('send-brief').removeAttribute('href'); $('brief-status').textContent = 'Você alterou as respostas. Prepare o briefing novamente antes de enviar.'; } });
  $('copy-brief').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('brief-text').value); $('brief-status').textContent = 'Briefing copiado.'; } catch { $('brief-text').focus(); $('brief-text').select(); $('brief-status').textContent = 'Selecione e copie o texto do briefing.'; } });
  $('download-brief').addEventListener('click', () => { const text = brief(); if (!text) return; const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })), a = document.createElement('a'); a.href = url; a.download = 'briefing-relax-studios.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); $('brief-status').textContent = 'Briefing preparado para download. Os campos não são armazenados pelo site.'; });
  $('year').textContent = new Date().getFullYear();
})();
