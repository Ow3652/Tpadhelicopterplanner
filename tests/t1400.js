const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.4.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1406.00N',lon:'10108.00E'},{name:'D',lat:'1400.00N',lon:'10108.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');
await p.evaluate(()=>{navGo();const L=navList();directTo("",L.b[1])});await p.waitForTimeout(500);
const o=()=>p.evaluate(()=>DT.orig.map(q=>q.name).join(',')+' | pts '+pts.map(q=>q.name).join(','));
console.log('start',await o());
await p.evaluate(()=>{pts.splice(3,0,{name:'X1',lat:'1408.00N',lon:'10104.00E'});drawPts()});await p.waitForTimeout(300);console.log('insert B-C',await o());
await p.evaluate(()=>{pts.splice(1,0,{name:'X2',lat:'1403.00N',lon:'10102.00E'});drawPts()});await p.waitForTimeout(300);console.log('insert MYPOS-B',await o());
await p.evaluate(()=>{const q=pts.find(x=>x.name==='C');q.lat='1410.00N';drawPts()});await p.waitForTimeout(300);console.log('move C',await o());
console.log(await p.evaluate(()=>JSON.stringify(DT.orig.map(q=>q.lat))));
console.log(er);await b.close()})()
