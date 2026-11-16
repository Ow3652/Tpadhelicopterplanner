// ทดสอบภูมิประเทศ v4.5.0: ชั้น TAWS + กราฟความสูงตามเส้นทาง + ข้อมูลความสูงออฟไลน์ (Playwright/Chromium จำลอง ไม่ใช่ iPad จริง)
// ไม่ได้ต่อ AWS จริง: ข้อมูลความสูงเป็น "ภูเขาจำลอง" รูปกรวยสูง 1,500 ม. (≈4,921 ft) ที่ 14.00N 100.80E รัศมี 0.25° ส่งผ่าน context.route
// รัน: node tests/t4500.js  (ใช้ไฟล์แอปล่าสุดและ pwa/ ในโฟลเดอร์โปรเจกต์ เปิดเซิร์ฟเวอร์ชั่วคราวพอร์ต 8770 เอง)
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS='1';
const {chromium,devices}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');const os=require('os');const zlib=require('zlib');
const ROOT=path.resolve(__dirname,'..');
const APP=fs.readdirSync(ROOT).filter(f=>/^Tpad helicopter planner v\d+\.\d+\.\d+\.html$/.test(f)).sort().pop();
const SITE=fs.mkdtempSync(path.join(os.tmpdir(),'tw-'));
fs.copyFileSync(path.join(ROOT,APP),path.join(SITE,'index.html'));
for(const f of fs.readdirSync(path.join(ROOT,'pwa')))fs.copyFileSync(path.join(ROOT,'pwa',f),path.join(SITE,f));
const MIME={'.html':'text/html;charset=utf-8','.js':'application/javascript','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(SITE,p);
 if(!f.startsWith(SITE)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f))});
let pass=0,fail=0;const t=(l,ok,x)=>{console.log(ok?'PASS':'FAIL',l,x===undefined?'':x);ok?pass++:fail++};
// ---- สร้าง PNG แบบ Terrarium ----
const CRC=(()=>{const T=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;T[n]=c}return b=>{let c=-1;for(const x of b)c=T[(c^x)&255]^(c>>>8);return(c^-1)>>>0}})();
const chunk=(ty,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(ty),d]);const c=Buffer.alloc(4);c.writeUInt32BE(CRC(td));return Buffer.concat([l,td,c])};
const MT={la:14.0,lo:100.8,r:.25,h:1500};
const elevAt=(la,lo)=>{const d=Math.hypot(la-MT.la,(lo-MT.lo)*Math.cos(MT.la*Math.PI/180));return d>=MT.r?0:MT.h*(1-d/MT.r)};
const ll=(x,y,z)=>{const s=256*2**z;return[Math.atan(Math.sinh(Math.PI*(1-2*y/s)))*180/Math.PI,x/s*360-180]};
const cacheP=new Map();
function tilePng(z,x,y){const k=z+'/'+x+'/'+y;if(cacheP.has(k))return cacheP.get(k);const raw=Buffer.alloc(256*(1+256*3));
 for(let j=0;j<256;j++){raw[j*769]=0;for(let i=0;i<256;i++){const[la,lo]=ll(x*256+i+.5,y*256+j+.5,z);const v=elevAt(la,lo)+32768,R=Math.floor(v/256),G=Math.floor(v)%256,B=Math.floor((v-Math.floor(v))*256),o=j*769+1+i*3;raw[o]=R;raw[o+1]=G;raw[o+2]=B}}
 const h=Buffer.alloc(13);h.writeUInt32BE(256,0);h.writeUInt32BE(256,4);h[8]=8;h[9]=2;h[10]=0;h[11]=0;h[12]=0;
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);cacheP.set(k,png);return png}
const TPNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==','base64');
(async()=>{
await new Promise(r=>srv.listen(8770,r));const U='http://localhost:8770/';
const ver=(APP.match(/v(\d+\.\d+\.\d+)/)||[])[1],swv=(fs.readFileSync(path.join(SITE,'sw.js'),'utf8').match(/VERSION = '([^']+)'/)||[])[1];
t('T0 sw.js VERSION == เวอร์ชันแอป ('+ver+')',swv===ver,swv);
t('T0 sw.js isTile รวมโดเมนข้อมูลความสูง AWS',/elevation-tiles-prod/.test(fs.readFileSync(path.join(SITE,'sw.js'),'utf8')));
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1280,height:800}});let mode='ok';const hits=[];
await c.route(/elevation-tiles-prod/,r=>{const u=r.request().url();hits.push(u);if(mode==='fail')return r.abort();const m=u.match(/terrarium\/(\d+)\/(\d+)\/(\d+)\.png/);
 if(!m)return r.fulfill({status:404,body:''});r.fulfill({status:200,contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:tilePng(+m[1],+m[2],+m[3])})});
