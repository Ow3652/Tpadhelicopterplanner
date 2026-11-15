const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.3.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');
for(const v of [0,20,60,120,240]){await p.evaluate(v=>{SIM.spd=v;SIM.sp=v;SIM.last=Date.now()},v);await p.waitForTimeout(400);
 const n=await p.evaluate(()=>{const e=document.querySelector('#ov polyline[stroke="#ff9800"]');if(!e)return 0;const pp=e.getAttribute('points').split(' ').map(q=>q.split(',').map(Number));let L=0;for(let i=1;i<pp.length;i++)L+=Math.hypot(pp[i][0]-pp[i-1][0],pp[i][1]-pp[i-1][1]);return Math.round(L/15)});console.log('spd',v,'dashes',n)}
// z-order: arrow last in #ov
console.log('last child is arrow',await p.evaluate(()=>{const o=document.getElementById('ov');const l=o.lastElementChild;return l.tagName+':'+(l.querySelector('path[fill="#1a73e8"]')?'heli':'other')}));
console.log(er);await b.close()})()
