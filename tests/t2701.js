const {chromium,devices}=require('playwright');(async()=>{
const b=await chromium.launch();const c=await b.newContext({...devices['iPad Pro 11'],viewport:{width:1194,height:834},hasTouch:true});
const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.3.html'));await p.waitForTimeout(1500);
await p.evaluate(()=>{pts=[{name:'BKK',lat:'1353.62N',lon:'10035.77E'},{name:'HHN',lat:'1238.06N',lon:'09957.07E'},{name:'PKT',lat:'0806.80N',lon:'09819.00E'}];drawPts()});
await p.tap('#fs');await p.waitForTimeout(500);await p.tap('#uis');await p.tap('#fib');await p.tap('#simbtn');await p.tap('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo();const L=navList();directTo("",L.b[1])});await p.waitForTimeout(1000);
const r=await p.evaluate(()=>{const T={};const w=(n)=>{const f=window[n];if(typeof f!=="function")return;window[n]=function(){const t=performance.now();const r=f.apply(this,arguments);T[n]=(T[n]||0)+performance.now()-t;T[n+"#"]=(T[n+"#"]||0)+1;return r}};["drawMap","nlUpd","hsiUpd","navText","gpsText","navFix","navUi","instUpd","calcAll","qrender"].forEach(w);return new Promise(res=>setTimeout(()=>res(T),3000))});
console.log(JSON.stringify(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,Math.round(v)]))));await b.close()})()
