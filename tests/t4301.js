// ตรวจแนวตั้งของแถวกรอกรหัส เทียบกับปุ่มแผนที่เต็มจอ (iPad แนวตั้ง/แนวนอน, PC, มือถือ) ต้องต่างกันไม่เกิน 1 พิกเซล
// ต้องเปิดเซิร์ฟเวอร์ที่พอร์ต 8765 ในโฟลเดอร์ที่มีไฟล์แอป (python -m http.server 8765) ชื่อไฟล์ตามตัวแปร FILE
const {chromium,devices}=require('playwright');
const FILE=process.env.FILE||'Tpad helicopter planner v4.3.0.html';
(async()=>{const b=await chromium.launch();let bad=0;
for(const [nm,dv,vp] of [['iPad Pro 11 แนวตั้ง',devices['iPad Pro 11'],null],['iPad Pro 11 แนวนอน',devices['iPad Pro 11 landscape'],null],['PC',null,{width:1280,height:800}],['มือถือ',devices['iPhone 13'],null]]){
 const c=await b.newContext(dv?{...dv}:{viewport:vp});await c.route(/tile|arcgis|openstreetmap|fonts\.g|script\.google|aviationweather|rainviewer|cartocdn/,r=>r.abort());
 await c.addInitScript("try{localStorage.setItem('heliMyKey','k1')}catch(e){}");
 const p=await c.newPage();await p.route(/script\.google\.com/,r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({ok:true,rows:[],routes:[],user:'somchai'})}));
 await p.goto('http://localhost:8765/'+encodeURIComponent(FILE));await p.waitForTimeout(2500);
 const m=await p.evaluate(()=>{const cy=e=>{const x=e.getBoundingClientRect();return x.y+x.height/2};const lab=document.querySelector('.tkey');
  let tx=null;for(const n of lab.childNodes){if(n.nodeType===3&&n.textContent.trim()){const rg=document.createRange();rg.selectNodeContents(n);tx=cy(rg)}}
  const fs=document.getElementById('fs0');const fsv=fs&&fs.getBoundingClientRect().width>0;
  return {fs:fsv?cy(fs):null,text:tx,input:cy(document.getElementById('mykey2')),user:(()=>{const u=document.getElementById('myuser');return u&&!u.hidden?cy(u):null})()}});
 const ref=m.fs!=null?m.fs:m.input;const d=[m.text,m.input,m.user].filter(x=>x!=null).map(x=>Math.abs(x-ref));const mx=Math.max(...d);
 const ok=mx<=1;if(!ok)bad++;console.log(ok?'PASS':'FAIL',nm,'ปุ่มแผนที่เต็มจอ='+(m.fs==null?'(ซ่อน)':m.fs.toFixed(1)),'ข้อความ='+m.text.toFixed(1),'ช่องรหัส='+m.input.toFixed(1),'ชื่อ='+(m.user==null?'-':m.user.toFixed(1)),'ต่างสูงสุด',mx.toFixed(2));await c.close()}
await b.close();process.exit(bad?1:0)})();
