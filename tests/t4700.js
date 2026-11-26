// ทดสอบโหมดบิน + บันทึก Track (v4.7.0–4.7.7) Playwright/Chromium จำลอง iPad แนวตั้ง (ไม่ใช่ iPad/GPS จริง)
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
t('T2 b ชื่อปุ่มโหมดบินเป็นภาษาอังกฤษ: Prev WP, Next WP, NAV, Coords, Rec Route (ไม่มี Edit route/Prev NAV ในแถบบน)',EN.every(x=>!/[\u0E00-\u0E7F]/.test(x.replace('พิกัด','')))&&['Prev WP','Next WP','พิกัด','Route','SAR','MY POS'].every(k=>EN.some(x=>x.includes(k)))&&!EN.some(x=>/REC Track|Rec Route|Prev NAV|Next NAV/.test(x)),EN.join(' | '));
const ic=await p.evaluate(()=>{const g=k=>document.querySelector(`#flyT [data-fk="${k}"],#flyZ [data-fk="${k}"]`);return{nav:!g('nav').querySelector('.l'),navT:g('nav').querySelector('.i').textContent,dto:!g('dto').querySelector('.l')&&g('dto').getAttribute('aria-label')==='Direct to'&&g('dto').textContent.trim()==='D→',me:g('me').querySelector('.i').textContent.charCodeAt(0)===0x2708&&getComputedStyle(g('me').querySelector('.i')).color==='rgb(255, 255, 255)'}});
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
const c0=await p.evaluate(()=>[M.cx,M.cy]);await p.tap('#flyB .fbbr',{position:{x:10,y:30}});await p.tap('#flyT [data-fk="hide"]');await p.tap('#flyR');await W(200);
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
await p.evaluate(()=>$('mptx').click());await W(300);
t('T11 b v4.7.2 (b5: แถบ NAV TO ซ่อนขณะแก้เส้นทาง → ปิดด้วย ✕) ปิดแผงแก้เส้นทาง',await p.evaluate(()=>getComputedStyle($('mpt')).display==='none'&&!M.mpt));
await p.tap('#flyT [data-fk="rrt"]');await W(300);await p.tap('#flyPk [data-pr="rt-list"]');await W(300);const rr1=await p.evaluate(()=>{const e=$('lbr');return{on:e.classList.contains('on'),vis:e.getClientRects().length>0,top:Math.round(e.getBoundingClientRect().top),tb:Math.round($('flyT').getBoundingClientRect().bottom)}});
await p.tap('#flyT [data-fk="rrt"]');await W(300);await p.tap('#flyPk [data-pr="rt-list"]');await W(300);const rr2=await p.evaluate(()=>$('lbr').classList.contains('on'));
t('T11 c v4.7.1 Rec Route: เปิดกล่องเส้นทางที่บันทึกไว้ (ใต้แถบบน) กดอีกครั้งปิด',rr1.on&&rr1.vis&&rr1.top>=rr1.tb-1&&!rr2,{rr1,rr2});
// Menu กระเบื้อง
await p.tap('#flyT [data-fk="menu"]');await W(200);
const mn=await p.evaluate(()=>({open:!$('flyM').hidden,tiles:[...document.querySelectorAll('#flyM .fog button')].map(e=>({t:e.textContent.trim(),h:Math.round(e.getBoundingClientRect().height)}))}));
t('T12 Menu กระเบื้องปุ่มใหญ่ (≥ 80 px) ภาษาอังกฤษ: Record track, Tracks/GPX, Aircraft, GPS / Position, Summary, HSI, FMS, SIM, Exit · ไม่มีปุ่มเก็บจุดทุก… · v4.7.9 b2 ไม่มี FLTA/Terrain profile (ย้ายไปหน้าต่าง TAWS)',mn.open&&mn.tiles.length>=12&&mn.tiles.every(x=>x.h>=80&&!/[\u0E00-\u0E7F]/.test(x.t))&&['track','Tracks / GPX','Aircraft','GPS / Position','Summary','HSI','FMS','SIM','Exit flight mode'].every(k=>mn.tiles.some(x=>x.t.includes(k)))&&!mn.tiles.some(x=>/Interval|เก็บจุด|FLTA|Terrain profile/.test(x.t)),mn.tiles.map(x=>x.t+'('+x.h+')').join(' | '));
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
// v4.7.6: North up สัญลักษณ์อย่างเดียว · HDG up → HDG · แตะ ETE ↔ ETA · Summary · กล่อง Summary/Aircraft ใหญ่ · TAWS บรรทัดเดียว · ซูมสองนิ้วต่อเนื่อง
{const W=n=>p.waitForTimeout(n);
 const a=await p.evaluate(()=>{const b=document.querySelector('#flyZ [data-fk="rot"]'),l=b.querySelector('.l'),i=b.querySelector('.i');return{lh:getComputedStyle(l).display==='none',iv:i.getBoundingClientRect().width>0}});
 t('T27 v4.7.6 โหมดบิน: ปุ่ม North up แสดงเฉพาะสัญลักษณ์ ไม่มีคำอธิบาย',a.lh&&a.iv,a);
 await p.evaluate(()=>{window.__s={TUP,RMODE,CPON,ch:MLP.ch};TUP=true;RMODE="H";CPON=true;MLP.ch=123});await W(1300);
 const h1=await p.evaluate(()=>({l:$('fbTl').textContent,v:$('fbT').textContent}));
 await p.evaluate(()=>{TUP=__s.TUP;RMODE=__s.RMODE;CPON=__s.CPON;MLP.ch=__s.ch});await W(1300);const h2=await p.evaluate(()=>$('fbTl').textContent);
 t('T27 b HDG up: ช่องล่าง TRK เปลี่ยนเป็น HDG (ค่าหัวเครื่อง) · กลับเป็น TRK เมื่อเลิก',h1.l==='HDG'&&/123/.test(h1.v)&&h2==='TRK',{h1,h2});
 await p.tap('#fbEw');await W(300);const e1=await p.evaluate(()=>({l:$('fbEl').textContent,ls:localStorage.getItem('heliEta')}));await p.tap('#fbEw');await W(300);const e2=await p.evaluate(()=>$('fbEl').textContent);
 t('T27 c แตะ ETE สลับเป็น ETA (จำในเครื่อง) · แตะอีกครั้งกลับ ETE',e1.l==='ETA DEST'&&e1.ls==='true'&&e2==='ETE DEST',{e1,e2});
// v4.7.7 b7: ETE/ETA ในแถบล่าง = ถึงปลายทาง (จุดสุดท้าย) ไม่ใช่จุดถัดไป
{const W=n=>p.waitForTimeout(n);
 const r=await p.evaluate(async()=>{window.__fm=$("fmt").value;$("fmt").value="dd";pts.length=0;pts.push({name:"AAA",lat:"14.0",lon:"100.3"},{name:"BBB",lat:"14.1",lon:"100.6"},{name:"CCC",lat:"14.3",lon:"100.9"});drawPts();calc();render();
  MLP.on=true;MLP.la=13.98;MLP.lo=100.25;MLP.sp=120/1.943844;MLP.t=Date.now();directTo("",pts[0]);if(typeof FLYETA!=="undefined"&&localStorage.getItem('heliEta')==='true')$('fbEw').click();
  await new Promise(r=>setTimeout(r,1500));if(!DT)return{noDT:true,fm:window.__fm,to:$('fbN').textContent,mlp:[MLP.on,MLP.la]};const L=navList();const fm=$('fmt').value,s={la:MLP.la,lo:MLP.lo};let d=leg(s,DT.t).d;for(let i=L.k;i<L.b.length-1;i++)d+=leg(dtLL(L.b[i],fm),dtLL(L.b[i+1],fm)).d;
  const gs=+$('fbG').textContent,sec=Math.round(d/gs*3600),nx=Math.round(leg(s,DT.t).d/gs*3600);return{l:$('fbEl').textContent,e:$('fbE').textContent,d,gs,sec,nx,k:L.k,n:L.b.length,to:$('fbN').textContent}});
 const P=s=>{const m=s.match(/^(\d+):(\d+)(?::(\d+))?/);return m?(s.includes('ชม')?(+m[1])*3600+(+m[2])*60:(+m[1])*60+(+m[2])):null};const es=P(r.e);
 t('T33 v4.7.7 b7 แถบล่าง: ETE DEST = เวลาถึงจุดสุดท้ายของเส้นทาง (รวมขาที่เหลือ) ไม่ใช่เวลาถึงจุดถัดไป',r.l==='ETE DEST'&&es!=null&&Math.abs(es-r.sec)<=90&&r.sec>r.nx+60,{r,es});
 await p.tap('#fbEw');await W(300);const ea=await p.evaluate(()=>({l:$('fbEl').textContent,e:$('fbE').textContent}));await p.tap('#fbEw');await W(200);
 const exp=new Date(Date.now()+r.sec*1000),eh=String(exp.getHours()).padStart(2,'0')+':'+String(exp.getMinutes()).padStart(2,'0');
 t('T33 b แตะสลับเป็น ETA DEST = นาฬิกาเครื่อง + เวลาถึงปลายทาง',ea.l==='ETA DEST'&&Math.abs(P(ea.e)-P(eh))<=2,{ea,eh})}
// v4.7.7 b8→b14: กล่อง Summary บรรทัดสุดท้าย Plan ETA = เวลาออกบิน (#dep) + เวลาบินตามแผน (GS ในแผน · ขณะ NAV ใช้ NAVGS0) · ไม่กรอกเวลาออก = นับจากตอนนี้
{const r=await p.evaluate(()=>{const g0=$('gs').value,d0=$('dep').value,s0=!!M.sum;$('gs').value=100;$('dep').value='09:00';calc();sumShow(true);const tot=calcData.legs.reduce((s,l)=>s+l.d,0);
 const q=()=>{const all=[...document.querySelectorAll('#msb .mg>div')],e=document.querySelector('#msb .mplan');return{t:e&&e.innerText.replace(/\s+/g,' ').trim(),last:!!e&&all[all.length-1]===e}};const a=q();
 const sv=[NAVON,NAVGS0];NAVON=true;NAVGS0="100";$('gs').value=140;msumRender();const b=q();NAVON=sv[0];NAVGS0=sv[1];$('gs').value=100;
 $('dep').value='';msumRender();const c=q();$('gs').value=g0;$('dep').value=d0;calc();sumShow(s0);
 const m=Math.round(tot/100*60),f=x=>String(Math.floor(x/60)%24).padStart(2,'0')+':'+String(x%60).padStart(2,'0'),n=new Date(),nm=n.getHours()*60+n.getMinutes()+m;
 return{a,b,c,exp:f(540+m),now:[f(nm-1),f(nm),f(nm+1)]}});
 t('T34 v4.7.7 b14 กล่อง Summary: บรรทัดสุดท้าย Plan ETA = เวลาออกบิน + เวลาบินตามแผน (ขณะ NAV ยังใช้ GS ในแผน) · ไม่กรอกเวลาออก = นับจากตอนนี้',r.a.last&&r.a.t.startsWith('Plan ETA '+r.exp)&&/ออก 09:00/.test(r.a.t)&&/@ 100 kt/.test(r.a.t)&&r.b.t.startsWith('Plan ETA '+r.exp)&&r.c.last&&/ออกตอนนี้/.test(r.c.t)&&r.now.some(x=>r.c.t.startsWith('Plan ETA '+x)),r)}
// v4.7.7 b9: กันจอดับในโหมดบิน (Screen Wake Lock) — จำลอง navigator.wakeLock
{const W=n=>p.waitForTimeout(n);
 const r=await p.evaluate(async()=>{const w={req:0,rel:0};const mk=()=>{const t=new EventTarget();t.released=false;t.release=async()=>{if(t.released)return;t.released=true;w.rel++;t.dispatchEvent(new Event('release'))};return t};
  Object.defineProperty(navigator,'wakeLock',{value:{request:async()=>{w.req++;w.s=mk();return w.s}},configurable:true});const sl=ms=>new Promise(r=>setTimeout(r,ms));const S=()=>({st:WK.st,h:$('flyWk').hidden,c:$('flyWk').className});
  wkSet(false);wkSet(true);await sl(100);const a=S(),q1=w.req;
  await w.s.release();await sl(50);const b=S();document.dispatchEvent(new Event('visibilitychange'));await sl(600);const c=S(),q2=w.req;
  wkSet(false);await sl(50);const d={...S(),rel:w.rel};wkSet(true);await sl(100);
  flyOff();await sl(200);const e={...S(),rel:w.rel};flyOn();await sl(300);const g={...S(),req:w.req};
  delete navigator.wakeLock;return{a,q1,b,c,q2,d,e,g}});
 t('T35 v4.7.7 b9 โหมดบินขอกันจอดับ (ไอคอนเขียว) · ระบบปล่อยแล้วขอใหม่เมื่อกลับมาที่แอป · ปิดใน Menu = ปล่อย · ออกโหมดบิน = ปล่อย · เข้าใหม่ = ขอใหม่',r.a.st==='on'&&r.a.c.includes('ok')&&!r.a.h&&r.b.st==='off'&&r.c.st==='on'&&r.q2===r.q1+1&&r.d.h&&r.d.st==='off'&&r.e.st==='off'&&r.e.h&&r.g.st==='on'&&!r.g.h,r);
 await p.evaluate(()=>{document.querySelector('#flyT [data-fk="menu"]').click()});await W(200);const m=await p.evaluate(()=>{const b=$('flyM').querySelector('[data-fm="wk"]');return b&&b.textContent});await p.evaluate(()=>{$('flyM').hidden=true});
 t('T35 b Menu มีปุ่ม Screen awake แสดงสถานะ On/Off',/Screen awake: (On|Off)/.test(m||''),m)}
// v4.7.7 b10–b11: ยอดเขา (MT0) ตรงกับชีต Mountain 159 แถว — ลบ x4462 18.88/99.8 (b10), x5702 แถวซ้ำ และ x6017 (b11)
{const r=await p.evaluate(()=>({n:MT0.length,dup:MT0.some(a=>a[0]==="x4462"&&a[1]===18.88),k:MT0.some(a=>a[0]==="x4462"&&a[1]===18.8767),x5702:MT0.filter(a=>a[0]==="x5702").length,x6017:MT0.some(a=>a[0]==="x6017"),x5839:MT0.some(a=>a[0]==="x5839"),db:DB.MT.length}));
 t('T36 v4.7.7 b11 ข้อมูลยอดเขาในไฟล์ = ชีต Mountain (159 แถว · x5702 แถวเดียว · ไม่มี x6017 · ไม่มี x4462 แถวที่ลบแล้ว)',r.n===159&&!r.dup&&r.k&&r.x5702===1&&!r.x6017&&r.x5839&&r.db===159,r)}
// v4.7.7 b12: ปุ่ม ▴ INFO ชิดขอบล่าง · ลากแผนที่ด้วยนิ้ว = เลื่อนชั้น #rot ด้วย transform ระหว่างรอบวาด แล้ววาดจริงเมื่อยกนิ้ว
{const W=n=>p.waitForTimeout(n);
 await p.evaluate(()=>{document.querySelector('#fbHide').click()});await W(300);
 const ib=await p.evaluate(()=>{const r=$('flySb').getBoundingClientRect(),m=mp.getBoundingClientRect();return{t:$('flySb').textContent,vis:!$('flySb').hidden,gap:Math.round(m.bottom-r.bottom),cx:Math.round(r.left+r.width/2-(m.left+m.width/2)),h:Math.round(r.height),ub:$('ubadge')&&!$('ubadge').hidden?Math.round($('ubadge').getBoundingClientRect().height):null}});
 await p.evaluate(()=>{$('flySb').click()});await W(200);
 t('T37 v4.7.7 b12–b13 ซ่อนแถบข้อมูลแล้วปุ่ม "▴ INFO" อยู่กลาง ชิดขอบล่างสุด สูงไม่เกิน 32 px (ใกล้เคียงป้ายผู้ใช้)',ib.vis&&ib.t==='▴ INFO'&&ib.gap===0&&Math.abs(ib.cx)<=2&&ib.h<=32&&(ib.ub==null||Math.abs(ib.h-ib.ub)<=6),ib);
 const r=await p.evaluate(()=>{let n=0;const o=drawMap;drawMap=function(){n++;return o.apply(this,arguments)};const ev=(x,y)=>({clientX:x,clientY:y});const rot=$('rot');
  try{panMove(ev(300,300));const n1=n;for(let i=1;i<=5;i++)panMove(ev(300+i*10,300+i*4));const tf=rot.style.transform,n2=n;panFlush();return{n1,n2,tf,after:rot.style.transform,n3:n,pb:PANB}}finally{drawMap=o}});
 t('T37 b ลากด้วยนิ้ว: ระหว่างรอบวาดใช้ transform เลื่อนภาพ (ไม่วาดใหม่ทุกครั้ง) · ยกนิ้วแล้ววาดจริงและล้าง transform',r.n1===1&&r.n2===1&&/translate\(50\.0px, ?20\.0px\)/.test(r.tf)&&r.after===''&&r.n3===2&&r.pb===null,r)}
// v4.7.7 b15: ชั้น ENR Chart (Tpadenr) — แผนที่พื้นหลัง (พื้นขาว) และซ้อนบนแผนที่อื่น + ความทึบ · ไม่ขอแผ่นนอกกรอบ · ซูมเกิน zmax ใช้แผ่นแม่ขยาย
{const W=n=>p.waitForTimeout(n);
 const r=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const L0=LAY.k,on0=ENR.on,op0=ENR.op,z0=M.z,c0=[M.cx,M.cy];
  const has=!!LAYERS.find(l=>l.k==='enr');setLayer('enr');let q=wp(13.75,100.6,9);M.z=9;M.cx=q[0];M.cy=q[1];drawMap(false);await sl(200);
  const base={n:document.querySelectorAll('#tl img.enr').length,bg:mp.style.background!=='',at:/ENR AIRAC/.test($('at').textContent),dis:[...document.querySelectorAll('.enron')].every(c=>c.disabled)};
  q=wp(13.75,100.6,13);M.z=13;M.cx=q[0];M.cy=q[1];drawMap(false);await sl(100);const im=document.querySelector('#tl img.enr');const oz={z:im&&im._z,d:im&&im._d,src:im&&/\/tiles\/11\//.test(im.src)};
  setLayer('topo');const c=document.querySelector('.enron');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));const s=document.querySelector('.enrop');s.value='0.5';s.dispatchEvent(new Event('change',{bubbles:true}));
  q=wp(13.75,100.6,9);M.z=9;M.cx=q[0];M.cy=q[1];drawMap(false);await sl(100);
  const ov={n:document.querySelectorAll('#tl img.enr').length,op:(document.querySelector('#tl img.enr')||{style:{}}).style.opacity,at:/ENR AIRAC/.test($('at').textContent),ls:localStorage.getItem('heliEnrOn')};
  q=wp(35,140,9);M.cx=q[0];M.cy=q[1];drawMap(false);await sl(50);const out=document.querySelectorAll('#tl img.enr').length;
  c.checked=false;c.dispatchEvent(new Event('change',{bubbles:true}));q=wp(13.75,100.6,9);M.cx=q[0];M.cy=q[1];drawMap(false);await sl(50);const off={n:document.querySelectorAll('#tl img.enr').length,at:/ENR AIRAC/.test($('at').textContent)};
  ENR.op=op0;setLayer(L0);M.z=z0;M.cx=c0[0];M.cy=c0[1];drawMap(false);return{has,base,oz,ov,out,off}});
 t('T38 v4.7.7 b15 ชั้น ENR Chart: เป็นแผนที่พื้นหลัง (พื้นขาว ป้าย AIRAC ที่บรรทัดลิขสิทธิ์) · ซ้อนบนแผนที่อื่นได้ ปรับความทึบ · ไม่ขอแผ่นนอกกรอบ · ซูม 13 ใช้แผ่นซูม 11 ขยาย · ปิดแล้วหาย',r.has&&r.base.n>0&&r.base.bg&&r.base.at&&r.base.dis&&r.oz.z===13&&r.oz.d===2&&r.oz.src&&r.ov.n>0&&r.ov.op==='0.5'&&r.ov.at&&r.ov.ls==='1'&&r.out===0&&r.off.n===0&&!r.off.at,r)}
