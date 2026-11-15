const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
async function mk(withKey,scriptDown){
 const c=await b.newContext({viewport:{width:1180,height:820}});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 const st={ver:1,calls:[],down:!!scriptDown};
 const route=n=>JSON.stringify({name:n,pts:[{la:13.7,lo:100.5,n:'A'},{la:14.0,lo:101.0,n:'B'}],at:'2026-11-15T01:00:00Z'});
 const area=n=>JSON.stringify({n:n,a:[[13,100],[13.5,100.5],[14,100]]});
 await p.route('**/*',r=>{const u=r.request().url();
  if(/localhost:8765/.test(u))return r.continue();
  if(/script\.google\.com\/macros\/s\/MYAPI/.test(u)){
   if(st.down)return r.abort();
   let q={};try{q=JSON.parse(r.request().postData()||'{}')}catch(e){}
   st.calls.push((q.t||'pub')+':'+q.op);const h={'access-control-allow-origin':'*'};const v=st.ver;
   let body;
   if(!q.t&&q.op==='list')body={ok:true,rows:Array.from({length:v},(_,i)=>['Shared'+i,"13° 45.00' N","100° 30.00' E",''])};
   else if(q.t==='my'&&q.op==='list')body={ok:true,user:'owner',rows:Array.from({length:v+1},(_,i)=>['Mine'+i,"14° 00.00' N","101° 00.00' E",''])};
   else if(q.t==='route'&&q.op==='list')body={ok:true,routes:Array.from({length:v+2},(_,i)=>route('R'+i))};
   else if(q.t==='sarroute'&&q.op==='list')body={ok:true,routes:Array.from({length:v},(_,i)=>JSON.stringify({name:'S'+i,p:'',pts:[{la:13,lo:100},{la:14,lo:101}],at:'x'}))};
   else if(q.t==='sararea'&&q.op==='list')body={ok:true,routes:Array.from({length:v},(_,i)=>area('Z'+i))};
   else body={ok:true};
   return r.fulfill({status:200,contentType:'application/json',headers:h,body:JSON.stringify(body)})}
  return r.abort()});
 await p.addInitScript(`try{localStorage.setItem('heliPubApi','https://script.google.com/macros/s/MYAPI/exec');${withKey?"localStorage.setItem('heliMyKey','ka');":""}}catch(e){}`);
 await p.goto('http://localhost:8765/v4.2.2.html');await p.waitForTimeout(4000);
 return {p,st,er,c}}
const stat=p=>p.evaluate(()=>({shared:SHP.length,my:(myOn()?MYP:MYL).length,routes:store().length,sr:SK.route.get().length,area:SK.area.get().length,title:document.title,btns:[...document.querySelectorAll('.rfall')].map(b=>b.textContent)}));
const toastTxt=p=>p.evaluate(()=>document.getElementById('toast').textContent);
{ const {p,st,er,c}=await mk(true);
  console.log('A before:',JSON.stringify(await stat(p)));
  st.ver=3;st.calls.length=0;
  for(const [tab,name] of [['t5','จุดทั้งหมด'],['t2','เส้นทาง'],['t4','เส้นทางค้นหา']]){
    st.ver+=1;st.calls.length=0;
    await p.click('#'+tab);await p.waitForTimeout(500);st.calls.length=0;
    const btn=p.locator('.panel:not([hidden]) .rfall');console.log(name,'buttons visible:',await btn.count());
    await btn.first().click();await p.waitForTimeout(2500);
    console.log(name,'after click:',JSON.stringify(await stat(p)).replace(/"btns":.*/,''),'\n  toast:',await toastTxt(p),'\n  calls:',[...new Set(st.calls)].join(', '));}
  console.log('errors',er);await c.close();}
{ const {p,st,er,c}=await mk(true);st.down=true;await p.click('#t5');
  await p.locator('.panel:not([hidden]) .rfall').first().click();await p.waitForTimeout(2500);
  console.log('B script down toast:',await toastTxt(p),'| errors',er);await c.close();}
{ const {p,st,er,c}=await mk(false);await p.click('#t5');
  await p.locator('.panel:not([hidden]) .rfall').first().click();await p.waitForTimeout(2000);
  console.log('C no key toast:',await toastTxt(p),'| errors',er);await c.close();}
await b.close()})();
