#!/usr/bin/env python3
"""Portable build from the three committed canonical Lesson 7 JSON files."""
from pathlib import Path
import argparse, json, hashlib, zipfile, sqlite3, tempfile

REPO=Path(__file__).resolve().parents[2]
L7=REPO/'lesson7'
parser=argparse.ArgumentParser(description='Assemble the canonical Lesson 7 web content and review inventories.')
parser.add_argument('--output-dir',type=Path,default=REPO/'artifacts'/'lesson7-review',help='Directory for generated review files; defaults to artifacts/lesson7-review.')
parser.add_argument('--anki',action='store_true',help='Also generate the review APKG and identity registry. Requires genanki. No existing user collection is read or edited.')
args=parser.parse_args()
OUT=args.output_dir.expanduser().resolve()
OUT.mkdir(parents=True,exist_ok=True)
C=json.loads((L7/'card-data.json').read_text())
S=json.loads((L7/'study-data.json').read_text())
R=json.loads((L7/'lesson6-recap-data.json').read_text())
sheets=S if isinstance(S,list) else S['sheets']
cards=C['cards']
topics=C['topics']
def choose(prefixes):
    return [s['slug'] for s in sheets if any(s['slug'].startswith(p) for p in prefixes)]

# The authored study file supplies its exact catalogue mapping when available.
lib_topics=(S.get('libraryTopics',[]) if isinstance(S,dict) else [])
if not lib_topics:
    lib_topics=[
      {'id':'l7-families','title':'Verb families and infinitives','it':'Famiglie verbali e infinito','category':'verbs','sets':['l7-families','l7-homework-matching'],'flashcards':{'lesson':'L7','deck':topics[0]}},
      {'id':'l7-build-are','title':'Build the regular -ARE pattern','it':'Costruisci il modello regolare in -ARE','category':'verbs','sets':['l7-endings'],'flashcards':{'lesson':'L7','deck':topics[1]}},
      {'id':'l7-core-verbs','title':'Five everyday verbs','it':'Cinque verbi quotidiani','category':'verbs','sets':['l7-class-'+v for v in ['lavorare','abitare','parlare','studiare','mangiare']],'flashcards':{'lesson':'L7','deck':topics[2]}},
      {'id':'l7-forms','title':'Choose the verb form','it':'Scegli la forma verbale','category':'verbs','sets':['l7-homework-gaps','l7-homework-choices','l7-homework-more'],'flashcards':{'lesson':'L7','deck':topics[3]}},
      {'id':'l7-stress-spelling','title':'Stress and spelling','it':'Accento e ortografia','category':'sounds','sets':['l7-stress-spelling'],'flashcards':{'lesson':'L7','deck':topics[4]}},
      {'id':'l7-sentences','title':'Build everyday sentences','it':'Costruisci frasi quotidiane','category':'conversation','sets':['l7-homework-translation'],'flashcards':{'lesson':'L7','deck':topics[5]}},
      {'id':'l7-connected','title':'Connect earlier learning','it':'Collega ciò che sai','category':'grammar','sets':['l7-connected'],'flashcards':{'lesson':'L7','deck':topics[6]}},
    ]
libraryLesson=((S.get('libraryLesson') if isinstance(S,dict) else None) or {
 'id':'L7','date':'2026-11-10','title':'Regular -ARE verbs and everyday sentences',
 'it':'Verbi regolari in -ARE e frasi quotidiane',
 'description':'Recognise verb families, build regular -ARE forms, hear the stress and use full sentences.',
 'topics':[t['id'] for t in lib_topics], 'extra':[]
})
libraryLesson['id']='L7'
libraryLesson['date']='2026-11-10'
existingTopicSets=R.get('existingTopicSets',{})
# Shared recap is reachable from L6 Questions and L7, without copied questions.
recap_topic={'id':'l7-l6-recap','title':'Useful questions and reminders','it':'Domande utili e promemoria','category':'conversation','sets':[s['slug'] for s in R['sheets']],'flashcards':{'lesson':'L6','deck':'Question words and useful phrases'}}
lib_topics.append(recap_topic)
if recap_topic['id'] not in libraryLesson['topics']:
    libraryLesson['topics'].insert(0,recap_topic['id'])

