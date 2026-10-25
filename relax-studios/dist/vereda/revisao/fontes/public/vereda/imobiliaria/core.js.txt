/* Date-only availability and conservative, demonstration-only publication checks. */
(function(root){
  'use strict';
  const DAY=86400000;
  function dateValue(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) throw Error('Escolha uma data válida.');
    const time=Date.parse(value+'T00:00:00Z');
    if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==value) throw Error('Escolha uma data válida.');
    return time;
  }
  function iso(time){return new Date(time).toISOString().slice(0,10);}
  function addDays(date,days){return iso(dateValue(date)+days*DAY);}
  function nightsBetween(start,end){return (dateValue(end)-dateValue(start))/DAY;}
  function overlaps(a,b){return dateValue(a.start)<dateValue(b.end)&&dateValue(b.start)<dateValue(a.end);}
  function rateFor(property,date){
    dateValue(date);
    const special=property.specialRates?.[date];
    if(special!==undefined) return special;
    return [5,6].includes(new Date(date+'T00:00:00Z').getUTCDay())?property.weekend:property.weekday;
  }
  function quoteStay(property,start,end,guests,extra=[],today){
    const nights=nightsBetween(start,end);
    if(nights<=0) throw Error('A saída precisa ser depois da entrada.');
    if(nights>90) throw Error('Esta demonstração de temporada aceita no máximo 90 dias. Para outro período, consulte uma proposta de locação.');
    if(nights<(property.minimumNights||1)) throw Error(`Escolha pelo menos ${property.minimumNights} noites.`);
    if(today&&dateValue(start)<dateValue(today)) throw Error('Escolha uma entrada a partir de hoje.');
    if(!Number.isInteger(guests)||guests<1||guests>property.capacity) throw Error(`Este imóvel demonstrativo recebe até ${property.capacity} pessoas.`);
    const range={start,end};
    if([...(property.blocked||[]),...extra].some(b=>overlaps(range,b))) throw Error('Há noites bloqueadas nesse intervalo. Escolha outras datas.');
    const daily=Array.from({length:nights},(_,i)=>{const date=addDays(start,i);return{date,cents:rateFor(property,date)};});
    if(daily.some(d=>!Number.isSafeInteger(d.cents)||d.cents<0)) throw Error('Tarifa indisponível. Consulte a equipe.');
    const subtotal=daily.reduce((sum,d)=>sum+d.cents,0),cleaning=property.cleaning||0;
    if(!Number.isSafeInteger(cleaning)||cleaning<0||!Number.isSafeInteger(subtotal+cleaning))throw Error('Custos indisponíveis. Consulte a equipe.');
    return {nights,daily,subtotal,cleaning,total:subtotal+cleaning};
  }
  function filterProperties(properties,filter){
    return properties.filter(p=>p.intent===filter.intent&&(!filter.neighborhood||p.neighborhood===filter.neighborhood)&&p.bedrooms>=Number(filter.bedrooms||0)&&(!filter.maximum||p.price<=Number(filter.maximum)*100));
  }
  const STATES=new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));
  function publicationIssues(config){
    const errors=[];
    if(!['agency','agent','owner'].includes(config.type)) return ['Identifique quem anuncia o imóvel.'];
    if(!String(config.name||'').trim()) errors.push('Informe o nome do responsável.');
    if(config.type==='owner'){
      if(!config.ownProperty) errors.push('O modo proprietário exige confirmar que se trata de imóvel próprio, sem intermediação de terceiros.');
    }else{
      if(!STATES.has(config.state)) errors.push('Informe a unidade federativa do CRECI.');
      if(!/^[1-9]\d{0,7}$/.test(String(config.registration||''))) errors.push('Informe o número do CRECI; zeros demonstrativos não são válidos.');
      if(config.suffix!==(config.type==='agency'?'J':'F')) errors.push('Use CRECI-J para pessoa jurídica ou CRECI-F para corretor pessoa física.');
      if(!config.registrationChecked) errors.push('A situação do registro precisa ser conferida no Conselho competente.');
    }
    if(!config.authorization) errors.push('Confirme a autorização para anunciar e a revisão dos dados.');
    if(config.incorporation&&(!String(config.incorporationNumber||'').trim()||!String(config.registryOffice||'').trim())) errors.push('Para incorporação, informe registro e cartório aplicáveis.');
    if(config.shortStay&&!config.condominiumReviewed) errors.push('Para temporada, revise a convenção e as regras do condomínio.');
    return errors;
  }
  function parseIcal(text){
    if(typeof text!=='string'||text.length>262144) throw Error('Use um calendário de teste de até 256 KB.');
    const lines=text.replace(/\r?\n[ \t]/g,'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    if(lines[0]!=='BEGIN:VCALENDAR'||lines.at(-1)!=='END:VCALENDAR') throw Error('Arquivo iCal inválido.');
    if(lines.some(l=>/^(RRULE|RDATE|EXDATE|RECURRENCE-ID|DURATION)(;|:)/.test(l))) throw Error('Esta demonstração aceita apenas bloqueios de dia inteiro, sem repetição. O arquivo não foi aplicado.');
    const ranges=[];let current=null;
    for(const line of lines){
      if(line==='BEGIN:VEVENT'){if(current)throw Error('Evento inválido.');current={};continue;}
      if(line==='END:VEVENT'){
        if(!current)throw Error('Evento inválido.');
        if(current.status!=='CANCELLED'&&current.transp!=='TRANSPARENT'){
          if(!current.start)throw Error('Evento sem data inicial. O arquivo não foi aplicado.');
          const end=current.end||addDays(current.start,1);
          if(nightsBetween(current.start,end)<=0||nightsBetween(current.start,end)>3660)throw Error('Intervalo de calendário inválido.');
          ranges.push({start:current.start,end});
        }
        current=null;continue;
      }
      if(!current)continue;
      if(/^DT(START|END)(;|:)/.test(line)){
        const match=/^DT(START|END);VALUE=DATE:(\d{4})(\d{2})(\d{2})$/.exec(line);
        if(!match)throw Error('Evento com horário ou formato não suportado. Use datas de dia inteiro; nada foi importado.');
        const value=`${match[2]}-${match[3]}-${match[4]}`;dateValue(value);
        const key=match[1]==='START'?'start':'end';if(current[key])throw Error('Evento com datas duplicadas.');current[key]=value;
      }else if(line.startsWith('STATUS:')){if(current.status!==undefined)throw Error('Evento com status duplicado.');current.status=line.slice(7);}
      else if(line.startsWith('TRANSP:')){if(current.transp!==undefined)throw Error('Evento com transparência duplicada.');current.transp=line.slice(7);}
    }
    if(current)throw Error('Evento incompleto.');
    if(ranges.length>500)throw Error('Use até 500 bloqueios de teste.');
    return ranges.filter((range,i,self)=>self.findIndex(r=>r.start===range.start&&r.end===range.end)===i);
  }
  function exportIcal(ranges,id,stamp=new Date()){
    if(!/^[a-z0-9-]+$/i.test(id))throw Error('Identificador inválido.');
    const compact=v=>v.replaceAll('-','');
    const dtstamp=stamp.toISOString().replaceAll('-','').replaceAll(':','').replace(/\.\d{3}/,'');
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Relax Studios//Morada Demo//PT-BR','CALSCALE:GREGORIAN'];
    ranges.forEach((r,i)=>{if(nightsBetween(r.start,r.end)<=0)throw Error('Intervalo inválido.');lines.push('BEGIN:VEVENT',`UID:${id}-${compact(r.start)}-${compact(r.end)}-${i}@demo.invalid`,`DTSTAMP:${dtstamp}`,`DTSTART;VALUE=DATE:${compact(r.start)}`,`DTEND;VALUE=DATE:${compact(r.end)}`,'SUMMARY:Bloqueio demonstrativo','TRANSP:OPAQUE','END:VEVENT');});
    return lines.concat('END:VCALENDAR','').join('\r\n');
  }
  const api={dateValue,addDays,nightsBetween,overlaps,rateFor,quoteStay,filterProperties,publicationIssues,parseIcal,exportIcal};
  root.MoradaCore=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
