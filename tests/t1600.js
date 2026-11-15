const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage();await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.0.6.html'));await p.waitForTimeout(800);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.evaluate(()=>{NLON=true;nlUpd()});await p.waitForTimeout(300);
const m=async()=>JSON.stringify(await p.evaluate(()=>['nldel','nldt','nladd'].map(i=>{const r=document.getElementById(i).getBoundingClientRect();return i+':'+Math.round(r.width)+'x'+Math.round(r.height)})));
console.log(await m());await p.click('#nldel');console.log(await m(),await p.textContent('#nldel'));
const f=await p.locator('#navlog').boundingBox();await p.screenshot({path:'s1600.png',clip:{x:f.x,y:f.y+f.height-60,width:f.width,height:60}});await b.close()})()
