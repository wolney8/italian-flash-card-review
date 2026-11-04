#!/usr/bin/env node
'use strict';
/* Browser smoke: exercise the actual static site in Chromium, without dependencies. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');

function auditClient(){
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const frames=()=>new Promise(resolve=>setTimeout(resolve,110));
  const query=s=>document.querySelector(s);
  async function test(){
    for(let i=0;i<150;i++){
      if(document.body.classList.contains('guided-study-pilot')&&query('.study-detail-location-row'))break;
      await sleep(40);
    }
    if(!query('.guided-sheet-steps'))throw Error('Guided pilot did not initialise');
    const styles=selector=>getComputedStyle(query(selector)).display;
    const result={
      viewport:window.innerWidth,
      shellHidden:styles('.study-course-shell')==='none',
      legacyHeaderHidden:styles('main > header.hero')==='none',
      sheetTitleVisible:styles('.study-pack-sheet > header.hero')!=='none',
      toolbar:!!query('.study-detail-tools'),
      icons:document.querySelectorAll('.study-detail-tools svg').length,
      print:!!query('[data-study-print]'),
      breadcrumbsEnglish:!query('.course-site-breadcrumb .editorial-label')
    };
    const selector=query('.guided-sheet-steps'),positions=[];
    for(const stage of ['learn','examples','practise','learn']){
      query('[data-guided-step="'+stage+'"]').click();
      await frames();await sleep(40);
      positions.push(Math.round(selector.getBoundingClientRect().top));
    }
    result.stagePositions=positions;
    result.stageStable=Math.max(...positions)-Math.min(...positions)<=5;
    query('[data-guided-step="practise"]').click();
    await frames();
    const current=()=>query('.quiz-question:not([hidden])');
    const oldTop=current().getBoundingClientRect().top;
    query('[data-guided-action="next"]').click();
    await frames();await sleep(40);
    const newTop=current().getBoundingClientRect().top;
    result.questionInView=newTop>=8&&newTop<=window.innerHeight-90;
    result.questionMovement=Math.round(newTop-oldTop);
    const controls=[...document.querySelectorAll('.guided-sheet-controls-buttons button')];
    result.pairedButtons=controls.length===2&&Math.abs(controls[0].getBoundingClientRect().top-controls[1].getBoundingClientRect().top)<=3;
    result.buttonWidths=controls.map(b=>Math.round(b.getBoundingClientRect().width));
    result.toolbarOverflow=query('.study-detail-tools').scrollWidth-query('.study-detail-tools').clientWidth;
    query('.study-detail-tools [data-study-mode="review"]').click();await sleep(50);
    result.reviewPressed=query('.study-detail-tools [data-study-mode="review"]')?.getAttribute('aria-pressed')==='true';
    query('.study-detail-tools [data-study-mode="learn"]').click();await sleep(50);
    result.learnPressed=query('.study-detail-tools [data-study-mode="learn"]')?.getAttribute('aria-pressed')==='true';
    return result;
  }
  const marker=document.createElement('pre');
  marker.id='browser-audit-result';
  marker.textContent=JSON.stringify({ok:false,error:'Audit did not finish'});
  document.body.appendChild(marker);
  function report(data){marker.textContent=JSON.stringify(data);}
  const run=()=>test().then(data=>report({ok:true,...data}))
    .catch(e=>report({ok:false,error:String(e.stack||e)}));
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
}
const injected='('+auditClient.toString()+')();';
function mime(name){
  if(name.endsWith('.html'))return 'text/html; charset=utf-8';
  if(name.endsWith('.css'))return 'text/css; charset=utf-8';
  if(name.endsWith('.js'))return 'application/javascript; charset=utf-8';
  return 'text/plain; charset=utf-8';
}
const server=http.createServer((req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    const name=decodeURIComponent(url.pathname);
    const filename=path.resolve(root,'.'+name);
    if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let content=fs.readFileSync(filename,'utf8');
    if(name==='/study/study-sheets.html')
      content=content.replace('</body>','<script>'+injected+'</script></body>');
    res.setHeader('content-type',mime(filename));res.end(content);
  }catch(error){res.writeHead(404);res.end(String(error.message));}
});
function chrome(){
  for(const name of ['google-chrome','google-chrome-stable','chromium','chromium-browser']){
    const found=spawnSync('which',[name]);
    if(found.status===0)return found.stdout.toString().trim();
  }
  throw Error('Chromium/Chrome not installed');
}
function run(browser,base,label,size){
  return new Promise((resolve,reject)=>{
    const args=['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
      '--disable-background-networking','--hide-scrollbars','--virtual-time-budget=12000',
      '--window-size='+size,'--dump-dom',base+'/study/study-sheets.html?mode=learn&sheet=di-da-dove-pronouns'];
    const child=spawn(browser,args,{env:{...process.env,HOME:'/tmp'}});
    let stdout='',stderr='';
    const timer=setTimeout(()=>child.kill('SIGKILL'),35000);
    child.stdout.on('data',b=>stdout+=b.toString());
    child.stderr.on('data',b=>stderr+=b.toString());
    child.on('error',reject);
    child.on('close',code=>{
      clearTimeout(timer);
      const match=stdout.match(/<pre id="browser-audit-result">([\s\S]*?)<\/pre>/);
      if(!match){
        reject(Error(label+' audit missing. code='+code+
          ' stdoutSize='+stdout.length+
          ' pageMarker='+stdout.includes('guided-sheet-steps')+
          ' injected='+stdout.includes('auditClient')+
          ' tail='+stdout.slice(-1700)+
          ' stderr='+stderr.slice(-450)));
        return;
      }
      try{resolve({label,...JSON.parse(match[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&'))});}
      catch(error){reject(Error(label+' invalid JSON '+match[1].slice(0,300)));}
    });
  });
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const base='http://127.0.0.1:'+server.address().port;
    const browser=chrome();
    for(const [name,size] of [['desktop','1280,900'],['mobile','430,840']]){
      const result=await run(browser,base,name,size);
      console.log(name,JSON.stringify(result));
      assert.ok(result.ok,name+' error: '+result.error);
      for(const key of ['shellHidden','legacyHeaderHidden','sheetTitleVisible','toolbar',
        'print','breadcrumbsEnglish','stageStable','questionInView','pairedButtons',
        'reviewPressed','learnPressed']){
        assert.equal(result[key],true,name+': '+key+' failed');
      }
      assert.equal(result.icons,4,'Expected 4 toolbar icons');
      assert.ok(result.toolbarOverflow<=3,'Toolbar overflows on '+name);
      assert.ok(result.buttonWidths.every(w=>w>70),'Navigation buttons too narrow on '+name);
    }
    console.log('PASS real desktop and mobile Chromium interaction smoke.');
  }finally{server.close();}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;server.close();});