coverage={
 'status':'Review candidate; not published', 'lesson_date':'2026-11-10',
 'source_counts':{'classroom_responses':30,'homework_responses':29,'source_responses':59},
 'cards':len(cards),'card_topics':[{'name':t,'count':sum(c['deck']==t for c in cards)} for t in topics],
 'study_sets':[{'slug':s['slug'],'title':s['title'],'kind':s.get('kind'),'screens':len(s['questions']),'responses':sum(len(q.get('pairs',[])) if q['type']=='match' else 1 for q in s['questions'])} for s in sheets+R['sheets']],
 'lesson6':{'existing_cards':66,'new_cards':0,'new_practice_screens':sum(len(s['questions']) for s in R['sheets']),'recapReferences':R.get('recapReferences',[])},
 'unavailable_sources':['Textbook page 173 exercise 14','Textbook grammar page 233','No separate email body was present in the message'],
 'pronunciation':'Approximate English-friendly guides; core stress checked; full IPA is provisional. No recorded audio or speech assessment.',
 'source_issues':[
  'Voi is plural. The 2nd S label in the Lesson 7 minutes is a typo.',
  'The pattern applies to regular -ARE verbs. It is not a rule for every verb ending in -ARE.',
  'Internal accents in the stress examples are teaching marks. Ordinary answers keep standard spelling.',
  'Studiare and mangiare use one i in studi/studiamo and mangi/mangiamo.',
  'Vivere appears in the minutes/tables; vedere appears on slide 9. Both are retained as -ERE examples.',
  'Dormire and leggere belong to -IRE and -ERE, even though they appear in the -ARE homework matching set.',
  'The English You study history is ambiguous. A labelled prompt clarification or full alternatives prevents unfair marking.',
  'Verb complements depend on the construction: parlare can occur without a direct object; working in a profession is an intransitive use of lavorare.',
  'Io sono andato is naturally I went / I have gone; I am gone is not used as the natural translation in the recap.'
 ],
 'lesson_delta':[
  {'lesson':'L1','connection':'Subject and person; informal tu and formal Lei. New -ARE applications are labelled support.'},
  {'lesson':'L2','connection':'Soft g in mangiare, the meaning of grammatical person, and spelling. Full endings are new.'},
  {'lesson':'L3','connection':'Abitare revisits residence. The new focus is its regular family and complete conjugation, with a + city / in + country reminders.'},
  {'lesson':'L4','connection':'Quantity and article agreement remain visible; compare one banana with some bananas.'},
  {'lesson':'L5','connection':'Singular/plural and some return in complete sentences, with the target of each question stated.'},
  {'lesson':'L6','connection':'Reuse the existing question/expression cards and number/essere/negative/intonation routes. Add 12 contextual recall tasks and a visible reminder guide.'},
 ],
}
payload={'version':'2026-11-13-lesson7-review-1','status':'review candidate','sources':C['sources'],'topics':topics,'topicsIt':C['topicsIt'],'cards':cards,'sheets':sheets,'forms':C['forms'],'libraryLesson':libraryLesson,'libraryTopics':lib_topics,'lesson6Supplements':{'cards':[],'sheets':R['sheets'],'topics':[]},'existingTopicSets':existingTopicSets,'recapReferences':R.get('recapReferences',[]),'reminderSections':R.get('reminderSections',[]),'coverage':coverage,'uiTranslations':S.get('uiTranslations',{}) if isinstance(S,dict) else {}}
serialized=json.dumps(payload,ensure_ascii=False,separators=(',',':'))
(L7/'content.js').write_text('/* Canonical Lesson 7 review data. One dataset supplies web cards and Anki. */\n(function(root){\nconst data='+serialized+';\nif(typeof module!=="undefined")module.exports=data;\nif(root)root.ITALIAN_L7=data;\n})(typeof window!=="undefined"?window:null);\n')
(OUT/'Lesson_7_Canonical_Content.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2))
(OUT/'Lesson_7_Coverage_Map.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2))
(OUT/'Lesson_7_Pronunciation_Inventory.json').write_text(json.dumps([{k:c[k] for k in ['key','primaryAnswer','guide','ipa','pronunciation_status','pronunciation_note','reference']} for c in cards if c['pron']],ensure_ascii=False,indent=2))

if args.anki:
    import genanki
    # Dedicated stable model/deck identities avoid changing the already imported Lesson 6 note type.
    def ident(label,base=1600000000,span=400000000):
        return base+int(hashlib.sha256(label.encode()).hexdigest()[:15],16)%span
    model_id=ident('italian-course-lesson7-recall-v1')
    fields=['StableKey','Lesson','Topic','Panel','Prompt','Answer','Pronunciation','NaturalEnglish','Literal','Usage','Pattern','Extra','CourseSource','PronunciationStatus']
    css=(Path(__file__).parent/'anki-base.css').read_text()+'\n'+(L7/'styles.css').read_text()+'\n.card{font-size:19px}.l7-card{max-width:760px;margin:0 auto;text-align:left;overflow-wrap:anywhere}.l7-card .panel-title{font-size:1.3em}.l7-card .focus{font-size:1.25em}.l7-card .italian{font-size:1.7em}.l7-kicker{font-size:.75em;letter-spacing:.12em;opacity:.75;margin-bottom:14px}.nightMode .l7-word-tile{border-color:#55584e}.l7-card .l7-stress{font-size:1.2em}.l7-card p{line-height:1.5}.l7-form-row>span:last-child{font-size:.9em}'
    qfmt='<article class="l7-card"><div class="l7-kicker">LESSON 7 · RECALL</div>{{Panel}}{{Prompt}}</article>'
    afmt='<article class="l7-card"><div class="l7-kicker">LESSON 7 · ANSWER</div><div class="italian">{{Answer}}</div>{{#Pronunciation}}{{Pronunciation}}{{/Pronunciation}}'
    for f,label in [('NaturalEnglish','Natural English'),('Literal','Literal construction'),('Usage','Use / word jobs'),('Pattern','Rule / forms')]:
        afmt+='{{#'+f+'}}<div class="section"><div class="label">'+label+'</div>{{'+f+'}}</div>{{/'+f+'}}'
    afmt+='{{#Extra}}<details class="extra"><summary>Memory aid and extra information</summary><div class="inside">{{Extra}}</div></details>{{/Extra}}<details class="extra"><summary>Course source</summary><div class="inside">{{CourseSource}}<br>{{PronunciationStatus}}</div></details></article>'
    model=genanki.Model(model_id,'Italian Course - Lesson 7 Recall v1',fields=[{'name':f} for f in fields],templates=[{'name':'Recall','qfmt':qfmt,'afmt':afmt}],css=css,sort_field_index=0)
    parent='Italian - Lesson 7 - Regular ARE Verbs and Everyday Sentences'
    decks={t:genanki.Deck(ident('italian-l7-deck:'+t),parent+'::'+t) for t in topics}
    for i,c in enumerate(cards):
        vals=[c['key'],c['lesson'],c['deck'],c['panel'],c['prompt'],c['answer'],c['pron'],c['meaning'],c['literal'],c['usage'],c['pattern'],c['clarification'],c['reference']+' · '+c['source_class'],c['pronunciation_status']]
        note=genanki.Note(model=model,fields=vals,guid=genanki.guid_for(c['key']),tags=['Italian','Lesson7',c['source_class'].replace(' ','_')],due=i+1)
        decks[c['deck']].add_note(note)
    apkg=OUT/'Italian_Lesson_7_Review.apkg'
    genanki.Package(list(decks.values())).write_to_file(str(apkg))
    # Stable IDs on disk as well as stable GUIDs. SQLite mod fields remain integer seconds.
    with tempfile.TemporaryDirectory() as td:
        td=Path(td)
        with zipfile.ZipFile(apkg) as z:z.extractall(td)
        dbp=td/'collection.anki2'
        con=sqlite3.connect(dbp)
        oldnotes=con.execute('select id,flds from notes').fetchall()
        registry=[]
        for oldid,flds in oldnotes:
            key=flds.split('\x1f')[0]
            nid=ident(key+':note',1800000000000,500000000000)
            cid=ident(key+':card',2400000000000,500000000000)
            con.execute('update notes set id=? where id=?',(nid,oldid))
            con.execute('update cards set id=?,nid=? where nid=?',(cid,nid,oldid))
            guid=con.execute('select guid from notes where id=?',(nid,)).fetchone()[0]
            registry.append({'key':key,'note_id':nid,'card_id':cid,'guid':guid})
        con.commit()
        integrity=con.execute('pragma integrity_check').fetchone()[0]
        assert integrity=='ok'
        con.close()
        with zipfile.ZipFile(apkg,'w',zipfile.ZIP_DEFLATED) as z:
            for p in td.iterdir():z.write(p,p.name)
    (OUT/'Lesson_7_Identity_Registry.json').write_text(json.dumps({'model_id':model_id,'decks':{t:d.deck_id for t,d in decks.items()},'notes':registry},indent=2))
    print(json.dumps({'cards':len(cards),'topics':len(topics),'study_screens':sum(len(s['questions']) for s in sheets),'recap_screens':sum(len(s['questions']) for s in R['sheets']),'apkg':str(apkg),'sqlite_integrity':integrity,'content_bytes':len(serialized.encode())}))
else:
    print(json.dumps({'cards':len(cards),'topics':len(topics),'study_screens':sum(len(s['questions']) for s in sheets),'recap_screens':sum(len(s['questions']) for s in R['sheets']),'output_dir':str(OUT),'anki':'not requested'}))
