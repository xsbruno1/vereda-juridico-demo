/* Contribution comparison for equivalent recurring orders, not a revenue forecast. */
function compareChannels(v) {
  const keys = ['orders','basket','food','marketRate','marketExtra','directRate','directExtra','acquisition','monthly','setup','months'];
  if(keys.some(k => !Number.isFinite(v[k]) || v[k] < 0) || v.months < 1 || v.months > 120 || !Number.isInteger(v.months) || !Number.isInteger(v.orders) || v.marketRate > 100 || v.directRate > 100) throw new RangeError('Revise os valores: use números válidos, sem valores negativos.');
  const current = v.basket * (1 - v.marketRate / 100) - v.food - v.marketExtra;
  const direct = v.basket * (1 - v.directRate / 100) - v.food - v.directExtra;
  const delta = direct - current;
  const fixed = v.acquisition + v.monthly + v.setup / v.months;
  const net = v.orders * delta - fixed;
  const breakEven = delta > 1e-9 ? Math.max(0,Math.ceil(fixed / delta - 1e-9)) : null;
  return {current,direct,delta,fixed,net,breakEven};
}
if (typeof module !== 'undefined' && module.exports) module.exports = {compareChannels};
if (typeof document !== 'undefined') {
  const form = document.getElementById('margin-form');
  const output = document.getElementById('margin-output');
  const error = document.getElementById('calc-error');
  const money = value => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  function calculate() {
    if(!form.reportValidity()) return;
    try {
      const values = Object.fromEntries([...new FormData(form)].map(([key,value]) => [key,Number(value)]));
      const r = compareChannels(values);
      const verdict = r.net > 0 ? 'O cenário sugere uma vantagem de margem. Valide demanda e custos reais antes de investir.' : r.net < 0 ? 'Neste cenário, o canal direto não cobre o custo adicional. Revise custos e demanda antes de contratar.' : 'O cenário está no equilíbrio, sem sobra para imprevistos.';
      const warning = r.direct < 0 ? '<p><strong>A margem direta por pedido é negativa.</strong> Mais pedidos podem ampliar o prejuízo, mesmo que a comparação com o outro canal melhore.</p>' : '';
      output.innerHTML = `<dl><dt>Margem por pedido no canal atual</dt><dd>${money(r.current)}</dd><dt>Margem por pedido no canal direto</dt><dd>${money(r.direct)}</dd><dt>Diferença mensal após custos adicionais</dt><dd>${money(r.net)}</dd><dt>Pedidos para cobrir os custos adicionais</dt><dd>${r.breakEven === null ? 'Sem equilíbrio' : r.breakEven.toLocaleString('pt-BR')}</dd></dl><p>${verdict}</p>${warning}<p>Volume informado: ${values.orders.toLocaleString('pt-BR')} pedidos/mês. Custos fixos adicionais e implantação diluída: ${money(r.fixed)}/mês.</p>`;
      error.textContent = '';
    } catch(e) { error.textContent = e.message; output.textContent = 'Revise os dados para calcular.'; }
  }
  form.addEventListener('submit',event => {event.preventDefault();calculate();});
  form.addEventListener('input',() => {output.textContent = 'Cenário alterado. Selecione “Calcular cenário” para atualizar o resultado.';error.textContent='';});
  form.addEventListener('reset',() => {output.textContent = 'Exemplo restaurado. Selecione “Calcular cenário” para atualizar o resultado.';error.textContent='';});
  calculate();
}
