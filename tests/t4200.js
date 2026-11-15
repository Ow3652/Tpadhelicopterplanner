const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();
const log=[];const say=(...a)=>{console.log(...a)};
async function mk(file,pre){
 const c=await b.newContext({viewport:{width:1180,height:820}});
 const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 const calls={metar:[],script:[],gviz:[],direct:[]};
 const DATA={ka:{user:'owner',rows:[['ลานวัง','13° 45.00\' N','100° 30.00\' E','owner']]},kb:{user:'user1',rows:[['จุดของบี','14° 00.00\' N','101° 00.00\' E','b']]}};
 let scriptDown=false;
 await p.route('**/*',r=>{const u=r.request().url();
  if(/localhost:8766/.test(u))return r.continue();
  if(/METARID/.test(u)){calls.metar.push(u);return r.fulfill({status:200,contentType:'text/plain',headers:{'access-control-allow-origin':'*'},body:'METAR VTBD 150030Z 31004KT 6000 FEW020 27/25 Q1013 NOSIG'})}
  if(/script\.google\.com\/macros\/s\/MYAPI/.test(u)){
    if(scriptDown)return r.abort();
    let q={};try{q=JSON.parse(r.request().postData()||'{}')}catch(e){}
    calls.script.push(q);
    const d=DATA[q.key];
    const h={'access-control-allow-origin':'*'};
    if(!d)return r.fulfill({status:200,contentType:'application/json',headers:h,body:JSON.stringify({ok:false,err:'รหัสไม่ถูกต้อง'})});
    if(q.op==='list'&&q.t==='my')return r.fulfill({status:200,contentType:'application/json',headers:h,body:JSON.stringify({ok:true,rows:d.rows,user:d.user})});
    if(q.op==='list')return r.fulfill({status:200,contentType:'application/json',headers:h,body:JSON.stringify({ok:true,routes:[]})});
    return r.fulfill({status:200,contentType:'application/json',headers:h,body:JSON.stringify({ok:true})});}
  if(/docs\.google\.com\/spreadsheets/.test(u)){if(/gid=945414332|sheet=My_route|sheet=SAR_/.test(u))calls.gviz.push(u);return r.abort()}
  if(/aviationweather\.gov/.test(u)){calls.direct.push(u);return r.abort()}
  return r.abort()});
 await p.addInitScript(pre||'');
 await p.goto('http://localhost:8765/'+file);await p.waitForTimeout(3500);
 return {p,calls,er,down:v=>scriptDown=v};
}
const openAP=async p=>{await p.evaluate(()=>{const i=DB.AP.findIndex(q=>(q.c||'').trim()==='VTBD'),a=DB.AP[i],w=wp(a.la,a.lo,M.z);M.cx=w[0];M.cy=w[1];M.touched=true;M.pop={c:'AP',i};drawMap(false)});await p.waitForTimeout(400)};
const txt=async p=>(await p.locator('#awxo').innerText()).replace(/\n/g,' / ');
// --- METAR ---
{ const {p,calls,er}=await mk('withurl.html');
  say('title:',await p.title());
  await openAP(p);await p.click('#pop [data-wx="METAR:VTBD"]');await p.waitForTimeout(600);
  say('M1 METAR_URL no passcode:',await txt(p),'| calls',calls.metar.length,calls.metar[0]);
  await p.click('#pop [data-wx="TAF:VTBD"]');await p.waitForTimeout(600);say('M2 taf url:',calls.metar[1]);
  say('M3 passcode/AC.px used?',await p.evaluate(()=>!!(AC&&AC.px)),'direct calls',calls.direct.length);
  say('errors',er);await p.context().close();}
{ const {p,calls,er}=await mk('orig.html');
  await openAP(p);await p.click('#pop [data-wx="METAR:VTBD"]');await p.waitForTimeout(600);
  say('M4 no URL, direct blocked:',await txt(p),'| direct',calls.direct.length);say('errors',er);await p.context().close();}
// --- per-user sync ---
for(const [k,label] of [['ka','owner'],['kb','user1'],['kx','wrong']]){
  const pre=`try{localStorage.setItem('heliPubApi','https://script.google.com/macros/s/MYAPI/exec');localStorage.setItem('heliMyKey','${k}')}catch(e){}`;
  const {p,calls,er}=await mk('orig.html',pre);
  await p.waitForTimeout(1500);
  const pts=await p.evaluate(()=>DB.MY.map(x=>x.n));
  const st=await p.evaluate(()=>document.getElementById('myst')&&document.getElementById('myst').textContent);
  say('S key='+label,'points:',JSON.stringify(pts),'| status:',st,'| gviz calls:',calls.gviz.length,'| errors',er.length);
  await p.context().close();}
// script down: no gviz fallback
{ const pre=`try{localStorage.setItem('heliPubApi','https://script.google.com/macros/s/MYAPI/exec');localStorage.setItem('heliMyKey','ka')}catch(e){}`;
  const {p,calls,er,down}=await mk('orig.html',pre);down(true);
  await p.evaluate(()=>myLoad(true));await p.waitForTimeout(800);
  await p.evaluate(()=>rtLoad(true));await p.evaluate(()=>skLoad('route',true));await p.waitForTimeout(800);
  const st=await p.evaluate(()=>document.getElementById('myst').textContent);
  say('S script down: status:',st,'| gviz calls (must be 0):',calls.gviz.length,'| errors',er);await p.context().close();}
await b.close();})();
