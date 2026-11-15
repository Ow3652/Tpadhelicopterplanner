// ทดสอบแผนที่ออฟไลน์ v4.4.0 (Playwright/Chromium จำลอง ไม่ใช่ iPad จริง และไม่ได้ต่อเซิร์ฟเวอร์แผนที่จริง: ภาพแผนที่เป็นภาพจำลอง)
// รัน: node tests/t4400.js  (ใช้ไฟล์แอปล่าสุดและ pwa/ ในโฟลเดอร์โปรเจกต์)
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS='1';/* ให้ context.route ดักคำขอจาก service worker ได้ */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');const os=require('os');
const ROOT=path.resolve(__dirname,'..');
const APP=fs.readdirSync(ROOT).filter(f=>/^Tpad helicopter planner v\d+\.\d+\.\d+\.html$/.test(f)).sort().pop();
const SITE=fs.mkdtempSync(path.join(os.tmpdir(),'om-'));
fs.copyFileSync(path.join(ROOT,APP),path.join(SITE,'index.html'));
for(const f of fs.readdirSync(path.join(ROOT,'pwa')))fs.copyFileSync(path.join(ROOT,'pwa',f),path.join(SITE,f));
fs.mkdirSync(path.join(SITE,'docs'));fs.writeFileSync(path.join(SITE,'docs','manual.pdf'),'%PDF-1.4\n%fake\n');
const MIME={'.html':'text/html;charset=utf-8','.js':'application/javascript','.json':'application/json','.png':'image/png','.pdf':'application/pdf'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(SITE,p);
 if(!f.startsWith(SITE)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream','cache-control':'max-age=600'});r.end(fs.readFileSync(f))});
let pass=0,fail=0;const t=(l,ok,x)=>{console.log(ok?'PASS':'FAIL',l,x===undefined?'':x);ok?pass++:fail++};
// ภาพ PNG 1x1 + ข้อมูลเติมท้ายให้ได้ ~30 KB (เบราว์เซอร์ยังอ่านภาพได้)
const PNG=Buffer.concat([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==','base64'),Buffer.alloc(30000,1)]);
(async()=>{
await new Promise(r=>srv.listen(8768,r));const U='http://localhost:8768/';
const ver=(APP.match(/v(\d+\.\d+\.\d+)/)||[])[1];
const swv=(fs.readFileSync(path.join(SITE,'sw.js'),'utf8').match(/VERSION = '([^']+)'/)||[])[1];
t('T0 sw.js VERSION == เลขเวอร์ชันของไฟล์แอป ('+ver+')',swv===ver,swv);
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1280,height:800}});
let mode='ok';const hits=[];
await c.route(/tile\.opentopomap|tile-cyclosm|tile\.openstreetmap|arcgisonline/,r=>{hits.push(r.request().url());if(mode==='fail')return r.abort();r.fulfill({status:200,contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:PNG})});
await c.route(/rainviewer|cartocdn|aviationweather|fonts\.g|script\.google\.com/,r=>r.abort());
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto(U);await p.waitForFunction(()=>navigator.serviceWorker.getRegistration().then(r=>r&&r.active&&r.active.state==='activated'),null,{timeout:15000}).catch(()=>{});
await p.waitForTimeout(1500);await p.reload();await p.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:15000}).catch(()=>{});await p.reload();await p.waitForTimeout(3000);
t('T1 หน้าถูกควบคุมโดย SW',await p.evaluate(()=>!!navigator.serviceWorker.controller));
const caches1=await p.evaluate(async()=>{const o={};for(const k of await caches.keys())o[k]=(await (await caches.open(k)).keys()).map(r=>r.url);return o});
const auto=caches1['tiles-auto']||[];
t('T1 เก็บอัตโนมัติ: มีแผ่นใน tiles-auto',auto.length>0,auto.length);
t('T1 คีย์ถูกทำให้เป็นมาตรฐาน (ไม่มีโดเมนย่อย a/b/c และไม่มี _r)',auto.length>0&&auto.every(u=>!/\/\/[abc]\./.test(u)&&!/_r=/.test(u)));
t('T1 ไม่มีแคชอื่นของข้ามโดเมน (เฉพาะ tiles-*, tpad-*)',Object.keys(caches1).every(k=>/^(tiles-|tpad-)/.test(k)),Object.keys(caches1));
t('T1 ไม่มีรายการที่ไม่ใช่ภาพแผนที่ในแคชแผนที่',auto.every(u=>/opentopomap|openstreetmap|arcgisonline/.test(u)));
// cache-first
const n1=hits.length;await p.reload();await p.waitForTimeout(2000);
t('T2 โหลดซ้ำ: แผ่นที่เก็บไว้ไม่ถูกขอออกเน็ตอีก',hits.length-n1<=2,hits.length-n1);
// ออฟไลน์ใช้แคชอัตโนมัติ
mode='fail';await c.setOffline(true);await p.reload();await p.waitForTimeout(2500);
const ld=await p.evaluate(()=>[...document.querySelectorAll('#tl img.tile')].filter(i=>i.complete&&i.naturalWidth>0).length);
t('T3 ออฟไลน์: แสดงภาพแผนที่จากแคชอัตโนมัติ',ld>0,ld);
await c.setOffline(false);mode='ok';await p.reload();await p.waitForTimeout(1500);
// เมนู + ปิดเก็บอัตโนมัติ
await p.click('#offb');await p.waitForSelector('#omd:not([hidden])');
t('T4 ปุ่ม 📥 เปิดหน้าจอแผนที่ออฟไลน์',await p.isVisible('#omd .omb'));
t('T4 ค่าเริ่มต้น: เก็บอัตโนมัติเปิด เพดาน 200 MB',await p.isChecked('#omauto')&&await p.inputValue('#omcap')==='200');
await p.uncheck('#omauto');await p.waitForTimeout(500);
const a0=(await p.evaluate(async()=>(await (await caches.open('tiles-auto')).keys()).length));
await p.click('#omx');
await p.evaluate(()=>{M.z=8;M.cx+=3000;M.touched=true;drawMap(false)});await p.waitForTimeout(1500);
const a1=(await p.evaluate(async()=>(await (await caches.open('tiles-auto')).keys()).length));
t('T4 ปิดเก็บอัตโนมัติแล้ว ภาพใหม่ไม่ถูกเก็บ',a1===a0,a0+'→'+a1);
await p.click('#offb');await p.check('#omauto');await p.waitForTimeout(500);await p.click('#omx');
// ดาวน์โหลดตามพื้นที่
await p.evaluate(()=>{M.z=10;const c=wp(13.8081,100.4851,10);M.cx=c[0];M.cy=c[1];drawMap(false)});await p.waitForTimeout(500);
await p.click('#offb');await p.waitForSelector('#omd:not([hidden])');
await p.check('input[name=omsrc][value=rad]');await p.fill('#omrad','5');
for(const e of await p.$$('[data-ly]'))if(await e.isChecked())await e.uncheck();
await p.check('[data-ly=topo]');await p.selectOption('#omz0','8');await p.selectOption('#omz1','10');await p.fill('#omname','ทดสอบ');await p.waitForTimeout(400);
const est=await p.textContent('#omest');t('T5 แสดงจำนวนแผ่น/ขนาดประมาณก่อนดาวน์โหลด',/แผ่น/.test(est)&&/MB|KB/.test(est),est.slice(0,80));
const nEst=+(await p.getAttribute('#omest','data-n'));
await p.click('#omgo');await p.waitForFunction(()=>/เสร็จแล้ว|หยุดแล้ว|จบ:/.test(document.getElementById('omst').textContent),null,{timeout:30000});
const st=await p.textContent('#omst');t('T5 ดาวน์โหลดเสร็จ',/เสร็จแล้ว/.test(st),st);
const area=await p.evaluate(async()=>({k:(await (await caches.open('tiles-area')).keys()).length,a:JSON.parse(localStorage.getItem('heliOmAreas')||'[]')}));
t('T5 จำนวนแผ่นในแคชพื้นที่ = ที่ประมาณไว้',area.k===nEst&&area.a.length===1&&area.a[0].done===nEst,area.k+' vs '+nEst);
t('T5 รายการพื้นที่ขึ้นในหน้าจอ',/ทดสอบ/.test(await p.textContent('#omal'))&&/ครบ/.test(await p.textContent('#omal')));
// ทดสอบความทนต่อ 2 ครั้ง: โหลดต่อไม่ซ้ำ
const h0=hits.length;await p.click('[data-oc="0"]');await p.waitForFunction(()=>/เสร็จแล้ว/.test(document.getElementById('omst').textContent),null,{timeout:30000});
t('T5 โหลดซ้ำ/โหลดต่อ: ข้ามแผ่นที่มีแล้ว (ไม่ขอเน็ตซ้ำ)',hits.length-h0===0,hits.length-h0);
await p.click('#omx');
// ออฟไลน์ใช้แคชพื้นที่ล้วน
await p.evaluate(()=>caches.delete('tiles-auto'));
const nz10=await p.evaluate(async()=>(await (await caches.open('tiles-area')).keys()).filter(r=>/\/10\//.test(r.url)).length);
mode='fail';await c.setOffline(true);await p.reload();await p.waitForTimeout(2500);
const ld2=await p.evaluate(()=>[...document.querySelectorAll('#tl img.tile')].filter(i=>i.complete&&i.naturalWidth>0).length);
t('T6 ออฟไลน์: แสดงภาพจากพื้นที่ที่ดาวน์โหลดไว้ (เฉพาะแผ่นในพื้นที่)',ld2>=1&&ld2<=nz10,ld2+' / z10 ในแคช '+nz10);
await c.setOffline(false);mode='ok';await p.reload();await p.waitForTimeout(1200);
// ลบพื้นที่
await p.click('#offb');await p.waitForSelector('#omd:not([hidden])');await p.click('[data-ox="0"]');await p.waitForTimeout(1200);
const area2=await p.evaluate(async()=>({k:(await (await caches.open('tiles-area')).keys()).length,a:JSON.parse(localStorage.getItem('heliOmAreas')||'[]').length}));
t('T7 ลบพื้นที่: แคชพื้นที่ว่าง และรายการหาย',area2.k===0&&area2.a===0,JSON.stringify(area2));
await p.click('#omx');
// ตรวจเพดาน (เก็บอัตโนมัติ): ตั้ง 1 MB แล้วโหลดภาพ 160 แผ่น แผ่นเก่าต้องถูกลบ
await p.evaluate(async()=>{await caches.delete('tiles-auto');const r=await navigator.serviceWorker.ready;r.active.postMessage({t:'tilecfg',auto:true,capMB:1})});await p.waitForTimeout(500);
await p.evaluate(()=>{for(let i=0;i<160;i++){const im=new Image();im.src='https://a.tile.opentopomap.org/12/'+(2000+i)+'/1500.png'}});await p.waitForTimeout(4000);
const ev=await p.evaluate(async()=>(await (await caches.open('tiles-auto')).keys()).map(r=>r.url));
t('T8 เพดานขนาด: แผ่นเก่าถูกลบเมื่อเกินเพดาน (ไม่เก็บครบ 160)',ev.length>0&&ev.length<160,ev.length);
t('T8 แผ่นล่าสุดยังอยู่ แผ่นแรกสุดถูกลบ',ev.some(u=>/\/2159\//.test(u))&&!ev.some(u=>/\/2000\//.test(u)));
await p.evaluate(async()=>{const r=await navigator.serviceWorker.ready;r.active.postMessage({t:'tilecfg',auto:true,capMB:200})});
// คู่มือ
const href=await p.getAttribute('#mnl','href'),tg=await p.getAttribute('#mnl','target');
t('T9 ลิงก์คู่มือบนหน้าเพจ (docs/manual.pdf เปิดแท็บใหม่)',/docs\/manual\.pdf$/.test(href)&&tg==='_blank',href);
const pg=await c.newPage();const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:8000}).catch(()=>null),pg.goto(U+'docs/manual.pdf').catch(()=>null)]);
const pth=dl?await dl.path():null;const body=pth?fs.readFileSync(pth):Buffer.alloc(0);
t('T9 เปิด docs/manual.pdf (ลิงก์คู่มือ) ใต้ SW ได้ไฟล์ PDF ไม่ใช่หน้าแอป',!!dl&&body.toString().startsWith('%PDF'),dl&&dl.suggestedFilename());
await pg.close();
t('T10 ไม่มี pageerror',errs.length===0,errs);
await p.close();
// ปุ่มคู่มือ: แท็บเบราว์เซอร์ธรรมดาเปิดแท็บใหม่ (ไม่มีกรอบซ้อน) / แอปที่ติดตั้ง (standalone) ใช้กรอบซ้อนที่มีปุ่มปิด
fs.writeFileSync(path.join(SITE,'docs','manual.html'),'<!doctype html><meta charset=utf-8><title>manual</title><h1 id=h>คู่มือจำลอง</h1>');
{const pn=await c.newPage();await pn.goto(U);await pn.waitForTimeout(800);
 const [pop]=await Promise.all([pn.waitForEvent('popup',{timeout:5000}).catch(()=>null),pn.click('#mnl')]);
 t('T12 แท็บธรรมดา: กดคู่มือเปิดแท็บใหม่ ไม่มีกรอบซ้อน',!!pop&&!(await pn.$('#mnv')));if(pop)await pop.close().catch(()=>{});await pn.close();
 const ps=await c.newPage();await ps.addInitScript(()=>{Object.defineProperty(navigator,'standalone',{get:()=>true})});await ps.goto(U);await ps.waitForTimeout(800);
 await ps.click('#mnl');await ps.waitForSelector('#mnv');
 const fr=ps.frames().find(f=>/docs\/manual\.html$/.test(f.url()));await ps.waitForTimeout(800);
 const txt=await (ps.frames().find(f=>/docs\/manual\.html$/.test(f.url()))||ps.mainFrame()).evaluate(()=>document.body.textContent).catch(()=>'');
 t('T12 แอปที่ติดตั้ง: กดคู่มือเปิดกรอบซ้อนในหน้าเดิม (ไม่ออกจากแอป) และโหลดคู่มือได้',/คู่มือจำลอง/.test(txt)&&ps.url()===U,ps.url());
 t('T12 มีปุ่ม "ปิดคู่มือ" อยู่ในกรอบ มองเห็นและกดได้',await ps.isVisible('#mnx'));
 await ps.click('#mnx');t('T12 กดปิดแล้วกลับหน้าแอป',!(await ps.$('#mnv'))&&await ps.isVisible('#offb'));
 await ps.click('#mnl');await ps.waitForSelector('#mnv');await ps.keyboard.press('Escape');t('T12 กด Esc ปิดคู่มือได้',!(await ps.$('#mnv')));await ps.close()}
// file:// ไม่ใช้
const f=await b.newContext({viewport:{width:1280,height:800}});await f.route(/^https?:/,r=>r.abort());
const fp=await f.newPage();const fe=[];fp.on('pageerror',e=>fe.push(e.message));
await fp.goto('file://'+path.join(ROOT,APP));await fp.waitForTimeout(1200);await fp.click('#offb');await fp.click('#omx');await fp.click('#mnl');const fm=await fp.isVisible('#mnx');await fp.click('#mnx');await fp.click('#offb');
t('T11 file:// เปิดหน้าจอได้ แสดงข้อความว่าใช้ไม่ได้ ไม่มี error',await fp.isVisible('#omun')&&!(await fp.isVisible('#omok'))&&fe.length===0,fe);
t('T12 file:// (เช่น Pagira): กดคู่มือได้กรอบซ้อนที่มีปุ่มปิด',fm);
await b.close();srv.close();
console.log('\nสรุป '+pass+' ผ่าน '+fail+' ไม่ผ่าน');process.exit(fail?1:0);
})();
