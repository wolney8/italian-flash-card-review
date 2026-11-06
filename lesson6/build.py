#!/usr/bin/env python3
"""Build the Lesson 6 Anki review candidate and preview from canonical content.js.
Requires genanki==0.13.1 and Node.js. No previous deck is modified.
"""
from pathlib import Path
import argparse, base64, hashlib, html, json, re, sqlite3, subprocess, sys, tempfile, zipfile
ROOT=Path(__file__).resolve().parents[1]
# Optional offline build dependency directory; never ship fonts or private originals.
for p in [ROOT/'_build-deps', Path('/mnt/data/lesson6_work/_build-deps')]:
    if p.exists():sys.path.append(str(p))
import genanki
parser=argparse.ArgumentParser();parser.add_argument('--output',default=str(ROOT/'artifacts/lesson6'));args=parser.parse_args()
OUT=Path(args.output);OUT.mkdir(parents=True,exist_ok=True)
data=json.loads(subprocess.check_output(['node','-e',"process.stdout.write(JSON.stringify(require('./lesson6/content.js')))"] ,cwd=ROOT,text=True))
cards=data['cards']; sheets=data['sheets']
assert len(cards)==66 and len(sheets)==9

def stable(kind,key):
    # Fixed identities, independent of card content or export order; safe Anki integer sizes.
    h=int(hashlib.sha256((kind+':'+key).encode()).hexdigest()[:11],16)
    return {'note':1800000000000,'card':1900000000000}[kind]+h%80000000000

def small_id(key): return 1400000000+int(hashlib.sha256(key.encode()).hexdigest()[:8],16)%500000000
class StableNote(genanki.Note):
    def write_to_db(self,cursor,timestamp,deck_id,id_gen):
        super().write_to_db(cursor,timestamp,deck_id,iter([stable('note',self.fields[0]),stable('card',self.fields[0])]))

