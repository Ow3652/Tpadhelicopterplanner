// ทดสอบโหมดบิน + บันทึก Track (v4.7.0) Playwright/Chromium จำลอง iPad แนวตั้ง (ไม่ใช่ iPad/GPS จริง)
// ตำแหน่งเครื่องจำลองผ่าน MLP · รัน: node tests/t4700.js (เปิดเซิร์ฟเวอร์ชั่วคราวพอร์ต 8773 เอง ตั้ง SHOT=1 เพื่อบันทึกภาพไว้ใน /tmp)
const {chromium,devices}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');const os=require('os');
const ROOT=path.resolve(__dirname,'..');
const APP=fs.readdirSync(ROOT).filter(f=>/^Tpad helicopter planner v\d+\.\d+\.\d+\.html$/.test(f)).sort((a,b)=>{const v=s=>s.match(/v(\d+)\.(\d+)\.(\d+)/).slice(1).map(Number);const x=v(a),y=v(b);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2]}).pop();
const SITE=fs.mkdtempSync(path.join(os.tmpdir(),'fly-'));
fs.copyFileSync(path.join(ROOT,APP),path.join(SITE,'index.html'));
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(SITE,p);
 if(!f.startsWith(SITE)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html;charset=utf-8':'application/octet-stream'});r.end(fs.readFileSync(f))}).listen(8773);
let pass=0,fail=0;const t=(l,ok,x)=>{console.log(ok?'PASS':'FAIL',l,x===undefined?'':typeof x==='string'?x:JSON.stringify(x));ok?pass++:fail++};
const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:810,height:1080},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'});
await ctx.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8773/');await p.waitForTimeout(1500);
await p.evaluate(()=>{try{localStorage.removeItem('heliFly');Object.keys(localStorage).filter(k=>/^heliTrk/.test(k)).forEach(k=>localStorage.removeItem(k))}catch(e){}
 $("fmt").value="dd";pts.length=0;pts.push({name:"AAA",lat:"14.0",lon:"100.3"},{name:"BBB",lat:"14.1",lon:"100.6"},{name:"CCC",lat:"14.3",lon:"100.9"});drawPts();calc();render();
 MLP.on=true;MLP.la=13.98;MLP.lo=100.25;MLP.hd=60;MLP.sp=10;MLP.alt=300;MLP.t=Date.now();});
t('T1 มีปุ่ม "✈ โหมดบิน" ในเมนู Flight INST. ▾',await p.evaluate(()=>!!document.querySelector('#fidd .ddm #flyon')));
await p.evaluate(()=>{if(!mp.classList.contains('full'))fsToggle()});await W(300);
const u2=await p.evaluate(()=>{const b=$('flyon2');return b&&b.getClientRects().length?Math.round(b.getBoundingClientRect().height):0});
t('T1 เต็มจอที่ซ่อนเมนูอยู่: มีปุ่ม "✈ โหมดบิน" ในแถบเล็ก ☰ เมนู',u2>0,u2);
await p.tap('#flyon2');await W(600);
const L=await p.evaluate(()=>{const r=e=>{const q=e.getBoundingClientRect();return{t:Math.round(q.top),b:Math.round(q.bottom),l:Math.round(q.left),r:Math.round(q.right),w:Math.round(q.width),h:Math.round(q.height)}};const mr=r(mp);
 const bt=[...document.querySelectorAll('#flyT button')].map(r),zb=[...document.querySelectorAll('#flyZ button')].map(r);
 return{fly:mp.classList.contains('fly'),mcHidden:getComputedStyle(document.querySelector('.mc')).display==='none',mc2Hidden:getComputedStyle(document.querySelector('.mc2')).display==='none',map:mr,T:r($('flyT')),B:r($('flyB')),bt,zb,at:r(document.querySelector('#map .at'))}});
