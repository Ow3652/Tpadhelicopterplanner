// ทดสอบโหมดบิน + บันทึก Track (v4.7.0–4.7.5) Playwright/Chromium จำลอง iPad แนวตั้ง (ไม่ใช่ iPad/GPS จริง)
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
t('T1 b v4.7.1 หน้าจอปกติ: ไม่มีปุ่มโหมดบินในแถวปุ่ม (ไม่ให้แถวตกบรรทัด)',await p.evaluate(()=>!$('flyon3').getClientRects().length));
await p.evaluate(()=>{if(!mp.classList.contains('full'))fsToggle()});await W(300);
const f3=await p.evaluate(async()=>{$('uis').click();await new Promise(r=>setTimeout(r,200));const b=$('flyon3'),v=b.getClientRects().length>0;$('hui').click();await new Promise(r=>setTimeout(r,200));return v});
t('T1 b v4.7.1 เต็มจอแบบแสดงเมนูทั้งหมด: มีปุ่ม "✈ โหมดบิน" ในแถวปุ่ม',f3);
const u2=await p.evaluate(()=>{const b=$('flyon2');return b&&b.getClientRects().length?Math.round(b.getBoundingClientRect().height):0});
t('T1 เต็มจอที่ซ่อนเมนูอยู่: มีปุ่ม "✈ โหมดบิน" ในแถบเล็ก ☰ เมนู',u2>0,u2);
await p.tap('#flyon2');await W(600);
const EN=await p.evaluate(()=>[...document.querySelectorAll('#flyT button,#flyZ button,#flyR')].map(e=>e.textContent.trim()));
t('T2 b ชื่อปุ่มโหมดบินเป็นภาษาอังกฤษ: Prev WP, Next WP, NAV, Coords, Rec Route (ไม่มี Edit route/Prev NAV ในแถบบน)',EN.every(x=>!/[\u0E00-\u0E7F]/.test(x))&&['Prev WP','Next WP','Coords','Route','My position'].every(k=>EN.some(x=>x.includes(k)))&&!EN.some(x=>/REC Track|Rec Route|Prev NAV|Next NAV/.test(x)),EN.join(' | '));
const ic=await p.evaluate(()=>{const g=k=>document.querySelector(`#flyT [data-fk="${k}"]`);return{nav:!g('nav').querySelector('.l'),navT:g('nav').querySelector('.i').textContent,dto:!g('dto').querySelector('.l')&&g('dto').getAttribute('aria-label')==='Direct to'&&g('dto').textContent.trim()==='D→',me:g('me').querySelector('.i').textContent.charCodeAt(0)===0x2708&&getComputedStyle(g('me').querySelector('.i')).color==='rgb(255, 255, 255)'}});
t('T2 d v4.7.3 NAV แสดงแค่สถานะ · D→ เฉพาะสัญลักษณ์ · My position ไอคอนเครื่องบินสีขาว',ic.nav&&/^(NAV|STBY)$/.test(ic.navT)&&ic.dto&&ic.me,ic);
t('T2 c v4.7.2 แถบบนไม่มี Edit route และ North up (North up อยู่เหนือปุ่มซูม)',await p.evaluate(()=>!document.querySelector('#flyT [data-fk="edit"]')&&!document.querySelector('#flyT [data-fk="rot"]')&&(()=>{const r=document.querySelector('#flyZ [data-fk="rot"]').getBoundingClientRect(),z=document.querySelector('#flyZ [data-fk="zi"]').getBoundingClientRect();return r.bottom<=z.top&&Math.abs(r.left-z.left)<2&&r.height>=64})()));
const L=await p.evaluate(()=>{const r=e=>{const q=e.getBoundingClientRect();return{t:Math.round(q.top),b:Math.round(q.bottom),l:Math.round(q.left),r:Math.round(q.right),w:Math.round(q.width),h:Math.round(q.height)}};const mr=r(mp);
 const bt=[...document.querySelectorAll('#flyT button')].map(r),zb=[...document.querySelectorAll('#flyZ > button')].map(r);
 return{fly:mp.classList.contains('fly'),mcHidden:getComputedStyle(document.querySelector('.mc')).display==='none',mc2Hidden:getComputedStyle(document.querySelector('.mc2')).display==='none',map:mr,T:r($('flyT')),B:r($('flyB')),bt,zb,at:r(document.querySelector('#map .at'))}});
