// ทดสอบ FLTA v4.6.0–4.6.1 (เตือนภูมิประเทศข้างหน้า) Playwright/Chromium จำลอง ไม่ใช่ iPad/GPS จริง: วางเครื่องจำลองผ่าน MLP ใกล้ "ภูเขาจำลอง" 1,500 ม. ที่ 14.00N 100.80E
// เสียงเตือนตรวจด้วยตัวแทน speechSynthesis · รัน: node tests/t4600.js (เปิดเซิร์ฟเวอร์ชั่วคราวพอร์ต 8772 เอง ตั้ง SHOT=1 เพื่อเก็บภาพหน้าจอ)
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS='1';
const {chromium,devices}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');const os=require('os');const zlib=require('zlib');
const ROOT=path.resolve(__dirname,'..');
const APP=fs.readdirSync(ROOT).filter(f=>/^Tpad helicopter planner v\d+\.\d+\.\d+\.html$/.test(f)).sort().pop();
const SITE=fs.mkdtempSync(path.join(os.tmpdir(),'fl-'));
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
const tileMax=(z,x,y)=>{let m=0;for(let j=0;j<=16;j++)for(let i=0;i<=16;i++){const[la,lo]=ll(x*256+i*16,y*256+j*16,z);m=Math.max(m,elevAt(la,lo))}return m};
const T11=(la,lo)=>{const n=2**11,x=Math.floor((lo+180)/360*n),r=la*Math.PI/180,y=Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n);return[x,y]};
const P12=[];{const[a0,b0]=T11(MT.la+.4,MT.lo-.4),[a1,b1]=T11(MT.la-.4,MT.lo+.4);for(let x=a0;x<=a1;x++)for(let y=b0;y<=b1;y++)if(tileMax(11,x,y)>=300)P12.push([x,y])}
const COV={v:1,source:'test',bbox:[5.5,97.2,20.6,105.8],zmin:5,zfull:11,zmax:12,z12parents:P12};
const TPNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==','base64');

(async()=>{
await new Promise(r=>srv.listen(8772,r));const U='http://localhost:8772/';
const ver=(APP.match(/v(\d+\.\d+\.\d+)/)||[])[1],swv=(fs.readFileSync(path.join(SITE,'sw.js'),'utf8').match(/VERSION = '([^']+)'/)||[])[1];
t('T0 sw.js VERSION == เวอร์ชันแอป ('+ver+')',swv===ver,swv);
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1280,height:800}});let mode='ok';
await c.addInitScript(()=>{window.__said=[];const ss={speak:u=>window.__said.push(u.text),cancel(){},getVoices:()=>[]};try{Object.defineProperty(window,'speechSynthesis',{value:ss,configurable:true})}catch(e){}window.SpeechSynthesisUtterance=function(x){this.text=x}});
await c.route(/ow3652\.github\.io\/Tpadterrain\//,r=>{const u=r.request().url();if(mode==='fail')return r.abort();
 if(/coverage\.json/.test(u))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(COV)});
 const m=u.match(/terrarium\/(\d+)\/(\d+)\/(\d+)\.png/);if(!m)return r.fulfill({status:404,body:''});const z=+m[1],x=+m[2],y=+m[3];
 if(z>12||tileMax(z,x,y)<=0)return r.fulfill({status:404,headers:{'access-control-allow-origin':'*'},body:'nf'});
 r.fulfill({status:200,contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:tilePng(z,x,y)})});
await c.route(/elevation-tiles-prod|tile\.opentopomap|tile-cyclosm|tile\.openstreetmap|arcgisonline/,r=>mode==='fail'?r.abort():r.fulfill({status:200,contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:TPNG}));
await c.route(/rainviewer|cartocdn|aviationweather|fonts\.g|script\.google\.com|open-meteo|adsb|airplanes/,r=>r.abort());
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto(U);await p.waitForFunction(()=>typeof TOWN!=='undefined'&&TOWN.st!=='loading',null,{timeout:12000}).catch(()=>{});
// วางเครื่อง (ตั้ง MLP เหมือน GPS/SIM) แล้วประเมิน 2 รอบ (รอบแรกโหลดข้อมูลความสูง)
const at=async(la,lo,hd,kt,altft)=>{await p.evaluate(([la,lo,hd,kt,altft])=>{clearInterval(FL.tm);FL.st='clear';FL.since=0;FL.saidSt='';FL.hh=[];FL.hist=[];MLP.on=true;MLP.la=la;MLP.lo=lo;MLP.hd=hd;MLP.sp=kt/1.943844;MLP.alt=altft==null?null:altft/3.28084;MLP.t=Date.now();flTick()},[la,lo,hd,kt,altft]);
 await p.waitForTimeout(1500);return p.evaluate(()=>{MLP.t=Date.now();FL.since=0;flTick();return{st:FL.st,tc:FL.tc,e:FL.pt&&Math.round(FL.pt.e),cls:document.getElementById('flb').className,txt:document.getElementById('flb').textContent,hid:document.getElementById('flb').hidden,poly:!!document.querySelector('#flv polygon'),x:!!document.querySelector('#flv path')}})};
