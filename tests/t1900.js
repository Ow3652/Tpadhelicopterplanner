const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.9.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1406.00N',lon:'10108.00E'},{name:'D',lat:'1400.00N',lon:'10108.00E'},{name:'E',lat:'1400.00N',lon:'10116.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo();const L=navList();directTo("",L.b[1])});
await p.fill('#smspd','120');await p.press('#smspd','Enter');await p.click('[data-sc="4"]');await p.waitForTimeout(2500);
const info=()=>p.evaluate(()=>{const A=DT.a?dtLL(DT.a,$("fmt").value):null;return JSON.stringify({dir:DT.dir,t:DT.t.n,gap:A?+(leg({la:SIM.la,lo:SIM.lo},A).d).toFixed(3):null,legFromIsMyPos:legFrom()&&A&&dtNear(legFrom(),A),pos:[+SIM.la.toFixed(3),+SIM.lo.toFixed(3)]})});
console.log('before',await info());
await p.click('#nldt');await p.waitForTimeout(200);
const i=await p.evaluate(()=>pts.findIndex(q=>q.name==='D'));await p.locator('#nlb tr[data-i="'+i+'"]').click();await p.waitForTimeout(200);
await p.click('#nladd');await p.waitForTimeout(150);
console.log('after EXEC',await info());
const rows=[];for(let k=0;k<10;k++){await p.waitForTimeout(500);rows.push(await p.evaluate(()=>{const A=legFrom(),T=DT.t,s={la:SIM.la,lo:SIM.lo},lp=leg(T,s),c=leg(A,T).brg;return +(lp.d*Math.sin(((lp.brg-c+540)%360-180)*Math.PI/180)).toFixed(3)}))}
console.log('xte series',rows.join(' '));
// run until target E (auto next) and check dir false
for(let k=0;k<500;k++){await p.waitForTimeout(250);const t=await p.evaluate(()=>DT.t.n);if(t==='E')break}
console.log('at E',await info());console.log(er);await b.close()})()
