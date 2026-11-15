const {chromium,devices}=require('playwright');(async()=>{
const b=await chromium.launch();const c=await b.newContext({...devices['iPad Pro 11'],viewport:{width:1194,height:834},hasTouch:true});
const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:12});
await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.3.html'));await p.waitForTimeout(1500);
await p.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(Math.round(e.duration)))).observe({entryTypes:['longtask']})});
await p.evaluate(()=>{pts=[{name:'BKK',lat:'1353.62N',lon:'10035.77E'},{name:'HHN',lat:'1238.06N',lon:'09957.07E'},{name:'PKT',lat:'0806.80N',lon:'09819.00E'},{name:'KRT',lat:'1456.10N',lon:'10204.36E'}];drawPts()});
await p.tap('#fs');await p.waitForTimeout(500);await p.tap('#uis');await p.tap('#fib');await p.tap('#simbtn');await p.tap('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo();const L=navList();directTo("",L.b[1])});
for(const sc of [1,10,20]){await p.tap('[data-sc="'+sc+'"]');await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>{const t0=performance.now();return new Promise(res=>setTimeout(()=>res(Math.round(performance.now()-t0)),0))});
 console.log('scale',sc,'timeout latency ms',r,'longtasks',JSON.stringify(await p.evaluate(()=>window.__lt.slice(-8))))}
// responsiveness: tap pause
const t0=Date.now();await p.tap('#smrun');console.log('tap pause took',Date.now()-t0,await p.evaluate(()=>SIM.run));
console.log(er);await b.close()})()
