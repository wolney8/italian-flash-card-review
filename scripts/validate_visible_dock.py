#!/usr/bin/env python3
"""Record viewport-edge controls and real hosting overlays without changing the page."""
from pathlib import Path
import json,shutil,sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/visible-dock';OUT.mkdir(parents=True,exist_ok=True)
BASE='https://italian-flash-card-review.netlify.app'
CANDIDATE='--candidate' in sys.argv
reports=[]
SNAPSHOT='''()=>{
 const desc=e=>e?{tag:e.tagName,id:e.id,cls:String(e.className),rect:e.getBoundingClientRect().toJSON(),position:getComputedStyle(e).position,pointer:getComputedStyle(e).pointerEvents,z:getComputedStyle(e).zIndex,html:e.outerHTML.slice(0,400)}:null;
 const dock=document.querySelector('.flow-bottom-dock');
 const selectors=['[data-flow-skip]','[data-guided-action=next]','[data-guided-action=back]'];
 return {viewport:{width:innerWidth,height:innerHeight,visual:visualViewport?{width:visualViewport.width,height:visualViewport.height,top:visualViewport.offsetTop}:null},dock:desc(dock),reserve:dock?.style.getPropertyValue('--flow-hosting'),keyboard:getComputedStyle(document.documentElement).getPropertyValue('--flow-keyboard'),buttons:selectors.map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {selector:s,disabled:e.disabled,element:desc(e),hit:desc(document.elementFromPoint(x,y)),clear:e.contains(document.elementFromPoint(x,y)),stack:document.elementsFromPoint(x,y).slice(0,5).map(desc)}}),iframes:[...document.querySelectorAll('iframe')].map(desc)};
}'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 for width,height in [(1280,900),(390,844),(320,720)]:
  context=browser.new_context(viewport={'width':width,'height':height},has_touch=width<600,is_mobile=width<600,reduced_motion='reduce')
  def routing(route):
   url=route.request.url
   if CANDIDATE and url.startswith(BASE+'/learning-controls-v2.js'):
    route.fulfill(path=str(ROOT/'learning-controls-v2.js'),content_type='application/javascript')
   elif url.startswith(BASE):route.continue_()
   else:route.abort()
  context.route('**/*',routing)
  context.add_init_script("if(window===top){localStorage.setItem('italianAutoAdvanceV2','off');localStorage.setItem('italianCourseThemeV1','light');localStorage.setItem('italianCourseLanguageV1','en');}")
  page=context.new_page();page.set_default_timeout(12000)
  page.goto(BASE+'/study/study-sheets.html?sheet=class2-alphabet',wait_until='networkidle')
  page.wait_for_selector('[data-flow-skip]')
  for delay in [100,1500,3500]:
   page.wait_for_timeout(delay)
   report=page.evaluate(SNAPSHOT);report.update(width=width,delay=delay,phase='initial',candidate=CANDIDATE);reports.append(report)
  page.screenshot(path=str(OUT/f'initial-{width}.png'))
  button=page.locator('[data-flow-skip]');r=button.bounding_box();page.mouse.click(r['x']+r['width']/2,r['y']+r['height']/2);page.wait_for_timeout(100)
  before=page.evaluate('ItalianGuidedStudy.getState().question')
  report=page.evaluate(SNAPSHOT);report.update(width=width,phase='after-skip',candidate=CANDIDATE);reports.append(report)
  next_button=page.locator('[data-guided-action=next]');r=next_button.bounding_box()
  if width<600:page.touchscreen.tap(r['x']+r['width']/2,r['y']+r['height']/2)
  else:page.mouse.click(r['x']+r['width']/2,r['y']+r['height']/2)
  page.wait_for_timeout(150)
  report['native_next_advanced']=page.evaluate('ItalianGuidedStudy.getState().question')==before+1
  page.screenshot(path=str(OUT/f'after-next-{width}.png'))
  context.close()
 browser.close()
(OUT/'hit-targets.json').write_text(json.dumps(reports,indent=2))
for r in reports:
 print(json.dumps({'width':r['width'],'phase':r['phase'],'reserve':r['reserve'],'buttons':[{k:b[k] for k in ['selector','disabled','clear','hit']} for b in r['buttons']],'iframes':r['iframes'],'native_next_advanced':r.get('native_next_advanced')}))
assert all(all(b['clear'] for b in r['buttons']) for r in reports),'Control centre is obstructed; inspect hit-targets.json'
assert all(r.get('native_next_advanced',True) for r in reports),'Native Next click did not advance'
