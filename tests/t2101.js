const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();
for(const gps of [false,true]){
const c=await b.newContext({viewport:{width:1180,height:820},permissions:['geolocation'],geolocation:{latitude:14,longitude:101}});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.1.html'));await p.waitForTimeout(700);
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');
if(gps){await p.evaluate(()=>gpsOn());await p.waitForTimeout(1200)}
await p.click('#simbtn');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo()});await p.waitForTimeout(800);
await p.click('#smstop');await p.waitForTimeout(800);
console.log('gps',gps,await p.evaluate(()=>JSON.stringify({HSION,RMION,NLON,hsi:!hsibox.hidden,rmi:!navbox.hidden,fms:!navlog.hidden,gpsOn:!!MLP.on})),er);await c.close()}
await b.close()})()
