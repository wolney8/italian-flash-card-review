#!/usr/bin/env python3
"""Measure native controls with real hosting overlays and late-resizing fixtures."""
from pathlib import Path
import json,shutil,sys,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/visible-dock';OUT.mkdir(parents=True,exist_ok=True)
BASE='https://italian-flash-card-review.netlify.app'
CANDIDATE='--candidate' in sys.argv
reports=[]
SNAPSHOT='''()=>{
 const desc=e=>e?{tag:e.tagName,id:e.id,cls:String(e.className),rect:e.getBoundingClientRect().toJSON(),position:getComputedStyle(e).position,pointer:getComputedStyle(e).pointerEvents,z:getComputedStyle(e).zIndex}:null;
 const dock=document.querySelector('.flow-bottom-dock');
 const selectors=['[data-flow-skip]','[data-guided-action=next]','[data-guided-action=back]'];
 return {viewport:{width:innerWidth,height:innerHeight,visual:visualViewport?{width:visualViewport.width,height:visualViewport.height,top:visualViewport.offsetTop}:null},dock:desc(dock),reserve:dock?.style.getPropertyValue('--flow-hosting'),keyboard:getComputedStyle(document.documentElement).getPropertyValue('--flow-keyboard'),buttons:selectors.map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {selector:s,disabled:e.disabled,element:desc(e),hit:desc(document.elementFromPoint(x,y)),clear:e.contains(document.elementFromPoint(x,y))}}),iframes:[...document.querySelectorAll('iframe,#test-hosting-badge')].map(desc)};
}'''
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  if not CANDIDATE:
   request=p.request.new_context()
   for name in ['learning-controls-v2.js','learning-controls-v2.css']:
    for attempt in range(30):
     response=request.get(BASE+'/'+name+'?verify=visible-dock',timeout=30000)
     if response.ok and response.body()==(ROOT/name).read_bytes():break
     time.sleep(5)
    else:raise AssertionError(name+' does not match the deployed release')
   request.dispose()
  for width,height in [(1280,900),(768,1024),(390,844),(320,720)]:
   for language,theme in [('en','light'),('it','dark')]:
    context=browser.new_context(viewport={'width':width,'height':height},has_touch=width<900,is_mobile=width<900,reduced_motion='reduce')
    def routing(route):
     url=route.request.url
     for name,kind in [('learning-controls-v2.js','application/javascript'),('learning-controls-v2.css','text/css')]:
      if CANDIDATE and url.startswith(BASE+'/'+name):
       route.fulfill(path=str(ROOT/name),content_type=kind);return
     if url.startswith(BASE):route.continue_()
     else:route.abort()
    context.route('**/*',routing)
    context.add_init_script('if(window===top){localStorage.setItem("italianAutoAdvanceV2","off");localStorage.setItem("italianCourseThemeV1",'+json.dumps(theme)+');localStorage.setItem("italianCourseLanguageV1",'+json.dumps(language)+');}')
    page=context.new_page();page.set_default_timeout(15000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'/study/study-sheets.html?sheet=class2-alphabet',wait_until='networkidle')
    page.wait_for_selector('[data-flow-skip]');page.wait_for_timeout(300)
    def capture(phase):
     report=page.evaluate(SNAPSHOT);report.update(width=width,language=language,theme=theme,phase=phase,candidate=CANDIDATE);reports.append(report)
     page.screenshot(path=str(OUT/f'{phase}-{width}-{theme}.png'))
     return report
    capture('initial')
    # A fixture starts invisible, then resizes after insertion without a window resize event.
    page.evaluate('''()=>{const b=document.createElement('div');b.id='test-hosting-badge';b.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;z-index:2147483647;background:#123';document.body.append(b);setTimeout(()=>{b.style.width='260px';b.style.height='80px';},200);}''')
    page.wait_for_timeout(500);capture('late-badge')
    page.evaluate("document.getElementById('test-hosting-badge').remove()")
    page.wait_for_timeout(150)
    dock=page.locator('.flow-bottom-dock').bounding_box()
    assert abs(dock['y']+dock['height']-height)<3,dock
    rows=page.locator('.guided-sheet-controls-buttons button').evaluate_all('(els)=>els.map(e=>e.getBoundingClientRect().top)')
    assert max(rows)-min(rows)<3,('buttons not side by side',width,rows)
    assert dock['height']<220,('oversized dock',width,dock)
    button=page.locator('[data-flow-skip]');r=button.bounding_box();page.mouse.click(r['x']+r['width']/2,r['y']+r['height']/2);page.wait_for_timeout(100)
    before=page.evaluate('ItalianGuidedStudy.getState().question')
    report=capture('after-skip')
    next_button=page.locator('[data-guided-action=next]');r=next_button.bounding_box()
    if width<900:page.touchscreen.tap(r['x']+r['width']/2,r['y']+r['height']/2)
    else:page.mouse.click(r['x']+r['width']/2,r['y']+r['height']/2)
    page.wait_for_timeout(150)
    report['native_next_advanced']=page.evaluate('ItalianGuidedStudy.getState().question')==before+1
    assert not errors,errors
    context.close()
  browser.close()
finally:
 (OUT/'hit-targets.json').write_text(json.dumps(reports,indent=2))
for r in reports:
 print(json.dumps({'width':r['width'],'language':r['language'],'phase':r['phase'],'reserve':r['reserve'],'buttons':[{k:b[k] for k in ['selector','disabled','clear','hit']} for b in r['buttons']],'native_next_advanced':r.get('native_next_advanced')}))
assert len(reports)==24,len(reports)
assert all(all(b['clear'] for b in r['buttons']) for r in reports),'Control centre is obstructed; inspect hit-targets.json'
assert all(r.get('native_next_advanced',True) for r in reports),'Native Next click did not advance'
print('PASS eight live layouts: unobstructed native controls, delayed badge growth, compact paired navigation.')