await p.evaluate(()=>{const c=wp(14.0,100.6,10);M.z=10;M.cx=c[0];M.cy=c[1];M.touched=true;M.init=true;drawMap(false)});
let r=await at(14.0,100.543,90,120,null);
t('T1 FLTA ปิด (ค่าเริ่มต้น): ไม่แสดงแถบ ไม่ประเมิน',r.hid&&r.st==='off',r.st);
await p.evaluate(()=>{document.getElementById('flon').click()});await p.waitForTimeout(200);
t('T1 เปิด FLTA: พูดทดสอบเสียง (เปิดเสียงบน iPad ด้วยการกด)',await p.evaluate(()=>window.__said.some(s=>/Terrain alerting on/.test(s))));
t('T1 ค่าตั้งซิงก์ช่องในชั้นข้อมูล และเก็บใน localStorage',await p.evaluate(()=>document.getElementById('flon2').checked&&JSON.parse(localStorage.getItem('heliTaws')).fl===true));
await p.evaluate(()=>{window.__said=[]});
r=await at(14.0,100.5861,90,120,null);
t('T2 b2 ห่างจุดชน ~0.5 NM ที่ 120 kt (~15 วิ): CAUTION',r.st==='caution'&&r.tc>10&&r.tc<=20&&/CAUTION – TERRAIN/.test(r.txt)&&r.cls.includes('fl-caution'),JSON.stringify({st:r.st,tc:r.tc,e:r.e}));
t('T2 พูด "Caution, terrain" และวาดพัดตรวจ + จุดชนบนแผนที่',await p.evaluate(()=>window.__said.some(s=>/Caution, terrain/.test(s)))&&r.poly&&r.x);
await p.evaluate(()=>{window.__said=[]});
r=await at(14.0,100.5913,90,120,null);
t('T3 b2 ห่าง ~0.2 NM (~6 วิ): WARNING',r.st==='warn'&&r.tc<=10&&/WARNING – TERRAIN/.test(r.txt)&&r.cls.includes('fl-warn'),JSON.stringify({st:r.st,tc:r.tc}));
t('T3 พูด "Warning, terrain"',await p.evaluate(()=>window.__said.some(s=>/Warning, terrain/.test(s))));
await p.evaluate(()=>{window.__said=[];document.getElementById('flmute').click()});await p.waitForTimeout(100);
await p.evaluate(()=>{FL.said=0;MLP.t=Date.now();flTick()});
t('T3 กด 🔇 ปิดเสียงเตือนครั้งนี้: ไม่พูดซ้ำ',await p.evaluate(()=>window.__said.length===0&&FL.mute));
r=await at(14.0,100.492,90,120,null);
r=await at(14.0,100.572,90,120,null);
t('T4 b2 ห่าง ~1.3 NM (~40 วิ เกิน 20 วิ): ไม่เตือน',r.st==='clear',JSON.stringify({st:r.st,tc:r.tc}));
t('T4 ห่าง ~6 NM (เกิน 20 วิ): ไม่เตือน และกลับมาเปิดเสียงเมื่อพ้นเหตุ',r.st==='clear'&&/FLTA ✓/.test(r.txt)&&await p.evaluate(()=>!FL.mute),r.st);
// v4.6.1 b2: พัดข้างละ 30° — ภูเขาเฉียงซ้าย 20° เตือน / เฉียง 80° (นอกพัด) ไม่เตือน (240 kt ระยะ 20 วิ = 1.33 NM, ขอบเตือน 11.95 NM จากยอด)
const offAx=async rel=>{const q=await p.evaluate(rel=>flDest(14.0,100.8,(90-rel+180+360)%360,12.95),rel);return at(q.la,q.lo,90,240,null)};
r=await offAx(20);
t('T5b b2 ภูเขาเฉียงซ้าย 20° (ในพัด 30°): CAUTION',r.st==='caution',JSON.stringify({st:r.st,tc:r.tc}));
r=await offAx(80);
t('T5b b2 ภูเขาเฉียงซ้าย 80° (นอกพัด): ไม่เตือน',r.st==='clear',r.st);
const fan=await p.evaluate(()=>{const F=FL.path&&FL.path.F;if(!F)return null;const b=(a,c)=>{const r=Math.PI/180,y=Math.sin((c.lo-a.lo)*r)*Math.cos(c.la*r),x=Math.cos(a.la*r)*Math.sin(c.la*r)-Math.sin(a.la*r)*Math.cos(c.la*r)*Math.cos((c.lo-a.lo)*r);return(Math.atan2(y,x)/r+360)%360};return{l:Math.round(b(F[0],F[1])),r:Math.round(b(F[0],F[F.length-1]))}});
t('T5b b2 วาดเฉพาะเส้นขอบพัด ไม่ลงสี และไม่มีเส้นโค้งกลางพัด',await p.evaluate(()=>{const sv=document.getElementById('flv');const pg=[...sv.querySelectorAll('polygon')];return pg.length>0&&pg.every(e=>e.getAttribute('fill')==='none')&&!sv.querySelector('polyline')}));
const fr=async v=>p.evaluate(v=>{const r=document.getElementById('flr');r.value=String(v);r.dispatchEvent(new Event('change'));MLP.t=Date.now();FL.since=0;flTick();const F=FL.path.F,a=F[0],c=F[12],R=6371e3/1852,rr=Math.PI/180;const d=2*R*Math.asin(Math.sqrt(Math.sin((c.la-a.la)*rr/2)**2+Math.cos(a.la*rr)*Math.cos(c.la*rr)*Math.sin((c.lo-a.lo)*rr/2)**2));return{d:+d.toFixed(2),st:FL.st,tc:FL.tc,saved:JSON.parse(localStorage.getItem('heliTaws')).flr}},v);
await offAx(20);const f10=await fr(10),f5=await fr(5),f2=await fr(2);
t('T5d b3 เลือกขนาดพัด 10/5/2 NM: พัดที่วาดยาวตามที่เลือก และบันทึกค่า',Math.abs(f10.d-10)<.1&&Math.abs(f5.d-5)<.1&&Math.abs(f2.d-2)<.1&&f10.saved===10&&f2.saved===2,JSON.stringify({f10,f5,f2}));
t('T5d b3 ขนาดพัดไม่เปลี่ยนการเตือน (ภูเขาเฉียง 20° ยัง CAUTION ทุกขนาด, tc ≤ 20 วิ)',[f10,f5,f2].every(x=>x.st==='caution'&&x.tc<=20),JSON.stringify([f10.st,f5.st,f2.st,f2.tc]));
t('T5d b3 ชั้นพัด (#flv) อยู่ใต้ชั้นสามเหลี่ยมเฮลิคอปเตอร์ (#ov)',await p.evaluate(()=>{const f=document.getElementById('flv'),o=document.getElementById('ov');return f.parentElement===o.parentElement&&!!(f.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_FOLLOWING)&&getComputedStyle(f).zIndex==='auto'&&getComputedStyle(o).zIndex==='auto'}));
t('T5d b3 ความเข้มสี TAWS ปรับจางได้ถึง 5%',await p.evaluate(()=>document.getElementById('twop').min==='5'));
t('T5b b2 พัดที่วาด: 60° ถึง 120° (Track 090 ± 30°)',fan&&fan.l===60&&fan.r===120,JSON.stringify(fan));
// เส้นโค้งทำนาย (ใช้ตรวจ ไม่วาด): b2 ระยะ 20 วิ → เลี้ยว 3°/วิ โค้ง 60° (ไม่ถึงเพดาน 80°) · 6°/วิ คาไว้ 80° · 0.2°/วิ โค้ง 4°
const curve=async rate=>p.evaluate(rate=>{clearInterval(FL.tm);const now=Date.now();FL.hh=[];for(let i=0;i<=4;i++)FL.hh.push({t:now-4000+i*1000,hd:(90+rate*(i-4)+360)%360});MLP.on=true;MLP.la=13.0;MLP.lo=100.0;MLP.hd=90;MLP.sp=120/1.943844;MLP.alt=null;MLP.t=now;const r=flEval(now),C=r.path.C,a=C[C.length-2],c=C[C.length-1],rr=Math.PI/180,y=Math.sin((c.lo-a.lo)*rr)*Math.cos(c.la*rr),x=Math.cos(a.la*rr)*Math.sin(c.la*rr)-Math.sin(a.la*rr)*Math.cos(c.la*rr)*Math.cos((c.lo-a.lo)*rr);return Math.round(((Math.atan2(y,x)/rr-90+540)%360)-180)},rate);
const c3=await curve(3),c6=await curve(6),c02=await curve(0.2);
t('T5c เส้นโค้งทำนาย: เลี้ยว 3°/วิ ใน 20 วิ โค้ง ~60°',c3>=55&&c3<=62,c3);
t('T5c เส้นโค้งทำนาย: เลี้ยว 6°/วิ คาไว้ที่ ~80°',c6>=74&&c6<=81,c6);
t('T5c เส้นโค้งทำนาย: เลี้ยวน้อย 0.2°/วิ โค้งน้อย (~4°)',c02>=2&&c02<=6,c02);
r=await at(14.0,100.578,270,120,null);
t('T5 จุดเดิมแต่บินออกจากภูเขา (270°): ไม่เตือน',r.st==='clear',r.st);
r=await at(14.0,100.5913,90,15,null);
t('T6 GS 15 kt (< 20): งดเตือน',r.st==='inh'&&/งดเตือน/.test(r.txt),r.st);
await p.evaluate(()=>twSet({alt:6000}));
r=await at(14.0,100.5913,90,120,null);
t('T7 ความสูงบิน 6,000 ft (ยอด 4,921 + 500 = 5,421): ไม่เตือน',r.st==='clear',r.st);
// ความสูง GPS + ร่อนลง: ไม่ร่อน = ไม่เตือน / ร่อน 30 ft/วิ = เตือน (b2 มองล่วงหน้า 20 วิ)
await p.evaluate(()=>twSet({alt:1500,gps:true}));
r=await at(14.0,100.79,90,120,5600);
t('T8 ความสูง GPS 5,600 ft ระดับคงที่ ใกล้ยอด: ไม่เตือน',r.st==='clear',r.st);
const dsc=await p.evaluate(async()=>{clearInterval(FL.tm);FL.hist=[];FL.hh=[];FL.st='clear';const t0=Date.now()-10000;
 for(let i=0;i<=10;i++){MLP.t=t0+i*1000;MLP.alt=(5900-30*i)/3.28084;flTick(t0+i*1000)}MLP.t=Date.now();MLP.alt=5600/3.28084;flTick();return{st:FL.st,vs:FL.vs,tc:FL.tc}});
