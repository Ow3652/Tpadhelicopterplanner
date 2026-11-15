const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();
const R=3440.065,rad=Math.PI/180;
function pt(la,lo,brg,d){const a=la*rad,bb=brg*rad,dl=d/R,la2=Math.asin(Math.sin(a)*Math.cos(dl)+Math.cos(a)*Math.sin(dl)*Math.cos(bb)),lo2=lo*rad+Math.atan2(Math.sin(bb)*Math.sin(dl)*Math.cos(a),Math.cos(dl)-Math.sin(a)*Math.sin(la2));return[la2/rad,lo2/rad]}
const fmt=(v,ns)=>{const a=Math.abs(v),d=Math.floor(a),m=(a-d)*60;return String(d).padStart(ns?2:3,'0')+m.toFixed(3).padStart(6,'0')+(ns?(v>=0?'N':'S'):(v>=0?'E':'W'))};
async function run(b1,b2,spd){
 const B=pt(14,101,b1,6),C=pt(B[0],B[1],b2,8),D=pt(C[0],C[1],b2,8);
 const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.6.html'));await p.waitForTimeout(700);
 await p.evaluate(a=>{pts=[{name:'A',lat:'1400.000N',lon:'10100.000E'},{name:'B',lat:a[0],lon:a[1]},{name:'C',lat:a[2],lon:a[3]},{name:'D',lat:a[4],lon:a[5]}];drawPts()},[fmt(B[0],1),fmt(B[1],0),fmt(C[0],1),fmt(C[1],0),fmt(D[0],1),fmt(D[1],0)]);
 await p.click('#fs');await p.waitForTimeout(200);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');
 await p.fill('#smspd','0');await p.press('#smspd','Enter');await p.click('#smrun');
 await p.evaluate(()=>{navGo();const L=navList();directTo("",L.b[1])});
 await p.fill('#smspd',''+spd);await p.press('#smspd','Enter');await p.click('[data-sc="4"]');
 const xte=(a,bq,q)=>{const d=(x,y)=>{const dl=(y[0]-x[0])*rad,dn=(y[1]-x[1])*rad,aa=Math.sin(dl/2)**2+Math.cos(x[0]*rad)*Math.cos(y[0]*rad)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(aa))};const br=(x,y)=>Math.atan2(Math.sin((y[1]-x[1])*rad)*Math.cos(y[0]*rad),Math.cos(x[0]*rad)*Math.sin(y[0]*rad)-Math.sin(x[0]*rad)*Math.cos(y[0]*rad)*Math.cos((y[1]-x[1])*rad));return Math.asin(Math.sin(d(a,q)/R)*Math.sin(br(a,q)-br(a,bq)))*R};
 const trace=[];let maxom=0,maxx=0,ev=[],last='',phase=0;
 for(let i=0;i<1200;i++){await p.waitForTimeout(100);
  const s=await p.evaluate(()=>({t:DT&&DT.t&&DT.t.n,a:DT&&DT.a&&DT.a.lat+DT.a.lon,reh:SIM.reh,hd:SIM.hd,la:SIM.la,lo:SIM.lo,om:SIM.om,run:SIM.run}));
  if(s.t==='C'&&trace.length<40)trace.push(Math.round(s.hd)+'/'+s.om.toFixed(1)+(s.reh?'*':''));if(s.t==='C'){maxom=Math.max(maxom,Math.abs(s.om));maxx=Math.max(maxx,Math.abs(xte(B,C,[s.la,s.lo])));}
  const k=s.t+s.a;if(k!==last){last=k;ev.push(s.t+(s.reh?'*':'')+'@'+Math.round(s.hd))}
  if(s.t==='D')break;if(!s.run)break}
 console.log(trace.join(' '));console.log(b1+'->'+b2,'spd',spd,'maxrate',maxom.toFixed(2),'max xte vs B-C',maxx.toFixed(3),ev.join(' '),er);await p.close()}
await run(45,28,120);
await b.close()})()
