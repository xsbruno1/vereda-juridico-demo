/* Planned shifts only. No attendance, wage, tax or collective-agreement engine. */
(function(root){
  'use strict';
  function day(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error('Informe uma data válida.');
    const t=Date.parse(value+'T00:00:00Z');
    if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==value) throw Error('Informe uma data válida.');
    return t;
  }
  function minute(value){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))throw Error('Confira os horários.');const [h,m]=value.split(':').map(Number);return h*60+m;}
  function interval(s){
    const start=day(s.date)+minute(s.start)*60000;
    const end=day(s.date)+(minute(s.end)+(s.nextDay?1440:0))*60000;
    const pause=Number(s.pause), commission=Number(s.commission);
    if(end<=start||end-start>24*60*60000)throw Error('O fim deve ser posterior ao início. Marque “termina no dia seguinte” quando necessário.');
    if(!Number.isInteger(pause)||pause<0||pause>=(end-start)/60000)throw Error('O intervalo deve ser menor que a duração do turno.');
    if(!Number.isFinite(commission)||commission<0||commission>100000)throw Error('Confira o valor informado de comissão.');
    return {start,end,minutes:(end-start)/60000-pause};
  }
  function overlap(a,b){return a.start<b.end&&b.start<a.end;}
  function weekRange(value){
    const selected=day(value),weekday=new Date(selected).getUTCDay(),monday=selected-((weekday+6)%7)*86400000;
    const from=new Date(monday).toISOString().slice(0,10),to=new Date(monday+6*86400000).toISOString().slice(0,10);
    day(from);day(to);
    return {from,to};
  }
  function dayShifts(shifts,value,person='all'){
    const start=day(value),range={start,end:start+86400000};
    return shifts.filter(s=>(person==='all'||s.person===person)&&overlap(interval(s),range)).sort((a,b)=>Math.max(interval(a).start,start)-Math.max(interval(b).start,start));
  }
  function validateShift(s,shifts,leaves,people){
    if(!people.some(p=>p.id===s.person))throw Error('Escolha uma pessoa da equipe demonstrativa.');
    const next=interval(s);
    if(shifts.some(x=>x.id!==s.id&&x.person===s.person&&overlap(next,interval(x))))throw Error('Esta pessoa já tem um turno nesse horário.');
    if(leaves.some(x=>x.kind!=='swap'&&x.person===s.person&&x.status==='approved'&&overlap(next,{start:day(x.from),end:day(x.to)+86400000})))throw Error('O turno coincide com uma ausência aprovada.');
    return next;
  }
  function validateLeave(leave,shifts,leaves,people){
    if(!people.some(p=>p.id===leave.person))throw Error('Escolha uma pessoa da equipe.');
    const range={start:day(leave.from),end:day(leave.to)+86400000};
    if(range.end<=range.start)throw Error('A data final deve ser igual ou posterior à inicial.');
    if(shifts.some(s=>s.person===leave.person&&overlap(interval(s),range)))throw Error('Há turnos nesse período. Reorganize a escala antes de aprovar a ausência.');
    if(leaves.some(x=>x.kind!=='swap'&&x.id!==leave.id&&x.person===leave.person&&x.status==='approved'&&overlap(range,{start:day(x.from),end:day(x.to)+86400000})))throw Error('Já existe uma ausência aprovada nesse período.');
    return true;
  }
  function summary(shifts,people,from,to){
    day(from);day(to);if(to<from)throw Error('Período inválido.');
    return people.map(person=>{const list=shifts.filter(s=>s.person===person.id&&s.date>=from&&s.date<=to);return {person:person.name,shifts:list.length,minutes:list.reduce((a,s)=>a+interval(s).minutes,0),commissionCents:list.reduce((a,s)=>a+Math.round(Number(s.commission)*100),0)};});
  }
  function csvCell(value){let v=String(value);if(/^[\s]*[=+@-]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';}
  function csv(rows,from,to){const data=[['PRÉ-FOLHA INFORMATIVA — DEMONSTRAÇÃO, NÃO É HOLERITE'],['Período de início dos turnos',from,to],['Pessoa fictícia','Turnos planejados','Minutos planejados líquidos de intervalo','Comissões informadas (R$)'],...rows.map(r=>[r.person,r.shifts,r.minutes,(r.commissionCents/100).toFixed(2)]),['Planejamento, não horas efetivamente trabalhadas. Sem salário líquido, impostos, adicionais ou validação contábil.']];return '\ufeff'+data.map(r=>r.map(csvCell).join(';')).join('\r\n');}
  root.VeredaTeam={day,minute,interval,overlap,weekRange,dayShifts,validateShift,validateLeave,summary,csvCell,csv};
})(typeof globalThis!=='undefined'?globalThis:this);
