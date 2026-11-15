const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const D={ka:'owner',kb:'user1'};
async function mk(key,vp){
 const c=await b.newContext({viewport:vp||{width:1180,height:820},deviceScaleFactor:1});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 await p.route('**/*',r=>{const u=r.request().url();
  if(/localhost:8765/.test(u))return r.continue();
  if(/script\.google\.com\/macros\/s\/MYAPI/.test(u)){let q={};try{q=JSON.parse(r.request().postData()||'{}')}catch(e){}
   const h={'access-control-allow-origin':'*'};const n=D[q.key];
   let body;if(q.t&&!n)body={ok:false,err:'รหัสไม่ถูกต้อง'};else if(q.t==='my'&&q.op==='list')body={ok:true,user:n,rows:[]};else if(q.op==='list'&&q.t)body={ok:true,routes:[]};else if(q.op==='list')body={ok:true,rows:[]};else body={ok:true};
   return r.fulfill({status:200,contentType:'application/json',headers:h,body:JSON.stringify(body)})}
  return r.abort()});
 await p.addInitScript(`try{localStorage.setItem('heliPubApi','https://script.google.com/macros/s/MYAPI/exec');${key?`localStorage.setItem('heliMyKey','${key}');`:''}}catch(e){}`);
 await p.goto('http://localhost:8765/v4.2.2.html');await p.waitForTimeout(3500);return {p,er,c}}
const tag=p=>p.evaluate(()=>{const e=document.getElementById('myuser');const l=document.querySelector('.tkey');const tn=[...l.childNodes].find(n=>n.nodeType===3&&n.textContent.includes('กรอกรหัส'));const r=document.createRange();r.selectNodeContents(tn);const tr=r.getBoundingClientRect(),er=e.getBoundingClientRect();return {hidden:e.hidden,text:e.textContent,insideLabelBeforeText:e.parentElement===l&&(e.compareDocumentPosition(tn)&4)>0,userCenterY:Math.round((er.top+er.bottom)/2*10)/10,labelTextCenterY:Math.round((tr.top+tr.bottom)/2*10)/10,gap:Math.round(tr.left-er.right)}});
{const {p,er,c}=await mk('ka');console.log('1 key ka  :',JSON.stringify(await tag(p)),er);await p.screenshot({path:'/tmp/t/hdr1.png',clip:{x:0,y:0,width:1180,height:70}});await c.close()}
{const {p,er,c}=await mk('kx');console.log('2 wrong   :',JSON.stringify(await tag(p)),er);await c.close()}
{const {p,er,c}=await mk('');console.log('3 no key  :',JSON.stringify(await tag(p)),er);
 // type key in header box
 await p.fill('#mykey2','kb');await p.press('#mykey2','Enter');await p.waitForTimeout(2500);console.log('4 typed kb:',JSON.stringify(await tag(p)));
 await p.fill('#mykey2','kx');await p.press('#mykey2','Enter');await p.waitForTimeout(2500);console.log('5 typed kx:',JSON.stringify(await tag(p)));
 await p.fill('#mykey2','');await p.press('#mykey2','Enter');await p.waitForTimeout(1500);console.log('6 cleared :',JSON.stringify(await tag(p)));await c.close()}
{const {p,c}=await mk('kb',{width:390,height:800});console.log('7 phone   :',JSON.stringify(await tag(p)));await p.screenshot({path:'/tmp/t/hdr2.png',clip:{x:0,y:0,width:390,height:140}});await c.close()}
await b.close()})();