t('T2 เข้าโหมดบิน: แถบปุ่มปกติซ่อน แถบบน/ล่างโหมดบินแสดง',L.fly&&L.mcHidden&&L.mc2Hidden&&L.T.h>0&&L.B.h>0,{fly:L.fly,mc:L.mcHidden,mc2:L.mc2Hidden});
t('T2 แถบบนมี 12 ปุ่ม แต่ละปุ่มสูง ≥ 60 px กว้าง ≥ 120 px (iPad แนวตั้ง)',L.bt.length===12&&L.bt.every(x=>x.h>=60&&x.w>=120),L.bt.map(x=>x.w+'x'+x.h).join(' '));
t('T2 ปุ่ม North up / ซูม +/− ใหญ่ ≥ 64×64 px อยู่ขวา เหนือแถบตัวเลข',L.zb.length===3&&L.zb.every(x=>x.w>=64&&x.h>=64&&x.b<=L.B.t-8&&L.map.r-x.r<=20),L.zb);
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
// v4.7.2 Coords
const co0=await p.evaluate(()=>CURON);await p.tap('#flyT [data-fk="coord"]');await W(200);const co1=await p.evaluate(()=>({on:CURON,lit:document.querySelector('#flyT [data-fk="coord"]').classList.contains('on'),cur:!$('cur').hidden,top:Math.round($('cur').getBoundingClientRect().top),tb:Math.round($('flyT').getBoundingClientRect().bottom)}));
await p.tap('#flyT [data-fk="coord"]');await W(200);const co2=await p.evaluate(()=>({on:CURON,lit:document.querySelector('#flyT [data-fk="coord"]').classList.contains('on')}));
t('T4 b v4.7.2 Coords เปิด/ปิดกล่องพิกัด ไฟปุ่มตามสถานะ กล่องพิกัดอยู่ใต้แถบบน',co1.on!==co0&&co1.lit===co1.on&&co2.on===co0&&co2.lit===co0&&(!co1.on||(co1.cur&&co1.top>=co1.tb-1)),{co0,co1,co2});
const z0=await p.evaluate(()=>M.z);await p.tap('#flyZ [data-fk="zi"]');await W(200);const z1=await p.evaluate(()=>M.z);await p.tap('#flyZ [data-fk="zo"]');await W(200);const z2=await p.evaluate(()=>M.z);
t('T5 ปุ่มซูม + / − ทำงาน',z1>z0&&z2<z1,{z0,z1,z2});
// Direct to
await p.tap('#flyT [data-fk="dto"]');await W(200);
const d1=await p.evaluate(()=>({open:!$('flyD').hidden,rows:[...document.querySelectorAll('#flyD .for')].map(e=>({t:e.querySelector('.fn').textContent,h:Math.round(e.getBoundingClientRect().height)}))}));
t('T6 D→ เปิดรายการจุดในเส้นทาง แถวสูง ≥ 60 px',d1.open&&d1.rows.length===3&&d1.rows.every(r=>r.h>=60),d1);
const dw=await p.evaluate(()=>{const r=$('flyD').getBoundingClientRect(),m=mp.getBoundingClientRect(),T=$('flyT').getBoundingClientRect(),B=$('flyB').getBoundingClientRect();return{w:Math.round(r.width),mw:Math.round(m.width),cx:Math.round(r.left+r.width/2),mcx:Math.round(m.left+m.width/2),top:Math.round(r.top),tb:Math.round(T.bottom),bot:Math.round(r.bottom),bt:Math.round(B.top)}});
t('T6 d v4.7.3 D→ เป็นหน้าต่างกลางจอ (ไม่เต็มจอ) อยู่ระหว่างแถบบนกับแถบตัวเลข',dw.w<dw.mw-40&&Math.abs(dw.cx-dw.mcx)<3&&dw.top>dw.tb&&dw.bot<dw.bt,dw);
await p.tap('#flyD .for:nth-of-type(2)');await W(300);
const d2=await p.evaluate(()=>({n:DT&&DT.t&&DT.t.n,closed:$('flyD').hidden,strip:$('fbN').textContent,dis:$('fbD').textContent,brg:$('fbB').textContent}));
t('T6 แตะจุด BBB: Direct to BBB และแถบตัวเลขแสดงจุด/ระยะ/ทิศ',d2.n==='BBB'&&d2.closed&&d2.strip==='BBB'&&/^\d/.test(d2.dis)&&/°$/.test(d2.brg),d2);
t('T6 b v4.7.2 ปุ่ม Direct to ไม่ค้างไฟติดระหว่าง NAV',await p.evaluate(()=>!document.querySelector('#flyT [data-fk="dto"]').classList.contains('on')));
const nv=await p.evaluate(()=>{const b=document.querySelector('#flyT [data-fk="nav"]');return{t:b.querySelector('.i').textContent,go:b.classList.contains('go')}});
t('T6 c v4.7.2 ปุ่ม NAV แสดง NAV ไฟเขียวเมื่อกำลัง NAV',nv.t==='NAV'&&nv.go,nv);
await p.tap('#flyT [data-fk="dto"]');await W(200);const d3=await p.evaluate(()=>[...document.querySelectorAll('#flyD .for')].map(e=>e.querySelector('.fn').textContent));await p.tap('#flyD [data-fx]');
t('T6 ระหว่าง NAV รายการ D→ ยังมีจุดเดิมครบ (AAA BBB CCC)',d3.length===3&&/AAA/.test(d3[0])&&/CCC/.test(d3[2]),d3);
// NAV ถัดไป / ก่อนหน้า
await p.tap('#flyT [data-fk="next"]');await W(200);const n1=await p.evaluate(()=>DT&&DT.t.n);
await p.tap('#flyT [data-fk="prev"]');await W(200);const n2=await p.evaluate(()=>DT&&DT.t.n);
t('T7 Next WP → CCC · Prev WP → BBB',n1==='CCC'&&n2==='BBB',{n1,n2});
await p.tap('#flyT [data-fk="nav"]');await W(300);const s1=await p.evaluate(()=>({dt:!!DT,t:document.querySelector('#flyT [data-fk="nav"] .i').textContent}));
await p.tap('#flyT [data-fk="nav"]');await W(300);const s2=await p.evaluate(()=>({dt:!!DT,n:DT&&DT.t.n,t:document.querySelector('#flyT [data-fk="nav"] .i').textContent}));
t('T7 b v4.7.2 ปุ่ม NAV: แตะ = Standby (STBY) แตะอีก = กลับ NAV',!s1.dt&&s1.t==='STBY'&&s2.dt&&s2.t==='NAV',{s1,s2});
if(!s2.dt||s2.n!=='BBB')await p.evaluate(()=>{const o=(DT&&DT.orig||[]).find(q=>q.name==='BBB');if(o)directTo("",o)});
// Track up / North up
await p.evaluate(()=>{MLP.sp=60;MLP.t=Date.now()});
await p.tap('#flyZ [data-fk="rot"]');await W(400);const r1=await p.evaluate(()=>({up:NAVON?NAVUP:TUP,lbl:document.querySelector('#flyZ [data-fk="rot"] .i').textContent}));
await p.tap('#flyZ [data-fk="rot"]');await W(400);const r2=await p.evaluate(()=>({up:NAVON?NAVUP:TUP,lbl:document.querySelector('#flyZ [data-fk="rot"] .i').textContent}));
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
await p.tap('#fbW');await W(300);const ed=await p.evaluate(()=>{const e=$('mpt');return!!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().top>=$('flyT').getBoundingClientRect().bottom-1&&$('fbW').classList.contains('on')});
t('T11 v4.7.2 แตะช่อง NAV TO (ล่างซ้าย): เปิดแผงแก้เส้นทาง ใต้แถบปุ่มบน',ed);
// v4.7.4: กดบันทึกเส้นทางในแผงแก้เส้นทาง → มีกล่องใส่ชื่อก่อนบันทึก
const sv1=await p.evaluate(async()=>{const n0=store().length;const b=$('save');b.scrollIntoView({block:'center'});b.click();await new Promise(r=>setTimeout(r,200));const d=$('svd'),i=$('svn'),r=i.getBoundingClientRect(),top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return{n0,n1:store().length,open:!d.hidden,val:i.value,onTop:top===i}});
t('T11 d v4.7.4 กด "บันทึกเส้นทาง": ขึ้นกล่องใส่ชื่อก่อน (ชื่อตั้งต้นจากจุดแรก-จุดสุดท้าย) ยังไม่บันทึก กล่องอยู่บนสุด',sv1.open&&sv1.n1===sv1.n0&&/ - CCC$/.test(sv1.val)&&sv1.onTop,sv1);
await p.evaluate(()=>$('svno').click());await W(100);
const sv2=await p.evaluate(async()=>{const n0=store().length;$('save').click();await new Promise(r=>setTimeout(r,150));$('svn').value='เที่ยวบินทดสอบ 1';$('svok').click();await new Promise(r=>setTimeout(r,200));const a=store();return{closed:$('svd').hidden,n:a.length-n0,has:a.some(r=>r.name==='เที่ยวบินทดสอบ 1'),rname:$('rname').value}});
t('T11 e v4.7.4 ใส่ชื่อแล้วกดบันทึก: บันทึกเส้นทางด้วยชื่อที่ใส่ · กดยกเลิกไม่บันทึก',sv2.closed&&sv2.n===1&&sv2.has&&sv2.rname==='เที่ยวบินทดสอบ 1',sv2);
await p.tap('#fbW');await W(300);
t('T11 b v4.7.2 แตะช่อง NAV TO อีกครั้ง: ปิดแผงแก้เส้นทาง',await p.evaluate(()=>getComputedStyle($('mpt')).display==='none'&&!M.mpt));
await p.tap('#flyT [data-fk="rrt"]');await W(300);const rr1=await p.evaluate(()=>{const e=$('lbr');return{on:e.classList.contains('on'),vis:e.getClientRects().length>0,top:Math.round(e.getBoundingClientRect().top),tb:Math.round($('flyT').getBoundingClientRect().bottom)}});
await p.tap('#flyT [data-fk="rrt"]');await W(300);const rr2=await p.evaluate(()=>$('lbr').classList.contains('on'));
t('T11 c v4.7.1 Rec Route: เปิดกล่องเส้นทางที่บันทึกไว้ (ใต้แถบบน) กดอีกครั้งปิด',rr1.on&&rr1.vis&&rr1.top>=rr1.tb-1&&!rr2,{rr1,rr2});
// Menu กระเบื้อง
await p.tap('#flyT [data-fk="menu"]');await W(200);
const mn=await p.evaluate(()=>({open:!$('flyM').hidden,tiles:[...document.querySelectorAll('#flyM .fog button')].map(e=>({t:e.textContent.trim(),h:Math.round(e.getBoundingClientRect().height)}))}));
t('T12 Menu กระเบื้องปุ่มใหญ่ (≥ 80 px) ภาษาอังกฤษ: Record track, Tracks/GPX, Aircraft, GPS / Position, Summary, HSI, FMS, SIM, FLTA, Exit · ไม่มีปุ่มเก็บจุดทุก…',mn.open&&mn.tiles.length>=12&&mn.tiles.every(x=>x.h>=80&&!/[\u0E00-\u0E7F]/.test(x.t))&&['track','Tracks / GPX','Aircraft','GPS / Position','Summary','HSI','FMS','SIM','FLTA','Exit flight mode'].every(k=>mn.tiles.some(x=>x.t.includes(k)))&&!mn.tiles.some(x=>/Interval|เก็บจุด/.test(x.t)),mn.tiles.map(x=>x.t+'('+x.h+')').join(' | '));
// v4.7.1: Aircraft
const ac0=await p.evaluate(()=>M.mac);await p.tap('#flyM [data-fm="ac"]');await W(200);const ac1=await p.evaluate(()=>({mac:M.mac,on:document.querySelector('#flyM [data-fm="ac"]').classList.contains('on')}));
await p.tap('#flyM [data-fm="ac"]');await W(200);const ac2=await p.evaluate(()=>M.mac);
t('T13 v4.7.1 Menu → Aircraft เปิด/ปิดกล่องข้อมูลอากาศยาน',ac1.mac!==ac0&&ac1.on===ac1.mac&&ac2===ac0,{ac0,ac1,ac2});
// v4.7.3 Summary + GPS window
const sm0=await p.evaluate(()=>M.sum);await p.tap('#flyM [data-fm="sum"]');await W(200);const sm1=await p.evaluate(()=>({sum:M.sum,lit:document.querySelector('#flyM [data-fm="sum"]').classList.contains('on'),vis:getComputedStyle($('msum')).display!=='none'}));
await p.tap('#flyM [data-fm="sum"]');await W(200);const sm2=await p.evaluate(()=>M.sum);
t('T13 c v4.7.3 Menu → Summary เปิด/ปิดกล่องสรุปเส้นทาง',sm1.sum!==sm0&&sm1.lit===sm1.sum&&sm1.vis===sm1.sum&&sm2===sm0,{sm0,sm1,sm2});
await p.tap('#flyM [data-fm="gps"]');await W(200);
const gp=await p.evaluate(()=>{const g=$('flyG'),r=g.getBoundingClientRect(),m=mp.getBoundingClientRect();return{open:!g.hidden,menu:$('flyM').hidden,win:r.width<m.width-40,btn:[...g.querySelectorAll('[data-fg]')].map(b=>({t:b.textContent,h:Math.round(b.getBoundingClientRect().height)}))}});
t('T13 d v4.7.3 Menu → GPS / Position เปิดหน้าต่าง: Use GPS, Follow, Compass, Center map (ปุ่ม ≥ 80 px)',gp.open&&gp.menu&&gp.win&&['Use GPS','Follow','Compass','Center map'].every(k=>gp.btn.some(b=>b.t.includes(k)&&b.h>=80)),gp);
const fo0=await p.evaluate(()=>$('mlf').checked);await p.tap('#flyG [data-fg="f"]');await W(500);const fo1=await p.evaluate(()=>({mlf:$('mlf').checked,lit:document.querySelector('#flyG [data-fg="f"]').classList.contains('on')}));
await p.tap('#flyG [data-fg="f"]');await W(500);const fo2=await p.evaluate(()=>$('mlf').checked);
t('T13 e v4.7.3 GPS window: Follow เปิด/ปิด "ตามตำแหน่ง" ได้',fo1.mlf!==fo0&&fo1.lit===fo1.mlf&&fo2===fo0,{fo0,fo1,fo2});
await p.tap('#flyG [data-fx]');await p.tap('#flyT [data-fk="menu"]');await W(150);
// interval อยู่ในหน้า Tracks
await p.tap('#flyM [data-fm="trk"]');await W(200);const ivs=[];for(const v of [10,30,1,5]){await p.tap(`#flyK [data-ki="${v}"]`);await W(60);ivs.push(await p.evaluate(()=>[TK.cfg.iv,document.querySelector('#flyK [data-ki].on').dataset.ki]))}
t('T13 b v4.7.1 ช่วงเก็บจุด 1/5/10/30 วินาที เลือกได้ในหน้า Tracks และบันทึกค่า',JSON.stringify(ivs)==='[[10,"10"],[30,"30"],[1,"1"],[5,"5"]]'&&await p.evaluate(()=>JSON.parse(localStorage.getItem('heliTrkCfg')).iv===5),ivs);
await p.tap('#flyK [data-fx]');
// บันทึก Track อัตโนมัติ (เร็วเกิน 20 kt) ทุก 5 วินาที
const tk=await p.evaluate(async()=>{const o={};TK.man=false;if(TK.on)tkStop();TK.man=false;MLP.sp=10;MLP.t=Date.now();tkTick();o.slow=TK.on;
 MLP.sp=100/1.943844;MLP.t=Date.now();tkTick();o.auto=TK.on;const id=TK.cur&&TK.cur.id;o.n0=TK.cur.pts.length;
 for(let i=0;i<12;i++){MLP.la+=0.003;MLP.lo+=0.004;MLP.t=Date.now();TK.lastT=Date.now()-5000;tkTick()}o.n1=TK.cur.pts.length;
 MLP.la+=0.003;MLP.t=Date.now();tkTick();o.n2=TK.cur.pts.length;
 tkSave(true);o.idx=JSON.parse(localStorage.getItem('heliTrkIdx')||'[]').length;o.stored=(JSON.parse(localStorage.getItem('heliTrk_'+id)||'{}').pts||[]).length;o.cur=JSON.parse(localStorage.getItem('heliTrkCur'));o.id=id;
 drawMap(false);await new Promise(r=>setTimeout(r,100));const sv=$('trkv');o.poly=sv.querySelectorAll('polyline').length;o.under=!!(sv.compareDocumentPosition($('ov'))&Node.DOCUMENT_POSITION_FOLLOWING)&&sv.parentElement===$('ov').parentElement;
 o.btn=!$('flyRec').hidden&&$('flyRec').getClientRects().length>0;return o});
