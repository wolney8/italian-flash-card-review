#!/usr/bin/env node
'use strict';
/* Browser smoke: exercise the actual static site in Chromium, without dependencies. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),zlib=require('node:zlib');
const {spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');

function auditClient(){
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const frames=()=>new Promise(resolve=>setTimeout(resolve,110));
  const query=s=>document.querySelector(s);
  async function test(){
    for(let i=0;i<150;i++){
      if(document.body.classList.contains('guided-study-pilot') &&
         query('.study-detail-location-row .study-detail-tools') &&
         query('.guided-sheet-steps') &&
         query('.study-detail-tools [data-study-print]'))break;
      await sleep(40);
    }
    if(!query('.guided-sheet-steps'))throw Error('Guided pilot did not initialise');
    const styles=selector=>getComputedStyle(query(selector)).display;
    const article=query('.study-pack-sheet');
    const teaching=[...article.querySelectorAll(':scope > section.panel:not([data-study-quiz]):not(.guided-sheet-finish)')];
    const questions=[...article.querySelectorAll('.quiz-question')];
    const result={
      slug:article.id,
      teachingSections:teaching.length,
      questions:questions.length,
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
    result.progressTotal=Number(query('.guided-sheet-progress-track')?.getAttribute('aria-valuemax'));
    result.expectedProgressTotal=teaching.length+questions.length;
    result.initialProgressLabel=query('.guided-sheet-progress-count')?.textContent;
    result.sourceOrder=teaching.map(p=>p.querySelector('h2')?.textContent.trim());
    for(const stage of ['learn','examples','practise','learn']){
      query('[data-guided-step="'+stage+'"]').click();
      await frames();await sleep(40);
      positions.push(Math.round(selector.getBoundingClientRect().top));
      const visible=teaching.filter(panel=>!panel.hidden);
      const activeQuestions=questions.filter(question=>!question.hidden);
      if(stage==='learn')result.learnOneSection=visible.length===1&&visible[0]===teaching[0];
      if(stage==='examples')result.examplesOneSection=visible.length===1&&visible[0]===teaching[1];
      if(stage==='practise')result.practiseOneQuestion=activeQuestions.length===1&&visible.length===0;
    }
    result.stagePositions=positions;
    result.stageStable=Math.max(...positions)-Math.min(...positions)<=5;
    query('[data-guided-step="practise"]').click();
    await frames();
    const current=()=>query('.quiz-question:not([hidden])');
    // Simulate the learner scrolling down to read the question before using Next.
    current().scrollIntoView({block:'center',behavior:'instant'});
    await frames();
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
    result.hasNextAction=!!query('.guided-sheet-followup')?.getAttribute('href');
    result.nextHref=query('.guided-sheet-followup')?.getAttribute('href');
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
function run(browser,base,label,size,slug){
  return new Promise((resolve,reject)=>{
    const args=['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
      '--disable-background-networking','--hide-scrollbars','--virtual-time-budget=12000',
      '--window-size='+size,'--dump-dom',base+'/study/study-sheets.html?mode=learn&sheet='+encodeURIComponent(slug)];
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
    const packed=fs.readFileSync(path.join(root,'study/study-sheets-v5.js'),'utf8');
    const source=packed.match(/const B="([^"]+)"/);
    assert.ok(source,'Study Sheet data missing');
    const sheets=JSON.parse(zlib.gunzipSync(Buffer.from(source[1],'base64')).toString('utf8'));
    assert.equal(sheets.length,9,'Nine sheets must be represented');
    for(const [name,size] of [['desktop','1280,900'],['mobile','430,840']]){
      for(const sheet of sheets){
        const result=await run(browser,base,name,size,sheet.slug);
        console.log(name+' '+sheet.slug,JSON.stringify(result));
        assert.ok(result.ok,name+'/'+sheet.slug+' error: '+result.error);
        for(const key of ['shellHidden','legacyHeaderHidden','sheetTitleVisible','toolbar',
          'print','breadcrumbsEnglish','stageStable','questionInView','pairedButtons',
          'reviewPressed','learnPressed','learnOneSection','examplesOneSection',
          'practiseOneQuestion','hasNextAction']){
          assert.equal(result[key],true,name+'/'+sheet.slug+': '+key+' failed');
        }
        assert.equal(result.icons,4,'Expected 4 toolbar icons');
        assert.equal(result.slug,sheet.slug,'Wrong sheet rendered');
        assert.equal(result.teachingSections,sheet.study_sections.length,'Teaching sections lost');
        assert.equal(result.questions,sheet.questions.length,'Questions lost');
        assert.equal(result.progressTotal,result.expectedProgressTotal,'Progress denominator incorrect');
        assert.deepEqual(result.sourceOrder,sheet.study_sections.map(s=>s.title),'Teaching content order changed');
        assert.ok(result.toolbarOverflow<=3,'Toolbar overflows on '+name);
        assert.ok(result.buttonWidths.every(w=>w>70),'Navigation buttons too narrow on '+name);
        const idx=sheets.findIndex(s=>s.slug===sheet.slug);
        // Sheet navigation follows the category order rather than source data order.
        if(idx===sheets.length-1)assert.ok(result.nextHref?.startsWith('../?page=lessons'),'Final sheet must lead to Flashcards');
      }
    }
    console.log('PASS all nine Study Sheets in desktop and narrow/mobile Chromium.');
  }finally{server.close();}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;server.close();});