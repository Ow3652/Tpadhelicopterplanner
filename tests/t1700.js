const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.7.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1406.00N',lon:'10108.00E'},{name:'D',lat:'1412.00N',lon:'10108.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo();const L=navList();directTo("",L.b[1])});await p.waitForTimeout(300);
// predictor counts
const dash=async v=>{await p.evaluate(v=>{SIM.spd=v;SIM.sp=v;SIM.last=Date.now()},v);await p.waitForTimeout(350);return p.evaluate(()=>{const e=document.querySelector('#ov polyline[stroke="#fff"][stroke-dasharray="20 8"]');if(!e)return 0;const pp=e.getAttribute('points').split(' ').map(q=>q.split(',').map(Number));let L=0;for(let i=1;i<pp.length;i++)L+=Math.hypot(pp[i][0]-pp[i-1][0],pp[i][1]-pp[i-1][1]);return Math.round(L)})};
for(const v of [0,50,100,150,300])console.log('spd',v,'dash len px',await dash(v));
// course line
await p.evaluate(()=>{hsiCrs(0)});await p.waitForTimeout(400);
console.log('course',await p.evaluate(()=>HSICM),'line',await p.evaluate(()=>!!document.querySelector('#ov polyline[stroke="#fff"][stroke-dasharray="22 12"]')));
await p.evaluate(()=>{hsiCrs(5)});await p.waitForTimeout(300);console.log('after +5',await p.evaluate(()=>HSICM));
await p.evaluate(()=>{HSICM=null;hsiUpd()});await p.waitForTimeout(300);console.log('cleared line',await p.evaluate(()=>!!document.querySelector('#ov polyline[stroke="#fff"][stroke-dasharray="22 12"]')));
// stop SIM keeps HSI
await p.click('#smstop');await p.waitForTimeout(500);
console.log('after stop HSION',await p.evaluate(()=>[HSION,RMION,!document.getElementById('hsibox').hidden,!document.getElementById('navbox').hidden]));
console.log(er);await b.close()})()