await c.route(/tile\.opentopomap|tile-cyclosm|tile\.openstreetmap|arcgisonline/,r=>mode==='fail'?r.abort():r.fulfill({status:200,contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:TPNG}));
await c.route(/rainviewer|cartocdn|aviationweather|fonts\.g|script\.google\.com|open-meteo|adsb|airplanes/,r=>r.abort());
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto(U);await p.waitForFunction(()=>navigator.serviceWorker.getRegistration().then(r=>r&&r.active&&r.active.state==='activated'),null,{timeout:15000}).catch(()=>{});
await p.waitForTimeout(1500);await p.reload();await p.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:15000}).catch(()=>{});await p.reload();await p.waitForTimeout(1500);
t('T1 หน้าถูกควบคุมโดย service worker',await p.evaluate(()=>!!navigator.serviceWorker.controller));
t('T1 ค่าเริ่มต้น: TAWS ปิด ไม่มีชั้นสี',await p.evaluate(()=>!TW.on&&getComputedStyle(document.getElementById('tws')).display==='none'));
t('T1 ปุ่ม ⛰ TAWS และ 📈 กราฟความสูง อยู่ในแถบปุ่มแผนที่',await p.isVisible('#twb')&&await p.isVisible('#pfb'));
// ไปที่ภูเขา ซูม 10
await p.evaluate(()=>{const c=wp(14.0,100.8,10);M.z=10;M.cx=c[0];M.cy=c[1];M.touched=true;M.init=true;drawMap(false)});
await p.click('#twb');await p.waitForTimeout(2500);
const px=async()=>p.evaluate(()=>{const cv=document.getElementById('tws');if(!cv.width||getComputedStyle(cv).display==='none')return{r:0,y:0,n:0,hidden:true};const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let r=0,y=0;for(let i=0;i<d.length;i+=4){if(d[i+3]){if(d[i+1]<60)r++;else y++}}return{r,y,n:d.length/4}});
let P=await px();
t('T2 เปิด TAWS (1,500 ft): มีพื้นที่สีแดงบนภูเขา',P.r>50,P);
t('T2 ชั้นสีแสดงบนจอจริง (มองเห็นที่ยอดเขา)',await p.evaluate(()=>{const cv=document.getElementById('tws'),r=cv.getBoundingClientRect(),c=wp(14.0,100.8,M.z),m=mp.getBoundingClientRect(),x=m.left+c[0]-(M.cx-mp.clientWidth/2),y=m.top+c[1]-(M.cy-mp.clientHeight/2);return getComputedStyle(cv).display!=='none'&&r.width>100&&x>r.left&&x<r.right&&y>r.top&&y<r.bottom}));
t('T2 ตำแหน่งไกลจากภูเขาไม่มีสี (พื้นราบ 0 ม.)',await p.evaluate(()=>{const cv=document.getElementById('tws');return cv.getContext('2d').getImageData(0,0,3,3).data[3]===0}));
const e0=await p.evaluate(()=>[trElev(14.0,100.8,10,false),trElev(14.0,100.925,10,false),trElev(14.0,100.45,10,false)]);
t('T2 ถอดค่าความสูง: ยอด ≈1,500 ม. / กลางเนิน ≈750 ม. / ไกลออกไป (100.45E) 0',Math.abs(e0[0]-1500)<25&&Math.abs(e0[1]-750)<40&&e0[2]!==null&&Math.abs(e0[2])<1,e0);
t('T2 คำอธิบายสีแสดงความสูงอ้างอิง (กล่องกราฟยังปิด)',await p.evaluate(()=>{const l=document.getElementById('twl');return !l.hidden&&/1,500 ft/.test(l.textContent)&&/ไม่รวมสิ่งกีดขวาง/.test(l.textContent)}));
// ความสูงบิน 6,000 ft: ยอด 4,921 ft → ไม่มีแดง มีเหลือง (แถบ 1,000 ft: 5,000–5,900) หรือไม่มีเลย
await p.fill('#twalt','5500');await p.press('#twalt','Tab');await p.waitForTimeout(600);P=await px();
t('T3 ความสูงบิน 5,500 ft: ไม่มีแดง มีเหลือง (ยอด 4,921 ft อยู่ในแถบ 4,500–5,400)',P.r===0&&P.y>10,P);
await p.fill('#twalt','8000');await p.press('#twalt','Tab');await p.waitForTimeout(600);P=await px();
t('T3 ความสูงบิน 8,000 ft: ไม่มีสีเลย',P.r===0&&P.y===0,P);
await p.evaluate(()=>twSet({alt:1500}));await p.waitForTimeout(400);
t('T3 ค่าตั้งถูกเก็บใน localStorage',await p.evaluate(()=>JSON.parse(localStorage.getItem('heliTaws')).alt===1500&&JSON.parse(localStorage.getItem('heliTaws')).on===true));
// แพน/หมุนแผนที่ไม่ error
await p.evaluate(()=>{M.cx+=300;drawMap(false);M.z=12;M.cx*=4;M.cy*=4;drawMap(false)});await p.waitForTimeout(1500);
await p.evaluate(()=>{const c=wp(14.0,100.8,12);M.cx=c[0];M.cy=c[1];drawMap(false)});await p.waitForTimeout(1500);P=await px();
t('T4 ซูม 12 ที่ยอดเขา: ยังแสดงสีแดง',P.r>100,P);
// กราฟความสูง: เส้นทาง A → ยอดเขา → C
await p.evaluate(()=>{$("fmt").value="dd";pts.length=0;pts.push({name:"AAA",lat:"14.0",lon:"100.3"},{name:"BBB",lat:"14.0",lon:"101.3"},{name:"CCC",lat:"14.6",lon:"101.3"});drawPts();calc();render();drawMap(false)});
await p.click('#pfb');await p.waitForTimeout(3000);
const pr=await p.evaluate(()=>({on:document.getElementById('mprof').classList.contains('on'),s:document.getElementById('pfs').textContent,rows:[...document.querySelectorAll('#pfl tr')].map(r=>r.textContent),top:PRF.S&&PRF.S.top&&PRF.S.top.e,miss:PRF.S&&PRF.S.miss,red:!!document.querySelector('#pfl .twr')}));
t('T5 เปิดกราฟความสูง: กล่องแสดง',pr.on);
t('T5 กล่องกราฟไม่บังแถบปุ่มแผนที่ (โหมดปกติ แผนที่เล็ก)',await p.evaluate(()=>{const r=document.getElementById('mprof').getBoundingClientRect(),f=document.getElementById('fs').getBoundingClientRect(),h=document.elementFromPoint(f.left+f.width/2,f.top+f.height/2);return r.top>=f.bottom-1&&h&&(h.id==='fs'||document.getElementById('fs').contains(h))}));
t('T5 กล่องกราฟเปิด: ซ่อนคำอธิบาย TAWS บนแผนที่ (ไม่ซ้อนกัน)',await p.evaluate(()=>document.getElementById('twl').hidden));
if(process.env.SHOT){await p.evaluate(()=>{const c=wp(14.1,100.85,9);M.z=9;M.cx=c[0];M.cy=c[1];drawMap(false)});await p.waitForTimeout(1500);await p.locator('#map').screenshot({path:'/tmp/tw_pc.png'});await p.click('#fs');await p.waitForTimeout(800);if(await p.isVisible('#uis'))await p.click('#uis');await p.waitForTimeout(500);await p.screenshot({path:'/tmp/tw_pc_full.png'});await p.evaluate(()=>fsToggle());await p.waitForTimeout(400)}
t('T5 ภูมิประเทศสูงสุด ≈4,921 ft บนช่วง AAA→BBB',pr.top&&Math.abs(pr.top-4921)<120&&/AAA→BBB/.test(pr.s),pr.top+' | '+pr.s.slice(0,120));
t('T5 ตารางรายช่วง 2 ช่วง + หัวตาราง และช่วงแรกเป็นสีแดง (ห่างพื้นติดลบ)',pr.rows.length===3&&pr.red,pr.rows.join(' / '));
t('T5 ไม่ขาดข้อมูลความสูง',pr.miss===0,pr.miss);
const cvOk=await p.evaluate(()=>{const c=document.getElementById('pfc');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let red=0,brown=0;for(let i=0;i<d.length;i+=4){if(d[i]>200&&d[i+1]<40)red++;if(d[i]>120&&d[i]<160&&d[i+1]>95&&d[i+1]<125)brown++}return{red,brown}});
t('T5 กราฟมีพื้นสีแดง (สูงกว่าความสูงบิน) และสีน้ำตาล',cvOk.red>100&&cvOk.brown>50,cvOk);
// แตะกราฟ → จุดบนแผนที่
const bb=await p.locator('#pfc').boundingBox();await p.mouse.move(bb.x+bb.width*0.3,bb.y+bb.height/2);await p.mouse.down();await p.mouse.up();await p.waitForTimeout(300);
t('T6 แตะกราฟ: แสดงค่าความสูง และวางจุดบนแผนที่',await p.evaluate(()=>/ภูมิประเทศ/.test(document.getElementById('pft').textContent)&&!document.getElementById('twm').hidden));
// ความสูงบิน 6,000 → ห่างพื้นบวก ไม่มีแดง
await p.fill('#twalt3','6000');await p.press('#twalt3','Tab');await p.waitForTimeout(800);
t('T6 ความสูงบินจากกล่องกราฟ 6,000 ft: ไม่มีช่วงสีแดง และค่าซิงก์กับช่องอื่น',await p.evaluate(()=>!document.querySelector('#pfl .twr')&&document.getElementById('twalt').value==='6000'&&document.getElementById('twalt2').value==='6000'));
await p.evaluate(()=>twSet({alt:1500}));
// แผนที่เต็มจอ: ปุ่มสูงเท่าแถวบนเมื่อเป็นจอสัมผัส (ตรวจใน t4301) / ปิดกราฟ
await p.click('#pfx');await p.waitForTimeout(200);
t('T7 ปิดกล่องกราฟด้วย ✕',await p.evaluate(()=>!document.getElementById('mprof').classList.contains('on')&&!TW.pf));
// ออฟไลน์: ใช้ข้อมูลความสูงจากแคชอัตโนมัติ
const tc=await p.evaluate(async()=>(await (await caches.open('tiles-auto')).keys()).filter(r=>/elevation-tiles-prod/.test(r.url)).length);
t('T8 ข้อมูลความสูงถูกเก็บในแคชอัตโนมัติ (tiles-auto)',tc>0,tc);
mode='fail';await c.setOffline(true);await p.reload();await p.waitForTimeout(1500);
await p.evaluate(()=>{const c=wp(14.0,100.8,10);M.z=10;M.cx=c[0];M.cy=c[1];M.touched=true;drawMap(false)});await p.waitForTimeout(2500);P=await px();
t('T8 ออฟไลน์: TAWS ยังแสดงจากแคช (อ่านค่าได้ ไม่ติด CORS)',P.r>50,P);
await p.evaluate(()=>{M.z=13;const c=wp(14.0,100.8,13);M.cx=c[0];M.cy=c[1];drawMap(false)});await p.waitForTimeout(2000);P=await px();
t('T8 ออฟไลน์ซูม 13 (ข้อมูลถึงซูม 12): ยังแสดงสีจากแผ่นแม่',P.r>50,P);
await c.setOffline(false);mode='ok';await p.reload();await p.waitForTimeout(1500);
// หน้าดาวน์โหลดออฟไลน์มีตัวเลือกข้อมูลความสูง และจำกัดซูม 12
await p.click('#offb');await p.waitForSelector('#omd:not([hidden])');
const om=await p.evaluate(()=>{const tf=document.querySelector('#omd [data-ly="terrain"]');return{has:!!tf,checked:tf&&tf.checked}});
t('T9 หน้า 📥 แผนที่ออฟไลน์ มีตัวเลือกข้อมูลความสูง (เลือกไว้ให้เมื่อเปิด TAWS)',om.has&&om.checked,om);
for(const e of await p.$$('#omd [data-ly]'))if(await e.isChecked())await e.uncheck();
await p.check('#omd [data-ly="terrain"]');await p.selectOption('#omz0','10');await p.selectOption('#omz1','14');await p.check('input[name=omsrc][value=rad]');await p.fill('#omrad','5');await p.waitForTimeout(300);
const n1=await p.evaluate(()=>+document.getElementById('omest').dataset.n);
await p.selectOption('#omz1','12');await p.waitForTimeout(300);const n2=await p.evaluate(()=>+document.getElementById('omest').dataset.n);
t('T9 ข้อมูลความสูงนับถึงซูม 12 เท่านั้น (เลือกถึง 14 = เลือกถึง 12)',n1>0&&n1===n2,n1+' vs '+n2);
const h0=hits.length;await p.fill('#omname','ภูเขาทดสอบ');await p.click('#omgo');await p.waitForFunction(()=>/เสร็จแล้ว/.test(document.getElementById('omst').textContent),null,{timeout:30000}).catch(()=>{});
const ta=await p.evaluate(async()=>(await (await caches.open('tiles-area')).keys()).filter(r=>/elevation-tiles-prod/.test(r.url)).length);
t('T9 ดาวน์โหลดข้อมูลความสูงลงแคชพื้นที่ (tiles-area)',ta>0&&ta<=n1,ta+' / '+n1);
await p.click('#omx');
// แผนที่เต็มจอบน iPad จำลอง: ปุ่มใหม่สูง 40px ไม่มี error
const c2=await b.newContext({...devices['iPad Pro 11 landscape']});await c2.route(/tile|arcgis|openstreetmap|elevation-tiles|fonts\.g|script\.google|aviationweather|rainviewer|cartocdn/,r=>r.abort());
const p2=await c2.newPage();p2.on('pageerror',e=>errs.push('iPad: '+e.message));await p2.goto(U);await p2.waitForTimeout(1500);await p2.click('#fs');await p2.waitForTimeout(400);if(await p2.isVisible('#uis'))await p2.click('#uis');await p2.waitForTimeout(400);
const hh=await p2.evaluate(()=>['fit','twb','pfb'].map(id=>document.getElementById(id).getBoundingClientRect().height));
t('T10 iPad เต็มจอ: ปุ่ม TAWS/กราฟความสูงสูงเท่าแถวบน',hh.every(h=>Math.abs(h-hh[0])<=2),hh.join(','));
await p2.click('#twb');await p2.waitForTimeout(800);
t('T10 iPad: เปิด TAWS แบบไม่มีข้อมูล แจ้งสถานะในคำอธิบาย',await p2.evaluate(()=>{const l=document.getElementById('twl');return !l.hidden&&/ข้อมูลความสูง/.test(l.textContent)}));
await p2.click('#pfb');await p2.waitForTimeout(800);
t('T10 iPad: เปิดกราฟแบบไม่มีเส้นทาง แจ้งให้สร้างเส้นทาง',await p2.evaluate(()=>/อย่างน้อย 2 จุด/.test(document.getElementById('pfs').textContent)));
// ความเร็ววาดชั้น TAWS บน iPad จำลอง (CPU ช้าลง 4 เท่า) ด้วยข้อมูลภูเขาจำลอง
const c3=await b.newContext({...devices['iPad Pro 11 landscape']});await c3.route(/elevation-tiles-prod/,r=>{const m=r.request().url().match(/terrarium\/(\d+)\/(\d+)\/(\d+)\.png/);r.fulfill({status:200,contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:tilePng(+m[1],+m[2],+m[3])})});
await c3.route(/tile\.|arcgis|openstreetmap|fonts\.g|script\.google|aviationweather|rainviewer|cartocdn|open-meteo|adsb|airplanes/,r=>r.abort());
const p3=await c3.newPage();p3.on('pageerror',e=>errs.push('iPad3: '+e.message));await p3.goto(U);await p3.waitForTimeout(1200);
await p3.evaluate(()=>{$("fmt").value="dd";pts.length=0;pts.push({name:"AAA",lat:"14.0",lon:"100.3"},{name:"BBB",lat:"14.0",lon:"101.3"},{name:"CCC",lat:"14.6",lon:"101.3"});drawPts();calc();render();twSet({on:true,pf:true})});
await p3.click('#fs');await p3.waitForTimeout(300);if(await p3.isVisible('#uis'))await p3.click('#uis');
await p3.evaluate(()=>{const c=wp(14.05,100.8,10);M.z=10;M.cx=c[0];M.cy=c[1];M.touched=true;drawMap(false)});await p3.waitForTimeout(3000);
const cdp=await c3.newCDPSession(p3);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
const ms=await p3.evaluate(()=>{const a=[],f=[],z=[];for(let i=0;i<12;i++){M.cx+=7;let t0=performance.now();drawMap(false);a.push(performance.now()-t0);TWS.k="";t0=performance.now();drawMap(false);f.push(performance.now()-t0)}
 const tw=TW.on;TW.on=false;for(let i=0;i<12;i++){M.cx+=7;const t0=performance.now();drawMap(false);z.push(performance.now()-t0)}TW.on=tw;[a,f,z].forEach(x=>x.sort((p,q)=>p-q));return{med:a[6],max:a[11],full:f[6],off:z[6]}});