t('T8 ความสูง GPS ร่อนลง 30 ft/วิ: คาดว่าจะต่ำลง จึงเตือน',(dsc.st==='caution'||dsc.st==='warn')&&dsc.vs<-25,JSON.stringify(dsc));
await p.evaluate(()=>twSet({gps:false}));
// ออฟไลน์บริเวณที่ไม่เคยโหลด: ไม่มีข้อมูล ≠ ปลอดภัย
mode='fail';await c.setOffline(true);
r=await at(18.5,99.5,90,120,null);
t('T9 ออฟไลน์ ไม่มีข้อมูลความสูงด้านหน้า: แจ้ง "ไม่มีข้อมูล" ไม่ขึ้นว่าปลอดภัย',r.st==='nodata'&&/ไม่มีข้อมูลความสูงด้านหน้า/.test(r.txt),r.st);
await c.setOffline(false);mode='ok';
// ความสูงตรงเป้าชี้ (v4.6.0): PC = จุดที่เมาส์ชี้ แสดง ft ต่อท้ายพิกัด
await p.evaluate(()=>{const c=wp(14.0,100.8,11);M.z=11;M.cx=c[0];M.cy=c[1];drawMap(false)});await p.waitForTimeout(1500);
const mb=await p.locator('#map').boundingBox();await p.mouse.move(mb.x+mb.width/2,mb.y+mb.height/2);await p.waitForTimeout(1200);await p.mouse.move(mb.x+mb.width/2+1,mb.y+mb.height/2);await p.waitForTimeout(200);
const ct=await p.evaluate(()=>document.getElementById('cur').textContent);
const ft=+((ct.match(/·\s*([\d,]+) ft/)||[])[1]||'0').replace(/,/g,'');
t('T9b PC: กล่องพิกัดตรงเมาส์แสดงความสูง ft (ยอดเขา ≈4,900 ft)',ft>4700&&ft<5000,ct);
await p.evaluate(()=>{const c=wp(13.0,100.0,11);M.cx=c[0];M.cy=c[1];drawMap(false)});await p.mouse.move(mb.x+mb.width/2,mb.y+mb.height/2);await p.waitForTimeout(1500);await p.mouse.move(mb.x+mb.width/2+1,mb.y+mb.height/2);await p.waitForTimeout(200);
const ct2=await p.evaluate(()=>document.getElementById('cur').textContent);
t('T9b PC: ชี้ที่ราบห่างภูเขา (13N 100E) แสดง 0 ft',/· 0 ft/.test(ct2),ct2);
// v4.6.1 ข้อ 4: เส้นประทำนายหน้าสามเหลี่ยม SIM ซูมออก + เลี้ยวแรง ไม่ม้วนเกิน ~80°
const simC=await p.evaluate(()=>{const keep={on:SIM.on,la:SIM.la,lo:SIM.lo,hd:SIM.hd,sp:SIM.sp,om:SIM.om};const out={};for(const z of[6,9,13])for(const om of[3,0.3]){Object.assign(SIM,{on:true,la:14,lo:100,hd:90,sp:120,om});const h=simLayer(z,0,0,1000,800,"p"),m=[...h.matchAll(/points="([^"]+)"/g)].pop();const P=m[1].trim().split(" ").map(s=>s.split(",").map(Number));const b=(a,c)=>Math.atan2(c[0]-a[0],-(c[1]-a[1]))*180/Math.PI;out[z+'/'+om]=Math.round(((b(P[P.length-2],P[P.length-1])-90+540)%360)-180)}Object.assign(SIM,keep);return out});
t('T9c v4.6.1 เส้นทำนาย SIM: เลี้ยว 3°/วิ ทุกซูม โค้งรวมไม่เกิน 80°',['6/3','9/3','13/3'].every(k=>simC[k]<=81&&simC[k]>0),JSON.stringify(simC));
t('T9c v4.6.1 เส้นทำนาย SIM: เลี้ยวน้อย โค้งน้อยกว่าเลี้ยวแรง',simC['13/0.3']<simC['13/3']&&simC['13/0.3']>=0,JSON.stringify(simC));
// v4.6.1 ข้อ 1: FLTA + เสียง อยู่แถวเดียวกับปุ่มดาวน์โหลดแผนที่/TAWS (กล่องชั้นข้อมูล เต็มจอ)
await p.click('#fs');await p.waitForTimeout(600);
await p.evaluate(()=>document.getElementById('fpb').click());const lay2=true;await p.waitForTimeout(500);
const row=await p.evaluate(()=>{const g=id=>{const e=document.getElementById(id);const el=e.tagName==='INPUT'?e.closest('label'):e;const r=el.getBoundingClientRect();return{t:Math.round(r.top),b:Math.round(r.bottom),l:Math.round(r.left),r:Math.round(r.right),v:r.width>0}};return{dl:g('twdl'),fl:g('flon2'),sn:g('flsnd'),same:document.getElementById('twdl').parentElement===document.getElementById('flon2').closest('label').parentElement}});
const mid=o=>(o.t+o.b)/2;
t('T12 v4.6.1 กล่องชั้นข้อมูล: FLTA + เสียง แถวเดียวกับ ดาวน์โหลดแผนที่/TAWS',row.same&&row.dl.v&&row.fl.v&&Math.abs(mid(row.dl)-mid(row.fl))<8&&Math.abs(mid(row.dl)-mid(row.sn))<8&&row.dl.r<=row.fl.l+1&&row.fl.r<=row.sn.l+1,JSON.stringify({lay2,...row}));
await p.evaluate(()=>{document.getElementById('fpb').click();document.getElementById('fs').click()});await p.waitForTimeout(400);
// v4.6.1 ข้อ 2: กราฟความสูงเต็มกว้างกล่อง สูงพอ วาดใหม่เมื่อกล่องเปลี่ยนขนาด ไม่มีกราฟค้างเมื่อไม่มีเส้นทาง
await p.evaluate(()=>{$("fmt").value="dd";pts.length=0;pts.push({name:"AAA",lat:"14.0",lon:"100.3"},{name:"AAB",lat:"14.0",lon:"100.31"},{name:"AAC",lat:"14.0",lon:"100.32"},{name:"BBB",lat:"14.0",lon:"101.3"});drawPts();calc();render();drawMap(false);prfShow(true)});await p.waitForTimeout(1500);
const pg=await p.evaluate(async()=>{const box=document.getElementById('pfbx'),cv=document.getElementById('pfc'),pe=document.getElementById('mprof');const a={bw:box.clientWidth,cw:cv.getBoundingClientRect().width,ch:cv.getBoundingClientRect().height,pxw:cv.width};pe.style.width='900px';await new Promise(r=>setTimeout(r,400));a.bw2=box.clientWidth;a.cw2=cv.getBoundingClientRect().width;a.pxw2=cv.width;return a});
t('T13 v4.6.1 กราฟความสูงกว้างเต็มกล่อง และสูงอย่างน้อย 120 px',Math.abs(pg.cw-pg.bw)<24&&pg.ch>=120,JSON.stringify(pg));
t('T13 v4.6.1 ขยายกล่องแล้วกราฟวาดใหม่ตามความกว้าง (ไม่ค้างเป็นกล่องเล็ก)',pg.bw2>pg.bw+100&&Math.abs(pg.cw2-pg.bw2)<24&&pg.pxw2>pg.pxw,JSON.stringify(pg));
await p.evaluate(async()=>{pts.length=0;drawPts();calc();render();drawMap(false);prfUpd(true)});await p.waitForTimeout(400);
t('T13 v4.6.1 ไม่มีเส้นทาง Active: ซ่อนกราฟ เหลือข้อความ',await p.evaluate(()=>{const c=document.getElementById('pfc');return getComputedStyle(c).display==='none'&&/ต้องมีเส้นทาง Active/.test(document.getElementById('pfs').textContent)}));
await p.evaluate(()=>{document.getElementById('mprof').style.width='';prfShow(false)});
if(process.env.SHOT){await p.setViewportSize({width:1280,height:800});await p.evaluate(()=>{pts.length=0;pts.push({name:"MYPOT",lat:"13.8",lon:"100.3"},{name:"KRTLK",lat:"14.0",lon:"100.8"},{name:"TKSMC",lat:"14.3",lon:"101.2"},{name:"KSTMC",lat:"14.32",lon:"101.25"});drawPts();calc();render();document.getElementById('fs').click()});await p.waitForTimeout(500);await p.evaluate(()=>{prfShow(true);const c=wp(14.0,100.8,9);M.z=9;M.cx=c[0];M.cy=c[1];drawMap(false)});await p.waitForTimeout(2500);await p.screenshot({path:'/tmp/s461_prof.png'});
await p.evaluate(()=>{prfShow(false);flSet({fl:true});clearInterval(FL.tm);const now=Date.now();FL.hh=[];for(let i=0;i<=4;i++)FL.hh.push({t:now-4000+i*1000,hd:90+3*(i-4)});MLP.on=true;MLP.la=13.93;MLP.lo=100.45;MLP.hd=90;MLP.sp=140/1.943844;MLP.alt=null;MLP.t=now;flTick(now);const c=wp(13.95,100.55,11);M.z=11;M.cx=c[0];M.cy=c[1];drawMap(false)});await p.waitForTimeout(1500);await p.screenshot({path:'/tmp/s461_fl.png'});
await p.evaluate(()=>document.getElementById('fpb').click());await p.waitForTimeout(500);await p.screenshot({path:'/tmp/s461_lay.png'});await p.evaluate(()=>document.getElementById('fpb').click());await p.evaluate(()=>{clearInterval(FL.tm);MLP.la=14.0;MLP.lo=100.5913;MLP.hd=90;MLP.t=Date.now();FL.hh=[];flTick();const c=wp(14.0,100.6,11);M.cx=c[0];M.cy=c[1];drawMap(false);document.getElementById('flb').click();const sb=document.getElementById('simbox');sb.hidden=false});await p.waitForTimeout(800);await p.screenshot({path:'/tmp/s462_ic.png'})}
// v4.6.2 ข้อ 1: แตะกล่องเตือน → ย่อเป็นไอคอนสี่เหลี่ยม TERRAIN มุมล่างขวา สีตามระดับเตือน
await p.evaluate(()=>twSet({alt:1500,gps:false}));
r=await at(14.0,100.5861,90,120,null);
const ic1=await p.evaluate(()=>{const b=document.getElementById('flb');b.click();const ic=document.getElementById('flic'),m=document.getElementById('map').getBoundingClientRect(),r=ic.getBoundingClientRect();return{st:FL.st,bh:b.hidden,ih:ic.hidden,txt:ic.textContent,cls:ic.className,w:Math.round(r.width),h:Math.round(r.height),dr:Math.round(m.right-r.right),db:Math.round(m.bottom-r.bottom),bg:getComputedStyle(ic).backgroundColor}});
t('T14 v4.6.2 แตะกล่อง CAUTION: ย่อเป็นไอคอน TERRAIN สี่เหลี่ยม มุมล่างขวา สีเหลือง',ic1.st==='caution'&&ic1.bh&&!ic1.ih&&ic1.txt==='TERRAIN'&&/fl-caution/.test(ic1.cls)&&ic1.w===ic1.h&&ic1.dr>=0&&ic1.dr<30&&ic1.db>=0&&ic1.db<140&&ic1.bg==='rgb(255, 196, 0)',JSON.stringify(ic1));
r=await at(14.0,100.5861,90,120,null);
t('T14 v4.6.2 ระดับเดิม (CAUTION) ยังเป็นไอคอน ไม่เด้งกลับ',await p.evaluate(()=>document.getElementById('flb').hidden&&!document.getElementById('flic').hidden));
r=await at(14.0,100.5913,90,120,null);
t('T14 v4.6.2 ระดับสูงขึ้นเป็น WARNING: กล่องเตือนเต็มกลับมาเอง',r.st==='warn'&&!r.hid&&await p.evaluate(()=>document.getElementById('flic').hidden),JSON.stringify({st:r.st,hid:r.hid}));
const ic2=await p.evaluate(()=>{document.getElementById('flb').click();const ic=document.getElementById('flic');return{ih:ic.hidden,cls:ic.className}});
t('T14 v4.6.2 ย่อ WARNING: ไอคอนสีแดง',!ic2.ih&&/fl-warn/.test(ic2.cls),JSON.stringify(ic2));
const ic3=await p.evaluate(()=>{document.getElementById('flic').click();return{bh:document.getElementById('flb').hidden,ih:document.getElementById('flic').hidden}});
t('T14 v4.6.2 แตะไอคอน: กลับเป็นกล่องเตือนเต็ม',!ic3.bh&&ic3.ih,JSON.stringify(ic3));
const ic4=await p.evaluate(()=>{const m=document.getElementById('flmute');if(m)m.click();return{bh:document.getElementById('flb').hidden,mute:FL.mute}});
t('T14 v4.6.2 กดปุ่มปิดเสียงในกล่อง ไม่ย่อกล่อง',!ic4.bh&&ic4.mute,JSON.stringify(ic4));
await p.evaluate(()=>{FL.mute=false;FL.min=false});
// v4.6.2 ข้อ 2: SIM มี ALT ใต้ SPD เหนือ TIME ค่าเดียวกับ FLY ALT ทีละ 100 ft ถึง 10,000 ft
const sa=await p.evaluate(async()=>{const sb=document.getElementById('simbox');sb.hidden=false;await new Promise(r=>setTimeout(r,50));const y=id=>document.getElementById(id).getBoundingClientRect();const o={spd:y('smspd').top,alt:y('smalt').top,time:y('smsc').top,v0:document.getElementById('smalt').value};
const plus=sb.querySelector('button[data-al="100"]'),minus=sb.querySelector('button[data-al="-100"]');const tap=b=>{b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))};
tap(plus);tap(plus);tap(plus);await new Promise(r=>setTimeout(r,300));o.a1=TW.alt;o.l1=document.getElementById('twalt2').value;tap(minus);await new Promise(r=>setTimeout(r,300));o.a2=TW.alt;
const e=document.getElementById('smalt');e.value='12345';e.dispatchEvent(new Event('change'));await new Promise(r=>setTimeout(r,50));o.a3=TW.alt;o.v3=e.value;
twSet({alt:3000});await new Promise(r=>setTimeout(r,50));o.v4=e.value;tap(minus);await new Promise(r=>setTimeout(r,300));o.a5=TW.alt;
TW.alt=50;twSet({alt:0});tap(minus);await new Promise(r=>setTimeout(r,300));o.a6=TW.alt;twSet({alt:1500});sb.hidden=true;return o});
t('T15 v4.6.2 SIM: แถว ALT อยู่ใต้ SPD และเหนือ TIME',sa.alt>sa.spd&&sa.alt<sa.time,JSON.stringify(sa));
t('T15 v4.6.2 SIM ALT: ค่าเริ่มเท่ากับ FLY ALT และ +/− ทีละ 100 ft (1500→1800→1700) ซิงก์กับกล่องชั้นข้อมูล',sa.v0==='1500'&&sa.a1===1800&&sa.l1==='1800'&&sa.a2===1700,JSON.stringify(sa));
t('T15 v4.6.2 SIM ALT: ไม่เกิน 10,000 ft และไม่ต่ำกว่า 0',sa.a3===10000&&sa.v3==='10000'&&sa.a6===0,JSON.stringify(sa));
t('T15 v4.6.2 แก้ FLY ALT ที่อื่น ช่อง ALT ใน SIM ตามด้วย (3000 → − = 2900)',sa.v4==='3000'&&sa.a5===2900,JSON.stringify(sa));
// v4.6.2 b2: เปิดกล่อง SIM ด้วยปุ่มจริง — ตัวเลข HDG, ไฟ TIME/ROUTE/HDG/RUN/PAUSE, ไม่มีเมนูกดค้าง, ไม่มี JS error
const sm=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const errs=[];const oe=window.onerror;window.onerror=(m)=>{errs.push(String(m))};
pts.length=0;pts.push({name:"AAA",lat:"14.0",lon:"100.3"},{name:"BBB",lat:"14.1",lon:"100.6"});drawPts();calc();render();
const sb=document.getElementById('simbox');if(sb.hidden)document.getElementById('simbtn').click();await W(100);const q=s=>sb.querySelector(s),tap=b=>{b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}))};
const o={};o.h0=document.getElementById('smhdg').value;tap(q('button[data-hg="1"]'));tap(q('button[data-hg="1"]'));await W(100);o.h1=document.getElementById('smhdg').value;o.hdgOn=document.getElementById('smhdgb').classList.contains('on');
q('[data-sc="8"]').click();await W(50);o.sc=[...sb.querySelectorAll('[data-sc]')].filter(x=>x.classList.contains('on')).map(x=>x.dataset.sc).join(',');o.scBg=getComputedStyle(q('[data-sc="8"]')).backgroundColor;q('[data-sc="1"]').click();
SIM.mode='R';q('[data-sc="2"]').click();await W(50);o.routeOn=document.getElementById('smroute').classList.contains('on')&&!document.getElementById('smhdgb').classList.contains('on');q('[data-sc="1"]').click();
const run=document.getElementById('smrun');o.r0={t:run.textContent,on:run.classList.contains('on')};run.click();await W(400);o.r1={t:run.textContent,on:run.classList.contains('on'),bg:getComputedStyle(run).backgroundColor};
run.click();await W(200);o.r2={t:run.textContent,on:run.classList.contains('on')};run.click();await W(200);o.r3={t:run.textContent,on:run.classList.contains('on')};
document.getElementById('smstop').click();await W(200);o.r4={t:run.textContent,on:run.classList.contains('on')};
const ev=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});q('button[data-sp="5"]').dispatchEvent(ev);o.ctxBlocked=ev.defaultPrevented;
o.errs=errs;window.onerror=oe;sb.hidden=true;return o});
t('T17 b2 SIM: กด HDG + แล้วตัวเลข HDG แสดงและเปลี่ยน (000 → 002) ไฟ HDG ติด',sm.h0==='000'&&sm.h1==='002'&&sm.hdgOn,JSON.stringify(sm));
t('T17 b2 SIM: กด TIME 8x แล้วไฟ 8x ติด (ปุ่มเดียว สีเขียว)',sm.sc==='8'&&sm.scBg==='rgb(34, 197, 94)',JSON.stringify({sc:sm.sc,bg:sm.scBg}));
t('T17 b2 SIM: โหมดตามเส้นทาง ไฟ ROUTE ติด ไฟ HDG ดับ',sm.routeOn,'');
t('T17 b2 SIM: ปุ่มแสดงสถานะ START (ไม่มีไฟ) → RUN ไฟเขียว → PAUSE ไฟเขียว → RUN → STOP แล้วกลับเป็น START',sm.r0.t==='▶ START'&&!sm.r0.on&&sm.r1.t==='▶ RUN'&&sm.r1.on&&sm.r1.bg==='rgb(34, 197, 94)'&&sm.r2.t==='❚❚ PAUSE'&&sm.r2.on&&sm.r3.t==='▶ RUN'&&sm.r3.on&&sm.r4.t==='▶ START'&&!sm.r4.on,JSON.stringify([sm.r0,sm.r1,sm.r2,sm.r3,sm.r4]));
t('T17 b2 SIM: กดค้างปุ่มในกล่อง SIM ไม่เปิดเมนูกดค้าง (contextmenu ถูกกันไว้)',sm.ctxBlocked,'');
t('T17 b2 SIM: ไม่มี JavaScript error ระหว่างใช้กล่อง SIM',sm.errs.length===0,JSON.stringify(sm.errs));
// v4.6.2 ข้อ 3: ป้าย FLY ALT
t('T16 v4.6.2 กล่องชั้นข้อมูลใช้คำว่า FLY ALT (ft)',await p.evaluate(()=>/^FLY ALT \(ft\)/.test(document.getElementById('twalt2').closest('label').textContent.trim())));
// ปิด FLTA
await p.evaluate(()=>document.getElementById('flon2').click());await p.waitForTimeout(200);
t('T10 ปิด FLTA: แถบหาย กรวยหาย',await p.evaluate(()=>document.getElementById('flb').hidden&&!document.querySelector('#flv polygon')));
// iPad เต็มจอ: แถบเตือนอยู่ใต้แถวปุ่ม ไม่บังปุ่ม
const c2=await b.newContext({...devices['iPad Pro 11 landscape']});await c2.addInitScript(()=>{const ss={speak(){},cancel(){},getVoices:()=>[]};try{Object.defineProperty(window,'speechSynthesis',{value:ss,configurable:true})}catch(e){}window.SpeechSynthesisUtterance=function(x){this.text=x}});
await c2.route(/ow3652\.github\.io\/Tpadterrain\//,r=>{const u=r.request().url();if(/coverage\.json/.test(u))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(COV)});const m=u.match(/terrarium\/(\d+)\/(\d+)\/(\d+)\.png/);if(!m||tileMax(+m[1],+m[2],+m[3])<=0)return r.fulfill({status:404,body:'nf'});r.fulfill({status:200,contentType:'image/png',headers:{'access-control-allow-origin':'*'},body:tilePng(+m[1],+m[2],+m[3])})});
await c2.route(/tile\.|arcgis|openstreetmap|elevation-tiles|fonts\.g|script\.google|aviationweather|rainviewer|cartocdn|open-meteo|adsb|airplanes/,r=>r.abort());
const p2=await c2.newPage();p2.on('pageerror',e=>errs.push('iPad: '+e.message));await p2.goto(U);await p2.waitForTimeout(1500);
await p2.click('#fs');await p2.waitForTimeout(300);if(await p2.isVisible('#uis'))await p2.click('#uis');await p2.waitForTimeout(300);
await p2.evaluate(()=>{flSet({fl:true});clearInterval(FL.tm);MLP.on=true;MLP.la=14.0;MLP.lo=100.5913;MLP.hd=90;MLP.sp=120/1.943844;MLP.alt=null;MLP.t=Date.now();flTick()});await p2.waitForTimeout(1500);
const lay=await p2.evaluate(()=>{MLP.t=Date.now();FL.since=0;flTick();const fb=document.getElementById('flb').getBoundingClientRect(),bs=[...document.querySelectorAll('.mc .mr>*,.mc2>*')].filter(e=>e.id&&e.getClientRects().length),tb=Math.max(...bs.map(e=>e.getBoundingClientRect().bottom));
 const cov=bs.filter(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !(h&&(h===e||e.contains(h)))}).map(e=>e.id);return{st:FL.st,top:Math.round(fb.top),tb:Math.round(tb),cov}});
const cx=await p2.evaluate(async()=>{const c=wp(14.0,100.8,11);M.z=11;M.cx=c[0];M.cy=c[1];drawMap(false);await new Promise(r=>setTimeout(r,1500));drawMap(false);await new Promise(r=>setTimeout(r,300));return document.getElementById('cur').textContent});
const ft2=+((cx.match(/·\s*([\d,]+) ft/)||[])[1]||'0').replace(/,/g,'');
t('T11 iPad: กล่องพิกัดกากบาทกลางจอแสดงความสูง ft',ft2>4700&&ft2<5000,cx);
t('T11 iPad เต็มจอ: แถบ WARNING อยู่ใต้แถวปุ่ม และไม่บังปุ่ม',lay.st==='warn'&&lay.top>=lay.tb&&lay.cov.length===0,JSON.stringify(lay));
if(process.env.SHOT)await p2.screenshot({path:'/tmp/fl_ipad.png'});
await c2.close();
t('T12 ไม่มี JavaScript error',errs.length===0,errs.slice(0,3));
console.log(`\nผล: PASS ${pass} / FAIL ${fail} (${APP})`);await b.close();srv.close();process.exit(fail?1:0)})();
