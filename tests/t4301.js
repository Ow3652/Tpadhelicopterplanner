// ตรวจหน้าตาหัวหน้าจอ v4.4.0: (ก) แถวบน: ลิงก์คู่มือ/ปุ่มแผนที่ออฟไลน์/ข้อความกรอกรหัส/ช่องรหัส/ชื่อ user อยู่แนวเดียวกัน
// (ข) iPad แนวตั้ง: ปุ่มแผนที่เต็มจออยู่ขวาสุดของแถวแท็บ ระดับเดียวกับแท็บ ขอบขวาตรงกับช่องรหัส และแท็บไม่ต้องเลื่อน (iPad Pro 11 และ iPad gen 9 กว้าง 810)
// (ค) แผงเมนูที่ซ่อนในแผนที่เต็มจอ: ลำดับปุ่ม เมนู → ย้อนกลับ → ทำซ้ำ → ✕
// ต้องเปิดเซิร์ฟเวอร์ที่พอร์ต 8765 ในโฟลเดอร์ที่มีไฟล์แอป (python -m http.server 8765) ชื่อไฟล์ตามตัวแปร FILE
const {chromium,devices}=require('playwright');
const FILE=process.env.FILE||'Tpad helicopter planner v4.7.7.html';
(async()=>{const b=await chromium.launch();let bad=0;const ck=(ok,...a)=>{if(!ok)bad++;console.log(ok?'PASS':'FAIL',...a)};
for(const [nm,dv,vp] of [['iPad Pro 11 แนวตั้ง',devices['iPad Pro 11'],null],['iPad gen 9 แนวตั้ง (810)',{...devices['iPad (gen 7)'],viewport:{width:810,height:1080}},null],['iPad Pro 11 แนวนอน',devices['iPad Pro 11 landscape'],null],['PC',null,{width:1280,height:800}],['มือถือ',devices['iPhone 13'],null]]){
 const c=await b.newContext(dv?{...dv}:{viewport:vp});await c.route(/tile|arcgis|openstreetmap|fonts\.g|script\.google|aviationweather|rainviewer|cartocdn/,r=>r.abort());
 await c.addInitScript("try{localStorage.setItem('heliMyKey','k1')}catch(e){}");
 const p=await c.newPage();await p.route(/script\.google\.com/,r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({ok:true,rows:[],routes:[],user:'somchai'})}));
 await p.goto('http://localhost:8765/'+encodeURIComponent(FILE));await p.waitForTimeout(2500);
 const m=await p.evaluate(()=>{const cy=e=>{const x=e.getBoundingClientRect();return x.y+x.height/2};const lab=document.querySelector('.tkey');
  let tx=null;for(const n of lab.childNodes){if(n.nodeType===3&&n.textContent.trim()){const rg=document.createRange();rg.selectNodeContents(n);tx=cy(rg)}}
  const fs=document.getElementById('fs0'),fb=fs.getBoundingClientRect(),fsv=fb.width>0,key=document.getElementById('mykey2').getBoundingClientRect(),tabs=document.querySelector('.tabs');
  const u=document.getElementById('myuser');
  return {mnl:cy(document.getElementById('mnl')),offb:cy(document.getElementById('offb')),text:tx,input:cy(document.getElementById('mykey2')),user:u&&!u.hidden&&u.getBoundingClientRect().width>0?cy(u):null,
   fsv,fsy:fsv?cy(fs):null,t1:cy(document.getElementById('t1')),fsR:fb.right,keyR:key.right,fsInTabs:!!fs.closest('.tabs'),tabsFit:tabs.scrollWidth<=tabs.clientWidth+1,
   mnlLeftOfKey:document.getElementById('mnl').getBoundingClientRect().right<=lab.getBoundingClientRect().left+1,order:['uiu','uir','uix'].map(i=>[...document.getElementById('uib').children].indexOf(document.getElementById(i)))}});
 const ref=m.input;const d=[m.mnl,m.offb,m.text,m.user].filter(x=>x!=null).map(x=>Math.abs(x-ref));
 const narrow=(dv?dv.viewport.width:vp.width)<500; // มือถือแคบมาก ปล่อยให้ขึ้นบรรทัดใหม่ได้
 if(!narrow){ck(Math.max(...d)<=1.5,nm,'แถวบน ลิงก์/ปุ่ม/ข้อความ/ช่องรหัส แนวเดียวกัน ต่างสูงสุด',Math.max(...d).toFixed(2));
 ck(m.mnlLeftOfKey,nm,'ลิงก์คู่มือ/ปุ่มแผนที่ออฟไลน์ อยู่ซ้ายของช่องกรอกรหัส/ชื่อ user')}else console.log('ข้าม (มือถือแคบ ขึ้นบรรทัดใหม่)',nm);
 ck(m.fsInTabs,nm,'ปุ่มแผนที่เต็มจออยู่ในแถวแท็บ');
 if(m.fsv){ck(Math.abs(m.fsy-m.t1)<=2.5,nm,'ปุ่มเต็มจอระดับเดียวกับแท็บ ต่าง',Math.abs(m.fsy-m.t1).toFixed(2));
  ck(Math.abs(m.fsR-m.keyR)<=3,nm,'ขอบขวาปุ่มเต็มจอตรงกับช่องรหัส',m.fsR.toFixed(0)+' vs '+m.keyR.toFixed(0));
  if(!narrow)ck(m.tabsFit,nm,'แท็บทั้งหมดอยู่ในจอ ไม่ต้องเลื่อน')}
 ck(m.fsv,nm,'ปุ่มแผนที่เต็มจอแสดงอยู่ (ทุกขนาดจอ)');
 ck(m.order[0]<m.order[1]&&m.order[1]<m.order[2],nm,'ลำดับปุ่มในเมนูเต็มจอ: ย้อนกลับ ทำซ้ำ ✕',m.order.join(','));
 if(dv&&dv.hasTouch){await p.evaluate(()=>{const m=document.getElementById('map');if(!m.classList.contains('full'))document.getElementById('fs').click()});await p.waitForTimeout(400);
  if(!(await p.evaluate(()=>document.getElementById('fit').getClientRects().length))){await p.click('text=เมนู');await p.waitForTimeout(400)}
  const hh=await p.evaluate(()=>['fit','fpb','rfm','sfb','mb','hun','hre','hui'].map(id=>{const e=document.getElementById(id);return e&&e.getClientRects().length?e.getBoundingClientRect().height:null}));
  const top=hh[0],rest=hh.slice(1).filter(x=>x!=null);
  ck(top!=null&&rest.length>0&&rest.every(x=>Math.abs(x-top)<=2),nm,'แถวที่สองเมนูเต็มจอ (ชั้นข้อมูล…ซ่อนเมนู) สูงเท่าแถวบน (v4.4.1 b2)',top+' vs '+rest.map(x=>x.toFixed(0)).join(','))
  if(!narrow){await p.waitForTimeout(300);const ov=await p.evaluate(()=>{const bs=[...document.querySelectorAll('.mc .mr>*,.mc2>*')].filter(e=>e.id&&e.getClientRects().length);
   const cov=bs.filter(e=>{const q=e.getBoundingClientRect(),h=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);return !(h&&(h===e||e.contains(h)))}).map(e=>e.id);
   const c=document.getElementById('cur'),cr=c.hidden?null:c.getBoundingClientRect();const hit=cr?bs.filter(e=>{const q=e.getBoundingClientRect();return q.left<cr.right&&q.right>cr.left&&q.top<cr.bottom&&q.bottom>cr.top}).map(e=>e.id):[];return cov.concat(hit)});
   ck(ov.length===0,nm,'ปุ่มเมนูเต็มจอไม่ถูกกล่องข้อมูล/กล่องพิกัดทับ (v4.4.1 b2)',ov.join(' '))}}
 await c.close()}
await b.close();process.exit(bad?1:0)})();