await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
console.log('INFO เวลาวาดแผนที่ (iPad จำลอง CPU ช้า 4 เท่า) มัธยฐาน: แพนขณะเปิด TAWS',ms.med.toFixed(1),'ms · วาด TAWS ใหม่ทั้งจอ',ms.full.toFixed(1),'ms · ปิด TAWS',ms.off.toFixed(1),'ms');
t('T12 แพนแผนที่ขณะเปิด TAWS เร็วใกล้เคียงตอนปิด (ใช้ภาพเดิม ไม่วาดใหม่ทุกครั้ง)',ms.med<ms.off+8,ms.med.toFixed(1)+' vs '+ms.off.toFixed(1)+' ms');
if(process.env.SHOT){await p3.screenshot({path:'/tmp/tw_ipad_l.png'});await p3.setViewportSize({width:834,height:1194});await p3.waitForTimeout(800);await p3.evaluate(()=>drawMap(false));await p3.waitForTimeout(800);await p3.screenshot({path:'/tmp/tw_ipad_p.png'})}
await c3.close();
await c2.close();
t('T11 ไม่มี JavaScript error',errs.length===0,errs.slice(0,3));
console.log(`\nผล: PASS ${pass} / FAIL ${fail} (${APP})`);await b.close();srv.close();process.exit(fail?1:0)})();
