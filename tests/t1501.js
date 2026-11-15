const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.5.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd()});await p.click('[data-sc="20"]');
await p.waitForTimeout(1500);console.log('scale',await p.evaluate(()=>SIM.scale),er);
const bx=await p.locator('#simbox').boundingBox();await p.screenshot({path:'s1501.png',clip:{x:bx.x-4,y:bx.y-4,width:bx.width+8,height:bx.height+8}});
const f=await p.locator('#navlog').boundingBox();await p.screenshot({path:'s1502.png',clip:{x:f.x,y:f.y+f.height-70,width:f.width,height:70}});
await p.click('#nldt');await p.waitForTimeout(200);await p.screenshot({path:'s1503.png',clip:{x:f.x,y:f.y+f.height-70,width:f.width,height:70}});
await b.close()})()