t('T14 ความเร็วต่ำกว่า 20 kt ยังไม่บันทึก · เกิน 20 kt เริ่มบันทึกอัตโนมัติ มีป้าย ● REC บนแผนที่',!tk.slow&&tk.auto&&tk.btn,tk);
t('T14 เก็บจุดตามช่วง 5 วินาที (12 ครั้ง = 12 จุดเพิ่ม) และไม่เก็บถ้ายังไม่ครบช่วง',tk.n1===tk.n0+12&&tk.n2===tk.n1,tk);
t('T14 เก็บลงเครื่อง (localStorage) และวาดเส้น Track ใต้สามเหลี่ยมเฮลิคอปเตอร์',tk.idx>=1&&tk.stored===tk.n1&&tk.cur===tk.id&&tk.poly>=2&&tk.under,tk);
if(process.env.SHOT){await p.evaluate(()=>{gpsCenter()});await W(400);await p.screenshot({path:'/tmp/t4700_fly.png'})}
await p.tap('#flyRec');await W(200);t('T14 b v4.7.1 แตะป้าย ● REC เปิดหน้า Tracks',await p.evaluate(()=>!$('flyK').hidden));await p.tap('#flyK [data-fx]');
// รีโหลดแอประหว่างบันทึก → กลับมาโหมดบินและบันทึกต่อ Track เดิม
await p.reload();await p.waitForTimeout(1600);
const rl=await p.evaluate(()=>({fly:mp.classList.contains('fly'),on:TK.on,id:TK.cur&&TK.cur.id,n:TK.cur&&TK.cur.pts.length}));
t('T15 ปิด/รีโหลดแอป: กลับเข้าโหมดบินเอง และบันทึก Track เดิมต่อ',rl.fly&&rl.on&&rl.id===tk.id&&rl.n===tk.n1,rl);
// หยุดเอง → ไม่เริ่มใหม่อัตโนมัติจนกว่าจะช้าลง (ลงจอด)
const st=await p.evaluate(async()=>{MLP.on=true;MLP.la=14.05;MLP.lo=100.4;MLP.sp=100/1.943844;MLP.t=Date.now();tkTick();tkStop();const a=TK.on;MLP.t=Date.now();tkTick();await new Promise(r=>setTimeout(r,1200));return{a,b:TK.on,man:TK.man,cur:JSON.parse(localStorage.getItem('heliTrkCur')),badge:$('flyRec').hidden}});
t('T16 กดหยุดเอง: หยุดบันทึก ป้าย REC หาย และไม่เริ่มใหม่อัตโนมัติขณะยังบินอยู่',!st.a&&!st.b&&st.man&&st.cur===null&&st.badge,st);
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
t('T17 ลบ Track ต้องแตะยืนยันครั้งที่สอง (Delete → Confirm?)',k1.rows===kl.rows&&/Confirm/.test(k1.txt)&&k2.rows===kl.rows-1&&k2.ls===null,{k1,k2});
await p.tap('#flyK [data-fx]');
// ออกจากโหมดบิน
await p.tap('#flyT [data-fk="menu"]');await p.tap('#flyM [data-fm="exit"]');await W(300);
const ex=await p.evaluate(()=>({fly:mp.classList.contains('fly'),full:mp.classList.contains('full'),mc:getComputedStyle(document.querySelector('.mc')).display!=='none'||(!$('uib').hidden&&$('flyon2').getClientRects().length>0),T:$('flyT').hidden,ls:localStorage.getItem('heliFly')}));
t('T18 ออกจากโหมดบิน: กลับหน้าจอเต็มจอปกติ (แถบ ☰ เมนู พร้อมปุ่ม ✈ โหมดบิน)',!ex.fly&&ex.full&&ex.mc&&ex.T&&ex.ls==='0',ex);
// iPad แนวนอนก็ใช้ได้ (ปุ่มไม่ล้น)
await p.setViewportSize({width:1080,height:810});await p.evaluate(()=>flyOn());await W(400);
const ls=await p.evaluate(()=>{const bt=[...document.querySelectorAll('#flyT button')].map(e=>e.getBoundingClientRect());return{n:bt.length,ok:bt.every(r=>r.height>=60&&r.right<=innerWidth+1)}});
t('T19 iPad แนวนอน: ปุ่มโหมดบินครบ ไม่ล้นจอ',ls.n===12&&ls.ok,ls);
// v4.7.4: หน้าแรก (ใช้ ?start=auto เพราะเครื่องทดสอบอัตโนมัติปิดพฤติกรรมนี้ไว้)
const sc=async(opt)=>{const c=await b.newContext(opt);await c.route(/^https?:\/\/(?!localhost)/,r=>r.abort());const q=await c.newPage();await q.goto('http://localhost:8773/?start=auto');await q.waitForTimeout(1500);const o=await q.evaluate(()=>({full:mp.classList.contains('full'),fly:mp.classList.contains('fly'),ky:!$('kyd').hidden,ub:$('ubadge').getClientRects().length>0?$('ubadge').textContent:''}));await c.close();return o};
const sPC=await sc({viewport:{width:1366,height:800}}),sPad=await sc({viewport:{width:810,height:1080},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'}),sPh=await sc({viewport:{width:440,height:956},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
t('T21 v4.7.4 เปิดแอป: PC = แผนที่เต็มจอ · iPad และ iPhone = โหมดบิน',sPC.full&&!sPC.fly&&sPad.fly&&sPh.fly,{sPC,sPad,sPh});
t('T21 b v4.7.5 เปิดเพจโดยยังไม่มีรหัส: ขึ้นกล่องใส่รหัส (popup) ทั้ง PC/iPad/iPhone และมีป้าย Sign in มุมล่างซ้าย',[sPC,sPad,sPh].every(x=>x.ky&&/Sign in/.test(x.ub)),{sPC,sPad,sPh});
// v4.7.4: iPhone 17 Pro Max แนวตั้ง (440×956) หน้าจอกะทัดรัด
{const c=await b.newContext({viewport:{width:440,height:956},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});await c.route(/^https?:\/\/(?!localhost)/,r=>r.abort());const q=await c.newPage();await q.goto('http://localhost:8773/');await q.waitForTimeout(1200);
 const ip=await q.evaluate(async()=>{MLP.on=true;MLP.la=13.98;MLP.lo=100.25;MLP.hd=60;MLP.sp=123/1.943844;MLP.t=Date.now();flyOn();await new Promise(r=>setTimeout(r,600));flyUi();const W=innerWidth;const cut=e=>e.scrollWidth>e.clientWidth+1;
  const labs=[...document.querySelectorAll('#flyT .l')],vals=[...document.querySelectorAll('#flyB b')],bt=[...document.querySelectorAll('#flyT button')].map(e=>e.getBoundingClientRect());
  const cols=new Set([...document.querySelectorAll('#flyB>div')].map(e=>Math.round(e.getBoundingClientRect().left))).size;
  return{sw:document.documentElement.scrollWidth,W,labCut:labs.filter(cut).map(e=>e.textContent),valCut:vals.filter(cut).map(e=>e.textContent),btnH:Math.min(...bt.map(r=>r.height)),inside:bt.every(r=>r.right<=W+1),cols,zoom:[...document.querySelectorAll('#flyZ button')].every(e=>e.getBoundingClientRect().right<=W)}});
 t('T22 v4.7.4 iPhone 17 Pro Max แนวตั้ง: ไม่ล้นจอ ชื่อปุ่ม/ตัวเลขไม่ถูกตัด ปุ่มสูง ≥ 52 px แถบตัวเลข 3 คอลัมน์',ip.sw<=ip.W&&!ip.labCut.length&&!ip.valCut.length&&ip.btnH>=52&&ip.inside&&ip.cols===3&&ip.zoom,ip);
 t('T22 b v4.7.5 viewport ไม่ให้ iOS ซูมเองเมื่อแตะช่องกรอก (maximum-scale=1) และช่องรหัสตัวอักษร ≥ 16 px',await q.evaluate(()=>/maximum-scale=1/.test(document.querySelector('meta[name=viewport]').content)&&parseFloat(getComputedStyle($('kyi')).fontSize)>=16));
 await q.tap('#flyT [data-fk="lay"]');await q.waitForTimeout(400);
 const fpI=await q.evaluate(()=>{const r=$('fp').getBoundingClientRect(),T=$('flyT').getBoundingClientRect(),x=$('fpx').getBoundingClientRect(),top=document.elementFromPoint(x.left+x.width/2,x.top+x.height/2);return{l:Math.round(r.left),r:Math.round(r.right),W:innerWidth,top:Math.round(r.top),tb:Math.round(T.bottom),xVis:x.width>0&&x.right<=innerWidth&&(top===$('fpx')||$('fpx').contains(top)),hs:$('fp').scrollWidth<=$('fp').clientWidth+1}});
 t('T22 c v4.7.5 iPhone: กล่องชั้นข้อมูลอยู่ในจอ ใต้แถบบน ไม่เลื่อนแนวนอน และมีปุ่ม ✕ ที่แตะได้',fpI.l>=0&&fpI.r<=fpI.W&&fpI.top>=fpI.tb&&fpI.xVis&&fpI.hs,fpI);
 await q.tap('#fpx');await q.waitForTimeout(200);t('T22 d v4.7.5 แตะ ✕ ปิดกล่องชั้นข้อมูล',await q.evaluate(()=>$('fp').hidden&&!document.querySelector('#flyT [data-fk="lay"]').classList.contains('on')));
 await q.tap('#flyT [data-fk="hide"]');await q.waitForTimeout(200);const hr=await q.evaluate(()=>{const r=$('flyR').getBoundingClientRect();return{vis:!$('flyR').hidden,l:r.left,t:r.top,r:r.right,W:innerWidth}});
 t('T22 e v4.7.5 iPhone: ซ่อนเมนูแล้วปุ่ม ☰ อยู่ในจอ',hr.vis&&hr.l>=0&&hr.t>=0&&hr.r<=hr.W,hr);await q.tap('#flyR');
 if(process.env.SHOT)await q.screenshot({path:'/tmp/t4700_iphone.png'});await c.close()}
// v4.7.5: ป้ายชื่อผู้ใช้
const ub=await p.evaluate(async()=>{const r={};r.vis=$('ubadge').getClientRects().length>0;const a=$('ubadge').getBoundingClientRect(),m=mp.getBoundingClientRect(),B=$('flyB').getBoundingClientRect();r.pos=a.left-m.left<20&&a.bottom<=B.top;localStorage.setItem('heliMyKey','demo');MYDIAG.u='นักบินทดสอบ';ubUpd();r.txt=$('ubadge').textContent;$('ubadge').click();await new Promise(x=>setTimeout(x,100));r.ky=!$('kyd').hidden;kyClose();localStorage.removeItem('heliMyKey');MYDIAG.u='';ubUpd();return r});
t('T23 v4.7.5 ป้ายชื่อผู้ใช้มุมล่างซ้าย (เหนือแถบตัวเลข) แสดงชื่อ · แตะเพื่อเปิดกล่องรหัส',ub.vis&&ub.pos&&/นักบินทดสอบ/.test(ub.txt)&&ub.ky,ub);
// v4.7.5 b2: Android/หลายอุปกรณ์ — พอดีส่วนที่มองเห็นจริง (visualViewport จำลอง) + Screen fit เอง (Playwright ซูมจริงไม่ได้)
{const c=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2.625,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 15; SM-S731B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0 Mobile Safari/537.36'});await c.route(/^https?:\/\/(?!localhost)/,r=>r.abort());const q=await c.newPage();const e2=[];q.on('pageerror',e=>e2.push(e.message));await q.goto('http://localhost:8773/?start=auto');await q.waitForTimeout(1500);
 const fz=await q.evaluate(async()=>{try{kyClose()}catch(e){}const W=n=>new Promise(r=>setTimeout(r,n)),g=e=>e.getBoundingClientRect(),r={fly:mp.classList.contains('fly')};const m0=g(mp);r.n=[m0.width,m0.height,mp.style.width];
  const fk={width:381,height:820,scale:1.08,offsetLeft:12,offsetTop:30,addEventListener(){}};Object.defineProperty(window,'visualViewport',{get:()=>fk,configurable:true});fitApply();await W(300);
  const M=g(mp),T=g($('flyT')),B=g($('flyB'));r.z=[M.left,M.top,M.right,M.bottom,T.right,B.bottom];
  Object.assign(fk,{width:412,height:915,scale:1,offsetLeft:0,offsetTop:0});fitApply();await W(300);r.back=g(mp).width===412&&!mp.style.width;
  document.querySelector('#flyT [data-fk="menu"]').click();await W(200);const fb=document.querySelector('[data-fm="fit"]');r.lab=fb.textContent;fb.click();await W(300);
  const M2=g(mp);r.f96=[Math.round(M2.right),Math.round(M2.bottom),document.querySelector('[data-fm="fit"]').textContent];r.info=document.querySelector('#flyM .fdi').textContent;
  document.querySelector('[data-fm="fit"]').click();document.querySelector('[data-fm="fit"]').click();document.querySelector('[data-fm="fit"]').click();document.querySelector('[data-fm="fit"]').click();await W(300);r.f100=document.querySelector('[data-fm="fit"]').textContent;r.ls=localStorage.getItem('heliFit');r.cs=document.querySelector('meta[name="color-scheme"]').content;return r});
 t('T24 v4.7.5 b2 Android: ส่วนที่มองเห็นเล็กกว่าจอ (ซูม 1.08) → แผนที่/แถบบน/แถบล่างอยู่ในส่วนที่มองเห็น และกลับเต็มจอเมื่อเลิกซูม',fz.fly&&fz.z[0]===12&&fz.z[1]===30&&fz.z[2]===393&&fz.z[3]===850&&fz.z[4]<=393&&fz.z[5]<=850&&fz.back,fz);
 t('T24 b Menu → Screen fit 100→96% ย่อขอบขวา/ล่าง · วนกลับ 100% · จำในเครื่อง · บรรทัดข้อมูลจอ · meta color-scheme',/Screen fit: 100%/.test(fz.lab)&&fz.f96[0]===395&&fz.f96[1]===878&&/96%/.test(fz.f96[2])&&/100%/.test(fz.f100)&&fz.ls==='100'&&/Screen 412×915/.test(fz.info)&&/Samsung Internet/.test(fz.info)&&fz.cs==='light dark',fz);
 t('T24 c ไม่มี JavaScript error (Android)',!e2.length,e2);await c.close()}
// v4.7.5 b3: มือถือ Android — กล่องจุดพิกัดในเส้นทาง ชื่อ/ละติจูด/ลองจิจูดแถวเดียวกัน · กด Enter ปิดรายชื่อแนะนำ
{const c=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2.625,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 15; SM-S731B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36'});await c.route(/^https?:\/\/(?!localhost)/,r=>r.abort());const q=await c.newPage();const e3=[];q.on('pageerror',e=>e3.push(e.message));await q.goto('http://localhost:8773/?start=auto');await q.waitForTimeout(1500);
 const L=await q.evaluate(async()=>{try{kyClose()}catch(e){}$("fmt").value="ddmm";pts.length=0;pts.push({name:"MY POS",lat:"1400.00N",lon:"10036.27E"},{name:"Tpad",lat:"1352.00N",lon:"10038.07E"});drawPts();calc();render();mptShow(true);await new Promise(r=>setTimeout(r,300));
  const row=document.querySelector('#mpt .pt'),I=[...row.querySelectorAll('input')],g=e=>e.getBoundingClientRect(),[n,a,o]=I.map(g),m=g($('mpt'));
  return{same:Math.abs(n.top-a.top)<2&&Math.abs(a.top-o.top)<2,w:[n.width,a.width,o.width].map(Math.round),inside:o.right<=m.right+0.5,fit:I.slice(1).every(x=>x.scrollWidth<=x.clientWidth)}});
 t('T25 v4.7.5 b3 Android 412 px: กล่องจุดพิกัดในเส้นทาง ชื่อ + ละติจูด + ลองจิจูดอยู่แถวเดียวกัน ไม่เกินกล่อง พิกัดไม่ถูกตัด',L.same&&L.inside&&L.fit&&L.w.every(x=>x>=80),L);
 const nm=q.locator('#mpt .pt').nth(1).locator('input.nm');await nm.click();await nm.fill('');await nm.pressSequentially('tpad');await q.waitForTimeout(300);
 const bf=await q.evaluate(()=>!$('sg').hidden&&$('sg').children.length>0);await nm.press('Enter');await q.waitForTimeout(400);const af=await q.evaluate(()=>$('sg').hidden);
 t('T25 b พิมพ์ชื่อจุดแล้วกด Enter: รายชื่อแนะนำปิดเอง',bf&&af,{bf,af});
 await q.evaluate(()=>{mptShow(false)});await q.tap('#flyT [data-fk="coord"]');await q.waitForTimeout(200);await q.tap('#flyT [data-fk="rul"]');await q.waitForTimeout(500);
 const rb=await q.evaluate(()=>{const g=e=>e.getBoundingClientRect(),R=g($('rulb')),m=g(mp),B=g($('flyB')),Z=[...document.querySelectorAll('#flyZ button')].map(g),cy=m.top+m.height/2,cx=m.left+m.width/2;
  return{vis:R.height>0,cross:cx>=R.left&&cx<=R.right&&cy>=R.top&&cy<=R.bottom,aboveB:R.bottom<=B.top,low:R.top>m.top+m.height*0.6,zOver:Z.some(z=>z.left<R.right&&z.right>R.left&&z.top<R.bottom&&z.bottom>R.top)}});
 t('T25 d b4 Android โหมดบิน: กล่องไม้บรรทัดชิดล่างจอ เหนือแถบตัวเลข ไม่บังกากบาทกลางจอและปุ่มซูม',rb.vis&&!rb.cross&&rb.aboveB&&rb.low&&!rb.zOver,rb);t('T25 c ไม่มี JavaScript error',!e3.length,e3);await c.close()}
// v4.7.5 b3: ปุ่ม Undo/Redo เหนือ North up ในโหมดบิน
{const u=await p.evaluate(async()=>{const W=n=>new Promise(r=>setTimeout(r,n)),g=e=>e.getBoundingClientRect(),U=document.querySelector('#flyZ [data-fk="un"]'),R=document.querySelector('#flyZ [data-fk="re"]'),N=document.querySelector('#flyZ [data-fk="rot"]');
 if(!U||!R)return{ok:false};const a=g(U),b=g(R),n=g(N),r={pos:a.bottom<=b.top&&b.bottom<=n.top&&Math.abs(a.right-n.right)<2&&Math.abs(b.right-n.right)<2&&a.height>=56&&a.width>=56,vis:a.width>0};
 const before=pts.map(p=>p.name).join(),n0=pts.length;pts.push({name:"UNDOX",lat:"14.5",lon:"100.5"});drawPts();calc();render();try{hTrack()}catch(e){}await W(300);
 r.enU=!U.disabled;U.click();await W(300);r.undone=!pts.some(p=>p.name==="UNDOX");r.enR=!R.disabled;R.click();await W(300);r.redone=pts.some(p=>p.name==="UNDOX");
 U.click();await W(200);r.n=pts.length===n0;return r});
 t('T26 v4.7.5 b3 โหมดบิน: ปุ่ม Undo/Redo เหนือ North up เรียงแนวตั้ง Undo บน Redo ล่าง (≥ 56 px) ใช้ย้อนกลับ/ทำซ้ำการแก้เส้นทางได้ สถานะเปิด/ปิดตามประวัติ',u.vis&&u.pos&&u.enU&&u.undone&&u.enR&&u.redone,u)}
t('T20 ไม่มี JavaScript error',errs.length===0,errs);
console.log(`ผล: PASS ${pass} / FAIL ${fail} (${APP})`);await b.close();srv.close();process.exit(fail?1:0)})().catch(e=>{console.log('ERROR',e);srv.close();process.exit(1)});
