const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();
async function run(spd,cLat,cLon,off,sc){
const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.5.html'));await p.waitForTimeout(700);
await p.evaluate(([la,lo])=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:la,lon:lo},{name:'D',lat:'1400.00N',lon:'10120.00E'}];drawPts()},[cLat,cLon]);
await p.click('#fs');await p.waitForTimeout(200);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');
await p.fill('#smspd','0');await p.press('#smspd','Enter');await p.click('#smrun');
await p.evaluate(()=>{navGo();const L=navList();directTo("",L.b[1])});
await p.fill('#smspd',''+spd);await p.press('#smspd','Enter');
if(off){await p.fill('#smhdg',''+off);await p.press('#smhdg','Enter');await p.waitForTimeout(1500);await p.click('#smmode')}
await p.click('[data-sc="'+sc+'"]');
let ev=[],last='';
for(let i=0;i<500;i++){await p.waitForTimeout(100);
 const s=await p.evaluate(()=>({t:DT&&DT.t&&DT.t.n,a:DT&&DT.a&&DT.a.lat+DT.a.lon,reh:SIM.reh,hd:SIM.hd,la:SIM.la,lo:SIM.lo,run:SIM.run,cdi:HSIAC}));
 const k=s.t+s.a;if(k!==last){last=k;ev.push([i,s.t,s.reh,Math.round(s.hd)])}
 if(s.t==='D'&&!s.reh)break;if(!s.run)break}
console.log(spd,cLat,cLon,'off',off,'x'+sc,JSON.stringify(ev),'er',er.length);await p.close()}
await run(120,'1406.00N','10108.00E',0,10);
await run(160,'1400.00N','10108.00E',0,10);   // C south: 180 turn? B->C from north to south
await run(160,'1410.00N','10108.00E',0,10);   // ~ 45 deg
await run(120,'1406.00N','10108.00E',70,10);  // off-line start
await run(80,'1402.00N','10100.50E',0,20);
await b.close()})()
