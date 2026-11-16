// ทดสอบการขยายภาพแผนที่แม่ v4.4.1 (Playwright/Chromium จำลอง ไม่ใช่ iPad จริง และไม่ได้ต่อเซิร์ฟเวอร์แผนที่จริง: ภาพแผนที่เป็นภาพจำลอง)
// เมื่อโหลดแผ่นที่ระดับซูมปัจจุบันไม่ได้ (ออฟไลน์/ไม่มีในแคช/เกินซูมสูงสุด) ต้องแสดงแผ่นระดับซูมต่ำกว่าที่ขยายและตัดเฉพาะส่วนแทน
// รัน: node tests/t4410.js  (ใช้ไฟล์แอปล่าสุดและ pwa/ ในโฟลเดอร์โปรเจกต์)
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS='1';
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');const os=require('os');
const ROOT=path.resolve(__dirname,'..');
const APP=fs.readdirSync(ROOT).filter(f=>/^Tpad helicopter planner v\d+\.\d+\.\d+\.html$/.test(f)).sort().pop();
const SITE=fs.mkdtempSync(path.join(os.tmpdir(),'oz-'));
fs.copyFileSync(path.join(ROOT,APP),path.join(SITE,'index.html'));
for(const f of fs.readdirSync(path.join(ROOT,'pwa')))fs.copyFileSync(path.join(ROOT,'pwa',f),path.join(SITE,f));
const MIME={'.html':'text/html;charset=utf-8','.js':'application/javascript','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(SITE,p);
 if(!f.startsWith(SITE)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f))});
