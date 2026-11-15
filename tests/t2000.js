const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();
async function run(tl,tn){const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.0.html'));await p.waitForTimeout(700);
await p.evaluate(([la,lo])=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'T',lat:la,lon:lo}];drawPts()},[tl,tn]);
await p.click('#fs');await p.waitForTimeout(200);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.fill('#smspd','120');await p.press('#smspd','Enter');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo();const L=navList();directTo("",L.b[1])});await p.waitForTimeout(600);
await p.evaluate(()=>{SIM.run=false});
const r=await p.evaluate(()=>{const A=dtLL(DT.a,$("fmt").value);return +(leg({la:SIM.la,lo:SIM.lo},A).d*3600/120).toFixed(1)});
await p.evaluate(()=>{const i=pts.findIndex(q=>q.name==='T');directTo("",pts[i])});
const g=await p.evaluate(()=>{const A=dtLL(DT.a,$("fmt").value);return +(leg({la:SIM.la,lo:SIM.lo},A).d*3600/120).toFixed(1)});
console.log('target',tl,tn,'lead s',g,er);await p.close()}
await run('1412.00N','10100.20E'); // small angle
await run('1406.00N','10110.00E'); // ~90
await run('1400.00N','10100.00E'); // behind 180 (distance 0 start) 
await run('1410.00N','10110.00E'); // ~45
await b.close()})()
