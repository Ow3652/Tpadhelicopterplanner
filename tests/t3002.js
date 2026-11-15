const {chromium,devices}=require('playwright');(async()=>{
const b=await chromium.launch();
for(const rate of [1,4]){
const c=await b.newContext({viewport:{width:1194,height:834}});const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate});
const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.4.html'));await p.waitForTimeout(1500);
await p.evaluate(()=>{pts=[{name:'BKK',lat:'1353.62N',lon:'10035.77E'},{name:'HHN',lat:'1238.06N',lon:'09957.07E'},{name:'PKT',lat:'0806.80N',lon:'09819.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(500);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo();const L=navList();directTo("",L.b[1])});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{let dm=0,hs=0,nl=0;const f=(n,k)=>{const o=window[n];window[n]=function(){k();return o.apply(this,arguments)}};f("drawMap",()=>dm++);f("hsiUpd",()=>hs++);f("nlUpd",()=>nl++);return new Promise(res=>setTimeout(()=>res({dm,hs,nl,c:Math.round(SIMQ.c),dmc:Math.round(SIMQ.dm)}),4000))});
console.log('cpu x'+rate,'per sec: map',(r.dm/4).toFixed(1),'hsi',(r.hs/4).toFixed(1),'fms',(r.nl/4).toFixed(1),'| tick ms',r.c,'draw ms',r.dmc,er);await c.close()}
await b.close()})()
