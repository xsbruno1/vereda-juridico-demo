const buttons = [...document.querySelectorAll('[data-filter]')];
function filterModels(sector, updateURL = true) {
  if (!buttons.some(b => b.dataset.filter === sector)) sector = 'todos';
  let count = 0;
  document.querySelectorAll('[data-category]').forEach(card => {
    card.hidden = sector !== 'todos' && card.dataset.category !== sector;
    if (!card.hidden) count++;
  });
  buttons.forEach(b => { const selected = b.dataset.filter === sector; b.classList.toggle('active',selected); b.setAttribute('aria-pressed',String(selected)); });
  document.getElementById('count').textContent = `${count} ${count === 1 ? 'modelo disponível' : 'modelos disponíveis'}`;
  if (updateURL) { const url = new URL(location.href); if (sector === 'todos') url.searchParams.delete('setor'); else url.searchParams.set('setor',sector); history.replaceState(null,'',url); }
}
buttons.forEach(b => b.addEventListener('click',() => filterModels(b.dataset.filter)));
filterModels(new URLSearchParams(location.search).get('setor') || 'todos',false);
window.addEventListener('popstate',() => filterModels(new URLSearchParams(location.search).get('setor') || 'todos',false));