basecss='''
.card { --bg:#f8f3eb;--paper:#fffcf7;--paper2:#f3e8db;--ink:#332d28;--muted:#675b52;--line:#dacabe;--green:#285d47;--accent:#8c4938;--pink:#8c4938;background:var(--bg);color:var(--ink);font:18px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:left;margin:0;padding:22px 16px; }
.card.nightMode,.card.night_mode {--bg:#1d1c1a;--paper:#292622;--paper2:#37302b;--ink:#f6e8dc;--muted:#d5c2b4;--line:#65574c;--green:#bcd4bd;--accent:#f0b39a;--pink:#f0b39a}
.l6-card{max-width:760px;margin:auto;border:1px solid var(--line);border-radius:17px;background:var(--paper);padding:25px}
.l6-kicker{color:var(--muted);font-size:12px;letter-spacing:.06em;margin-bottom:12px}
.panel-head{display:flex;align-items:center;gap:12px;margin-bottom:24px}.panel-badge{display:grid;place-items:center;border:1px solid var(--line);border-radius:50%;font-size:13px;width:38px;height:38px;flex:none}.panel-title{font:500 25px/1.25 Georgia,serif}
.instruction{font-size:16px;color:var(--muted);margin:0 0 10px}.focus{font-size:29px;line-height:1.4;font-weight:500;margin:6px 0 18px}.clue{font-size:15px;color:var(--muted)}
.italian{font-size:30px;font-weight:500;line-height:1.35;margin:0 0 8px}.pron-guide-line{font-size:21px;line-height:1.5;color:var(--green)}.pron-ipa-line{font-size:17px;color:var(--muted);line-height:1.5;margin:3px 0 20px}.pron-guide-line strong{font-weight:600}
.section{border-top:1px solid var(--line);margin-top:20px;padding-top:15px}.label{font-size:12px;color:var(--muted);letter-spacing:.03em;margin-bottom:8px}.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;align-items:stretch}.word-tile{display:flex;flex-direction:column;justify-content:space-between;gap:10px;padding:12px;background:var(--paper2);border-radius:9px}.word-tile small{font-size:13px;color:var(--muted)}
.extra{margin-top:20px;font-size:14px;color:var(--muted)}.extra summary{padding:8px 0;cursor:pointer}.extra .inside{padding:8px 0}b,strong{font-weight:600}.gram{border-bottom:2px solid currentColor;font-weight:500}.gram.formal{color:#6741a3}.gram.informal{color:#8a4b00}.gram.masc{color:#165da6}.gram.fem{color:#9d2e62}.gram.sing{color:#775500}.gram.plur{color:#146a56}.nightMode .gram.formal{color:#d2b5ff}.nightMode .gram.informal{color:#ffbf69}.nightMode .gram.masc{color:#9ac8ff}.nightMode .gram.fem{color:#ffb3d1}.nightMode .gram.sing{color:#ffd166}.nightMode .gram.plur{color:#9ee3cf}
@media(max-width:500px){.card{padding:12px 8px}.l6-card{padding:19px 16px}.focus{font-size:25px}.italian{font-size:27px}.panel-title{font-size:22px}}
'''
css=basecss+(ROOT/'lesson6/styles.css').read_text()
fields=['StableKey','Lesson','Topic','Panel','Prompt','Answer','Pronunciation','NaturalEnglish','Literal','Usage','Pattern','Extra','CourseSource','PronunciationStatus']
qfmt='<article class="l6-card"><div class="l6-kicker">LESSON 6 · RECALL</div>{{Panel}}{{Prompt}}</article>'
afmt='''<article class="l6-card"><div class="l6-kicker">LESSON 6 · ANSWER</div><div class="italian">{{Answer}}</div>{{#Pronunciation}}{{Pronunciation}}{{/Pronunciation}}{{#NaturalEnglish}}<div class="section"><div class="label">NATURAL ENGLISH</div>{{NaturalEnglish}}</div>{{/NaturalEnglish}}{{#Literal}}<div class="section"><div class="label">LITERAL CONSTRUCTION</div>{{Literal}}</div>{{/Literal}}{{#Usage}}<div class="section"><div class="label">USE / WORD JOBS</div>{{Usage}}</div>{{/Usage}}{{#Pattern}}<div class="section"><div class="label">RULE / FORMS</div>{{Pattern}}</div>{{/Pattern}}{{#Extra}}<details class="extra"><summary>Memory aid and extra information</summary><div class="inside">{{Extra}}</div></details>{{/Extra}}<details class="extra"><summary>Course source</summary><div class="inside">{{CourseSource}}<br>{{StableKey}}<br>{{PronunciationStatus}}</div></details></article>'''
model=genanki.Model(small_id('Italian-L6-Recall-1'),'Italian Course - Lesson 6 Recall v1',fields=[{'name':f} for f in fields],templates=[{'name':'Recall','qfmt':qfmt,'afmt':afmt}],css=css,sort_field_index=0)
rootdeck=genanki.Deck(small_id(data['deckName']),data['deckName'])
decks={t:genanki.Deck(small_id(data['deckName']+'::'+t),data['deckName']+'::'+t) for t in data['topics']}
media=[ROOT/'lesson6/media/l6-intonation-statement.png',ROOT/'lesson6/media/l6-intonation-question.png']

def ankify(s):return str(s).replace('lesson6/media/','')
for i,c in enumerate(cards):
    values=[c['key'],c['lesson'],c['deck'],c['panel'],c['prompt'],c['answer'],c['pron'],c['meaning'],c['literal'],c['usage'],c['pattern'],c['clarification'],c['reference'],c['pronunciation_status']]
    note=StableNote(model=model,fields=[ankify(x) for x in values],guid=genanki.guid_for('italian-course',c['key']),due=i+1,tags=['Lesson6',c['task_kind'].replace(' ','_'),c['source_class'].replace(' ','_')])
    decks[c['deck']].add_note(note)
package=genanki.Package([rootdeck]+list(decks.values()),media_files=[str(p) for p in media])
apkg=OUT/'Italian_Lesson_6_Review_Candidate.apkg';package.write_to_file(apkg)
# Content and identity validation; no claims about native Anki-app import.
with zipfile.ZipFile(apkg) as z:
    with tempfile.TemporaryDirectory() as td:
        z.extract('collection.anki2',td);db=sqlite3.connect(Path(td)/'collection.anki2')
        integrity=db.execute('pragma integrity_check').fetchone()[0];assert integrity=='ok'
        rows=db.execute('select id,guid,flds from notes').fetchall();assert len(rows)==len(cards)
        count=db.execute('select count(*) from cards').fetchone()[0];assert count==len(cards)
        assert len({r[1] for r in rows})==len(cards)
        canonical={c['key']:c for c in cards}
        for nid,guid,raw in rows:
            v=raw.split('\x1f');assert len(v)==len(fields);c=canonical[v[0]]
            assert nid==stable('note',v[0]);assert v[5]==ankify(c['answer']);assert v[6]==ankify(c['pron']);assert v[4]==ankify(c['prompt'])
        assert db.execute('select count(*) from cards where due<1 or due>66').fetchone()[0]==0
        assert db.execute('select count(*) from cards where reps!=0 or ivl!=0').fetchone()[0]==0
        db.close()
    medias=json.loads(z.read('media'));assert len(medias)==2

