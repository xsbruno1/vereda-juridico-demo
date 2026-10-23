(() => {
  'use strict';
  const S = window.VeredaStudio;
  if (!S) return;
  const path = location.pathname.split('/').filter(Boolean), file = path.pop()?.replace('.html', ''), niche = path.pop();
  const model = S.models.find(([n, slug]) => (n === niche || niche === 'saude') && slug === file);
  if (!model) return;
  const override = window.VEREDA_CLIENT_CONFIG || S.read('vereda-profile-' + file, {});
  if (override && typeof override === 'object') {
    const name = S.clean(override.name, 60);
    if (name) {
      document.querySelectorAll('.brand, .logo, .footer-brand, .wordmark').forEach(el => {
        const node = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (node) node.textContent = name;
        el.setAttribute('aria-label', name + ', início');
      });
      document.title = name + ' · Prévia personalizada Vereda';
    }
    if (/^#[a-f0-9]{6}$/i.test(override.accent || '')) document.body.style.setProperty('--accent', override.accent);
    if (/^#[a-f0-9]{6}$/i.test(override.paper || '')) document.body.style.setProperty('--paper', override.paper);
    if (override.headline && document.querySelector('h1')) {
      document.querySelector('h1').textContent = S.clean(override.headline, 120);
      document.querySelector('h1').style.whiteSpace = 'normal';
    }
  }
  const tools = document.createElement('section');
  tools.className = 'vereda-client-tools'; tools.setAttribute('aria-label', 'Ferramentas de demonstração');
  tools.innerHTML = `<div><strong>VEREDA / ${S.esc(model[2])}</strong><span>Área do prestador · configuração e gestão demonstrativas</span></div><nav><a href="../personalizar.html?modelo=${file}">Personalizar este modelo ↗</a><a href="../crm.html?nicho=${model[0]}&modelo=${file}">Organizar atendimentos ↗</a><a href="../campanhas.html?nicho=${model[0]}&modelo=${file}">Preparar campanha ↗</a></nav><div class="vereda-social-links"></div>`;
  document.body.append(tools);
  const socials = tools.querySelector('.vereda-social-links');
  for (const [key, label] of [['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['facebook', 'Facebook'], ['booking', 'Agenda externa']]) {
    try { if (override[key]) { const a = document.createElement('a'); a.href = S.safeUrl(override[key]).href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = label + ' ↗'; socials.append(a); } } catch {}
  }
  if (/^[1-9]\d{9,14}$/.test(override.whatsapp || '')) { const a = document.createElement('a'); a.href = 'https://wa.me/' + override.whatsapp; a.textContent = 'WhatsApp ↗'; a.target = '_blank'; a.rel = 'noopener noreferrer'; socials.append(a); }
  const style = document.createElement('style'); style.textContent = '.vereda-client-tools{padding:28px max(20px,5vw) 70px;border-top:1px solid #bbb;background:#f2f2ec;color:#252a26;font:12px/1.6 Arial,sans-serif}.vereda-client-tools>div:first-child{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap}.vereda-client-tools nav,.vereda-social-links{display:flex;flex-wrap:wrap;gap:22px;margin-top:16px}.vereda-client-tools a{text-decoration:underline;text-underline-offset:5px}.vereda-client-tools button{font:inherit;padding:10px;border:1px solid #aaa;background:transparent;color:inherit;cursor:pointer}.vereda-campaign-choice{margin-top:18px;padding-top:15px;border-top:1px solid #ccc}.vereda-campaign-choice p{max-width:700px;font-size:12px}.vereda-campaign-choice [role=status]{display:block;margin-top:8px}'; document.head.append(style);
  const params = new URLSearchParams(location.search), source = S.clean(params.get('utm_source'), 40), medium = S.clean(params.get('utm_medium'), 30), campaign = S.clean(params.get('utm_campaign'), 100);
  let attribution = null;
  if ([source, medium, campaign].every(v => /^[a-zA-Z0-9_-]{1,100}$/.test(v))) {
    const choice = document.createElement('div'); choice.className = 'vereda-campaign-choice';
    choice.innerHTML = '<p>Este link identifica uma campanha. Você permite associar somente origem, mídia e nome da campanha ao contato fictício desta simulação? Não carregamos pixels nem enviamos dados a plataformas de anúncios.</p><button type="button" data-allow>Permitir nesta página</button> <button type="button" data-deny>Continuar sem identificação</button><span role="status"></span>';
    tools.append(choice);
    choice.querySelector('[data-allow]').addEventListener('click', () => { attribution = { source, medium, campaign }; choice.querySelector('[role=status]').textContent = 'Identificação permitida apenas nesta página.'; choice.querySelectorAll('button').forEach(b => b.disabled = true); });
    choice.querySelector('[data-deny]').addEventListener('click', () => { attribution = null; choice.querySelector('[role=status]').textContent = 'A campanha não será associada ao contato.'; choice.querySelectorAll('button').forEach(b => b.disabled = true); });
  }
  document.addEventListener('vereda:demo-inquiry', event => {
    const data = event.detail || {}, key = 'vereda-demo-v1-' + model[0];
    const state = S.read(key, { contacts: [], appointments: [] });
    if (!state || !Array.isArray(state.contacts) || !Array.isArray(state.appointments)) {
      if (data.result) data.result.textContent = 'Os exemplos salvos neste navegador precisam de revisão. Abra a gestão para recuperá-los. Esta solicitação não foi registrada.';
      return;
    }
    const supplied = S.clean(data.name, 80);
    const name = /^(teste|contato exemplo|pessoa exemplo|qa |demonstração)/i.test(supplied) ? supplied : 'Contato demonstração ' + (state.contacts.length + 1);
    const context = S.clean(data.context, 100);
    if (data.result?.dataset.demoRecorded === 'true') { data.result.textContent='Esta solicitação de exemplo já está no painel. Altere os campos para preparar outra.'; return; }
    state.contacts.push({ id: 'site-' + (crypto.randomUUID?.() || Date.now()), name, source: 'Site próprio', stage: 0, email: 'demo@example.com', owner: 'Equipe de atendimento', date: new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date()), consent: false, done: false, model: file, context, period: S.clean(data.period,40), channel: S.clean(data.channel,40), requestedDate: S.clean(data.requestedDate,10), requestedTime: S.clean(data.requestedTime,5), service: S.clean(data.service,100), attribution });
    const saved = S.write(key, state);
    if (saved && data.result) { data.result.dataset.demoRecorded='true'; const inquiryForm=data.result.closest('form'); inquiryForm?.addEventListener('input',()=>{data.result.dataset.demoRecorded='false';},{once:true}); }
    if (data.result) data.result.textContent = saved ? 'Simulação registrada no CRM deste nicho, neste navegador. Abra “Organizar atendimentos” para conferir. Nenhuma mensagem foi enviada e nenhum horário foi confirmado.' : 'Simulação concluída. O navegador bloqueou o armazenamento; nenhum registro foi salvo. Nenhuma mensagem enviada.';
  });
})();
