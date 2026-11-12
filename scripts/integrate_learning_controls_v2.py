from pathlib import Path
import hashlib,re
P=Path(__file__).resolve().parents[1]
expected={'study/guided-sheet-pilot-v1.js':'a4722b503ff9178c4ded436bbf35014c27a18dcf','guided-course-v2.js':'9900a79cc51d5ae631d1b0a0f45e2001947cbacc','learning-session-v1.js':'27351172cb9dc5bbd2cea0d814d6c2d1d2f71d85','index.html':'1cacbcede35b8d2b02c5e26dd0e440b8281f31d9','study/study-sheets.html':'402a5a64b8e1213273fddaef7157a1f6bf454e61'}
for f,h in expected.items():
 data=(P/f).read_bytes();assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==h,'Source changed: '+f
p=P/'study/guided-sheet-pilot-v1.js';s=p.read_text()
s=s.replace("    const feedback=question.querySelector('.feedback');", "    if(question.dataset.result==='skipped')return 'skipped';\n    const feedback=question.querySelector('.feedback');",1)
s=s.replace('round.first=round.first||{};', 'round.first=round.first||{}; round.last=round.last||{}; round.retryPending=round.retryPending||[];')
s=s.replace('reviewIncorrect:!!old.reviewIncorrect,',"reviewIncorrect:!!old.reviewIncorrect, reviewKind:old.reviewKind||'mistakes',")
a=s.index('    function stats()');b=s.index('    function show()',a)
s=s[:a]+'''    function stats(){
      const states=questions.map(q=>result(q)||round.last[q.dataset.progressKey]||null);
      const missing=states.map((x,i)=>!x||x==='skipped'?i:-1).filter(i=>i>=0);
      return {attempted:states.filter(x=>x&&x!=='skipped').length,correct:states.filter(x=>x==='correct').length,
        skipped:states.filter(x=>x==='skipped').length,wrong:states.filter(x=>x==='wrong').length,
        incorrectIndices:states.map((x,i)=>x==='wrong'?i:-1).filter(i=>i>=0),unansweredIndices:missing,firstUnanswered:missing[0]??-1};
    }
'''+s[b:]
s=s.replace("const unit=reviewing?'Incorrect answer':practice?'Question':'Part';", "const unit=reviewing?(state.reviewKind==='unanswered'?'Unanswered question':'Retry question'):practice?'Question':'Part';")
s=s.replace("state.question<questions.length-1?'Next question':'Finish practice';", "state.question<questions.length-1?'Next question':'Finish practice';\n      nextButton.disabled=practice&&!state.finished&&!result(questions[state.question]);")
needle="history.replaceState(null,'',stepUrl.pathname+stepUrl.search+stepUrl.hash);"
s=s.replace(needle,needle+"\n      window.dispatchEvent(new CustomEvent('italian-study-view-changed'));",1)
s=s.replace("    function move(action){", "    function move(action){\n      if(action!=='back'&&state.step==='practise'&&!state.finished&&!result(questions[state.question]))return false;",1)
s=s.replace("function recordFirst(q){if(!q)return;const r=result(q);if(r&&!round.first[q.dataset.progressKey]){round.first[q.dataset.progressKey]=r;saveRound();}}", "function recordFirst(q){if(!q)return;const r=result(q),k=q.dataset.progressKey;if(r){if(!round.first[k])round.first[k]=r;round.last[k]=r;round.retryPending=round.retryPending.filter(x=>x!==k);saveRound();}}")
s=s.replace("window.ItalianStudySupport?.refreshQuestion(question);},0);}", "window.ItalianStudySupport?.refreshQuestion(question);window.dispatchEvent(new CustomEvent('italian-study-answer-checked',{detail:{question}}));},0);}")
s=s.replace("window.ItalianGuidedStudy={newRound,remember:()=>{remember(state);saveRound();},getState:()=>({...state,round}),questions:()=>questions};", "window.ItalianGuidedStudy={newRound,move,show,stats,recordFirst,remember:()=>{remember(state);saveRound();},getState:()=>({...state,round}),setState:patch=>{Object.assign(state,patch);show();},focusCurrent,questions:()=>questions,scope:()=>scope};")
p.write_text(s)
p=P/'guided-course-v2.js';s=p.read_text();s=s.replace("['again','known'].includes(rating)","['again','unsure','known'].includes(rating)")
s=s.replace("    moveCard(1);\n  }\n  function startReviewAgain", "    if(!window.ItalianFlashFlow?.graded(card,rating))moveCard(1);\n  }\n  function startReviewAgain",1)
s=s.replace("    const {known,again,rated}=confidenceSummary;", "    const {known,again,unsure=0,rated}=confidenceSummary;")
s=s.replace("'<button type=\"button\" class=\"guided-secondary\" data-guide-rate=\"again\">Practise again</button>'+", "'<button type=\"button\" class=\"guided-secondary\" data-guide-rate=\"again\">Again</button>'+\n      '<button type=\"button\" class=\"guided-secondary\" data-guide-rate=\"unsure\">Not sure</button>'+" )
s=s.replace("'<span><strong>'+again+'</strong> Practise again</span>'+", "'<span><strong>'+again+'</strong> Again</span><span><strong>'+unsure+'</strong> Not sure</span>'+" )
s=s.replace("(again?'<button class=\"guided-primary\" data-guide-review-again>Review '+again+' marked '+(again===1?'card':'cards')+'</button>':'')", "(again+unsure?'<button class=\"guided-primary\" data-guide-review-again>Review '+(again+unsure)+' marked cards</button>':'')")
s=s.replace("' · Practise again: '+again+' · Not rated: '+(total-rated)","' · Again: '+again+' · Not sure: '+unsure+' · Not rated: '+(total-rated)")
s=s.replace("    if(ready)window.ItalianCourseBoot?.ready();", "    if(ready)window.ItalianCourseBoot?.ready();\n    window.dispatchEvent(new CustomEvent('italian-flashcard-rendered'));",1)
s=s.replace('  activate();\n})();', '''  window.ItalianFlashcards={getState:()=>({...state}),currentCard,cardList,activeCardList,navigate,moveCard,flip,recordConfidence,toggleFocus,renderKeepingCardFace};
  activate();
})();''')
p.write_text(s)
p=P/'learning-session-v1.js';s=p.read_text().replace("return {total:list.length,known,again,rated:known+again,unrated:list.length-known-again};","const unsure=list.filter(card=>confidence[card.key]==='unsure').length;\n    return {total:list.length,known,again,unsure,rated:known+again+unsure,unrated:list.length-known-again-unsure};").replace("confidence[card.key]==='again').map", "['again','unsure'].includes(confidence[card.key])).map")
p.write_text(s)
for f in ['index.html','study/study-sheets.html']:
 p=P/f;s=p.read_text();prefix='../' if f.startswith('study/') else ''
 s=s.replace('<meta charset="utf-8">','<meta charset="utf-8">\n  <script src="'+prefix+'learning-resume-v2.js?v=20261112flow"></script>',1)
 s=s.replace('</head>','  <link rel="stylesheet" href="'+prefix+'learning-controls-v2.css?v=20261112flow">\n</head>')
 s=s.replace('</body>','<script src="'+prefix+'learning-controls-v2.js?v=20261112flow" defer></script>\n</body>')
 for name in ['guided-sheet-pilot-v1.js','guided-course-v2.js','learning-session-v1.js']:
  s=re.sub(r'('+re.escape(name)+r'\?v=)[^"\s]+',r'\g<1>20261112flow',s)
 p.write_text(s)
p=P/'learning-controls-v2.js';p.write_text(p.read_text().replace("remaining?'Click anywhere to pause.':remaining", "remaining?'Click anywhere to pause.':''"))
print('Integrated narrow state-machine hooks; canonical learning material unchanged.')
