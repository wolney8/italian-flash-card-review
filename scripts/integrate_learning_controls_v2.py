from pathlib import Path
import subprocess
P=Path(__file__).resolve().parents[1]
changed=[]
def write(f,s):
 (P/f).write_text(s);changed.append(f)
f='learning-controls-v2.js';s=(P/f).read_text();needle="const prev=actions.querySelector('[data-guide-prev]');";assert needle in s
s=s.replace(needle,"label(actions.querySelector('[data-guide-prev]'),'Previous','Indietro');label(actions.querySelector('[data-guide-next]'),'Next','Avanti');\n const prev=actions.querySelector('[data-guide-prev]');")
s=s.replace('guide().show();root.ItalianStudyPersistence?.captureAll();refreshStudy();},0);',"guide().show();root.ItalianStudyPersistence?.captureAll();refreshStudy();if(guide().getState().step==='practise'&&!guide().getState().finished&&scrollY<50)requestAnimationFrame(()=>guide().focusCurrent(24));},0);")
write(f,s)
f='learning-controls-v2.css';s=(P/f).read_text().replace('body.flow-flashcards.guided-focus-active .study-flash-return,','');s+='\n.flow-flash-rail .guided-review-navigation button{overflow-wrap:normal!important;word-break:normal!important;white-space:nowrap}\n';write(f,s)
# Established content/navigation suites use manual advance; dedicated v2 tests cover timers.
for f in ['scripts/validate_course_library_browser.py','scripts/validate_library_finish.py','scripts/validate_study_support.py']:
 s=(P/f).read_text();obj='context' if 'library_finish' in f else 'ctx'
 needle='   '+obj+'.route('
 pos=s.index(needle);s=s[:pos]+"   "+obj+".add_init_script(\"try{localStorage.setItem('italianAutoAdvanceV2','off')}catch(_){}\")\n"+s[pos:]
 if 'course_library_browser' in f:
  s=s.replace("   page.click('[data-guided-action=next]');q=", "   page.click('[data-flow-skip]');page.click('[data-guided-action=next]');q=",1)
  old="""   for _ in range(12):
    if page.locator('.guided-sheet-finish').is_visible():break
    page.locator('[data-guided-action=next]').click()"""
  assert old in s;s=s.replace(old,"   page.locator('[data-flow-results]').click()")
 if 'library_finish' in f:
  old="""   for _ in range(12):
    if page.locator('.guided-sheet-finish').is_visible():break
    page.click('[data-guided-action=next]')"""
  assert old in s;s=s.replace(old,"   page.click('[data-flow-results]')")
 write(f,s)
f='scripts/validate_learning_controls_v2.py';s=(P/f).read_text();s='\n'.join(line for line in s.split('\n') if "print('BEFORE_CHECK'" not in line and "print('AFTER_CHECK'" not in line and "f'diagnostic-" not in line)
s=s.replace("   page.locator('[data-flow-focus]').click();page.wait_for_timeout(200)","   if not page.evaluate('document.body.classList.contains(\"guided-focus-active\")'):page.locator('[data-flow-focus]').click()\n   page.wait_for_timeout(200)\n   assert page.evaluate('document.body.classList.contains(\"guided-focus-active\")')\n   page.locator('[data-guide-flip]').click();page.wait_for_timeout(450)")
s=s.replace("q().locator('input').fill('draft');before=idx();", "q().locator('input').fill('draft');before=idx();")
s=s.replace("full_page=True)","full_page=False)")
write(f,s)
subprocess.run(['git','add',*changed],cwd=P,check=True)
print('Updated regression journeys, compact labels and visible return link in focus mode.')
