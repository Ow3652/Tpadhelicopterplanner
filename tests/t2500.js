const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.3.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1400.00N',lon:'10108.00E'},{name:'D',lat:'1400.00N',lon:'10116.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo();const L=navList();directTo("",L.b[1])});
await p.fill('#smspd','120');await p.press('#smspd','Enter');await p.evaluate(()=>{SIM.sp=SIM.spd});await p.click('[data-sc="4"]');await p.waitForTimeout(3000);
const st=()=>p.evaluate(()=>JSON.stringify({t:DT.t.n,dir:DT.dir,arc:!!DT.arc,hd:Math.round(SIM.hd),mode:SIM.mode}));
console.log('before',await st());
await p.click('#hsinext');await p.waitForTimeout(300);console.log('after next',await st());
let doneAt=null,maxAfter=0;
for(let i=0;i<400;i++){await p.waitForTimeout(100);const s=await p.evaluate(()=>{const A=legFrom(),T=DT.t,pp={la:SIM.la,lo:SIM.lo},lp=leg(T,pp),c=leg(A,T).brg;return{turn:SIM.turn,x:lp.d*Math.sin(((lp.brg-c+540)%360-180)*Math.PI/180),d:leg(pp,T).d}});if(!s.turn&&doneAt===null)doneAt=i;if(doneAt!==null&&i>doneAt+10)maxAfter=Math.max(maxAfter,Math.abs(s.x));if(s.d<0.2)break}
console.log('turn done',doneAt,'max xte after',maxAfter.toFixed(3));
await p.click('#hsiprev');await p.waitForTimeout(300);console.log('after prev',await st());
console.log(er);await b.close()})()
