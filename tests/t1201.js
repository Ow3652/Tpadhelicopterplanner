const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1180,height:820}});
const p=await c.newPage();await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.2.html'));await p.waitForTimeout(1000);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');
await p.fill('#smspd','120');await p.press('#smspd','Enter');await p.click('#smrun');await p.evaluate(()=>{M.z=13;M.touched=true});
await p.fill('#smhdg','090');await p.press('#smhdg','Enter');
await p.waitForTimeout(1500);
await p.evaluate(()=>{M.cx=wp(SIM.la,SIM.lo,M.z)[0]+100;M.cy=wp(SIM.la,SIM.lo,M.z)[1];drawMap(false)});
await p.waitForTimeout(200);
await p.screenshot({path:'s1201.png',clip:{x:330,y:200,width:520,height:420}});await b.close()})()
