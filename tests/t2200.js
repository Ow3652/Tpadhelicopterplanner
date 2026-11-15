const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.2.html'));await p.waitForTimeout(800);
await p.fill('#ff','500');await p.fill('#tof','3000');
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');await p.click('#smrun');await p.evaluate(()=>{NLON=true;nlUpd()});
await p.click('[data-sc="10"]');
const f0=await p.evaluate(()=>SIM.fuel);await p.waitForTimeout(2000);const f1=await p.evaluate(()=>SIM.fuel);console.log('rate lb/real s @500:',(f0-f1)/2);
await p.fill('#nlff','1000');await p.press('#nlff','Enter');await p.waitForTimeout(300);
console.log('NLFF',await p.evaluate(()=>NLFF),'input',await p.inputValue('#nlff'));
const g0=await p.evaluate(()=>SIM.fuel);await p.waitForTimeout(2000);const g1=await p.evaluate(()=>SIM.fuel);console.log('rate @1000:',(g0-g1)/2,er);await b.close()})()
