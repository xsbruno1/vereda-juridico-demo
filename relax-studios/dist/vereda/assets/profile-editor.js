(() => {
  'use strict';
  const S = window.VeredaStudio, form = document.getElementById('profile-form'), select = document.getElementById('model');
  const $ = id => document.getElementById(id);
  const labels={advocacia:'Advocacia',estetica:'Estética',medicina:'Medicina',odontologia:'Odontologia',petshop:'Petshop',pizzaria:'Pizzaria',salao:'Salão de beleza',hotelaria:'Hotelaria e motéis',psiquiatria:'Psicologia e psiquiatria'};
  select.innerHTML = S.models.map(([n, slug, name]) => `<option value="${slug}">${S.esc(name)} · ${labels[n]}</option>`).join('');
  const asked = new URLSearchParams(location.search).get('modelo');
  if (S.models.some(m => m[1] === asked)) select.value = asked;
  function current() { return S.models.find(m => m[1] === select.value); }
  function preview() {
    const [niche, slug, name] = current(), url = `${niche}/${slug}.html`;
    $('client-preview').src = url; $('open-preview').href = url; $('preview-name').textContent = name + ' / Prévia local';
    $('crm-link').href = 'crm.html?nicho='+niche+'&modelo='+slug; $('campaign-link').href = 'campanhas.html?nicho=' + niche + '&modelo=' + slug;
  }
  function load() {
    const model = select.value, p = S.read('vereda-profile-' + model, {});
    form.reset(); select.value = model;
    for (const key of ['name', 'headline', 'accent', 'paper', 'instagram', 'linkedin', 'facebook', 'booking', 'whatsapp']) if (typeof p[key] === 'string') form.elements[key].value = p[key];
    $('profile-error').textContent = ''; preview();
  }
  function data() {
    if (!form.reportValidity()) return null;
    const p = Object.fromEntries(new FormData(form)); p.version = 1; p.niche = current()[0];
    p.name = S.clean(p.name, 60); p.headline = S.clean(p.headline, 120);
    for (const k of ['instagram', 'linkedin', 'facebook', 'booking']) if (p[k]) p[k] = S.safeUrl(p[k]).href;
    return p;
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    try { const p = data(); if (!p) return; if (!S.write('vereda-profile-' + p.model, p)) throw new Error('O armazenamento está bloqueado. Exporte a configuração para preservar as alterações.'); preview(); $('profile-error').textContent = 'Prévia atualizada neste navegador.'; } catch (error) { $('profile-error').textContent = error.message; }
  });
  select.addEventListener('change', load);
  $('download-profile').addEventListener('click', () => {
    try { const p = data(); if (!p) return; const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'vereda-cliente-' + p.model + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); $('profile-error').textContent = 'Configuração pública exportada.'; } catch (error) { $('profile-error').textContent = error.message; }
  });
  $('reset-profile').addEventListener('click', () => { if (!confirm('Restaurar somente a personalização deste modelo?')) return; try { localStorage.removeItem('vereda-profile-' + select.value); load(); } catch { $('profile-error').textContent = 'O navegador bloqueou a alteração.'; } });
  load();
})();
