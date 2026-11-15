const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1180,height:820}});
const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.3.html'));await p.waitForTimeout(1000);
await p.fill('#gs','120');await p.fill('#ff','500');await p.fill('#tof','3000');
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1406.00N',lon:'10108.00E'},{name:'D',lat:'1400.00N',lon:'10108.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');
await p.fill('#smspd','120');await p.press('#smspd','Enter');await p.click('#smrun');
const S=()=>p.evaluate(()=>({m:SIM.mode,hold:SIM.hold,hd:+SIM.hd.toFixed(1),la:+SIM.la.toFixed(4),lo:+SIM.lo.toFixed(4),sp:Math.round(SIM.sp),tgt:SIM.tgt,om:+SIM.om.toFixed(2)}));
console.log('4. start (no NAV)',JSON.stringify(await S()));
// +1 / +5 buttons
await p.click('[data-hg="1"]');await p.click('[data-hg="1"]');await p.click('[data-sp="5"]');await p.click('[data-sp="-5"]');await p.click('[data-sp="-5"]');
console.log('3. after +1+1 hdg,+5-5-5 spd',await p.evaluate(()=>[SIM.hdg,SIM.spd,SIM.mode]));
// hold repeat
const bx=await p.locator('[data-hg="-1"]').boundingBox();await p.mouse.move(bx.x+8,bx.y+8);await p.mouse.down();await p.waitForTimeout(1100);await p.mouse.up();
console.log('3. hold-repeat hdg',await p.evaluate(()=>SIM.hdg));
await p.fill('#smhdg','000');await p.press('#smhdg','Enter');await p.click('[data-sc="10"]');await p.fill('#smspd','120');await p.press('#smspd','Enter');
await p.waitForTimeout(2500);console.log('4. still H after 2.5s',JSON.stringify(await S()));
// predictor visible
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd()});
await p.waitForTimeout(300);
console.log('2. predictor dashed present',await p.evaluate(()=>!!document.querySelector('#ov polyline[stroke="#ff9800"]')));
await p.locator('#map').screenshot({path:'s1200a.png'});
// NAV press then go to B, AUTO NEXT off
await p.evaluate(()=>{AUTOFW=false});
await p.evaluate(()=>navGo());await p.waitForTimeout(400);console.log('4. after NAV mode',JSON.stringify(await S()));
await p.evaluate(()=>{const L=navList();directTo("",L.b[1])});await p.waitForTimeout(300);console.log('tgt',await p.evaluate(()=>DT.t.n));
let s;for(let i=0;i<120;i++){await p.waitForTimeout(250);s=await S();if(s.hold)break}
console.log('1. arrival hold',s);
await p.waitForTimeout(3000);console.log('1. still holding',JSON.stringify(await S()));
console.log('5. ghost',await p.evaluate(()=>!!document.querySelector('#ov polyline[stroke="#00a152"]')),await p.evaluate(()=>DT.orig.map(q=>q.name).join(',')));
await p.evaluate(()=>navStep(1));await p.waitForTimeout(800);console.log('1. after next select',JSON.stringify(await S()));
let om=0;for(let i=0;i<40;i++){await p.waitForTimeout(100);const q=await S();om=Math.max(om,Math.abs(q.om))}console.log('2. max |om|',om);
await p.locator('#map').screenshot({path:'s1200b.png'});
await p.evaluate(()=>{AUTOFW=true});
for(let i=0;i<200;i++){await p.waitForTimeout(250);const t=await p.evaluate(()=>DT&&DT.t&&DT.t.n);if(t==='D')break}
console.log('5. auto advance',JSON.stringify(await S()),'orig',await p.evaluate(()=>DT.orig.map(q=>q.name).join(',')),'pts',await p.evaluate(()=>pts.map(q=>q.name).join(',')),'ghost',await p.evaluate(()=>!!document.querySelector('#ov polyline[stroke="#00a152"]')));
await p.evaluate(()=>{NLON=true;nlUpd()});await p.waitForTimeout(300);
await p.click('#nldt');await p.waitForTimeout(150);
const tr=p.locator('#nlb tr').nth(1);await tr.click();await p.waitForTimeout(300);
console.log('6. NLDP set',await p.evaluate(()=>!!NLDP&&NLDP.name));
await p.click('#nlx');await p.waitForTimeout(600);
console.log('6. after EXEC',await p.evaluate(()=>[DT&&DT.t&&DT.t.n,pts.map(q=>q.name).join(',')]),JSON.stringify(await S()));
console.log(er);await b.close()})()
