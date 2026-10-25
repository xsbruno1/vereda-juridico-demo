// Runs the actual event handlers in a minimal DOM fixture; no network/browser.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const base = path.resolve(__dirname, '../dist/vereda/assets');
function fixture(kind) {
  const nodes = new Map();
  class Element {
    constructor(id) { this.id=id;this.value='';this.textContent='';this.attributes={};this.events={};this.disabled=false;this.hidden=false;this.checked=false;this.classes=new Set();this.classList={add:v=>this.classes.add(v),remove:v=>this.classes.delete(v),toggle:(v,on)=>on?this.classes.add(v):this.classes.delete(v)}; }
    set innerHTML(html) { this.html=html;if(/<option/.test(html)){const first=html.match(/<option value="([^"]*)"/);if(first)this.value=first[1];} }
    get innerHTML() { return this.html||''; }
    addEventListener(name,fn) { this.events[name]=fn; }
    fire(name,extra={}) { return this.events[name]?.({target:this,preventDefault(){},...extra}); }
    setAttribute(name,value) { this.attributes[name]=value; }
    getAttribute(name) { return this.attributes[name]; }
    removeAttribute(name) { delete this.attributes[name];if(name==='href')this.href=undefined; }
    insertAdjacentHTML() {}
    querySelectorAll() { return this.id==='leave-fields'?['request-person','leave-from','leave-to'].map(get):this.id==='swap-fields'?['request-shift','request-target'].map(get):[]; }
    reportValidity() { return true; }
    reset() { if(this.id==='request-form')get('request-kind').value='leave';this.data={}; }
    focus() { focused=this.id; }
  }
  const get=id=>{if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id);};
  let focused='';
  get('person-filter').value='all';get('request-kind').value='leave';
  const context={URL,URLSearchParams,Intl,Date,Blob,setTimeout,location:{hash:'',search:''},document:{getElementById:get,querySelectorAll:()=>[]},window:{addEventListener(){},print(){}},FormData:class {constructor(form){this.data=form.data||{};}get(k){return this.data[k]??null;}has(k){return Object.hasOwn(this.data,k);}}};
  vm.createContext(context);
  for(const file of [kind+'-core.js',kind+'.js'])vm.runInContext(fs.readFileSync(path.join(base,file),'utf8'),context);
  const submit=(id,data)=>{get(id).data=data;get(id).fire('submit');};
  const clickAction=(container,key,id)=>get(container).fire('click',{target:{closest:selector=>selector===`[data-${key}]`?{dataset:{[key]:id}}:null}});
  return {get,submit,clickAction,focused:()=>focused};
}
let count=0;function test(name,fn){fn();count++;console.log('OK '+name);}
test('invalid week restores the last valid Monday and leaves rendering usable',()=>{
  const {get}=fixture('team');get('week-start').value='2026-11-08';get('week-start').fire('change');assert.equal(get('week-start').value,'2026-11-02');get('week-start').value='';get('week-start').fire('change');assert.equal(get('week-start').value,'2026-11-02');assert.match(get('schedule-status').textContent,/última semana válida/);assert.doesNotThrow(()=>get('person-filter').fire('change'));assert.match(get('report-period').textContent,/02\/11\/2026 a 08\/11\/2026/);
});
test('actual swap approval changes responsibility and preserves keyboard focus',()=>{
  const f=fixture('team');f.clickAction('requests','approve','r1');assert.match(f.get('request-shift').innerHTML,/Camila · exemplo · 27\/10\/2026/);assert.equal(f.focused(),'request-r1');assert.match(f.get('request-status').textContent,/Decisão demonstrativa/);
});
test('a second pending swap cannot silently overwrite a completed swap',()=>{
  const f=fixture('team');f.submit('request-form',{kind:'swap',shift:'s3',target:'rafael'});f.clickAction('requests','approve','r1');f.clickAction('requests','approve','r21');assert.match(f.get('request-status').textContent,/turno mudou/);assert.match(f.get('request-shift').innerHTML,/Camila · exemplo · 27\/10\/2026/);
});
test('approved absence rejects a later conflicting turn through the form',()=>{
  const f=fixture('team');f.clickAction('requests','approve','r2');f.submit('shift-form',{person:'rafael',date:'2026-11-02',start:'09:00',end:'17:00',pause:'60',commission:'0',role:'Operação'});assert.match(f.get('shift-status').textContent,/ausência aprovada/);assert.equal((f.get('request-shift').innerHTML.match(/<option/g)||[]).length,4);
});
test('overnight Sunday entry is displayed as Monday continuation',()=>{
  const f=fixture('team');f.submit('shift-form',{person:'camila',date:'2026-11-01',start:'22:00',end:'06:00',nextDay:'on',pause:'60',commission:'0',role:'Operação'});f.get('week-start').value='2026-11-02';f.get('week-start').fire('change');assert.match(f.get('week').innerHTML,/00:00–06:00 · continuação/);assert.match(f.get('week').innerHTML,/Início em 01\/11\/2026/);assert.equal(f.get('shift-count').textContent,'0 turnos iniciados na semana');
});
test('reset restores request field state as well as the example data',()=>{
  const f=fixture('team');f.get('request-kind').value='swap';f.get('request-kind').fire('change');assert.equal(f.get('leave-fields').hidden,true);f.get('reset-team').fire('click');assert.equal(f.get('request-kind').value,'leave');assert.equal(f.get('leave-fields').hidden,false);assert.equal(f.get('swap-fields').hidden,true);assert.equal(f.get('leave-from').disabled,false);assert.equal(f.get('request-shift').disabled,true);
});
test('editing a ready meeting invalidates its link, readiness and button label',()=>{
  const f=fixture('room');assert.equal(f.get('simulate-ready').disabled,true);f.get('meet-url').value='https://meet.google.com/abc-defg-hij';f.submit('room-form',{});for(const id of ['check-private','check-audio','check-video'])f.get(id).checked=true;f.get('simulate-ready').fire('click');assert.equal(f.get('join-meet').hidden,false);assert.equal(f.get('simulate-ready').getAttribute('aria-pressed'),'true');f.get('meet-url').value='https://meet.google.com/xyz-abcd-efg';f.get('meet-url').fire('input');assert.equal(f.get('join-meet').hidden,true);assert.equal(f.get('join-meet').href,undefined);assert.equal(f.get('simulate-ready').disabled,true);assert.equal(f.get('simulate-ready').getAttribute('aria-pressed'),'false');assert.equal(f.get('simulate-ready').textContent,'Simular liberação pelo profissional');
});
test('reset removes the invalid-link state and clears preparation checks',()=>{
  const f=fixture('room');f.get('meet-url').value='https://example.test';f.submit('room-form',{});assert.equal(f.get('room-status').classes.has('error'),true);f.get('check-audio').checked=true;f.get('clear-room').fire('click');assert.equal(f.get('room-status').classes.has('error'),false);assert.equal(f.get('check-audio').checked,false);assert.equal(f.get('join-meet').hidden,true);
});
console.log(count+' module event-flow regressions passed.');