let pass=0,fail=0;const t=(l,ok,x)=>{console.log(ok?'PASS':'FAIL',l,x===undefined?'':x);ok?pass++:fail++};
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==','base64');
const zOf=u=>{const m=u.match(/\/(\d+)\/\d+\/\d+\.png/);return m?+m[1]:-1};
const tiles=p=>p.evaluate(()=>[...document.querySelectorAll('#tl img.tile')].map(i=>({ok:i.complete&&i.naturalWidth>0,d:i._d,z:i._z,x:i._x,y:i._y,sx:i._sx,sy:i._sy,w:i.style.width,cp:i.style.clipPath,src:i.src,l:parseFloat(i.style.left),tp:parseFloat(i.style.top)})));
(async()=>{
await new Promise(r=>srv.listen(8769,r));const U='http://localhost:8769/';
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:800}});
let maxZ=99,mode='ok';
await c.route(/tile\.opentopomap|tile-cyclosm|tile\.openstreetmap|arcgisonline/,r=>{const u=r.request().url();if(mode==='fail'||zOf(u)>maxZ)return r.fulfill({status:404,body:''});r.fulfill({status:200,contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:PNG})});
await c.route(/rainviewer|cartocdn|aviationweather|fonts\.g|script\.google\.com|open-meteo|adsb|airplanes/,r=>r.abort());
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto(U);await p.waitForFunction(()=>navigator.serviceWorker.getRegistration().then(r=>r&&r.active),null,{timeout:15000}).catch(()=>{});
await p.reload();await p.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:15000}).catch(()=>{});
const go=async z=>{await p.evaluate(z=>{const c=wp(13.8081,100.4851,z);M.z=z;M.cx=c[0];M.cy=c[1];M.touched=true;M.init=true;drawMap(false)},z);await p.waitForTimeout(2000)};
// A: ออนไลน์ปกติ ไม่มีการขยาย
await go(10);let T=await tiles(p);
t('A ออนไลน์: ทุกแผ่นโหลดที่ระดับซูมจริง (_d=0)',T.length>0&&T.every(x=>x.ok&&x.d===0),T.length);
// B: เซิร์ฟเวอร์ไม่มีภาพเกินซูม 11 → ซูม 13 ต้องใช้แผ่นซูม 11 ขยาย 4 เท่า
maxZ=11;await go(13);T=await tiles(p);
t('B เกินซูมสูงสุด: ทุกแผ่นแสดงได้',T.length>0&&T.every(x=>x.ok),T.filter(x=>!x.ok).length+' แผ่นไม่ขึ้น');
t('B ใช้แผ่นแม่ 2 ระดับ (ซูม 11) ขนาด 1024px',T.every(x=>x.d===2&&zOf(x.src)===11&&x.w==='1024px'),T.slice(0,2).map(x=>x.d+':'+x.w));
t('B ตำแหน่ง/การตัดถูกต้อง (sx,sy = (x mod 4, y mod 4)·256 และ clip-path ตรง)',T.every(x=>x.sx===(x.x%4)*256&&x.sy===(x.y%4)*256&&x.cp===`inset(${x.sy}px ${1024-x.sx-256}px ${1024-x.sy-256}px ${x.sx}px)`));
const geo=await p.evaluate(()=>{const W=mp.clientWidth,H=mp.clientHeight,ox=M.cx-W/2,oy=M.cy-H/2;return [...document.querySelectorAll('#tl img.tile')].every(i=>{const tx=Math.round((parseFloat(i.style.left)+i._sx+ox)/256),ty=Math.round((parseFloat(i.style.top)+i._sy+oy)/256);return Math.abs(parseFloat(i.style.left)+i._sx-(tx*256-ox))<0.5&&ty===i._y})});
t('B ส่วนที่มองเห็นตรงกับช่องของแผ่นเดิมบนจอ',geo);
const vu=Math.floor((await p.evaluate(()=>M.cx))/256);
// B2: แพนแผนที่แล้วตำแหน่งยังตรง (drawMap คิดออฟเซ็ตของแผ่นที่ขยาย)
await p.evaluate(()=>{M.cx+=137;M.cy-=59;drawMap(false)});await p.waitForTimeout(800);
const geo2=await p.evaluate(()=>{const W=mp.clientWidth,H=mp.clientHeight,ox=M.cx-W/2,oy=M.cy-H/2;return [...document.querySelectorAll('#tl img.tile')].filter(i=>i._d>0).every(i=>{const vx=parseFloat(i.style.left)+i._sx+ox,vy=parseFloat(i.style.top)+i._sy+oy;return Math.abs(vx/256-Math.round(vx/256))<0.002&&Math.abs(vy/256-Math.round(vy/256))<0.002&&Math.round(vy/256)===i._y})});
t('B2 แพนแผนที่แล้วแผ่นที่ขยายยังอยู่ตรงช่อง',geo2);
// C: ออฟไลน์ ซูมลึกกว่าที่มีในแคช (แคชอัตโนมัติมีซูม 10-11) → ซูม 14 ต้องใช้แผ่นจากแคช
maxZ=99;mode='fail';await c.setOffline(true);await go(14);T=await tiles(p);
t('C ออฟไลน์ซูม 14: ทุกแผ่นแสดงจากแผ่นแม่ในแคช',T.length>0&&T.every(x=>x.ok&&x.d>=3),T.map(x=>x.d).join(','));
const toast1=await p.evaluate(()=>document.body.innerText.includes('ไม่มีแผนที่'));
t('C ไม่ขึ้นแจ้งเตือน "ไม่มีแผนที่" เมื่อขยายแผ่นแม่ได้',!toast1);
// D: ออฟไลน์ในพื้นที่ที่ไม่เคยโหลด → ถอยครบ 6 ระดับแล้วแจ้งเตือนตามเดิม ไม่ error
const e0=await p.evaluate(()=>TERR[LAY.k]||0);
await p.evaluate(()=>{const c=wp(5,140,14);M.z=14;M.cx=c[0];M.cy=c[1];drawMap(false)});await p.waitForTimeout(2500);T=await tiles(p);
const e1=await p.evaluate(()=>TERR[LAY.k]||0);
t('D ถอยครบแล้วนับเป็นแผ่นที่โหลดไม่ได้ 1 ครั้งต่อแผ่น (tileErr)',e1-e0===T.length,(e1-e0)+' / '+T.length);
await p.evaluate(()=>{M.cx+=256*4;drawMap(false)});await p.waitForTimeout(2500);
t('D ไม่มีในแคชเลย: ถอยไม่เกิน 6 ระดับ',T.every(x=>x.d<=6),Math.max(...T.map(x=>x.d)));
t('D แจ้งเตือนออฟไลน์ตามเดิม',await p.evaluate(()=>document.body.innerText.includes('ไม่มีแผนที่')));
await c.setOffline(false);mode='ok';
// E: รีเฟรชแผนที่ และเปลี่ยนชนิดแผนที่ ล้างแผ่นที่ขยายเดิม
await go(10);await p.evaluate(()=>mapRefresh());await p.waitForTimeout(1500);T=await tiles(p);
t('E รีเฟรชแผนที่: กลับมาใช้แผ่นระดับซูมจริง',T.length>0&&T.every(x=>x.ok&&x.d===0));
t('F ไม่มี JavaScript error',errs.length===0,errs.slice(0,3));
console.log(`\nผล: PASS ${pass} / FAIL ${fail} (${APP})`);await b.close();srv.close();process.exit(fail?1:0)})();