// v4.7.7 b17: แตะเส้นทาง Active → เมนูมีปุ่ม ⇄ Reverse · กลับลำดับจุด · ขณะ NAV = Direct to จุดก่อนหน้าของจุดที่กำลังไป · Undo ได้
{const W=n=>p.waitForTimeout(n);
 const r=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));$("fmt").value="dd";if(DT){DT=null}
  pts.length=0;pts.push({name:"AAA",lat:"14.0",lon:"100.3"},{name:"BBB",lat:"14.1",lon:"100.6"},{name:"CCC",lat:"14.3",lon:"100.9"},{name:"",lat:"",lon:""});drawPts();calc();render();await sl(800);
  ctmOpen({k:"act"});await sl(100);const btn=[...document.querySelectorAll('#mselb button[data-c="rev"],#ctm button[data-c="rev"]')];const has=btn.length>0&&/Reverse/.test(btn[0].textContent);
  btn[0].click();await sl(900);const a=pts.map(p=>p.name);
  $('hun').click();await sl(200);const u=pts.map(p=>p.name);
  MLP.on=true;MLP.la=14.05;MLP.lo=100.45;MLP.sp=100/1.943844;MLP.t=Date.now();directTo("",pts[1]);await sl(300);const dt0=DT&&DT.b&&DT.b.name;
  routeReverse();await sl(300);const b={names:pts.filter(p=>p.name).map(p=>p.name),to:DT&&DT.t&&DT.t.n,b:DT&&DT.b&&DT.b.name,orig:DT&&DT.orig?DT.orig.filter(p=>p.name&&p.name!=='MY POS').map(p=>p.name):null};
  DT=null;return{has,a,u,dt0,b}});
 t('T39 v4.7.7 b17 เมนูเส้นทาง Active มี ⇄ Reverse: กลับลำดับจุด (แถวว่างอยู่ท้าย) · Undo คืนลำดับเดิม · ขณะ Direct to BBB (จุดที่ 2) → Reverse = Direct to AAA (จุดเริ่มต้นเดิม) · เส้นทางเต็มเป็น CCC → BBB → AAA',r.has&&r.a.join()==='CCC,BBB,AAA,'&&r.u.join()==='AAA,BBB,CCC,'&&r.dt0==='BBB'&&r.b.b==='AAA'&&r.b.names.join()==='MY POS,AAA'&&r.b.orig&&r.b.orig.join()==='CCC,BBB,AAA',r)}
 // v4.7.8: ประสิทธิภาพ — GPS ขยับ < 1 px ไม่วาดใหม่ · ระหว่างลากนิ้ว (PANB) TAWS ไม่คำนวณสีใหม่ · curUpd ไม่อ่าน getBoundingClientRect · FLTA วาดเฉพาะชั้นพัด
 {const r=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));let n=0;const o=drawMap;drawMap=function(){n++;return o.apply(this,arguments)};
  MLP.on=true;MLP.la=14.0;MLP.lo=100.5;MLP.hd=90;MLP.t=Date.now();gpsDraw(false,true);n=0;
  MLP.la+=1e-7;const a=gpsDraw(false);const n1=n;MLP.la+=0.01;const b=gpsDraw(false);const n2=n;MLP.hd=95;const c=gpsDraw(false);
  const g=Element.prototype.getBoundingClientRect;let gb=0;Element.prototype.getBoundingClientRect=function(){gb++;return g.apply(this,arguments)};
  const fc0=$('fcur');const was=CURON;if(!was){fc0.checked=true;fc0.dispatchEvent(new Event('change',{bubbles:true}))}await sl(50);gb=0;curUpd();const gbc=gb;
  const cll=ctrLL(),r0=mp.getBoundingClientRect(),xll=xy2ll(r0.left+mp.clientWidth/2,r0.top+mp.clientHeight/2);Element.prototype.getBoundingClientRect=g;
  if(!was){fc0.checked=false;fc0.dispatchEvent(new Event('change',{bubbles:true}))}
  const tw0=TW.on;if(!TW.on)$('twb').click();await sl(400);drawMap(false);await sl(50);const t0=TWS.t;PANB={bx:0,by:0,lx:0,ly:0,t:0};M.cx+=30;drawMap(false);const t1=TWS.t;PANB=null;M.cx-=30;drawMap(false);const t2=TWS.t;
  drawMap=o;if(!tw0)$('twb').click();MLP.on=false;return{a,b,c,n1,n2,n,gbc,dll:Math.abs(cll[0]-xll[0])+Math.abs(cll[1]-xll[1]),panHold:t1===t0,after:t2!==t1||TWS.k!==undefined}});
 t('T40 v4.7.8 ประสิทธิภาพ: GPS ขยับไม่ถึง 1 px ไม่วาดแผนที่ใหม่ (ขยับจริง/หัวเปลี่ยน วาด) · curUpd ไม่อ่านผังหน้า (getBoundingClientRect = 0) และพิกัดกลางจอเท่าเดิม · ระหว่างลากนิ้ว TAWS ไม่คำนวณสีใหม่',r.a===false&&r.n1===0&&r.b===true&&r.n2===1&&r.c===true&&r.gbc===0&&r.dll<1e-6&&r.panHold&&r.after,r)}
 // v4.7.8 b2: update sheet to code — ชีต Point เพิ่ม CRMA (14°17.85' N 101°09.98' E) · ชีต TPAD ชื่อ Tpadจันทบุรี
 {const r=await p.evaluate(()=>{const c=DB.PT.find(x=>x.n==='CRMA');return{n:DB.PT.length,c:c?[+c.la.toFixed(4),+c.lo.toFixed(4)]:null,tp:DB.TP.some(x=>x.n==='Tpadจันทบุรี'),mt:MT0.some(r=>r[0]==='x5704'&&r[1]===19.2967&&r[2]===98.84)&&!MT0.some(r=>r[0]==='x5204'),old:DB.TP.some(x=>x.n==='TPADจันทบุรี')}});
 t('T41 v4.7.8 b2 ข้อมูลตรงชีต: Point 10 จุด (มี CRMA 14.2975/101.1663) · TPAD ชื่อ Tpadจันทบุรี · v4.7.9 b10 ยอดเขา x5204 → x5704 (19.2967/98.84)',r.n===10&&r.c&&r.c[0]===14.2975&&r.c[1]===101.1663&&r.tp&&!r.old&&r.mt,r)}
 // v4.7.9: ระหว่างลากนิ้ว (PANB) ไม่สร้าง SVG #ov ใหม่ — เลื่อนภาพเดิม (transform) · ยกนิ้ว (panFlush) สร้างใหม่และล้าง transform · จอสัมผัสวาดจุดเกินขอบ 256 px
 {const r=await p.evaluate(()=>{drawMap(false);const ov=$('ov');let w=0;const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(ov,'innerHTML',{set(v){w++;d.set.call(this,v)},get(){return d.get.call(this)},configurable:true});
  PANB={bx:0,by:0,lx:0,ly:0,t:0};const cx=M.cx,cy=M.cy;M.cx+=40;M.cy-=25;drawMap(false);const w1=w,tf=ov.style.transform;panFlush();const w2=w,tf2=ov.style.transform;M.cx=cx;M.cy=cy;drawMap(false);delete ov.innerHTML;return{w1,tf,w2,tf2,cull:CULL}});
 t('T42 v4.7.9 ลากนิ้ว: ไม่สร้าง SVG ใหม่ (เลื่อนภาพเดิม -40,+25 px) · ยกนิ้วสร้างใหม่ 1 ครั้งและล้าง transform · จอสัมผัส CULL 256',r.w1===0&&/translate\(-40(\.0)?px, 25(\.0)?px\)/.test(r.tf)&&r.w2===1&&r.tf2===''&&r.cull===256,r)}
 // v4.7.9 b3: หน้าต่างชั้นข้อมูลในโหมดบิน ปุ่มปิด/ย่อ ≥ 44 px · คำอธิบายเรดาร์ฝนไล่ถึงส้ม/แดง · ปุ่มย่อกล่องชั้นฝน
 {const W=n=>p.waitForTimeout(n);await p.tap('#flyT [data-fk="lay"]');await W(400);
  const a=await p.evaluate(()=>{const x=$('fpx').getBoundingClientRect(),c=document.querySelector('#fp .ph .pc').getBoundingClientRect(),ch=document.querySelector('#fp .chip').getBoundingClientRect();return{open:!$('fp').hidden,x:Math.round(Math.min(x.width,x.height)),c:Math.round(Math.min(c.width,c.height)),chip:Math.round(ch.height)}});
  await p.tap('#fpx');await W(200);const closed=await p.evaluate(()=>$('fp').hidden);
  await p.evaluate(()=>{wxSet("radar")});await W(300);
  const l=await p.evaluate(()=>({lg:$('wxl').innerHTML,head:$('wxh').textContent}));
  await p.tap('#wxmin');await W(200);const m1=await p.evaluate(()=>({min:$('wxb').classList.contains('min'),ls:localStorage.getItem('heliWxMin'),rowHidden:getComputedStyle(document.querySelector('#wxb .r')).display==='none'}));
  await p.tap('#wxmin');await W(200);const m2=await p.evaluate(()=>({min:$('wxb').classList.contains('min'),ls:localStorage.getItem('heliWxMin')}));await p.evaluate(()=>{wxSet("off")});
  t('T44 v4.7.9 b3 Layers (โหมดบิน): ปุ่ม ✕/▾ ≥ 44 px, ช่องเลือก ≥ 44 px, ✕ ปิดได้ · เรดาร์ฝน: คำอธิบายมีเหลือง/ส้ม/แดง · ปุ่มย่อ/ขยายกล่องชั้นฝน (จำค่า)',a.open&&a.x>=44&&a.c>=44&&a.chip>=44&&closed&&/#ffee00/.test(l.lg)&&/#ff4400/.test(l.lg)&&/#c10000/.test(l.lg)&&l.head==='เรดาร์ฝน'&&m1.min&&m1.ls==='1'&&m1.rowHidden&&!m2.min&&m2.ls==='0',{a,closed,head:l.head,m1,m2})}
 // v4.7.9 b4–b5: หมวด OSM Airport (OH, เฉพาะ aerodrome/airstrip ไอคอนเครื่องบินสีดำ) + OSM Peak (OP, ไม่มีชื่อ = x,xxx ft) — ปุ่มเปิด/ปิด (ค่าเริ่มต้นปิด) · แสดงเมื่อซูม ≥ 7/10 · popup ความสูงและที่มา OSM · ค้นหาได้
 {const r=await p.evaluate(()=>{const o={oh:DB.OH.length,dupAP:DB.OH.filter(x=>DB.AP.some(p=>(x.c&&p.c===x.c)||Math.hypot((p.la-x.la)*111.2,(p.lo-x.lo)*111.2*Math.cos(x.la*Math.PI/180))<=3)).length,op:DB.OP.length,def:[$('c_OH').checked,$('c_OP').checked],fp:!!$('f_OH')&&!!$('f_OP'),types:[...new Set(DB.OH.map(x=>x.t))].sort().join(''),icon:SHAPE.OH===SHAPE.AP,col:CATS.find(t=>t.k==='OH').c,name:CATS.find(t=>t.k==='OH').n};
  o.unnamed=OP0.map((r,k)=>r[0]?null:DB.OP[k].n).filter(x=>x!==null);o.nUn=o.unnamed.length;o.numM=DB.OP.filter(x=>/^\d+(\.\d+)?\s*m?$/i.test(x.n)).length;{const k=OP0.findIndex(r=>r[0]==='1770');o.n1770=k>=0?DB.OP[k].n:'';const k2=OP0.findIndex(r=>r[0]==='1335m');o.n1335=k2>=0?DB.OP[k2].n:''}o.badUn=o.unnamed.filter(n=>!/^\d{1,3}(,\d{3})* ft$/.test(n)).length;o.un0=o.unnamed[0];
  const keep=[M.z,M.cx,M.cy];const go=(la,lo,z)=>{const c=wp(la,lo,z);M.z=z;M.cx=c[0];M.cy=c[1];drawMap(false)};const cnt=k=>document.querySelectorAll('#ov [data-poi^="'+k+':"]').length;
  $('c_OH').checked=true;$('c_OP').checked=true;go(18.77,98.96,6);o.z6=cnt('OH')+cnt('OP');go(18.77,98.96,8);o.oh8=cnt('OH');o.op8=cnt('OP');go(18.77,98.96,11);o.op11=cnt('OP');{$('c_MT').checked=true;drawMap(false);const g=[...document.querySelectorAll('#ov [data-poi]')].map(e=>e.dataset.poi.split(':')[0]);o.mtTop=g.lastIndexOf('OP')<g.indexOf('MT')&&g.indexOf('MT')>=0;$('c_MT').checked=false}
  const i=DB.OP.findIndex(x=>/อินทนนท์/.test(x.n));o.pop=popHtml("OP",i);const j=DB.OH.findIndex(x=>x.c==="VTSW");o.vtbhGone=!DB.OH.some(x=>x.c==='VTBH');o.b9=!DB.OH.some(x=>x.osm==='w698540142')&&!DB.OP.some(x=>x.n==='House');{opBuild(OP0.concat([['House','',null,16.55706,98.76794]]));o.b9=o.b9&&DB.OP.length===1857;opBuild(OP0)}{const N=DB.OH.map(x=>x.n);o.fix=['คลอง15','คลอง16','เบสท์โอเชียน','โคกสำราญ'].every(n=>N.includes(n))&&!N.some(n=>/AD-27755|AD-25162|AD-79162|สนามบินเล็ก$|กองการบิน|คลอง 1[56]|แอร์พาร์ค/.test(n));const L=OH0.slice();ohBuild(L.concat([['สนามบินเล็ก','','A','',null,13.94538,100.57455,'w1466440822']]));o.fixLive=DB.OH.length===43;ohBuild(OH0)}o.poh=j>=0?popHtml("OH",j):"";
  $('q').value='อินทนนท์';qrender();o.q=$('qn').textContent;$('q').value='';qrender();
  $('c_OH').checked=false;$('c_OP').checked=false;M.z=keep[0];M.cx=keep[1];M.cy=keep[2];drawMap(false);delete o.unnamed;return o});
 t('T45 v4.7.9 b9 (ลบ AD-40142/House · ยอดเขา x อยู่บน OSM Peak · ยอดเขาชื่อเป็นเลขเมตร → ft) OSM Airport (43 แห่ง ลบ/เปลี่ยนชื่อตามผู้ใช้ เฉพาะ A/S ไม่ซ้ำหมวด Airport ไอคอนเครื่องบินสีดำ) + OSM Peak (1,857 ไม่มีชื่อ = x,xxx ft) ค่าเริ่มต้นปิด มีปุ่มในกล่องชั้นข้อมูล · ซูม 6 ไม่แสดง · ซูม 8 แสดงสนามบินแต่ยังไม่แสดงยอดเขา · ซูม 11 แสดงยอดเขา · popup/ค้นหา',r.oh===43&&r.b9&&r.fix&&r.dupAP===0&&r.op===1857&&r.types==='AS'&&r.icon&&r.col==='#000000'&&r.name==='OSM Airport'&&r.badUn===0&&r.numM===0&&r.n1770==='5,807 ft'&&r.n1335==='4,380 ft'&&!r.def[0]&&!r.def[1]&&r.fp&&r.z6===0&&r.oh8>0&&r.op8===0&&r.op11>0&&/2,565 m/.test(r.pop)&&/OpenStreetMap/.test(r.pop)&&/data-add="OP:/.test(r.pop)&&/Aerodrome/.test(r.poh)&&r.vtbhGone&&r.fixLive&&r.mtTop&&/1 จุด/.test(r.q),{...r,pop:r.pop.length,poh:r.poh.length})}
 const sm=await p.evaluate(()=>({sb:$('sb').textContent.trim(),ph:document.querySelector('#msum .ph b').textContent,h2:document.querySelector('#cs h2').textContent,old:document.documentElement.innerHTML.includes('สรุปเส้นทาง Active')}));
 t('T27 d ชื่อกล่อง "สรุปเส้นทาง Active" เปลี่ยนเป็น Summary ทั้งแอป',sm.sb==='Summary'&&sm.ph==='Summary'&&sm.h2==='Summary'&&!sm.old,sm);
 await p.evaluate(()=>{if(!M.mac)$('mb').click();if(!M.sum)$('sb').click()});await W(400);
 const bx=await p.evaluate(()=>{const g=e=>e.getBoundingClientRect(),m=g($('mac')),s=g($('msum')),st=g(document.querySelector('#mac .st button'));return{mw:Math.round(m.width),sw:Math.round(s.width),bw:Math.round(st.width),bh:Math.round(st.height),fs:parseFloat(getComputedStyle($('mac')).fontSize)}});
 t('T27 e โหมดบิน: กล่อง Aircraft/Summary ใหญ่ขึ้น (≥ 330 px, ตัวอักษร 16 px) ปุ่ม +/− ≥ 44 px',bx.mw>=330&&bx.sw>=330&&bx.bw>=44&&bx.bh>=44&&bx.fs>=16,bx);
 await p.evaluate(()=>{if(M.mac)$('mb').click();if(M.sum)$('sb').click()});
 await p.evaluate(()=>{if(!TW.on)$('twb').click()});await W(700);
 const tw=await p.evaluate(()=>{const l=$('twl'),n=l.querySelector('.twn');return{vis:!l.hidden,h:Math.round(l.getBoundingClientRect().height),twn:n?getComputedStyle(n).display:'none',ref:/TAWS/.test(l.textContent)}});
 await p.evaluate(()=>{if(TW.on)$('twb').click()});
 t('T27 f โหมดบิน: กล่อง TAWS เหลือบรรทัดเดียว (ตัดบรรทัดคำอธิบาย)',tw.vis&&tw.ref&&tw.twn==='none'&&tw.h<=34,tw);
 const cdp=await ctx.newCDPSession(p);const TE=(type,q)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:q.map((x,i)=>({x:x[0],y:x[1],id:i}))});
 const pin=async(d0,d1)=>{await p.evaluate(()=>{window.__dm=0;if(!window.__dmw){window.__dmw=1;const o=window.drawMap;window.drawMap=function(){window.__dm++;return o.apply(this,arguments)}}});const z0=await p.evaluate(()=>M.z);
  await TE('touchStart',[[400-d0/2,550],[400+d0/2,550]]);let mid=null;for(let i=1;i<=12;i++){const d=d0+(d1-d0)*i/12;await TE('touchMove',[[400-d/2,550],[400+d/2,550]]);if(i===6)mid=await p.evaluate(()=>$('rot').style.transform)}
  const dm=await p.evaluate(()=>__dm);await TE('touchEnd',[]);await W(450);return{z0,z1:await p.evaluate(()=>M.z),mid,dm,tf:await p.evaluate(()=>$('rot').style.transform)}};
 const pi=await pin(200,360),po=await pin(400,180);
 t('T27 g ซูมสองนิ้วต่อเนื่อง: ระหว่างถ่าง/หุบ ย่อ/ขยายทั้งชั้นด้วย transform (ไม่วาดใหม่ทุกครั้งที่ขยับ) ยกนิ้วแล้วเข้าระดับซูมใกล้สุด (×1.8 → +1, ×0.45 → −1)',/scale\(1\.[2-9]/.test(pi.mid||'')&&pi.dm<=3&&pi.z1===pi.z0+1&&!pi.tf&&/scale\(0\.[5-9]/.test(po.mid||'')&&po.z1===po.z0-1&&!po.tf,{pi,po})}
// v4.7.7: ปุ่ม พิกัด · Aircraft (ชื่อ + ปุ่มปิด) · เมนู Marks / Download map/TAWS / Manual · ปุ่ม MARK สร้างจุดจากตำแหน่งปัจจุบัน
{const W=n=>p.waitForTimeout(n);
 const a=await p.evaluate(()=>({co:document.querySelector('#flyT [data-fk="coord"]').textContent.trim(),mb:$('mb').textContent.trim(),ph:document.querySelector('#mac .ph b').textContent,h2:document.querySelector('#acard h2').textContent,old:document.documentElement.innerHTML.includes('>ข้อมูลอากาศยาน<')}));
 t('T28 v4.7.7 ปุ่ม Coords เป็น "พิกัด" · กล่อง/ปุ่ม ข้อมูลอากาศยาน เปลี่ยนเป็น Aircraft',/พิกัด$/.test(a.co)&&a.mb==='Aircraft'&&a.ph==='Aircraft'&&a.h2==='Aircraft'&&!a.old,a);
 await p.evaluate(()=>{if(!M.mac)$('mb').click()});await W(300);const x0=await p.evaluate(()=>{const b=$('macx').getBoundingClientRect();return{w:b.width,h:b.height}});await p.tap('#macx');await W(300);
 const x1=await p.evaluate(()=>({mac:M.mac,d:getComputedStyle($('mac')).display}));
 t('T28 b โหมดบิน: กล่อง Aircraft มีปุ่ม ✕ (≥ 44 px) แตะแล้วปิดกล่อง',x0.w>=44&&x0.h>=44&&!x1.mac&&x1.d==='none',{x0,x1});
 await p.evaluate(()=>{DB.MK.length=0;localStorage.removeItem('heliMarks');localStorage.removeItem('heliMarkN');window.__mlp={on:MLP.on,la:MLP.la,lo:MLP.lo};MLP.on=false});
 await p.tap('#flyZ [data-fk="mark"]');await W(200);const m0=await p.evaluate(()=>DB.MK.length);
 await p.evaluate(()=>{MLP.on=true;MLP.la=13.9;MLP.lo=100.6});await p.tap('#flyZ [data-fk="mark"]');await W(150);await p.evaluate(()=>{MLP.la=14.0});await p.tap('#flyZ [data-fk="mark"]');await W(200);
 const m1=await p.evaluate(()=>{const g=e=>e.getBoundingClientRect(),mk=g(document.querySelector('#flyZ [data-fk="mark"]')),un=g(document.querySelector('#flyZ [data-fk="un"]'));return{n:DB.MK.map(x=>x.n),la:DB.MK.map(x=>x.la),ls:JSON.parse(localStorage.getItem('heliMarks')||'[]').length,above:mk.bottom<=un.top,sz:mk.width>=56&&mk.height>=56,chip:!!$('c_MK')&&$('c_MK').checked,cnt:$('cn_MK').textContent}});
 const lit=await p.evaluate(async()=>{const b=document.querySelector('#flyZ [data-fk="mark"]'),bg=()=>getComputedStyle(b).backgroundColor;await new Promise(r=>setTimeout(r,800));const idle=bg();MLP.la=13.95;b.click();const on=bg();await new Promise(r=>setTimeout(r,900));const off=bg();DB.MK.pop();try{localStorage.setItem('heliMarks',JSON.stringify(DB.MK));localStorage.setItem('heliMarkN','2')}catch(e){}return{idle,on,off}});
 t('T28 c2 b2 ปุ่ม MARK ไม่ติดไฟตลอด — สีส้มเฉพาะตอนกด/สร้างจุด แล้วดับเอง',lit.idle!=='rgb(230, 81, 0)'&&lit.on==='rgb(230, 81, 0)'&&lit.off===lit.idle,lit);
 t('T28 c ปุ่ม MARK (เหนือ Undo, ≥ 56 px) สร้าง Mark 1, Mark 2 ตามลำดับที่ตำแหน่งปัจจุบัน เก็บในเครื่อง · ไม่มีตำแหน่งไม่สร้าง',m0===0&&m1.n.join()==='Mark 1,Mark 2'&&m1.la.join()==='13.9,14'&&m1.ls===2&&m1.above&&m1.sz&&m1.chip&&m1.cnt==='2',{m0,m1});
 await p.tap('#flyT [data-fk="menu"]');await W(200);const mt=await p.evaluate(()=>[...document.querySelectorAll('#flyM [data-fm]')].map(b=>b.dataset.fm+':'+b.textContent));
 t('T28 d Menu มี Marks / Download map/TAWS / Manual',['mk:🚩 Marks (2)','dl:📥 Download map/TAWS','man:📖 Manual'].every(k=>mt.includes(k)),mt);
 await p.tap('[data-fm="mk"]');await W(200);await p.fill('#flyMk [data-mn="0"]','LZ ALPHA');await p.press('#flyMk [data-mn="0"]','Enter');await W(150);
 await p.tap('#flyMk [data-mx="1"]');await W(100);const n1=await p.evaluate(()=>DB.MK.length);await p.tap('#flyMk [data-mx="1"]');await W(200);
 const r=await p.evaluate(()=>({n:DB.MK.map(x=>x.n),ls:JSON.parse(localStorage.getItem('heliMarks')).map(x=>x.n)}));await p.tap('#flyMk [data-fx]');
 await p.evaluate(()=>{MLP.la=14.1});await p.tap('#flyZ [data-fk="mark"]');await W(200);const nx=await p.evaluate(()=>DB.MK.map(x=>x.n).join());
 const sr=await p.evaluate(async()=>{const i=document.querySelector('#mpt .pt input.nm')||null;return DB.MK.some(x=>x.n==='LZ ALPHA')});
 t('T28 e หน้าต่าง Marks: เปลี่ยนชื่อ · ลบต้องแตะยืนยัน 2 ครั้ง · Mark ถัดไปนับต่อ (Mark 3)',n1===2&&r.n.join()==='LZ ALPHA'&&r.ls.join()==='LZ ALPHA'&&nx==='LZ ALPHA,Mark 3'&&sr,{n1,r,nx});
 await p.evaluate(()=>{window.__dl=0;$('twdl').addEventListener('click',()=>window.__dl++,true)});await p.tap('#flyT [data-fk="menu"]');await W(200);await p.tap('[data-fm="dl"]');await W(300);
 const dl=await p.evaluate(()=>({n:__dl,omd:!!$('omd')&&!$('omd').hidden}));await p.evaluate(()=>{if($('omd'))$('omd').hidden=true});
 await p.tap('#flyT [data-fk="menu"]');await W(200);await p.tap('[data-fm="man"]');await W(400);const mn=await p.evaluate(()=>{const v=$('mnv'),f=v&&v.querySelector('iframe');return{open:!!v,src:f?f.getAttribute('src'):''}});await p.evaluate(()=>{const x=$('mnx');if(x)x.click()});
 t('T28 f Menu → Download map/TAWS เปิดหน้าต่างดาวน์โหลด · Menu → Manual เปิดคู่มือในกรอบซ้อน (docs/manual.html)',dl.n===1&&dl.omd&&mn.open&&mn.src==='docs/manual.html',{dl,mn});
 await p.evaluate(()=>{DB.MK.length=0;localStorage.removeItem('heliMarks');localStorage.removeItem('heliMarkN');MLP.on=__mlp.on;MLP.la=__mlp.la;MLP.lo=__mlp.lo;drawMap(false)})}
// v4.7.7 b3: My position ย้ายไปคอลัมน์ขวาเหนือ MARK · ปุ่ม SAR (รูปแบบ / เส้นทาง / พื้นที่ SAR เหมือนเมนูแผนที่เต็มจอ)
{const W=n=>p.waitForTimeout(n);
 const a=await p.evaluate(()=>{const g=e=>e.getBoundingClientRect(),me=document.querySelector('#flyZ [data-fk="me"]'),mk=document.querySelector('#flyZ [data-fk="mark"]'),tb=[...document.querySelectorAll('#flyT [data-fk]')].map(b=>b.dataset.fk);
  return{me:!!me&&g(me).bottom<=g(mk).top&&g(me).width>=56,inT:tb.includes('me'),sar:tb[8]==='sar',lab:document.querySelector('#flyT [data-fk="sar"]').textContent.trim()}});
 t('T29 v4.7.7 b3 My position อยู่คอลัมน์ขวาเหนือ MARK (≥ 56 px) · ช่องเดิมเป็นปุ่ม SAR',a.me&&!a.inT&&a.sar&&/SAR$/.test(a.lab),a);
 await p.tap('#flyT [data-fk="sar"]');await W(300);
 const w=await p.evaluate(()=>{const S=$('flySar'),h=[...S.querySelectorAll('.sarh')].map(e=>e.textContent),sg=[...S.querySelectorAll('[data-sg]')].map(b=>b.dataset.sg+':'+b.textContent),full=[...document.querySelectorAll('.mc2 .dd')].filter(d=>/เส้นทางค้นหา|พื้นที่ SAR/.test(d.querySelector('.ddb').textContent)).flatMap(d=>[...d.querySelectorAll('[data-g]')].map(b=>b.dataset.g+':'+b.textContent.trim()));return{vis:!S.hidden,h,sg,full,sp:!!S.querySelector('[data-sp]')}});
 t('T29 b ปุ่ม SAR เปิดหน้าต่าง 1 รูปแบบ SAR · 2 เส้นทาง SAR · 3 พื้นที่ SAR — เมนูย่อยตรงกับแผนที่เต็มจอ',w.vis&&w.h.join('|')==='1. รูปแบบ SAR|2. เส้นทาง SAR|3. พื้นที่ SAR'&&w.sp&&w.sg.join()===w.full.join()&&w.sg.length===3,w);
 const s0=await p.evaluate(()=>!!M.sarp);await p.tap('#flySar [data-sp]');await W(400);
 const s1=await p.evaluate(()=>({sarp:!!M.sarp,vis:getComputedStyle($('msar')).display!=='none',lit:document.querySelector('#flyT [data-fk="sar"]').classList.contains('on'),closed:$('flySar').hidden}));
 await p.evaluate(()=>{if(M.sarp)sarShow(false)});
 await p.tap('#flyT [data-fk="sar"]');await W(300);await p.tap('#flySar [data-sg="sr-list"]');await W(400);const l1=await p.evaluate(()=>$('lbs')&&$('lbs').classList.contains('on'));await p.evaluate(()=>{try{$('lbs').classList.remove('on')}catch(e){}});
 await p.tap('#flyT [data-fk="sar"]');await W(300);await p.tap('#flySar [data-sg="sa-list"]');await W(400);const l2=await p.evaluate(()=>$('lba')&&$('lba').classList.contains('on'));await p.evaluate(()=>{try{$('lba').classList.remove('on')}catch(e){}});
 t('T29 c แตะ รูปแบบ SAR เปิดแผง SAR (ปุ่ม SAR ติดไฟ) · เส้นทาง SAR → รายการ · พื้นที่ SAR → รายการ เปิดกล่องเดียวกับแผนที่เต็มจอ',!s0&&s1.sarp&&s1.vis&&s1.lit&&s1.closed&&l1&&l2,{s0,s1,l1,l2})}
// v4.7.7 b4: Route → New Route / Saved Route / Clear · TAWS → TAWS / FLTA
{const W=n=>p.waitForTimeout(n);
 await p.tap('#flyT [data-fk="rrt"]');await W(300);
 const r=await p.evaluate(()=>({vis:!$('flyPk').hidden,b:[...document.querySelectorAll('#flyPk [data-pr]')].map(x=>x.textContent.trim())}));
 await p.evaluate(()=>{pts.length=0;pts.push({name:"AAA",lat:"14.0",lon:"100.3"},{name:"BBB",lat:"14.3",lon:"100.6"});drawPts();calc();render()});
 await p.tap('#flyPk [data-pr="cl-rt"]');await W(200);const c1=await p.evaluate(()=>({txt:document.querySelector('#flyPk [data-pr="cl-rt"]').textContent,open:!$("flyPk").hidden,n:pts.filter(q=>q.name).length}));
 await p.tap('#flyPk [data-pr="cl-rt"]');await W(300);const c2=await p.evaluate(()=>({n:pts.filter(q=>q.name).length,closed:$('flyPk').hidden}));
 await p.tap('#flyT [data-fk="rrt"]');await W(300);await p.tap('#flyPk [data-pr="rt-new"]');await W(400);const nw=await p.evaluate(()=>({mpt:!!M.mpt,closed:$('flyPk').hidden}));await p.evaluate(()=>{try{mptShow(false)}catch(e){}});
 t('T30 v4.7.7 b4 ปุ่ม Route มีเมนูย่อย New Route / Saved Route / Clear · Clear ต้องยืนยันเมื่อยังไม่บันทึก · New Route เปิดกล่องจุดพิกัด',r.vis&&r.b.length===4&&/New Route/.test(r.b[0])&&/Saved Route/.test(r.b[1])&&/GPX/.test(r.b[2])&&/Clear/.test(r.b[3])&&c1.open&&c1.n===2&&/ยืนยัน/.test(c1.txt)&&c2.n===0&&c2.closed&&nw.mpt&&nw.closed,{r,c1,c2,nw});
 await p.evaluate(()=>{if(TW.on)$('twb').click();if(TW.fl)flSet({fl:false})});await W(200);
 await p.tap('#flyT [data-fk="taws"]');await W(300);const t0=await p.evaluate(()=>[...document.querySelectorAll('#flyPk [data-pt]')].map(x=>x.textContent.trim()));
 await p.tap('#flyPk [data-pt="taws"]');await W(300);await p.tap('#flyPk [data-pt="fl"]');await W(300);
 const t1=await p.evaluate(()=>({tw:!!TW.on,fl:!!TW.fl,b:[...document.querySelectorAll('#flyPk [data-pt]')].map(x=>x.textContent.trim()+(x.classList.contains('on')?'*':'')),open:!$('flyPk').hidden,lit:document.querySelector('#flyT [data-fk="taws"]').classList.contains('on')}));
 await p.tap('#flyPk [data-pt="taws"]');await W(200);await p.tap('#flyPk [data-pt="fl"]');await W(200);const t2=await p.evaluate(()=>({tw:!!TW.on,fl:!!TW.fl}));await p.tap('#flyPk [data-fx]');
 t('T30 b ปุ่ม TAWS มีเมนูย่อย TAWS / FLTA เปิด/ปิดแยกกัน แสดงสถานะ On/Off (ปุ่ม TAWS ติดไฟเมื่อ TAWS เปิด)',t0.slice(0,2).join()==='⛰ TAWS: Off,⚠ FLTA: Off'&&t1.tw&&t1.fl&&t1.b.slice(0,2).join()==='⛰ TAWS: On*,⚠ FLTA: On*'&&t1.open&&t1.lit&&!t2.tw&&!t2.fl,{t0,t1,t2})}
 // v4.7.9 b2: หน้าต่าง TAWS มี Terrain profile ใต้ปุ่ม TAWS · Route มี GPX → Import / Export
 {await p.tap('#flyT [data-fk="taws"]');await W(300);
  const g=await p.evaluate(()=>{const a=document.querySelector('#flyPk [data-pt="taws"]').getBoundingClientRect(),b=document.querySelector('#flyPk [data-pt="prf"]').getBoundingClientRect();return{under:Math.abs(a.left-b.left)<2&&b.top>a.bottom-1,pf:!!TW.pf}});
  await p.tap('#flyPk [data-pt="prf"]');await W(300);const g2=await p.evaluate(()=>({pf:!!TW.pf,txt:document.querySelector('#flyPk [data-pt="prf"]').textContent}));
  await p.tap('#flyPk [data-pt="prf"]');await W(300);const g3=await p.evaluate(()=>!!TW.pf);await p.tap('#flyPk [data-fx]');await W(150);
  await p.evaluate(()=>{window.__gp={imp:0,exp:0};$('fimp').click=()=>{window.__gp.imp++};$('gpx').onclick=()=>{window.__gp.exp++}});
  await p.tap('#flyT [data-fk="rrt"]');await W(300);await p.tap('#flyPk [data-pr="gpx"]');await W(200);
  const w=await p.evaluate(()=>({open:!$('flyPk').hidden,b:[...document.querySelectorAll('#flyPk [data-pg]')].map(x=>x.textContent.trim())}));
  await p.tap('#flyPk [data-pg="imp"]');await W(200);const c1=await p.evaluate(()=>({...window.__gp,closed:$('flyPk').hidden}));
  await p.tap('#flyT [data-fk="rrt"]');await W(300);await p.tap('#flyPk [data-pr="gpx"]');await W(200);await p.tap('#flyPk [data-pg="exp"]');await W(200);const c2=await p.evaluate(()=>({...window.__gp,closed:$('flyPk').hidden}));
  await p.tap('#flyT [data-fk="rrt"]');await W(300);await p.tap('#flyPk [data-pr="gpx"]');await W(200);await p.tap('#flyPk [data-pg="back"]');await W(200);const bk=await p.evaluate(()=>!!document.querySelector('#flyPk [data-pr="rt-new"]'));await p.tap('#flyPk [data-fx]');
  await p.evaluate(()=>{delete $('fimp').click;$('gpx').onclick=()=>exportGpx($("rname").value.trim()||"route",calcData.valid,sarFlat())});
  t('T43 v4.7.9 b2 TAWS: ปุ่ม Terrain profile อยู่ใต้ปุ่ม TAWS เปิด/ปิดได้ · Route → GPX: Import (เลือกไฟล์) / Export / ◀ Route',g.under&&g2.pf!==g.pf&&/Terrain profile: (On|Off)/.test(g2.txt)&&g3===g.pf&&w.open&&/Import/.test(w.b[0])&&/Export/.test(w.b[1])&&c1.imp===1&&c1.closed&&c2.exp===1&&c2.closed&&bk,{g,g2,g3,w,c1,c2,bk})}
// v4.7.7 b5: ลากกล่องรายละเอียดจุด · ☰ มุมบนขวา · ซ่อนแถบล่างขณะแก้เส้นทาง · ซ่อนเมนูไม้บรรทัด
{const W=n=>p.waitForTimeout(n);
 await p.evaluate(()=>{if(CURON){const c=$('fcur');c.checked=false;c.dispatchEvent(new Event('change',{bubbles:true}))}const k=CATS.find(c=>DB[c.k]&&DB[c.k].length).k,t=DB[k][0],q=wp(t.la,t.lo,M.z);M.cx=q[0];M.cy=q[1];M.pop={c:k,i:0};drawMap(false)});await W(300);
 const r0=await p.evaluate(()=>{const r=$('pop').getBoundingClientRect(),t=$('flyT').getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,below:r.top>=t.bottom}});
 const cdp=await ctx.newCDPSession(p);const TE=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:7}]});
 await TE('touchStart',r0.x+r0.w/2,r0.y+12);for(let i=1;i<=8;i++)await TE('touchMove',r0.x+r0.w/2-i*25,r0.y+12+i*30);await TE('touchEnd');await W(300);
 const r1=await p.evaluate(()=>{const r=$('pop').getBoundingClientRect();return{x:r.left,y:r.top,vis:!$('pop').hidden}});await p.evaluate(()=>drawMap(false));await W(200);const r2=await p.evaluate(()=>{const r=$('pop').getBoundingClientRect();return{x:r.left,y:r.top}});
 t('T31 v4.7.7 b5 โหมดบิน: กล่องรายละเอียดจุดอยู่ใต้แถวปุ่ม ลากย้ายด้วยนิ้วได้ และคงตำแหน่งเมื่อแผนที่วาดใหม่',r0.below&&r1.vis&&Math.abs(r1.x-(r0.x-200))<4&&Math.abs(r1.y-(r0.y+240))<4&&Math.abs(r2.x-r1.x)<1&&Math.abs(r2.y-r1.y)<1,{r0,r1,r2});
 await p.evaluate(()=>{M.pop=null;drawMap(false)});await W(400);
 await p.tap('#flyT [data-fk="hide"]');await W(300);const rb=await p.evaluate(()=>{const r=$('flyR').getBoundingClientRect(),m=mp.getBoundingClientRect();return{vis:!$('flyR').hidden,right:m.right-r.right,top:r.top-m.top}});await p.tap('#flyR');await W(300);
 t('T31 b ซ่อนเมนูแล้วปุ่ม ☰ อยู่มุมบนขวา',rb.vis&&rb.right<=20&&rb.top<=24,rb);
 await p.evaluate(()=>{pts.length=0;for(let i=0;i<9;i++)pts.push({name:'P'+i,lat:String(13.8+i*0.05),lon:String(100.2+i*0.05)});drawPts();calc();render()});
 await p.tap('#fbW');await W(400);const e1=await p.evaluate(()=>({b:$('flyB').hidden,ed:mp.classList.contains('flyed'),fb:getComputedStyle(mp).getPropertyValue('--flyb').trim(),mb:$('mpt').getBoundingClientRect().bottom,h:mp.getBoundingClientRect().bottom}));
 await p.evaluate(()=>mptShow(false));await W(300);const e2=await p.evaluate(()=>({b:$('flyB').hidden,ed:mp.classList.contains('flyed')}));
 t('T31 c เปิดกล่องจุดพิกัดในเส้นทาง → ซ่อนแถบ NAV TO/DIS/BRG ด้านล่าง (กล่องใช้พื้นที่ถึงล่างจอ) · ปิดกล่องแล้วแถบกลับมา',e1.b&&e1.ed&&e1.fb==='0px'&&e1.mb<=e1.h&&!e2.b&&!e2.ed,{e1,e2});
 await p.tap('#flyT [data-fk="rul"]');await W(300);const h0=await p.evaluate(()=>!!$('rlhide')&&$('rlhide').offsetParent!==null);await p.tap('#rlhide');await W(200);
 const m1=await p.evaluate(()=>({min:$('rulb').classList.contains('rmin'),h:$('rulb').getBoundingClientRect().height,mini:$('rlmini').textContent,on:!!(M.rul&&M.rul.on)}));await p.tap('#rlmini');await W(200);
 const m2=await p.evaluate(()=>!$('rulb').classList.contains('rmin'));await p.tap('#rlhide');await W(100);await p.tap('#flyT [data-fk="rul"]');await W(300);await p.tap('#flyT [data-fk="rul"]');await W(300);const m3=await p.evaluate(()=>!$('rulb').classList.contains('rmin'));await p.tap('#flyT [data-fk="rul"]');await W(200);
 t('T31 d กล่องไม้บรรทัดมีปุ่ม ซ่อนเมนู → ย่อเป็นป้าย 📏 (ไม้บรรทัดยังทำงาน) แตะป้ายแสดงกลับ · เปิดไม้บรรทัดใหม่เริ่มแบบเต็ม',h0&&m1.min&&m1.h<70&&/📏/.test(m1.mini)&&m1.on&&m2&&m3,{h0,m1,m2,m3})}
