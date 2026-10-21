(() => {
  'use strict';
  const S = window.VeredaStudio, form = document.getElementById('campaign-form'), $ = id => document.getElementById(id), money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  $('platform').innerHTML = Object.entries(S.platforms).map(([key, p]) => `<option value="${key}">${S.esc(p.name)}</option>`).join('');
  const params = new URLSearchParams(location.search), requested = params.get('nicho');
  if (['advocacia', 'estetica', 'saude'].includes(requested)) $('niche').value = requested;
  const model = S.models.find(m => m[1] === params.get('modelo'));
  if (model) $('niche').value = model[0];
  let drafts = [], current = null;
  const key = () => 'vereda-campaigns-v1-' + $('niche').value;
  function raw() { return Object.fromEntries(new FormData(form)); }
  function data() { const input = raw(), old = drafts.find(d => d.id === input.id); if (old) input.createdAt = old.createdAt; return S.campaign(input, ['localhost', '127.0.0.1'].includes(location.hostname)); }
  function preview() {
    const p = S.platforms[$('platform').value];
    $('platform-name').textContent = p.name + ' / Briefing'; $('manager-link').href = p.manager;
    $('headline-limit').textContent = `${form.elements.headline.value.length}/${p.headline} caracteres sugeridos para uma peça simples.`;
    $('description-limit').textContent = `${form.elements.description.value.length}/${p.description} caracteres sugeridos; limites variam por formato.`;
    $('draft-heading').textContent = form.elements.headline.value || 'Sua mensagem aparece aqui.';
    $('draft-description').textContent = form.elements.description.value || 'Preencha o formulário para ver a composição do anúncio.';
    try { current = data(); $('tracked-url').href = current.landing; $('tracked-url').textContent = current.landing; $('tracked-url').removeAttribute('aria-disabled'); $('daily-budget').textContent = money(current.daily); $('total-budget').textContent = money(current.plannedTotal); }
    catch { current = null; $('tracked-url').removeAttribute('href'); $('tracked-url').textContent = 'Preencha uma URL válida e os campos obrigatórios.'; $('tracked-url').setAttribute('aria-disabled', 'true'); $('daily-budget').textContent = money(0); $('total-budget').textContent = money(0); }
  }
  function render() {
    $('draft-list').innerHTML = drafts.length ? drafts.map(d => `<article class="draft-row"><span class="status ${d.status === 'revisao' ? 'ready' : ''}">${d.status === 'revisao' ? 'PARA REVISÃO DO CLIENTE' : 'RASCUNHO'}</span><h3>${S.esc(d.name)}</h3><p>${S.esc(S.platforms[d.platform].name)} · ${money(d.daily)}/dia · ${d.days} dias · estimativa ${money(d.plannedTotal)}</p><p>${S.esc(d.headline)}</p><div class="actions"><button class="secondary" data-edit="${S.esc(d.id)}">Editar</button><button class="danger" data-remove="${S.esc(d.id)}">Excluir rascunho</button></div></article>`).join('') : '<p class="empty">Nenhum rascunho salvo neste nicho. Prepare o primeiro ao lado.</p>';
  }
  function load() {
    const stored = S.read(key(), []); drafts = [];
    if (Array.isArray(stored)) for (const d of stored.slice(0, 100)) { try { drafts.push(S.campaign(d, ['localhost', '127.0.0.1'].includes(location.hostname))); } catch {} }
    $('crm-link').href = 'crm.html?nicho=' + $('niche').value;
    const selected = model && model[0] === $('niche').value ? model : S.models.find(m => m[0] === $('niche').value);
    $('profile-link').href = 'personalizar.html?modelo=' + selected[1];
    render(); preview();
  }
  function clear() { const niche = $('niche').value; form.reset(); $('niche').value = niche; form.elements.id.value = ''; $('campaign-error').textContent = ''; preview(); }
  form.addEventListener('input', preview); $('platform').addEventListener('change', preview); $('niche').addEventListener('change', () => { clear(); load(); });
  form.addEventListener('submit', e => { e.preventDefault(); try { if (!form.reportValidity()) return; const d = data(); const existing = drafts.findIndex(x => x.id === d.id); if (existing >= 0) drafts[existing] = d; else drafts.push(d); if (!S.write(key(), drafts)) throw new Error('Armazenamento bloqueado; exporte o briefing para preservar seu rascunho.'); form.elements.id.value = d.id; render(); $('campaign-error').textContent = d.textReviewNeeded ? 'Rascunho salvo. Revise os limites de texto do formato escolhido.' : 'Rascunho salvo localmente. Revisão e publicação acontecem na conta de anúncios.'; } catch (error) { $('campaign-error').textContent = error.message; } });
  $('clear-draft').addEventListener('click', clear);
  $('draft-list').addEventListener('click', e => { const edit = e.target.closest('[data-edit]'), remove = e.target.closest('[data-remove]'); if (edit) { const d = drafts.find(x => x.id === edit.dataset.edit); for (const k of ['id', 'platform', 'name', 'tag', 'landing', 'headline', 'description', 'daily', 'days', 'status']) form.elements[k].value = d[k]; preview(); form.elements.name.focus(); } if (remove && confirm('Excluir somente este rascunho local?')) { drafts = drafts.filter(d => d.id !== remove.dataset.remove); S.write(key(), drafts); render(); } });
  function download(content, type, extension) { const url = URL.createObjectURL(new Blob([content], { type })), a = document.createElement('a'); a.href = url; a.download = `vereda-briefings-${$('niche').value}.${extension}`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  $('export-json').addEventListener('click', () => download(JSON.stringify({ demo: true, automaticPublishing: false, drafts }, null, 2), 'application/json', 'json'));
  $('export-csv').addEventListener('click', () => { const fields = ['name', 'platform', 'landing', 'headline', 'description', 'daily', 'days', 'plannedTotal', 'status']; download('\uFEFF' + [fields, ...drafts.map(d => fields.map(k => d[k]))].map(row => row.map(S.csvCell).join(';')).join('\r\n'), 'text/csv;charset=utf-8', 'csv'); });
  $('copy-brief').addEventListener('click', async () => { try { const d = data(), text = [d.name, S.platforms[d.platform].name, d.headline, d.description, d.landing, `${money(d.daily)}/dia, ${d.days} dias, soma planejada ${money(d.plannedTotal)}.`, 'Rascunho: publicar e aprovar orçamento na conta do cliente.'].join('\n'); await navigator.clipboard.writeText(text); $('copy-status').textContent = 'Briefing copiado. Nenhuma campanha foi publicada.'; } catch (error) { $('copy-status').textContent = error.message || 'Não foi possível copiar; use a exportação JSON.'; } });
  load();
})();
