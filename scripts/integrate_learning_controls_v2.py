from pathlib import Path
import subprocess
P=Path(__file__).resolve().parents[1]
p=P/'learning-controls-v2.js';s=p.read_text()
s=s.replace("if(s.round.retryPending.includes(q.dataset.progressKey))blank(q);", "if(s.round.retryPending.includes(q.dataset.progressKey)){q.dataset.result='';q.querySelector('.feedback').textContent='';q.querySelector('.feedback').className='feedback';q.querySelector('.model-answer').hidden=true;}")
s=s.replace("if(!editing(e)&&/^[1-9]$/.test(e.key)&&q.dataset.type==='choice')", "if((!editing(e)||e.target.matches('input[type=radio]'))&&/^[1-9]$/.test(e.key)&&q.dataset.type==='choice')")
p.write_text(s)
p=P/'scripts/validate_learning_controls_v2.py';s=p.read_text()
s=s.replace("el.locator('.check-button').click();page.wait_for_timeout(150)", """print('BEFORE_CHECK',page.evaluate('({question:ItalianGuidedStudy.getState().question,current:document.querySelector(\".quiz-question:not([hidden])\")?.outerHTML})'),flush=True)
    el.locator('.check-button').click();page.wait_for_timeout(150)
    print('AFTER_CHECK',page.evaluate('({question:ItalianGuidedStudy.getState().question,current:document.querySelector(\".quiz-question:not([hidden])\")?.outerHTML})'),errors,flush=True)
    page.screenshot(path=str(OUT/f'diagnostic-{width}-{theme}.png'),full_page=True)""")
s=s.replace("answer();assert q().get_attribute('data-result')=='correct'", "answer();assert q().get_attribute('data-result')=='correct', (idx(),q().get_attribute('data-result'),q().inner_text(),errors)")
p.write_text(s)
subprocess.run(['git','add','scripts/validate_learning_controls_v2.py'],cwd=P,check=True)
print('Retry drafts preserved; native-check diagnostics enabled.')
