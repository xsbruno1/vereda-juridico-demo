(function(root){'use strict';
 function meetingURL(value){try{const url=new URL(String(value).trim());if(url.protocol!=='https:'||url.hostname!=='meet.google.com'||url.username||url.password||url.port||url.search||url.hash||!/^\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(url.pathname))return null;return url.href;}catch{return null;}}
 function canJoin(link,prepared,ready){return Boolean(meetingURL(link)&&prepared===true&&ready===true);}
 root.VeredaRoom={meetingURL,canJoin};
})(typeof globalThis!=='undefined'?globalThis:this);
