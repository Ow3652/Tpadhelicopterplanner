const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.8.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1406.00N',lon:'10108.00E'},{name:'D',lat:'1400.00N',lon:'10108.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');
await p.fill('#smspd','0');await p.press('#smspd','Enter');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd()});
// start off the line: 1 NM east of A->B, then NAV to B
await p.evaluate(()=>{SIM.la=14.0;SIM.lo=101.0+1/60/Math.cos(14*Math.PI/180);SIM.hd=0});
await p.evaluate(()=>{MLP.la=SIM.la;MLP.lo=SIM.lo;MLP.ll={la:SIM.la,lo:SIM.lo};navGo();const L=navList();directTo("",L.b[1])});
await p.fill('#smspd','100');await p.press('#smspd','Enter');await p.click('[data-sc="4"]');
const xt=()=>p.evaluate(()=>{const A=legFrom(),T=DT.t,s={la:SIM.la,lo:SIM.lo};const R=3440.065,r=Math.PI/180;const lp=leg(T,s),c=leg(A,T).brg;return +(lp.d*Math.sin(((lp.brg-c+540)%360-180)*r)).toFixed(3)});
let rows=[];
for(let i=0;i<120;i++){await p.waitForTimeout(250);const t=await p.evaluate(()=>DT.t.n+' mode '+SIM.mode);if(i%12==0)rows.push(t+' xte '+await xt()+' legfrom '+await p.evaluate(()=>JSON.stringify(legFrom())))}
console.log(rows.join('\n'));
console.log('hsi course shown',await p.evaluate(()=>HSIAC),er);await b.close()})()
