(function(root){'use strict';
const menu=Object.freeze([{id:'cafe',name:'Café da manhã',description:'Pães, fruta e bebida quente. Contém trigo e leite.',cents:4200},{id:'massa',name:'Massa ao molho de tomate',description:'Massa e molho da casa. Contém trigo; consulte demais ingredientes.',cents:5800},{id:'sanduiche',name:'Sanduíche da casa',description:'Pão, queijo e salada. Contém trigo e leite.',cents:3200},{id:'suco',name:'Suco de laranja',description:'Copo de 300 ml. Disponibilidade sob confirmação.',cents:1400}]);
const next={recebido:'preparando',preparando:'pronto',pronto:'entregue'};
function order(cart,session,id){if(!session||session.active!==true)throw Error('Entre na estadia demonstrativa antes de pedir.');const lines=Object.entries(cart).map(([key,qty])=>{const item=menu.find(x=>x.id===key);if(!item||!Number.isInteger(qty)||qty<1||qty>10)throw Error('Revise os itens do pedido.');return {id:key,name:item.name,qty,cents:item.cents};});if(!lines.length)throw Error('Adicione pelo menos um item.');return {id,room:session.room,lines,total:lines.reduce((n,x)=>n+x.qty*x.cents,0),status:'recebido'};}
function transition(order,status){if(status!==next[order.status]&&!(status==='cancelado'&&order.status==='recebido'))throw Error('Esta mudança de status não está disponível.');return {...order,status};}
root.VeredaStay={menu,order,transition,next};
})(globalThis);
