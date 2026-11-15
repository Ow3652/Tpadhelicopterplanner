const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1180,height:820}});
const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));await p.goto('http://localhost:8765/'+encodeURIComponent('Tpad helicopter planner v4.1.3.html'));await p.waitForTimeout(1000);
await p.fill('#gs','120');await p.fill('#ff','500');await p.fill('#tof','3000');
await p.evaluate(()=>{pts=[{name:'A',lat:'1400.00N',lon:'10100.00E'},{name:'B',lat:'1406.00N',lon:'10100.00E'},{name:'C',lat:'1406.00N',lon:'10108.00E'},{name:'D',lat:'1400.00N',lon:'10108.00E'},{name:'E',lat:'1400.00N',lon:'10116.00E'}];drawPts()});
await p.click('#fs');await p.waitForTimeout(300);await p.click('#uis');await p.click('#fib');await p.click('#simbtn');
await p.fill('#smspd','120');await p.press('#smspd','Enter');await p.click('#smrun');
await p.evaluate(()=>{RMION=true;HSION=true;NLON=true;instUpd();navGo()});await p.waitForTimeout(300);
await p.evaluate(()=>{const L=navList();directTo("",L.b[1])});await p.click('[data-sc="4"]');
const st=()=>p.evaluate(()=>JSON.stringify({t:DT&&DT.t&&DT.t.n,pts:pts.map(q=>q.name).join(','),orig:DT&&DT.orig.map(q=>q.name).join(','),dt:NLDT,dp:NLDP&&NLDP.name,sel:NLSEL,sim:SIM.mode}));
await p.waitForTimeout(800);console.log('start',await st());
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#nlb tr')].map(r=>r.dataset.i+':'+(r.children[0]?r.children[0].textContent.replace(/\s/g,''):'')).join(' | '));
console.log(await rows());
const rowOf=n=>p.evaluate(n=>pts.findIndex(q=>q.name===n),n);
const tap=async n=>{const i=await rowOf(n);await p.locator('#nlb tr[data-i="'+i+'"]').click();await p.waitForTimeout(250)};
await p.click('#nldt');await p.waitForTimeout(250);await tap('D');console.log('after row',await st());
await p.click('#nladd');await p.waitForTimeout(500);console.log('6a Direct to D',await st());
await p.click('#nldel');await p.waitForTimeout(250);await tap('E');console.log('del marked',await p.evaluate(()=>NLMK.map(q=>q.name).join(',')));
await p.click('#nladd');await p.waitForTimeout(500);console.log('6b delete E',await st());
await tap('D');console.log('sel',await st());
await p.fill('#nlin','');await p.click('#nlin');await p.keyboard.type('D/270/4',{delay:30});await p.waitForTimeout(300);console.log('inp',await p.inputValue('#nlin'));
await p.click('#nladd');await p.waitForTimeout(600);console.log('6c insert',await st());
await p.waitForTimeout(3000);console.log('sim still',await p.evaluate(()=>JSON.stringify([SIM.run,SIM.mode,SIM.tgt,DT&&DT.t&&DT.t.n])));
console.log(er);await b.close()})()
