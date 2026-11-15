// ทดสอบ PWA v4.3.0 (Playwright/Chromium จำลอง ไม่ใช่ iPad จริง)
// รัน: node tests/t4300.js  (ต้องมีไฟล์แอป pwa/ และ index จากโฟลเดอร์โปรเจกต์)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');const os=require('os');
const ROOT=path.resolve(__dirname,'..');
const APP=fs.readdirSync(ROOT).filter(f=>/^Tpad helicopter planner v\d+\.\d+\.\d+\.html$/.test(f)).sort().pop();
const SITE=fs.mkdtempSync(path.join(os.tmpdir(),'pwa-'));
function put(n,d){fs.writeFileSync(path.join(SITE,n),d)}
fs.copyFileSync(path.join(ROOT,APP),path.join(SITE,'index.html'));
for(const f of fs.readdirSync(path.join(ROOT,'pwa')))fs.copyFileSync(path.join(ROOT,'pwa',f),path.join(SITE,f));
const MIME={'.html':'text/html;charset=utf-8','.js':'application/javascript','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(SITE,p);
 if(!f.startsWith(SITE)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream','cache-control':'max-age=600'});r.end(fs.readFileSync(f))});
let pass=0,fail=0;const t=(l,ok,x)=>{console.log(ok?'PASS':'FAIL',l,x===undefined?'':x);ok?pass++:fail++};
const mocks=async c=>{await c.route(/tile|arcgis|openstreetmap|opentopomap|rainviewer|cartocdn|aviationweather|fonts\.g|script\.google\.com/,r=>r.abort())};
(async()=>{
await new Promise(r=>srv.listen(8767,r));const U='http://localhost:8767/';
const ver=(APP.match(/v(\d+\.\d+\.\d+)/)||[])[1];
const swv=(fs.readFileSync(path.join(SITE,'sw.js'),'utf8').match(/VERSION = '([^']+)'/)||[])[1];
t('P0 sw.js VERSION == เลขเวอร์ชันของไฟล์แอป ('+ver+')',swv===ver,swv);
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1280,height:800}});await mocks(c);
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(U);await p.waitForTimeout(1500);
await p.waitForFunction(()=>navigator.serviceWorker.getRegistration().then(r=>r&&r.active&&r.active.state==='activated'),null,{timeout:15000}).catch(()=>{});
const st=await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();const ks=await caches.keys();const c=ks.length?await caches.open(ks[0]):null;const ents=c?(await c.keys()).map(x=>new URL(x.url).pathname):[];return{act:!!(r&&r.active),state:r&&r.active&&r.active.state,ks,ents,man:document.querySelector('link[rel=manifest]').href}});
t('P1 SW active',st.act&&st.state==='activated',st.state);
t('P1 cache ชื่อ tpad-'+ver+'-<build>',st.ks.length===1&&st.ks[0].startsWith('tpad-'+ver+'-b'),st.ks);
t('P1 precache ครบ 6 รายการ',['/index.html','/manifest.json','/icon-192.png','/icon-512.png','/apple-touch-icon.png'].every(x=>st.ents.includes(x))&&st.ents.some(x=>x==='/'),st.ents);
const mj=await (await p.request.get(U+'manifest.json')).json();t('P1 manifest ใช้ได้ (standalone, start_url ./)',mj.display==='standalone'&&mj.start_url==='./'&&mj.icons.length>=2);
for(const i of mj.icons){const r=await p.request.get(U+i.src);t('P1 icon '+i.src+' 200',r.status()===200)}
// รีโหลดให้หน้าอยู่ใต้ SW
await p.reload();await p.waitForTimeout(1200);
t('P2 หน้าถูกควบคุมโดย SW',await p.evaluate(()=>!!navigator.serviceWorker.controller));
// ออฟไลน์
await c.setOffline(true);
await p.reload();await p.waitForTimeout(1800);
const ti=await p.title();t('P2 เปิดตอนออฟไลน์ได้ (title)',/วางแผนเส้นทางบินเฮลิคอปเตอร์ v 4\./.test(ti),ti);
t('P2 แถบ "ออฟไลน์" แสดงสั้นๆ และไม่รับการกด (pointer-events:none)',await p.evaluate(()=>{const e=document.querySelector('#pwabar .pwoff');return !!e&&getComputedStyle(e).pointerEvents==='none'}));
t('P2 มีไอคอนออฟไลน์ในแถบหัว',await p.evaluate(()=>{const i=document.getElementById('offi');return !!i&&i.getBoundingClientRect().width>10&&!!i.closest('.hr')}));
await p.waitForTimeout(4500);
t('P2 แถบข้อความหายเองใน ~4 วินาที แต่ไอคอนยังอยู่',await p.evaluate(()=>!document.querySelector('#pwabar .pwoff')&&!!document.getElementById('offi')));
t('P2 แอปทำงาน (แผนที่/แท็บมี)',await p.evaluate(()=>!!document.querySelector('#map,.tabs,[role=tablist]')||document.querySelectorAll('button').length>20));
const nav=await p.evaluate(()=>fetch('index.html').then(r=>r.status).catch(()=>-1));t('P2 index.html ตอบจากแคช',nav===200,nav);
await c.setOffline(false);await p.waitForTimeout(800);
t('P2 กลับออนไลน์ ไอคอนออฟไลน์หาย',await p.evaluate(()=>!document.getElementById('offi')&&!document.querySelector('#pwabar .pwoff')));
// อัปเดต
let html=fs.readFileSync(path.join(SITE,'index.html'),'utf8');
put('index.html',html.replace('</body>','<!--UPDATED-MARK--></body>').replace(/v 4\.\d+\.\d+/g,'v 9.9.9'));
put('sw.js',fs.readFileSync(path.join(SITE,'sw.js'),'utf8').replace("VERSION = '"+ver+"'","VERSION = '9.9.9'"));
await p.evaluate(()=>navigator.serviceWorker.getRegistration().then(r=>r.update()));
await p.waitForSelector('#pwaupd',{timeout:15000}).catch(()=>{});
t('P3 มีแถบ "มีเวอร์ชันใหม่" ให้เลือก',await p.evaluate(()=>!!document.querySelector('#pwaupd')));
t('P3 ยังเป็นเวอร์ชันเดิม (ไม่สลับเอง)',/ v 4\./.test(await p.title())&&!(await p.content()).includes('UPDATED-MARK'));
await p.click('#pwaupd .pwlater');
t('P3 กด "ภายหลัง" แถบหาย และยังเป็นเวอร์ชันเดิม',await p.evaluate(()=>!document.querySelector('#pwaupd'))&&/ v 4\./.test(await p.title()));
await p.reload();await p.waitForTimeout(1500);
t('P3 โหลดซ้ำ (ยังไม่กดอัปเดต) แถบกลับมาถามอีก',await p.evaluate(()=>!!document.querySelector('#pwaupd'))||await p.waitForSelector('#pwaupd',{timeout:8000}).then(()=>true).catch(()=>false));
await Promise.all([p.waitForNavigation({timeout:15000}).catch(()=>{}),p.click('#pwaupd button:not(.pwlater)')]);
await p.waitForTimeout(2000);
t('P3 กด "อัปเดตตอนนี้" แล้วได้เวอร์ชันใหม่',(await p.title()).includes('9.9.9')&&(await p.content()).includes('UPDATED-MARK'),await p.title());
const ks2=await p.evaluate(()=>caches.keys());t('P3 ลบแคชเวอร์ชันเก่า เหลือแคชใหม่อันเดียว',ks2.length===1&&ks2[0].startsWith('tpad-9.9.9-'),ks2);
t('P* ไม่มี pageerror',errs.length===0,errs.slice(0,2));
await c.close();
// file://
const c2=await b.newContext();await mocks(c2);const p2=await c2.newPage();const e2=[];p2.on('pageerror',e=>e2.push(e.message));
await p2.goto('file://'+path.join(ROOT,APP));await p2.waitForTimeout(2000);
t('P4 file:// ไม่ลงทะเบียน SW และไม่มีแถบ',await p2.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistrations().catch(()=>[]);return r.length===0&&!document.querySelector('#pwaupd')}));
t('P4 file:// ไม่มี pageerror',e2.length===0,e2.slice(0,2));
await b.close();srv.close();
console.log('\nสรุป',pass,'ผ่าน',fail,'ไม่ผ่าน');process.exit(fail?1:0)})();
