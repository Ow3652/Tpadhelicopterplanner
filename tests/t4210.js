const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
async function run(label,{scriptOn,gvizOn,url=true}){
 const c=await b.newContext({viewport:{width:1180,height:820}});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 const calls={script:0,gviz:0};
 await p.route('**/*',r=>{const u=r.request().url();
  if(/localhost:8765/.test(u))return r.continue();
  if(/script\.google\.com\/macros\/s\/MYAPI/.test(u)){calls.script++;if(!scriptOn)return r.abort();
    let q={};try{q=JSON.parse(r.request().postData()||'{}')}catch(e){}
    const h={'access-control-allow-origin':'*'};
    if(q.op==='list'&&!q.t)return r.fulfill({status:200,contentType:'application/json',headers:h,body:JSON.stringify({ok:true,rows:[['Ae Co Test',"13° 45.00' N","100° 30.00' E",'t']]})});
    return r.fulfill({status:200,contentType:'application/json',headers:h,body:JSON.stringify({ok:true,rows:[],routes:[]})})}
  if(/docs\.google\.com\/spreadsheets\/d\/1W07RDHc2M7/.test(u)){calls.gviz++;if(!gvizOn)return r.abort();
    return r.fulfill({status:200,contentType:'text/csv',headers:{'access-control-allow-origin':'*'},body:'Name,Lat,Lon,Note\n"Gviz Point","14° 00.00\' N","101° 00.00\' E",""\n'})}
  return r.abort()});
 if(url)await p.addInitScript(`try{localStorage.setItem('heliPubApi','https://script.google.com/macros/s/MYAPI/exec')}catch(e){}`);
 await p.goto('http://localhost:8765/v4.2.1.html');await p.waitForTimeout(3500);
 const pts=await p.evaluate(()=>SHP.map(x=>x.n));const st=await p.evaluate(()=>document.getElementById('pubst')&&document.getElementById('pubst').textContent||'');
 console.log(label,'| shared points:',JSON.stringify(pts),'| script calls',calls.script,'gviz calls',calls.gviz,'| errors',er.length?er:0);
 await c.close();}
await run('1 script ok, gviz BLOCKED (file:// case)',{scriptOn:true,gvizOn:false});
await run('2 script down, gviz ok (fallback)',{scriptOn:false,gvizOn:true});
await run('3 no script URL, gviz ok',{scriptOn:false,gvizOn:true,url:false});
await run('4 both down',{scriptOn:false,gvizOn:false});
await b.close()})();
