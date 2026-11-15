const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();
async function run(cLat,cLon,distBefore,gs){const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.7.html'));await p.waitForTimeout(700);
await p.evaluate(([la,lo])=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:la,lon:lo},{name:'D',lat:'1420.00N',lon:'10120.00E'}];drawPts()},[cLat,cLon]);
await p.click('#fs');await p.waitForTimeout(200);await p.click('#uis');await p.click('#fib');
await p.evaluate(([d,gs])=>{MLP.on=true;MLP.la=14.1-d/60;MLP.lo=101;MLP.ll={la:MLP.la,lo:MLP.lo};MLP.hd=0;MLP.sp=gs/1.943844;RMION=true;HSION=true;instUpd();navGo();const L=navList();directTo("",L.b[1])},[distBefore,gs]);
for(let i=0;i<6;i++){await p.evaluate(()=>{MLP.t=Date.now();navText()});await p.waitForTimeout(100)}
console.log('C',cLat,cLon,'dist',distBefore,'gs',gs,'→ target',await p.evaluate(()=>DT&&DT.t&&DT.t.n),er);await p.close()}
await run('1406.00N','10108.00E',0.35,120); // 90° turn, lead .64 → advance
await run('1412.00N','10100.00E',0.15,120); // straight, thr .05 → stay B
await run('1412.00N','10100.00E',0.03,120); // straight, within .05 → advance
await run('1406.00N','10108.00E',0.35,60);  // 90° at 60kt lead .32 → advance? 0.35>0.32 stay
await b.close()})()
