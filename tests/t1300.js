const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1180,height:820}});
const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.3.html'));await p.waitForTimeout(1000);
await p.fill('#gs','120');await p.fill('#ff','500');await p.fill('#tof','3000');
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1406.00N',lon:'10108.00E'},{name:'D',lat:'1400.00N',lon:'10108.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');
await p.fill('#smspd','120');await p.press('#smspd','Enter');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo()});await p.waitForTimeout(300);
await p.evaluate(()=>{const L=navList();directTo("",L.b[1])});
await p.click('[data-sc="10"]');
const R=3440.065,rad=Math.PI/180;
const out=[];let lastDT='',names='';
for(let i=0;i<400;i++){await p.waitForTimeout(120);
 const s=await p.evaluate(()=>({t:DT&&DT.t&&DT.t.n,a:DT&&DT.a&&DT.a.lat+' '+DT.a.lon,la:SIM.la,lo:SIM.lo,hd:SIM.hd,run:SIM.run,pts:pts.map(q=>q.name).join(','),reh:SIM.reh}));
 const k=s.t+'|'+s.a+'|'+s.reh;if(k!==lastDT){lastDT=k;out.push(JSON.stringify({i,t:s.t,reh:s.reh,pts:s.pts,la:+s.la.toFixed(4),lo:+s.lo.toFixed(4),hd:Math.round(s.hd)}))}
 // leg B->C lat=14.1 : record deviation of lat when lo between 101.01 and 101.12 and target C
 if(s.t==='C'&&s.lo>101.02&&s.lo<101.12){out.dev=Math.max(out.dev||0,Math.abs(s.la-14.1)*60)}
 if(!s.run)break}
console.log(out.join('\n'));console.log('max dev from B-C line NM',out.dev);
console.log(er);await b.close()})()
