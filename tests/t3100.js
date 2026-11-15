const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:1});
const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
let mode='ok',urls=[];
await p.route('**/aviationweather.gov/**',r=>{urls.push(r.request().url());
 if(mode==='ok')return r.fulfill({status:200,contentType:'text/plain',body:r.request().url().includes('/taf')?'TAF VTBS 060500Z 0606/0712 18008KT 9999 SCT020':'VTBS 060930Z 17008KT 9999 FEW020 31/24 Q1010 NOSIG'});
 if(mode==='empty')return r.fulfill({status:200,contentType:'text/plain',body:''});
 if(mode==='500')return r.fulfill({status:500,body:'x'});
 return r.abort()});
await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.5.html'));await p.waitForTimeout(5000);
const open=async code=>{await p.evaluate(code=>{const i=DB.AP.findIndex(q=>(q.c||'').trim()===code),a=DB.AP[i],w=wp(a.la,a.lo,M.z);M.cx=w[0];M.cy=w[1];M.touched=true;M.pop={c:'AP',i};drawMap(false)},code);await p.waitForTimeout(400)};
await open('VTBS');
console.log('title',await p.title());
console.log('btns',await p.locator('#pop [data-wx]').count());
await p.click('#pop [data-wx="METAR:VTBS"]');await p.waitForTimeout(400);
console.log('pop visible',await p.locator('#pop').isVisible(),'|',(await p.locator('#awxo').innerText()).replace(/\n/g,' / '));
await p.click('#pop [data-wx="TAF:VTBS"]');await p.waitForTimeout(400);
console.log('TAF',(await p.locator('#awxo').innerText()).replace(/\n/g,' / '));
console.log('urls',urls.join(' | '));
await p.screenshot({path:'/tmp/t/wx1.png'});
mode='empty';await p.click('#pop [data-wx="METAR:VTBS"]');await p.waitForTimeout(400);console.log('empty:',(await p.locator('#awxo').innerText()).replace(/\n/g,' / '));
mode='500';await p.click('#pop [data-wx="TAF:VTBS"]');await p.waitForTimeout(400);console.log('500:',(await p.locator('#awxo').innerText()).replace(/\n/g,' / '));
mode='abort';await p.click('#pop [data-wx="METAR:VTBS"]');await p.waitForTimeout(400);console.log('abort:',(await p.locator('#awxo').innerText()).replace(/\n/g,' / '));
// persistence after redraw
mode='ok';await p.click('#pop [data-wx="METAR:VTBS"]');await p.waitForTimeout(300);
await p.evaluate(()=>{drawMap(false)});await p.waitForTimeout(300);
console.log('after redraw',(await p.locator('#awxo').innerText()).slice(0,40));
// another airport and non-ICAO
await open('VTBD');console.log('VTBD ic',await p.locator('#awxo').getAttribute('data-ic'),'text empty?',(await p.locator('#awxo').innerText())==='');
const noic=await p.evaluate(()=>DB.AP.map((q,i)=>[q.c,i]).filter(x=>!/^[A-Z]{4}$/.test((x[0]||'').trim())).length);console.log('AP without ICAO',noic,'of',await p.evaluate(()=>DB.AP.length));
// other categories unaffected
await p.evaluate(()=>{M.pop={c:'VOR',i:0};drawMap(false)});await p.waitForTimeout(200);console.log('VOR has wx',await p.locator('#pop [data-wx]').count());
console.log('errors',er);await b.close()})();
