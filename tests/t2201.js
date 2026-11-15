const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.2.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1406.00N',lon:'10108.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');
const W=()=>p.evaluate(()=>['smrun','smstop','smroute','smhdgb'].map(i=>{const r=document.getElementById(i).getBoundingClientRect();return i+':'+Math.round(r.width)+'x'+Math.round(r.height)}).join(' '));
console.log('stopped',await W());await p.click('#smrun');console.log('running',await W());await p.click('#smrun');console.log('paused',await W());await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();map&&0});
await p.evaluate(()=>{M.z=13;M.touched=true;gpsCenter()});await p.waitForTimeout(500);
const bx=await p.locator('#simbox').boundingBox();await p.screenshot({path:'s2201.png',clip:{x:bx.x-4,y:bx.y-4,width:bx.width+8,height:bx.height+8}});
// dbl click on header text area
const h=await p.locator('#simbox .rd').boundingBox();await p.mouse.dblclick(h.x+10,h.y+10);await p.waitForTimeout(300);
console.log('expanded transform',await p.evaluate(()=>simbox.style.transform));
const b2=await p.locator('#simbox').boundingBox();await p.screenshot({path:'s2202.png',clip:{x:b2.x-4,y:b2.y-4,width:b2.width+8,height:b2.height+8}});
await p.mouse.dblclick(h.x+10,h.y+10);await p.mouse.dblclick(h.x+10,h.y+10);console.log('back',await p.evaluate(()=>simbox.style.transform));
await p.screenshot({path:'s2203.png',clip:{x:450,y:260,width:300,height:300}});
console.log(er);await b.close()})()