t('T2 เข้าโหมดบิน: แถบปุ่มปกติซ่อน แถบบน/ล่างโหมดบินแสดง',L.fly&&L.mcHidden&&L.mc2Hidden&&L.T.h>0&&L.B.h>0,{fly:L.fly,mc:L.mcHidden,mc2:L.mc2Hidden});
t('T2 แถบบนมี 12 ปุ่ม แต่ละปุ่มสูง ≥ 60 px กว้าง ≥ 120 px (iPad แนวตั้ง)',L.bt.length===12&&L.bt.every(x=>x.h>=60&&x.w>=120),L.bt.map(x=>x.w+'x'+x.h).join(' '));
t('T2 ปุ่มซูม +/− ใหญ่ ≥ 64×64 px อยู่ขวา เหนือแถบตัวเลข',L.zb.length===2&&L.zb.every(x=>x.w>=64&&x.h>=64&&x.b<=L.B.t-8&&L.map.r-x.r<=20),L.zb);
t('T2 แถบบนชิดขอบบน แถบตัวเลขชิดขอบล่างของแผนที่',Math.abs(L.T.t-L.map.t)<=1&&Math.abs(L.B.b-L.map.b)<=1,{T:L.T,B:L.B,map:L.map});
t('T2 ข้อความลิขสิทธิ์แผนที่อยู่เหนือแถบตัวเลข (ไม่ถูกบัง)',L.at.b<=L.B.t+1,{at:L.at,B:L.B});
// แตะปุ่มโหมดบินต้องไม่เลื่อนแผนที่หรือเปิดป๊อปอัปบนแผนที่
const c0=await p.evaluate(()=>[M.cx,M.cy]);await p.tap('#flyB');await p.tap('#flyT [data-fk="hide"]');await p.tap('#flyR');await W(200);
const c1=await p.evaluate(()=>({c:[M.cx,M.cy],pop:!document.getElementById('pop')||document.getElementById('pop').hidden}));
t('T3 แตะแถบโหมดบินไม่เลื่อนแผนที่และไม่เปิดป๊อปอัป',c1.pop&&c1.c[0]===c0[0]&&c1.c[1]===c0[1],c1);
// ซ่อนเมนู / แสดงกลับ
await p.tap('#flyT [data-fk="hide"]');await W(200);
const h1=await p.evaluate(()=>({T:$('flyT').hidden,Z:$('flyZ').hidden,R:!$('flyR').hidden,B:!$('flyB').hidden,rh:$('flyR').getBoundingClientRect().height}));
await p.tap('#flyR');await W(200);const h2=await p.evaluate(()=>!$('flyT').hidden&&!$('flyZ').hidden&&$('flyR').hidden);
t('T4 ซ่อนเมนู: แถบบน/ซูมซ่อน เหลือปุ่ม ☰ (≥ 60 px) และแถบตัวเลข · แตะ ☰ แล้วกลับมา',h1.T&&h1.Z&&h1.R&&h1.B&&h1.rh>=60&&h2,h1);
// ซูม
const z0=await p.evaluate(()=>M.z);await p.tap('#flyZ [data-fk="zi"]');await W(200);const z1=await p.evaluate(()=>M.z);await p.tap('#flyZ [data-fk="zo"]');await W(200);const z2=await p.evaluate(()=>M.z);
t('T5 ปุ่มซูม + / − ทำงาน',z1>z0&&z2<z1,{z0,z1,z2});
// Direct to
await p.tap('#flyT [data-fk="dto"]');await W(200);
const d1=await p.evaluate(()=>({open:!$('flyD').hidden,rows:[...document.querySelectorAll('#flyD .for')].map(e=>({t:e.querySelector('.fn').textContent,h:Math.round(e.getBoundingClientRect().height)}))}));
t('T6 D→ เปิดรายการจุดในเส้นทาง แถวสูง ≥ 60 px',d1.open&&d1.rows.length===3&&d1.rows.every(r=>r.h>=60),d1);
await p.tap('#flyD .for:nth-of-type(2)');await W(300);
const d2=await p.evaluate(()=>({n:DT&&DT.t&&DT.t.n,closed:$('flyD').hidden,strip:$('fbN').textContent,dis:$('fbD').textContent,brg:$('fbB').textContent}));
t('T6 แตะจุด BBB: Direct to BBB และแถบตัวเลขแสดงจุด/ระยะ/ทิศ',d2.n==='BBB'&&d2.closed&&d2.strip==='BBB'&&/^\d/.test(d2.dis)&&/°$/.test(d2.brg),d2);
await p.tap('#flyT [data-fk="dto"]');await W(200);const d3=await p.evaluate(()=>[...document.querySelectorAll('#flyD .for')].map(e=>e.querySelector('.fn').textContent));await p.tap('#flyD [data-fx]');
t('T6 ระหว่าง NAV รายการ D→ ยังมีจุดเดิมครบ (AAA BBB CCC)',d3.length===3&&/AAA/.test(d3[0])&&/CCC/.test(d3[2]),d3);
// NAV ถัดไป / ก่อนหน้า
await p.tap('#flyT [data-fk="next"]');await W(200);const n1=await p.evaluate(()=>DT&&DT.t.n);
await p.tap('#flyT [data-fk="prev"]');await W(200);const n2=await p.evaluate(()=>DT&&DT.t.n);
t('T7 NAV ถัดไป → CCC · NAV ก่อนหน้า → BBB',n1==='CCC'&&n2==='BBB',{n1,n2});
// Track up / North up
await p.evaluate(()=>{MLP.sp=60;MLP.t=Date.now()});
await p.tap('#flyT [data-fk="rot"]');await W(400);const r1=await p.evaluate(()=>({up:NAVON?NAVUP:TUP,lbl:document.querySelector('#flyT [data-fk="rot"] .i').textContent}));
await p.tap('#flyT [data-fk="rot"]');await W(400);const r2=await p.evaluate(()=>({up:NAVON?NAVUP:TUP,lbl:document.querySelector('#flyT [data-fk="rot"] .i').textContent}));
t('T8 Track up ↔ North up สลับได้ และป้ายปุ่มบอกสถานะ',r1.up!==r2.up&&/↑/.test(r1.lbl)&&/↑/.test(r2.lbl)&&r1.lbl!==r2.lbl,{r1,r2});
// ชั้นข้อมูล
await p.tap('#flyT [data-fk="lay"]');await W(400);
const ly=await p.evaluate(()=>{const fp=$('fp'),r=fp.getBoundingClientRect(),t=$('flyT').getBoundingClientRect();return{vis:!fp.hidden&&getComputedStyle(fp).display!=='none',top:Math.round(r.top),tb:Math.round(t.bottom)}});
t('T9 ชั้นข้อมูล: เปิดกล่องใต้แถบปุ่มบน (ไม่ทับ)',ly.vis&&ly.top>=ly.tb,ly);
await p.tap('#flyT [data-fk="lay"]');await W(200);
// ไม้บรรทัด
await p.tap('#flyT [data-fk="rul"]');await W(200);const ru=await p.evaluate(()=>({on:M.rul.on,btn:document.querySelector('#flyT [data-fk="rul"]').classList.contains('on')}));
const rb=await p.evaluate(()=>{const e=$('rulb');if(!e||e.hidden||!e.getClientRects().length)return null;const r=e.getBoundingClientRect(),B=$('flyB').getBoundingClientRect();return{b:Math.round(r.bottom),Bt:Math.round(B.top)}});
await p.tap('#flyT [data-fk="rul"]');await W(200);const ru2=await p.evaluate(()=>M.rul.on);
t('T10 ไม้บรรทัด เปิด/ปิดได้ ไฟปุ่มติดตอนเปิด และแถบไม้บรรทัดไม่ถูกแถบตัวเลขบัง',ru.on&&ru.btn&&!ru2&&(!rb||rb.b<=rb.Bt),{ru,ru2,rb});
// แก้เส้นทาง
await p.tap('#flyT [data-fk="edit"]');await W(300);const ed=await p.evaluate(()=>{const e=$('mpt');return!!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().top>=$('flyT').getBoundingClientRect().bottom-1});
t('T11 แก้เส้นทาง: เปิดแผง "จุดพิกัดในเส้นทาง" ใต้แถบปุ่มบน',ed);
await p.evaluate(()=>{try{mptShow(false)}catch(e){}});
// Menu กระเบื้อง
await p.tap('#flyT [data-fk="menu"]');await W(200);
const mn=await p.evaluate(()=>({open:!$('flyM').hidden,tiles:[...document.querySelectorAll('#flyM .fog button')].map(e=>({t:e.textContent.trim(),h:Math.round(e.getBoundingClientRect().height)}))}));
t('T12 Menu เปิดกระเบื้องปุ่มใหญ่ (≥ 80 px) มีบันทึก Track, GPX, interval, HSI, FMS, SIM, FLTA, ออกจากโหมดบิน',mn.open&&mn.tiles.length>=10&&mn.tiles.every(x=>x.h>=80)&&['Track ที่บันทึก','เก็บจุดทุก','HSI','FMS','SIM','FLTA','ออกจากโหมดบิน'].every(k=>mn.tiles.some(x=>x.t.includes(k))),mn.tiles.map(x=>x.t+'('+x.h+')').join(' | '));
// interval 1/5/10/30
const ivs=[];for(let i=0;i<4;i++){await p.tap('#flyM [data-fm="iv"]');await W(60);ivs.push(await p.evaluate(()=>TK.cfg.iv))}
t('T13 ช่วงเก็บจุดวนได้ 10 → 30 → 1 → 5 วินาที และบันทึกค่า',JSON.stringify(ivs)==='[10,30,1,5]'&&await p.evaluate(()=>JSON.parse(localStorage.getItem('heliTrkCfg')).iv===5),ivs);
await p.tap('#flyM [data-fx]');
// บันทึก Track อัตโนมัติ (เร็วเกิน 20 kt) ทุก 5 วินาที
const tk=await p.evaluate(async()=>{const o={};TK.man=false;if(TK.on)tkStop();TK.man=false;MLP.sp=10;MLP.t=Date.now();tkTick();o.slow=TK.on;
 MLP.sp=100/1.943844;MLP.t=Date.now();tkTick();o.auto=TK.on;const id=TK.cur&&TK.cur.id;o.n0=TK.cur.pts.length;
 for(let i=0;i<12;i++){MLP.la+=0.003;MLP.lo+=0.004;MLP.t=Date.now();TK.lastT=Date.now()-5000;tkTick()}o.n1=TK.cur.pts.length;
 MLP.la+=0.003;MLP.t=Date.now();tkTick();o.n2=TK.cur.pts.length;
 tkSave(true);o.idx=JSON.parse(localStorage.getItem('heliTrkIdx')||'[]').length;o.stored=(JSON.parse(localStorage.getItem('heliTrk_'+id)||'{}').pts||[]).length;o.cur=JSON.parse(localStorage.getItem('heliTrkCur'));o.id=id;
 drawMap(false);await new Promise(r=>setTimeout(r,100));const sv=$('trkv');o.poly=sv.querySelectorAll('polyline').length;o.under=!!(sv.compareDocumentPosition($('ov'))&Node.DOCUMENT_POSITION_FOLLOWING)&&sv.parentElement===$('ov').parentElement;
 o.btn=document.querySelector('#flyT [data-fk="rec"]').classList.contains('rec');return o});