// v4.7.7 b6: ซ่อนแถบ NAV TO · กล่อง GPS กลางจอ/ลากได้ · FLT ALTITUDE · ไม้บรรทัด + และกดค้างย้ายจุด
{const W=n=>p.waitForTimeout(n);const cdp=await ctx.newCDPSession(p);const TE=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:8}]});
 const hb=await p.evaluate(()=>{const r=$('fbHide').getBoundingClientRect(),br=$('fbB').parentNode.getBoundingClientRect();return r.right>=br.right-4&&r.top<=br.top+4});
 await p.tap('#fbHide');await W(300);const s1=await p.evaluate(()=>({B:$('flyB').hidden,sb:!$('flySb').hidden,fb:getComputedStyle(mp).getPropertyValue('--flyb').trim()}));
 await p.tap('#flySb');await W(300);const s2=await p.evaluate(()=>({B:$('flyB').hidden,sb:!$('flySb').hidden}));
 t('T32 v4.7.7 b6 โหมดบิน: ปุ่มซ่อนแถบ NAV TO อยู่มุมขวาบนของช่อง BRG · ซ่อนแล้วมีปุ่ม ▴ NAV เรียกกลับ',hb&&s1.B&&s1.sb&&s1.fb==='0px'&&!s2.B&&!s2.sb,{hb,s1,s2});
 await p.evaluate(()=>{if(MLP.on)gpsOff()});await p.tap('#flyZ [data-fk="me"]');await W(300);
 const g1=await p.evaluate(()=>{const r=$('mlmenu').getBoundingClientRect(),m=mp.getBoundingClientRect();return{vis:!$('mlmenu').hidden,cy:(r.top+r.height/2-m.top)/m.height,cx:Math.abs(r.left+r.width/2-(m.left+m.width/2))}});
 const hr=await p.evaluate(()=>{const r=document.querySelector('#mlmenu .mlh').getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});
 await TE('touchStart',hr[0],hr[1]);for(let i=1;i<=6;i++)await TE('touchMove',hr[0]-i*10,hr[1]+i*20);await TE('touchEnd');await W(200);
 const g2=await p.evaluate(()=>{const r=document.querySelector('#mlmenu .mlh').getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});
 t('T32 b กด My position ตอน GPS ปิด → กล่องเลือก GPS แสดงกลางจอ และลากย้ายได้',g1.vis&&g1.cy>0.25&&g1.cy<0.6&&g1.cx<20&&Math.abs(g2[0]-(hr[0]-60))<4&&Math.abs(g2[1]-(hr[1]+120))<4,{g1,hr,g2});
 await p.evaluate(()=>{$('mlmenu').hidden=true});
 await p.evaluate(()=>{const b=document.querySelector('#flyT [data-fk="taws"]');b.click()});await W(300);const a0=await p.evaluate(()=>({t:/FLT ALTITUDE/.test($('flyPk').innerText),alt:TW.alt}));
 await p.tap('#flyPk [data-pa="100"]');await W(200);const a1=await p.evaluate(()=>({tw:TW.alt,inp:$('pkAlt').value}));await p.tap('#flyPk [data-pa="-100"]');await W(200);const a2=await p.evaluate(()=>TW.alt);
 await p.fill('#pkAlt','2500');await p.press('#pkAlt','Enter');await W(200);const a3=await p.evaluate(()=>TW.alt);await p.fill('#pkAlt',String(a0.alt));await p.press('#pkAlt','Enter');await p.tap('#flyPk [data-fx]');
 t('T32 c เมนูย่อย TAWS มี FLT ALTITUDE ปรับ ±100 ft และพิมพ์ค่าได้ (ใช้ค่าเดียวกับความสูงบินของ TAWS)',a0.t&&a1.tw===a0.alt+100&&a1.inp===String(a0.alt+100)&&a2===a0.alt&&a3===2500,{a0,a1,a2,a3});
 await p.evaluate(()=>{if(!CURON){const c=$('fcur');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))}});
 await p.tap('#flyT [data-fk="rul"]');await W(300);await p.evaluate(()=>{$('rlm').click()});await W(100);await p.tap('#rlhide');await W(200);
 await p.evaluate(()=>{M.cx+=120;drawMap(false)});await p.tap('#rlplus');await W(200);await p.evaluate(()=>{M.cx+=120;drawMap(false)});await p.tap('#rlplus');await W(200);
 const r1=await p.evaluate(()=>({n:M.rul.pts.length,plus:!!$('rlplus').offsetParent,mini:$('rlmini').textContent}));
 const pt=await p.evaluate(()=>{const q=wp(M.rul.pts[0].la,M.rul.pts[0].lo,M.z),r=mp.getBoundingClientRect();return[q[0]-(M.cx-mp.clientWidth/2)+r.left,q[1]-(M.cy-mp.clientHeight/2)+r.top,M.rul.pts[0].la]});
 await TE('touchStart',pt[0],pt[1]);await W(500);for(let i=1;i<=5;i++)await TE('touchMove',pt[0],pt[1]+i*20);await TE('touchEnd');await W(200);
 const r2=await p.evaluate(()=>({n:M.rul.pts.length,la:M.rul.pts[0].la}));
 const cx0=await p.evaluate(()=>M.cx);const p1=await p.evaluate(()=>{const q=wp(M.rul.pts[1].la,M.rul.pts[1].lo,M.z),r=mp.getBoundingClientRect();return[q[0]-(M.cx-mp.clientWidth/2)+r.left,q[1]-(M.cy-mp.clientHeight/2)+r.top,M.rul.pts[1].la,M.rul.pts[1].lo]});
 await TE('touchStart',p1[0],p1[1]);for(let i=1;i<=5;i++)await TE('touchMove',p1[0]+i*15,p1[1]);await TE('touchEnd');await W(200);
 const r3=await p.evaluate(a=>({pan:M.cx!==a[0],same:M.rul.pts[1].la===a[1]&&M.rul.pts[1].lo===a[2]}),[cx0,p1[2],p1[3]]);
 await p.evaluate(()=>{M.rul.tch=Date.now();mp.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:200,clientY:500}))});await W(100);const r4=await p.evaluate(()=>M.rul.pts.length);
 t('T32 d ไม้บรรทัดย่อแล้วมีปุ่ม + เพิ่มจุดที่กลางจอ · กดค้างที่จุดแล้วลาก = ย้ายจุด (ไม่ลบ) · ปัดเร็วจากจุด = เลื่อนแผนที่',r1.n===3&&r1.plus&&r2.n===3&&r2.la<pt[2]-1e-4&&r3.pan&&r3.same&&r4===3,{r1,pt,r2,r3,r4});
 await p.evaluate(()=>{$('rlmini').click()});await W(100);await p.tap('#flyT [data-fk="rul"]');await W(200);await p.evaluate(()=>{if(CURON){const c=$('fcur');c.checked=false;c.dispatchEvent(new Event('change',{bubbles:true}))}})}
t('T20 ไม่มี JavaScript error',errs.length===0,errs);
console.log(`ผล: PASS ${pass} / FAIL ${fail} (${APP})`);await b.close();srv.close();process.exit(fail?1:0)})().catch(e=>{console.log('ERROR',e);srv.close();process.exit(1)});
