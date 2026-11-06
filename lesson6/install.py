#!/usr/bin/env python3
"""Idempotently integrate the canonical L6 data without changing earlier cards.
Run from any directory: python lesson6/install.py
Only known, validated integration points are changed; fail closed on unexpected source.
"""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def patch(path, old, new):
    p=ROOT/path; s=p.read_text()
    if new in s: return
    if s.count(old)!=1: raise RuntimeError(f'{path}: expected one integration point, found {s.count(old)} for {old[:70]!r}')
    p.write_text(s.replace(old,new))
patch('index.html','  <script src="course-data-loader-v1.js?v=1" defer></script>', '  <script src="lesson6/content.js?v=20261106a" defer></script>\n  <script src="course-data-loader-v1.js?v=20261106l6" defer></script>')
patch('index.html','  <link rel="stylesheet" href="italian-warm-editorial-v1.css?v=20261105a">','  <link rel="stylesheet" href="italian-warm-editorial-v1.css?v=20261105a">\n  <link rel="stylesheet" href="lesson6/styles.css?v=20261106a">')
patch('index.html','guided-course-v2.js?v=20261104e','guided-course-v2.js?v=20261106l6')
patch('course-data-loader-v1.js','    return finalCards;','''    const lesson6Cards=window.ITALIAN_L6?.cards;
    if(!Array.isArray(lesson6Cards)||!lesson6Cards.length)throw new Error('Lesson 6 data did not load.');
    if(lesson6Cards.some(c=>c.lesson!=='L6'))throw new Error('Invalid Lesson 6 assignment.');
    const expanded=finalCards.concat(lesson6Cards);
    if(new Set(expanded.map(c=>c.key)).size!==expanded.length)throw new Error('Duplicate card keys in Lesson 6.');
    return expanded;''')
patch('course-data-loader-v1.js',"      return meta[lesson] || previous(lesson);", "      if(lesson==='L6')return {number:'6',title:'Numbers, Essere and Questions',description:'Number-building patterns, negatives, intonation and useful questions.'};\n      return meta[lesson] || previous(lesson);")
patch('guided-course-v2.js',"    L5:'Ripasso'", "    L5:'Ripasso', L6:'Numeri, essere e domande'")
patch('guided-course-v2.js',"    ['L5', 'Consolidation review', 'Mixed practice from previous lessons']", "    ['L5', 'Consolidation review', 'Mixed practice from previous lessons'],\n    ['L6', 'Numbers, Essere and Questions', 'Number patterns, negatives, intonation and useful expressions']")
patch('guided-course-v2.js',"  const isReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;", "  if(window.ITALIAN_L6){\n    TOPICS.push(...window.ITALIAN_L6.categories.map(c=>[c.title,c.slugs.map(slug=>{const s=window.ITALIAN_L6.sheets.find(x=>x.slug===slug);return [slug,s.title];})]));\n  }\n  const isReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;")
patch('guided-course-v2.js',"  function uiLabel(label) {const [it,en]=translated(label);return labelPair(it,en);}","  function uiLabel(label) {const [it,en]=translated(label);return it===en?esc(en):labelPair(it,en);}")
patch('guided-course-v2.js',"  function topicLabel(label) {return labelPair(STUDY_ITALIAN[label]||label,label);}","  function topicLabel(label) {return STUDY_ITALIAN[label]?labelPair(STUDY_ITALIAN[label],label):esc(label);}")
patch('study/study-sheets.html','  <link rel="stylesheet" href="../italian-warm-editorial-v1.css?v=20261105a">','  <link rel="stylesheet" href="../italian-warm-editorial-v1.css?v=20261105a">\n  <link rel="stylesheet" href="../lesson6/styles.css?v=20261106a">')
patch('study/study-sheets.html','<script src="study-sheets-v5.js?v=20261104c" defer></script>','<script src="../lesson6/content.js?v=20261106a" defer></script>\n<script src="study-sheets-v5.js?v=20261106l6" defer></script>')
patch('study/study-sheets.html','study-editorial-v1.js?v=20261104d','study-editorial-v1.js?v=20261106l6')
patch('study/study-editorial-v1.js',"  function mapped(value){const [it,en]=PAIRS[value]||[value,value];return bi(it,en);}","  function mapped(value){const pair=PAIRS[value];return pair?bi(pair[0],pair[1]):escapeHtml(value);}")
patch('study/study-sheets-v5.js','  const params=new URLSearchParams(location.search);', '''  if(window.ITALIAN_L6){
    data=data.concat(window.ITALIAN_L6.sheets);
    categories.push(...window.ITALIAN_L6.categories);
    // Canonical card paths are relative to the site root; study pages are one level down.
    data=data.map(s=>s.lesson==='L6'?JSON.parse(JSON.stringify(s),(_,v)=>typeof v==='string'?v.replaceAll('src="lesson6/media/','src="../lesson6/media/'):v):s);
  }
  const params=new URLSearchParams(location.search);''')
# Keep source identity and feedback on each question. Existing questions default to legacy checking.
patch('study/study-sheets-v5.js',"attrs=`data-type='${q.type}' data-answers=", "attrs=`data-answer-mode='${q.answer_mode||'legacy'}' data-explanation='${esc(q.explanation||'')}' data-question-key='${esc(q.id||id)}' data-type='${q.type}' data-answers=")
patch('study/study-sheets-v5.js',"const gv=variants(raw,s),ok=a.some(x=>[...gv].some(v=>variants(x,s).has(v))),f=q.querySelector('.feedback');", "const gv=variants(raw,s),ok=q.dataset.answerMode!=='legacy'&&window.ITALIAN_L6?window.ITALIAN_L6.checkAnswer(raw,a,q.dataset.answerMode):a.some(x=>[...gv].some(v=>variants(x,s).has(v))),f=q.querySelector('.feedback');")
patch('study/study-sheets-v5.js',"q.querySelector('.model-answer').hidden=false;q.dataset.result=ok?'correct':'wrong';", "q.querySelector('.model-answer').hidden=false;const explanation=q.dataset.explanation;if(explanation&&!q.querySelector('.l6-feedback-explanation')){const el=document.createElement('div');el.className='l6-feedback-explanation';el.innerHTML=explanation;q.querySelector('.model-answer').appendChild(el);}q.dataset.result=ok?'correct':'wrong';")
# L6-only guidance must describe its exact-accent/punctuation checking, rather than legacy leniency.
patch('study/study-sheets-v5.js','  document.querySelectorAll(".quiz-question").forEach(updateButton);', '''  if(active.lesson==='L6'){
    const tips=root.querySelector('.quiz-intro');
    if(tips)tips.textContent='Enter only the requested answer. Accents matter here: è and e are different. When a task asks you to turn a statement into a question, include the question mark. Answers and explanations stay hidden until an attempt.';
  }
  document.querySelectorAll(".quiz-question").forEach(updateButton);''')
# Source file still has the original nine embedded sheets. The mixed sheet now continues to L6.
p=ROOT/'scripts/validate_study_browser.cjs'; s=p.read_text()
s=s.replace("if(idx===sheets.length-1)assert.ok(result.nextHref?.startsWith('../?page=lessons'),'Final sheet must lead to Flashcards');", "if(idx===sheets.length-1)assert.ok(result.nextHref?.includes('l6-essere-matching'),'Original sequence must continue to Lesson 6');")
p.write_text(s)
print('Lesson 6 integrated: canonical data, metadata, topics, accent/punctuation checks and feedback.')
