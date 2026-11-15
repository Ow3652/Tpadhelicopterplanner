const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.3.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd()});
const info=()=>p.evaluate(()=>{const e=document.getElementById('hsic'),bb=document.getElementById('hsibox').querySelector('svg').getBoundingClientRect(),r=e.getBoundingClientRect();return {hd:Math.round(SIM.hd),a:e._a&&+e._a.toFixed(1),cx:Math.round(r.x+r.width/2-(bb.x+bb.width/2)),cy:Math.round(r.y+r.height/2-(bb.y+bb.height/2)),tr:e.style.transform}});
console.log('start',await info());
await p.fill('#smhdg','350');await p.press('#smhdg','Enter');await p.waitForTimeout(3500);console.log('hdg350',await info());
await p.fill('#smhdg','010');await p.press('#smhdg','Enter');
const a=[];for(let i=0;i<14;i++){await p.waitForTimeout(250);a.push((await info()).a)}console.log('cross 0:',a.join(' '));
console.log('center offset',JSON.stringify(await info()),er);
await p.locator('#hsibox').screenshot({path:'s2900.png'});await b.close()})()
