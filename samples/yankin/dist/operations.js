(function(root){
class Operation {
 constructor(){this.rooms={1:'Livre',2:'Livre'};this.accounts=[];this.payouts=[];this.seq=0;}
 start(room,person,minutes){if(this.rooms[room]!=='Livre')throw Error('Sala indisponível');if(!['A','B'].includes(person)||![30,60].includes(minutes))throw Error('Escolha inválida');if(this.accounts.some(a=>a.person===person&&a.active))throw Error('Profissional em atendimento');const a={id:++this.seq,room,person,minutes,service:minutes===30?20000:26000,commission:minutes===30?10000:14000,bar:[],payments:[],active:true,started:Date.now(),ended:null,paidAt:null};this.accounts.push(a);this.rooms[room]='Ocupada';return a;}
 get(id){const a=this.accounts.find(a=>a.id===id);if(!a)throw Error('Comanda não encontrada');return a;}
 total(a){return a.service+a.bar.reduce((s,i)=>s+i.price,0);}
 due(a){return this.total(a)-a.payments.reduce((s,i)=>s+i.amount,0);}
 addBar(id,item){const a=this.get(id);if(!a.active)throw Error('Consumo encerrado');const prices={Água:800,Suco:1200};if(!prices[item])throw Error('Item inválido');a.bar.push({item,price:prices[item]});}
 finish(id){const a=this.get(id);if(!a.active)throw Error('Já encerrado');a.active=false;a.ended=Date.now();this.rooms[a.room]='Em limpeza';}
 clean(room){if(this.rooms[room]!=='Em limpeza')throw Error('Sala não está em limpeza');this.rooms[room]='Livre';}
 pay(id,method,amount){const a=this.get(id);if(a.active)throw Error('Encerre o atendimento');if(!['Pix','Débito','Crédito','Dinheiro'].includes(method)||!Number.isSafeInteger(amount)||amount<=0||amount>this.due(a))throw Error('Valor ou forma inválidos');a.payments.push({method,amount,at:Date.now()});if(!this.due(a))a.paidAt=Date.now();}
 balance(person){return this.accounts.filter(a=>a.person===person&&a.paidAt).reduce((s,a)=>s+a.commission,0)-this.payouts.filter(p=>p.person===person).reduce((s,p)=>s+p.amount,0);}
 payout(person,method,amount){if(!['Pix','Dinheiro'].includes(method)||!Number.isSafeInteger(amount)||amount<=0||amount>this.balance(person))throw Error('Repasse inválido ou superior ao saldo');this.payouts.push({person,method,amount,at:Date.now()});}
}
if(typeof module!=='undefined')module.exports=Operation;else root.YankinOperation=Operation;
})(typeof window!=='undefined'?window:{});
