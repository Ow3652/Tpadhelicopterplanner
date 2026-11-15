const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();
const R=3440.065,rad=Math.PI/180;
function pt(la,lo,brg,d){const a=la*rad,bb=brg*rad,dl=d/R,la2=Math.asin(Math.sin(a)*Math.cos(dl)+Math.cos(a)*Math.sin(dl)*Math.cos(bb)),lo2=lo*rad+Math.atan2(Math.sin(bb)*Math.sin(dl)*Math.cos(a),Math.cos(dl)-Math.sin(a)*Math.sin(la2));return[la2/rad,lo2/rad]}
const fmt=(v,ns)=>{const a=Math.abs(v),d=Math.floor(a),m=(a-d)*60;return String(d).padStart(ns?2:3,'0')+m.toFixed(3).padStart(6,'0')+(ns?(v>=0?'N':'S'):(v>=0?'E':'W'))};
async function run(brg,dist,spd){
 const T=pt(14.5,101,brg,dist);
 const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.1.html'));await p.waitForTimeout(700);
 await p.evaluate(a=>{pts=[{name:'S',lat:'1430.000N',lon:'10100.000E'},{name:'N1',lat:'1445.000N',lon:'10100.000E'},{name:'T',lat:a[0],lon:a[1]}];drawPts()},[fmt(T[0],1),fmt(T[1],0)]);
 await p.click('#fs');await p.waitForTimeout(200);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');
 await p.fill('#smspd','0');await p.press('#smspd','Enter');await p.click('#smrun');
 await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();SIM.la=14.5;SIM.lo=101;SIM.hd=0;SIM.hdg=0;MLP.la=14.5;MLP.lo=101;MLP.ll={la:14.5,lo:101};MLP.hd=0});
 await p.fill('#smspd',''+spd);await p.press('#smspd','Enter');await p.evaluate(()=>{SIM.sp=SIM.spd});await p.waitForTimeout(300);
 await p.evaluate(()=>{SIM.run=false});
 await p.evaluate(()=>{navGo();const i=pts.findIndex(q=>q.name==='T');directTo("",pts[i])});
 const info=await p.evaluate(()=>JSON.stringify({arc:DT.arc&&{d:DT.arc.dir,t:Math.round(DT.arc.tcrs)},t:DT.t.n}));
 await p.evaluate(()=>{SIM.run=true;SIM.last=Date.now()});await p.click('[data-sc="10"]');
 let maxAfter=0,doneAt=null,fin=null;
 for(let i=0;i<500;i++){await p.waitForTimeout(100);
  const s=await p.evaluate(()=>{const A=legFrom(),Tt=DT.t,pp={la:SIM.la,lo:SIM.lo},lp=leg(Tt,pp),c=leg(A,Tt).brg;return{turn:SIM.turn,x:lp.d*Math.sin(((lp.brg-c+540)%360-180)*Math.PI/180),d:leg(pp,Tt).d,hd:SIM.hd,run:SIM.run}});
  if(!s.turn&&doneAt===null)doneAt=i;
  if(doneAt!==null&&i>doneAt+10)maxAfter=Math.max(maxAfter,Math.abs(s.x));
  fin=s;if(s.d<0.15||!s.run)break}
 console.log('brg',brg,'dist',dist,'spd',spd,info,'turn done at',doneAt,'max |xte| after turn',maxAfter.toFixed(3),'end dist',fin.d.toFixed(2),er);await p.close()}
for(const a of [90,135,180,270])await run(a,12,120);

await b.close()})()