t('T14 ความเร็วต่ำกว่า 20 kt ยังไม่บันทึก · เกิน 20 kt เริ่มบันทึกอัตโนมัติ ปุ่ม REC สีแดง',!tk.slow&&tk.auto&&tk.btn,tk);
t('T14 เก็บจุดตามช่วง 5 วินาที (12 ครั้ง = 12 จุดเพิ่ม) และไม่เก็บถ้ายังไม่ครบช่วง',tk.n1===tk.n0+12&&tk.n2===tk.n1,tk);
t('T14 เก็บลงเครื่อง (localStorage) และวาดเส้น Track ใต้สามเหลี่ยมเฮลิคอปเตอร์',tk.idx>=1&&tk.stored===tk.n1&&tk.cur===tk.id&&tk.poly>=2&&tk.under,tk);
if(process.env.SHOT){await p.evaluate(()=>{gpsCenter()});await W(400);await p.screenshot({path:'/tmp/t4700_fly.png'})}
// รีโหลดแอประหว่างบันทึก → กลับมาโหมดบินและบันทึกต่อ Track เดิม
await p.reload();await p.waitForTimeout(1600);
const rl=await p.evaluate(()=>({fly:mp.classList.contains('fly'),on:TK.on,id:TK.cur&&TK.cur.id,n:TK.cur&&TK.cur.pts.length}));
t('T15 ปิด/รีโหลดแอป: กลับเข้าโหมดบินเอง และบันทึก Track เดิมต่อ',rl.fly&&rl.on&&rl.id===tk.id&&rl.n===tk.n1,rl);
// หยุดเอง → ไม่เริ่มใหม่อัตโนมัติจนกว่าจะช้าลง (ลงจอด)
const st=await p.evaluate(()=>{MLP.on=true;MLP.la=14.05;MLP.lo=100.4;MLP.sp=100/1.943844;MLP.t=Date.now();tkTick();tkStop();const a=TK.on;MLP.t=Date.now();tkTick();return{a,b:TK.on,man:TK.man,cur:JSON.parse(localStorage.getItem('heliTrkCur'))}});
t('T16 กดหยุดเอง: หยุดบันทึก และไม่เริ่มใหม่อัตโนมัติขณะยังบินอยู่',!st.a&&!st.b&&st.man&&st.cur===null,st);
// รายการ Track + GPX + ลบแบบยืนยัน
await p.tap('#flyT [data-fk="menu"]');await p.tap('#flyM [data-fm="trk"]');await W(200);
const kl=await p.evaluate(()=>({open:!$('flyK').hidden,rows:document.querySelectorAll('#flyK .fok').length,first:document.querySelector('#flyK [data-kd]').dataset.kd,bh:Math.round(document.querySelector('#flyK [data-kg]').getBoundingClientRect().height)}));
t('T17 รายการ Track ที่บันทึก แสดงครบ (ล่าสุดอยู่บน) ปุ่มสูง ≥ 56 px',kl.open&&kl.rows>=1&&kl.first===String(tk.id)&&kl.bh>=56,kl);
const gpx=await p.evaluate(id=>tkGpx(id),tk.id);const npt=(gpx.match(/<trkpt /g)||[]).length;
t('T17 GPX ถูกรูปแบบ (gpx 1.1, trkpt ครบ, มี ele/time)',/^<\?xml/.test(gpx)&&/<gpx version="1.1"/.test(gpx)&&npt>=tk.n1&&/<ele>\d+<\/ele>/.test(gpx)&&/<time>\d{4}-\d\d-\d\dT/.test(gpx),{npt});
const dl=p.waitForEvent('download',{timeout:3000}).catch(()=>null);await p.tap('#flyK [data-kg]');const d=await dl;
t('T17 ปุ่ม GPX ดาวน์โหลดไฟล์ .gpx',!!d&&/\.gpx$/.test(d.suggestedFilename()),d&&d.suggestedFilename());
await p.tap('#flyK [data-kd]');await W(100);const k1=await p.evaluate(()=>({rows:document.querySelectorAll('#flyK .fok').length,txt:document.querySelector('#flyK [data-kd]').textContent}));
await p.tap('#flyK [data-kd]');await W(100);const k2=await p.evaluate(id=>({rows:document.querySelectorAll('#flyK .fok').length,ls:localStorage.getItem('heliTrk_'+id)}),tk.id);
t('T17 ลบ Track ต้องแตะยืนยันครั้งที่สอง',k1.rows===kl.rows&&/ยืนยัน/.test(k1.txt)&&k2.rows===kl.rows-1&&k2.ls===null,{k1,k2});
await p.tap('#flyK [data-fx]');
// ออกจากโหมดบิน
await p.tap('#flyT [data-fk="menu"]');await p.tap('#flyM [data-fm="exit"]');await W(300);
const ex=await p.evaluate(()=>({fly:mp.classList.contains('fly'),full:mp.classList.contains('full'),mc:getComputedStyle(document.querySelector('.mc')).display!=='none'||(!$('uib').hidden&&$('flyon2').getClientRects().length>0),T:$('flyT').hidden,ls:localStorage.getItem('heliFly')}));
t('T18 ออกจากโหมดบิน: กลับหน้าจอเต็มจอปกติ (แถบ ☰ เมนู พร้อมปุ่ม ✈ โหมดบิน)',!ex.fly&&ex.full&&ex.mc&&ex.T&&ex.ls==='0',ex);
// iPad แนวนอนก็ใช้ได้ (ปุ่มไม่ล้น)
await p.setViewportSize({width:1080,height:810});await p.evaluate(()=>flyOn());await W(400);
const ls=await p.evaluate(()=>{const bt=[...document.querySelectorAll('#flyT button')].map(e=>e.getBoundingClientRect());return{n:bt.length,ok:bt.every(r=>r.height>=60&&r.right<=innerWidth+1)}});
t('T19 iPad แนวนอน: ปุ่มโหมดบินครบ ไม่ล้นจอ',ls.n===12&&ls.ok,ls);
t('T20 ไม่มี JavaScript error',errs.length===0,errs);
console.log(`ผล: PASS ${pass} / FAIL ${fail} (${APP})`);await b.close();srv.close();process.exit(fail?1:0)})().catch(e=>{console.log('ERROR',e);srv.close();process.exit(1)});