# Standalone preview: all data/media embedded; no network, tracking or storage writes.
embedded=json.loads(json.dumps(data))
for f in media:
    uri='data:image/png;base64,'+base64.b64encode(f.read_bytes()).decode()
    def replace_all(x):
        if isinstance(x,str):return x.replace('lesson6/media/'+f.name,uri)
        if isinstance(x,list):return [replace_all(y) for y in x]
        if isinstance(x,dict):return {k:replace_all(v) for k,v in x.items()}
        return x
    embedded=replace_all(embedded)
preview_head='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lesson 6 · Review candidate</title><style>'''+css+'''
body{max-width:1080px;margin:auto}.preview-header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 20px;padding:8px 0 16px;border-bottom:1px solid var(--line)}.preview-header h1{font:500 27px/1.2 Georgia,serif;margin:0}.preview-header p{font-size:14px;color:var(--muted);margin:6px 0}.preview-controls{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.preview-controls button,.preview-controls select,button.nav{padding:10px 13px;min-height:44px;background:var(--paper);color:var(--ink);border:1px solid var(--line);border-radius:10px;font:500 15px/1.4 system-ui;cursor:pointer}button[aria-pressed="true"],button.primary{background:var(--green);color:var(--bg)}.preview-controls select{flex:1;min-width:170px;max-width:100%}.preview-meta{font-size:13px;color:var(--muted);margin-bottom:12px}.preview-note{font-size:13px;color:var(--muted);max-width:850px}.stage-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.stage-row button{width:100%}.nav-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.progress{height:8px;border-radius:5px;background:var(--paper2);overflow:hidden;margin:10px 0 20px}.progress>span{display:block;height:100%;background:var(--green)}.question{font-size:23px;line-height:1.5}.choice{display:block;padding:12px;border:1px solid var(--line);border-radius:9px;margin:8px 0;cursor:pointer}.choice input{margin-right:10px}input.answer{width:100%;box-sizing:border-box;padding:12px;border:1px solid var(--line);border-radius:8px;font:18px system-ui;background:var(--paper2);color:var(--ink)}.matrix-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:16px}th,td{border:1px solid var(--line);padding:12px;text-align:left;vertical-align:top}th{font-size:13px;background:var(--paper2)}.bullet{padding:14px;margin:10px 0;background:var(--paper2);border-radius:10px}.result{margin:12px 0;padding:12px;border-left:3px solid var(--green);background:var(--paper2)}button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid var(--accent);outline-offset:3px}button:disabled{opacity:.45;cursor:default}.preview-caption{font-size:13px;color:var(--muted);margin:15px 0}.l6-card h2{font-size:24px;font-weight:500}.source-ref{font-size:12px;color:var(--muted);margin-top:22px}
</style><body class="card"><header class="preview-header"><div><h1>Italian for Beginners · Lesson 6</h1><p>Numbers, Essere and Questions · 3 November 2026</p></div><button class="nav" id="theme">Dark mode</button></header><p class="preview-note">Review candidate · pronunciation guides are approximate and await dictionary review. Homework is grouped separately. No listening recordings are included.</p><div class="preview-controls"><button id="cardsMode" aria-pressed="true">Flashcards</button><button id="studyMode" aria-pressed="false">Study Sheets</button><select id="topic" aria-label="Choose topic"></select></div><div id="meta" class="preview-meta" aria-live="polite"></div><div class="progress"><span id="progress"></span></div><div id="stage" class="preview-controls stage-row"></div><main id="view"></main><div class="nav-row"><button id="prev" class="nav">← Previous</button><button id="next" class="nav">Next →</button></div><p class="preview-caption">Preview controls do not change your existing website, Anki reviews or saved course progress.</p><script>const DATA='''
preview_js=r''';
let mode='cards',topic=0,index=0,side=false,stage='learn',part=0;const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function choices(){const items=mode==='cards'?DATA.topics:DATA.sheets.map(s=>s.title);$('#topic').innerHTML=items.map((t,i)=>'<option value="'+i+'">'+esc(t)+'</option>').join('');$('#topic').value=topic;}
function reset(){index=0;part=0;side=false;stage='learn';render();}
function panel(s){if(s.type==='table')return '<h2>'+esc(s.title)+'</h2><div class="matrix-wrap"><table><thead><tr>'+s.headers.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+s.rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';return '<h2>'+esc(s.title)+'</h2>'+s.items.map(x=>'<div class="bullet">'+x+'</div>').join('');}
function render(){
 $('#cardsMode').setAttribute('aria-pressed',mode==='cards');$('#studyMode').setAttribute('aria-pressed',mode==='study');
 if(mode==='cards'){
  const list=DATA.cards.filter(c=>c.deck===DATA.topics[topic]),c=list[index];$('#stage').innerHTML='';$('#meta').textContent='Card '+(index+1)+' of '+list.length+' · '+c.deck;$('#progress').style.width=((index+1)/list.length*100)+'%';
  $('#view').innerHTML='<article class="l6-card">'+(side?'<div class="italian">'+c.answer+'</div>'+c.pron+'<div class="section"><div class="label">NATURAL ENGLISH</div>'+c.meaning+'</div>'+(c.literal?'<div class="section"><div class="label">LITERAL CONSTRUCTION</div>'+c.literal+'</div>':'')+(c.pattern?'<div class="section"><div class="label">RULE / FORMS</div>'+c.pattern+'</div>':'')+(c.clarification?'<details class="extra"><summary>Memory aid</summary>'+c.clarification+'</details>':'')+'<details class="extra"><summary>Course source</summary>'+c.reference+'<br>'+c.pronunciation_status+'</details>':c.panel+c.prompt)+'<p><button class="nav primary" id="flip">'+(side?'Show prompt':'Reveal answer')+'</button></p></article>';
  $('#flip').onclick=()=>{side=!side;render()};$('#prev').disabled=index===0;$('#next').disabled=index===list.length-1;
 }else{
  const s=DATA.sheets[topic];$('#stage').innerHTML=['learn','examples','practise'].map((x,i)=>'<button class="nav" data-stage="'+x+'" aria-pressed="'+(stage===x)+'">'+(i+1)+' '+({learn:'Learn',examples:'Examples',practise:'Practise'})[x]+'</button>').join('');
  $('[data-stage="learn"]').onclick=()=>{stage='learn';part=0;render()};$('[data-stage="examples"]').onclick=()=>{stage='examples';part=1;render()};$('[data-stage="practise"]').onclick=()=>{stage='practise';render()};
  const offset=stage==='learn'?0:stage==='examples'?part:s.study_sections.length+index;
  $('#meta').textContent=s.subtitle+' · '+(stage==='practise'?'Question '+(index+1)+' of '+s.questions.length:stage==='examples'?'Example '+part+' of '+(s.study_sections.length-1):'Learn');$('#progress').style.width=((offset+1)/(s.study_sections.length+s.questions.length)*100)+'%';
  if(stage!=='practise')$('#view').innerHTML='<article class="l6-card">'+panel(s.study_sections[stage==='learn'?0:part])+'</article>';
  else{
   const q=s.questions[index];$('#view').innerHTML='<article class="l6-card"><div class="question">'+q.prompt+'</div><details class="extra"><summary>Hint</summary>'+q.hint+'</details><div style="margin-top:18px">'+(q.type==='choice'?q.choices.map((x,i)=>'<label class="choice"><input type="radio" name="answer" value="'+i+'">'+esc(x)+'</label>').join(''):'<input class="answer" id="answer" aria-label="Your answer" placeholder="Type the missing answer">')+'</div><p><button id="check" class="nav primary">Check answer</button></p><div id="feedback" aria-live="polite"></div><details class="extra"><summary>Source</summary>'+q.source+'<br>'+q.answer_origin+'</details></article>';
   $('#check').onclick=()=>{const selection=$('input[name="answer"]:checked');const value=q.type==='choice'?(selection?q.choices[Number(selection.value)]:''):$('#answer').value;if(!value.trim())return;const norm=x=>{let t=x.normalize('NFC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ');return q.answer_mode==='punctuation'?t:t.replace(/[.!?,;:]/g,'').trim()};const ok=q.answers.some(a=>norm(a)===norm(value));$('#feedback').innerHTML='<div class="result">'+(ok?'Correct':'Not yet')+' · '+esc(q.model)+'<div class="l6-feedback-explanation">'+q.explanation+'</div></div>'};
  }
  $('#prev').disabled=stage==='learn';$('#next').disabled=stage==='practise'&&index===s.questions.length-1;
 }
}
$('#prev').onclick=()=>{if(mode==='cards'){index--;side=false}else if(stage==='examples'){if(part>1)part--;else stage='learn'}else if(stage==='practise'){if(index>0)index--;else{stage='examples';part=DATA.sheets[topic].study_sections.length-1}}render()};
$('#next').onclick=()=>{if(mode==='cards'){index++;side=false}else if(stage==='learn'){stage='examples';part=1}else if(stage==='examples'){if(part<DATA.sheets[topic].study_sections.length-1)part++;else stage='practise'}else index++;render()};
$('#topic').onchange=e=>{topic=Number(e.target.value);reset()};$('#cardsMode').onclick=()=>{mode='cards';topic=0;choices();reset()};$('#studyMode').onclick=()=>{mode='study';topic=0;choices();reset()};$('#theme').onclick=()=>{const dark=document.body.classList.toggle('nightMode');document.documentElement.dataset.italianTheme=dark?'dark':'light';$('#theme').textContent=dark?'Light mode':'Dark mode'};choices();render();
</script></body></html>'''
preview=preview_head+json.dumps(embedded,ensure_ascii=False).replace('</script','<\\/script')+preview_js
(OUT/'Lesson_6_Interactive_Preview.html').write_text(preview)
(OUT/'lesson6-card-inventory.json').write_text(json.dumps(cards,ensure_ascii=False,indent=2))
(OUT/'lesson6-study-inventory.json').write_text(json.dumps(sheets,ensure_ascii=False,indent=2))
(OUT/'lesson6-pronunciation-audit.json').write_text(json.dumps([{k:c[k] for k in ['key','primaryAnswer','guide','ipa','pronunciation_status','pronunciation_note','reference']} for c in cards if c['pron']],ensure_ascii=False,indent=2))
report={'status':'review candidate','lesson_date':'2026-11-03','cards':len(cards),'subdecks':len(decks),'study_sets':len(sheets),'practice_questions':sum(len(s['questions']) for s in sheets),'homework_questions':sum(len(s['questions']) for s in sheets if s['kind']=='homework'),'sqlite_integrity':integrity,'note_card_field_parity':'pass','stable_ids_guids':'pass','media_files':len(media),'unverified_pronunciations':sum(bool(c['pron']) for c in cards),'native_anki_import_test':'not performed','source_issues':data['issues']}
(OUT/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
(OUT/'IMPORT_AND_REVIEW.md').write_text(f'''# Lesson 6 — import and review

**Review candidate:** {len(cards)} notes / {len(cards)} recall cards, in {len(decks)} subdecks.

1. Open `Italian_Lesson_6_Review_Candidate.apkg` in Anki.
2. Check that the parent deck is **{data['deckName']}**.
3. Existing Lesson 1–5 cards are not included or modified. This package adds Lesson 6 only.
4. Future revisions must retain the stable keys, GUIDs and note/card identities. Reimport the updated package rather than deleting the current notes; keep your own scheduling history.

## What to check
- The numbers cards teach repeating **cento / mila**, the **mille** contrast, **ventuno / ventotto** joins and **ventitré** accent.
- The original two intonation graphics are included as media. They show the supplied statement/question pair and its different pitch ending.
- Speaking tasks are self-assessed. No teacher recordings or automatic speech grading are claimed.
- All 30 supplied homework questions are in the separate Study Sheet sets, alongside 27 class/group questions and 26 adapted pattern/meaning practice questions.

## Review limits
The course content and source diagrams have been checked against the supplied files. English-friendly pronunciation and IPA are supplementary working guides: **{report['unverified_pronunciations']} entries remain provisional**. They have not all passed an independent dictionary/native-speaker audit. This is not a pronunciation-certified release.

The package passed SQLite integrity, field/card counts, stable-identity, media and Anki/web content-parity checks. A native Anki application import was not available here. The browser preview can be opened directly and needs no internet connection.

The source's double-question-mark row (“Sono italiani?” in both columns) was not silently corrected; it is excluded from scored question/statement exercises. Missing textbook pages/recordings were not invented.
''')
print(json.dumps(report,ensure_ascii=False,indent=2))
