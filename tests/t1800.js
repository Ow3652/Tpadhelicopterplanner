const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.8.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1406.00N',lon:'10108.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo();const L=navList();directTo("",L.b[1])});await p.click('[data-sc="4"]');await p.waitForTimeout(1500);
const S=()=>p.evaluate(()=>JSON.stringify({m:SIM.mode,hold:SIM.hold,hd:Math.round(SIM.hd),hdg:SIM.hdg,crs:HSICM,t:DT&&DT.t&&DT.t.n}));
console.log('before',await S());
await p.evaluate(()=>hsiCrs(10));await p.waitForTimeout(1500);console.log('after +10',await S());
await p.evaluate(()=>hsiCrs(10));await p.waitForTimeout(800);console.log('after +10 again',await S());
await p.evaluate(()=>{$("hsicau").click()});await p.waitForTimeout(1500);console.log('AUTO',await S());
console.log(er);await b.close()})()
