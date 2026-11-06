/* Lesson 6, 3 November 2026. Canonical source for Anki and the Web UI.
 * Course text is preserved. Generated glosses/phonetics are supplementary support.
 * Pronunciation is a review candidate, not a claim of teacher-recorded audio.
 */
(function(root){
'use strict';
const version='2026-11-06-l6-candidate-1';
const sources={
 minutes:{file:'Session 6 - 03.11.2026 - Minutes.pdf',pages:5},
 tables:{file:'Session 6 - 03.11.2026 - Tables.pdf',pages:3},
 slides:{file:'Session 6 - 03.11.2026.pptx',pages:13},
 numbers:{file:'Numeri 20+.pdf',pages:1},
 class:{file:'Esercizi-verbo-essere (Class).pdf',pages:1},
 homework:{file:'Homework-verbo-essere.pdf',pages:2},
 negative:{file:'Homework-verbo-essere-negativo.pdf',pages:1},
 plurals:{file:'Group activity - Plurali Indeterminativi.pdf',pages:2}
};
const topics=['01 Conversation and age','02 Number-building patterns','03 Essere in context','04 Negatives and intonation','05 Question words and useful phrases','06 Plural partitives - revision'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceText=(id,page)=>sources[id].file+' · '+(id==='slides'?'slide ':'page ')+page;
const guideHtml=s=>esc(s).replace(/[A-Z][A-Z]+/g,'<strong>$&</strong>');
const semantic=s=>String(s).replace(/\b(informal|formal|masculine|feminine|singular|plural)\b/g,m=>'<span class="gram '+({masculine:'masc',feminine:'fem',singular:'sing',plural:'plur'}[m]||m)+'">'+m+'</span>');
const pairFigure='<div class="l6-int-pair"><figure class="l6-intonation"><div class="l6-int-label">Statement · falling ending</div><img src="lesson6/media/l6-intonation-statement.png" alt="Claudia è di Vienna. The curve ends downwards." width="580" height="156"></figure><figure class="l6-intonation"><div class="l6-int-label">Question · rising ending</div><img src="lesson6/media/l6-intonation-question.png" alt="Claudia è di Vienna? The curve ends upwards." width="587" height="156"></figure></div>';
const curve=kind=>'<svg class="l6-pitch" role="img" aria-label="'+(kind==='rise'?'Curve ending upwards':'Curve ending downwards')+'" viewBox="0 0 300 76"><path d="'+(kind==='rise'?'M12 47 C65 3 92 16 133 37 S220 68 276 25':'M12 48 C83 2 199 3 275 48')+'" fill="none" stroke="currentColor" stroke-width="3"/><path d="'+(kind==='rise'?'M260 25 L276 25 L269 40':'M261 36 L275 48 L257 48')+'" fill="currentColor"/></svg>';
function num(word){
 let t=esc(word);
 if(t==='mille')return '<span class="l6-n-thousand">mille</span>';
 if(t.endsWith('cento'))return t.slice(0,-5)+'<span class="l6-n-hundred">cento</span>';
 if(t.endsWith('mila'))return t.slice(0,-4)+'<span class="l6-n-thousand">mila</span>';
 if(t==='ventuno')return 'vent<span class="l6-n-join">uno</span>';
 if(t==='ventotto')return 'vent<span class="l6-n-join">otto</span>';
 if(t==='ventitré')return 'venti<span class="l6-n-accent">tré</span>';
 return t;
}
const cards=[];
function add(id,topic,task,target,answer,guide,ipa,meaning,rule,source,page,clue='',opts={}){
 const key='italian-l6-'+id;
 const pron=guide&&ipa?'<div class="pronunciation-compact"><div class="pron-guide-line">'+guideHtml(guide)+'</div><div class="pron-ipa-line">/'+esc(ipa)+'/</div></div>':'';
 cards.push({key,lesson:'L6',deck:topics[topic],panel:'<div class="panel-head"><span class="panel-badge">L6</span><div class="panel-copy"><div class="panel-title">'+esc(topics[topic].slice(3))+'</div></div></div>',
 prompt:'<div class="instruction">'+esc(task)+'</div><div class="focus">'+(opts.targetHtml||esc(target))+'</div>'+(clue?'<div class="clue">'+semantic(esc(clue))+'</div>':''),
 answer:opts.answerHtml||esc(answer),pron,meaning:esc(meaning),literal:opts.literal||'',usage:opts.usage||'',pattern:rule||'',clarification:opts.extra||'',reference:sourceText(source,page),
 primaryAnswer:answer,guide:guide||'',ipa:ipa||'',source_id:source,source_page:page,
 source_class:opts.sourceClass||'COURSE MATERIAL',task_kind:opts.kind||(guide?'production':'concept'),
 pronunciation_status:guide?'Provisional — verification pending':'Not applicable — conceptual answer',
 pronunciation_note:guide?'Supplementary careful-speech guide; not supplied in the lesson files. Stress shown in capitals. IPA and guide need the normal pronunciation review gate.':'',
 relatedEarlier:opts.relatedEarlier||[],visual:opts.visual||null});
}
const conjugation=[['Io','sono','I am'],['Tu','sei','You are (singular)'],['Lui / Lei','è','He / She / It is'],['Noi','siamo','We are'],['Voi','siete','You all are'],['Loro','sono','They are']];
const numberRows=[
 [21,'ventuno',10,'dieci',100,'cento',1000,'mille'],
 [22,'ventidue',20,'venti',200,'duecento',2000,'duemila'],
 [23,'ventitré',30,'trenta',300,'trecento',3000,'tremila'],
 [24,'ventiquattro',40,'quaranta',400,'quattrocento',4000,'quattromila'],
 [25,'venticinque',50,'cinquanta',500,'cinquecento',5000,'cinquemila'],
 [26,'ventisei',60,'sessanta',600,'seicento',6000,'seimila'],
 [27,'ventisette',70,'settanta',700,'settecento',7000,'settemila'],
 [28,'ventotto',80,'ottanta',800,'ottocento',8000,'ottomila'],
 [29,'ventinove',90,'novanta',900,'novecento',9000,'novemila'],
 [30,'trenta',100,'cento',1000,'mille',10000,'diecimila']
];
const numberPatterns=[
 '<div class="l6-build"><span>vent<del>i</del></span><span>+</span><span>uno</span><span>→</span><span>'+num('ventuno')+'</span></div><p>The two highlighted joins in the sheet are <b>ventuno</b> and <b>ventotto</b>: the final <i>i</i> of <i>venti</i> is not written.</p>',
 '<div class="l6-build"><span>venti</span><span>+</span><span>tre</span><span>→</span><span>'+num('ventitré')+'</span></div><p>The sheet marks the accented ending in <b>ventitré</b>.</p>',
 '<div class="l6-build"><span>due</span><span>+</span><span class="l6-n-hundred">cento</span><span>→</span><span>'+num('duecento')+'</span></div><p>The <span class="l6-n-hundred">cento</span> part repeats down the hundreds column: duecento, trecento, quattrocento…</p>',
 '<div class="l6-build"><span>due</span><span>+</span><span class="l6-n-thousand">mila</span><span>→</span><span>'+num('duemila')+'</span></div><p>Compare <span class="l6-n-thousand">mille</span> (1,000) with the repeating <span class="l6-n-thousand">mila</span> in duemila, tremila… diecimila.</p>'
];
// New conversation tasks. Earlier Come stai/Come sta and informal age prompts are not duplicated.
[
 ['come-va','How is it going?','Come va?','KOH-meh vah','ˈkome va','A greeting formula introduced in the minutes.',''],
 ['benissimo','Very well!','Benissimo!','beh-NEES-see-moh','beˈnissimo','A short response about how you are.',''],
 ['non-ce-male','Not bad.','Non c’è male.','non cheh MAH-leh','non tʃɛ ˈmale','A response to a wellbeing question.',''],
 ['sto-proprio-male','I feel really bad.','Sto proprio male.','stoh PROH-pryoh MAH-leh','sto ˈprɔprjo ˈmale','Keep the whole taught expression together.','']
].forEach(x=>add(x[0],0,'Say this in Italian:',x[1],x[2],x[3],x[4],x[1],x[5],'minutes',1,x[6]));
add('darle-del-tu',0,'Use the taught formula:', 'Ask permission to use informal tu with someone you are addressing formally.','Posso darle del tu?','POS-soh DAR-leh del too','ˈpɔsso ˈdarle del tu','May I address you informally?','The formal-to-informal dialogue supplies <b>Posso darle del tu?</b>.','minutes',2,'formal');
add('darti-del-tu',0,'Recall the other supplied formula:','Complete: Posso ______ del tu? Use the form with ti.','Posso darti del tu?','POS-soh DAR-tee del too','ˈpɔsso ˈdarti del tu','May I address you using tu?','The minutes list this alongside <b>Posso darle del tu?</b>. This card recalls that wording without treating the two registers as interchangeable.','minutes',2,'Use the supplied darti wording.');
add('age-formal',0,'Ask this formally in Italian:','How old are you?','Quanti anni ha?','KWAN-tee AN-nee ah','ˈkwanti ˈanni a','How old are you?','Compare <b>ha</b> (formal) with <b>hai</b> (informal).','numbers',1,'formal; one person',{literal:'<div class="tiles"><div class="word-tile">Quanti<small>how many</small></div><div class="word-tile">anni<small>years</small></div><div class="word-tile">ha<small>you have — formal</small></div></div>',relatedEarlier:['italian-l4-age-quanti-hai']});
add('age-34',0,'Use avere to say:','I am 34 years old.','Io ho trentaquattro anni.','EE-oh oh tren-tah-KWAT-troh AN-nee','ˈio ɔ trentaˈkwattro ˈanni','I am 34 years old.','The handout joins <b>trenta + quattro → trentaquattro</b> in its example age sentence.','numbers',1,'Fictional speaker; use io.',{literal:'<div class="tiles"><div class="word-tile">Io<small>I</small></div><div class="word-tile">ho<small>have</small></div><div class="word-tile">trentaquattro<small>thirty-four</small></div><div class="word-tile">anni<small>years</small></div></div>'});
const numberCards=[
 [21,'ventuno','ven-TOO-noh','venˈtuno'],[22,'ventidue','ven-tee-DOO-eh','ventiˈdue'],[23,'ventitré','ven-tee-TREH','ventiˈtre'],[28,'ventotto','ven-TOT-toh','venˈtɔtto'],
 [30,'trenta','TREN-tah','ˈtrenta'],[40,'quaranta','kwah-RAN-tah','kwaˈranta'],[50,'cinquanta','cheen-KWAN-tah','tʃinˈkwanta'],[60,'sessanta','ses-SAN-tah','sesˈsanta'],[70,'settanta','set-TAN-tah','setˈtanta'],[80,'ottanta','ot-TAN-tah','otˈtanta'],[90,'novanta','noh-VAN-tah','noˈvanta'],
 [100,'cento','CHEN-toh','ˈtʃɛnto'],[200,'duecento','doo-eh-CHEN-toh','dueˈtʃɛnto'],[800,'ottocento','ot-toh-CHEN-toh','ottoˈtʃɛnto'],[1000,'mille','MEEL-leh','ˈmille'],[2000,'duemila','doo-eh-MEE-lah','dueˈmila'],[10000,'diecimila','dyeh-chee-MEE-lah','djetʃiˈmila']
];
for(const [n,w,g,ipa] of numberCards){
 const rule=n===21||n===28?numberPatterns[0]:n===23?numberPatterns[1]:n>=1000?numberPatterns[3]:n>=100?numberPatterns[2]:'Locate this form in the <b>DECINE</b> column; then use it as a number-building block.';
 add('number-'+n,1,'Say this number in Italian:',n.toLocaleString('en-GB'),w,g,ipa,String(n),rule,'numbers',1,'',{answerHtml:num(w),visual:'number-pattern'});
}
[[1000000,'Un milione','oon mee-LYOH-neh','un miˈljone'],[2000000,'Due milioni','DOO-eh mee-LYOH-nee','ˈdue miˈljoni'],[1000000000,'Un miliardo','oon mee-LYAR-doh','un miˈljardo'],[2000000000,'Due miliardi','DOO-eh mee-LYAR-dee','ˈdue miˈljardi']].forEach(([n,w,g,ipa])=>add('number-'+n,1,'Say this number in Italian:',n.toLocaleString('en-GB'),w,g,ipa,String(n),'Compare <b>milione / milioni</b> and <b>miliardo / miliardi</b> in the source examples.','minutes',1));
add('pattern-hundreds',1,'Identify the repeated word part:','duecento · trecento · quattrocento','cento','CHEN-toh','ˈtʃɛnto','hundred',numberPatterns[2],'numbers',1,'What stays the same in the hundreds column?',{answerHtml:num('cento'),visual:'number-pattern',kind:'pattern-recognition'});
add('pattern-thousands',1,'Identify the repeated ending:','duemila · tremila · quattromila','mila','MEE-lah','ˈmila','thousand, in these multiples',numberPatterns[3],'numbers',1,'Contrast the separate form mille.',{answerHtml:'<span class="l6-n-thousand">mila</span>',visual:'number-pattern',kind:'pattern-recognition'});
add('pattern-drop-i',1,'Explain the spelling change:','venti + uno → ventuno; venti + otto → ventotto','The final i of venti disappears.','','','The final i of venti disappears.',numberPatterns[0],'numbers',1,'Look at the join, not the whole word.',{sourceClass:'ADDED STUDY SUPPORT',visual:'number-pattern'});
add('pattern-accent',1,'Spot the missing mark:','ventitre → ?','ventitré','ven-tee-TREH','ventiˈtre','twenty-three',numberPatterns[1],'numbers',1,'Write the final vowel exactly as in the number sheet.',{answerHtml:num('ventitré'),visual:'number-pattern',kind:'spelling-contrast'});
// Context tasks build on the existing isolated essere-form cards.
add('sono-inglese',2,'Translate the sentence:','Sono inglese.','I am English.','','','I am English.','The minutes contrast <b>inglese</b> with <b>inglesi</b> to identify the intended subject.','minutes',2,'Translate into English, using the ending as your clue.',{kind:'meaning-contrast',relatedEarlier:['verb_essere_0','verb_essere_loro']});
add('sono-inglesi',2,'Translate the sentence:','Sono inglesi.','They are English.','','','They are English.','Compare <b>Sono inglese</b> (I) and <b>Sono inglesi</b> (they).','minutes',2,'Translate into English, using the ending as your clue.',{kind:'meaning-contrast'});
add('e-accent',2,'Choose the Italian word meaning “is”:','e / è','è','eh','ɛ','is','The source distinguishes <b>è</b> (is) from <b>e</b> (and). The accent is part of this recall task.','tables',1,'Keep the accent.');
add('siamo-felici',2,'Use essere to say:','We are happy.','Siamo felici.','SYAH-moh feh-LEE-chee','ˈsjamo feˈlitʃi','We are happy.','Use the <b>noi</b> form <b>siamo</b>.','tables',1,'Use felici; omit the subject pronoun.');
add('siete-alti',2,'Use essere to say:','You are tall.','Siete alti.','SYEH-teh AL-tee','ˈsjɛte ˈalti','You are tall.','The source uses <b>siete</b> for you plural.','tables',1,'plural; masculine or mixed group; omit the subject pronoun.');
add('ci-sono-libri',2,'Say this in Italian:','There are some books.','Ci sono dei libri.','chee SOH-noh day LEE-bree','tʃi ˈsono dei ˈlibri','There are some books.','This is the source example for existence/presence.','tables',1);
add('sono-le-tre',2,'Say this in Italian:','It is three o’clock.','Sono le tre.','SOH-noh leh treh','ˈsono le tre','It is three o’clock.','This is the source time expression; this lesson does not extend to a full time-telling unit.','tables',1);
const negatives=[
 ['Sono italiano.','Non sono italiano.','non SOH-noh ee-tah-LYAH-noh','non ˈsono itaˈljano','I am not Italian.','masculine; I'],
 ['Sei inglese.','Non sei inglese.','non say een-GLEH-zeh','non sɛi inˈɡleze','You are not English.','informal singular'],
 ['È stanca.','Non è stanca.','non eh STAN-kah','non ɛ ˈstanka','She is not tired.','feminine; she'],
 ['Siamo pronti.','Non siamo pronti.','non SYAH-moh PRON-tee','non ˈsjamo ˈpronti','We are not ready.','masculine or mixed group'],
 ['Siete amici.','Non siete amici.','non SYEH-teh ah-MEE-chee','non ˈsjɛte aˈmitʃi','You are not friends.','plural; masculine or mixed group'],
 ['Sono felici.','Non sono felici.','non SOH-noh feh-LEE-chee','non ˈsono feˈlitʃi','They are not happy.','plural; they']
];
negatives.forEach((x,i)=>add('negative-'+(i+1),3,'Make the sentence negative:',x[0],x[1],x[2],x[3],x[4],'<div class="l6-build"><span class="l6-n-join">non</span><span>+</span><span>verb</span><span>→ negative</span></div>Place <b>non</b> immediately before the verb.','tables',2,x[5]));
add('intonation-statement',3,'Read aloud as a statement:','Claudia è di Vienna','Claudia è di Vienna.','KLOW-dyah eh dee VYEN-nah','ˈklaudja ɛ di ˈvjɛnna','Claudia is from Vienna.',pairFigure,'tables',2,'Follow the curve’s falling ending.',{targetHtml:curve('fall')+'<span lang="it">Claudia è di Vienna</span>',visual:'intonation',kind:'speak-and-self-check'});
add('intonation-question',3,'Read aloud as a question:','Claudia è di Vienna','Claudia è di Vienna?','KLOW-dyah eh dee VYEN-nah','ˈklaudja ɛ di ˈvjɛnna','Is Claudia from Vienna?',pairFigure,'tables',2,'Keep the words; follow the curve’s rising ending.',{targetHtml:curve('rise')+'<span lang="it">Claudia è di Vienna</span>',visual:'intonation',kind:'speak-and-self-check'});
add('intonation-what-changes',3,'Explain the contrast:','Claudia è di Vienna. / Claudia è di Vienna?','The intonation changes; the words can stay the same.','','','The intonation changes; the words can stay the same.',pairFigure,'tables',2,'Describe what the two curves show.',{visual:'intonation'});
add('question-sei-inglese',3,'Turn the statement into a spoken question:','Sei inglese.','Sei inglese?','say een-GLEH-zeh','sɛi inˈɡleze','Are you English?','The source keeps the words in the same order. Read with the question contour; use a question mark in writing.','tables',2,'informal singular',{extra:pairFigure,visual:'intonation',kind:'speak-and-self-check'});
const questions=[
 ['chi-sei','Who are you?','Chi sei?','kee say','ki sɛi','Chi asks who.'],
 ['dove-sei','Where are you?','Dove sei?','DOH-veh say','ˈdove sɛi','Dove asks where.'],
 ['cose','What is it?','Cos’è?','koh-ZEH','koˈzɛ','The source gives Che cosa è / Cos’è.'],
 ['quando-vieni','When are you coming?','Quando vieni?','KWAN-doh VYEH-nee','ˈkwando ˈvjɛni','Quando asks when.'],
 ['perche-vieni','Why are you coming?','Perché vieni?','per-KEH VYEH-nee','perˈke ˈvjɛni','Perché asks why in this question.'],
 ['significa-letto','What does “letto” mean?','Che cosa significa “letto”?','keh KOH-zah seen-YEE-fee-kah LET-toh','ke ˈkɔza siɲˈɲifika ˈlɛtto','The source answer is “Letto” significa “bed”.'],
 ['scrive-letto','How is “letto” spelt in Italian?','Come si scrive “letto” in italiano?','KOH-meh see SKREE-veh LET-toh een ee-tah-LYAH-noh','ˈkome si ˈskrive ˈlɛtto in itaˈljano','The source spells ELLE – E – TI – TI – O.'],
 ['dice-bed','How do you say “bed” in Italian?','Come si dice “bed” in italiano?','KOH-meh see DEE-cheh bed een ee-tah-LYAH-noh','ˈkome si ˈditʃe bɛd in itaˈljano','The source answer is Si dice “letto”.'],
 ['non-ho-capito','I did not understand!','Non ho capito!','non oh kah-PEE-toh','non ɔ kaˈpito','Use the supplied whole expression.'],
 ['repeat-informal','Sorry, what did you say? Can you repeat, please?','Come, scusa? Puoi ripetere, per favore?','KOH-meh SKOO-zah pwoy ree-PEH-teh-reh per fah-VOH-reh','ˈkome ˈskuza pwɔi riˈpɛtere per faˈvore','The informal expression uses scusa and puoi.'],
 ['repeat-formal','Sorry, what did you say? Can you repeat, please?','Come, scusi? Può ripetere, per favore?','KOH-meh SKOO-zee pwoh ree-PEH-teh-reh per fah-VOH-reh','ˈkome ˈskuzi pwɔ riˈpɛtere per faˈvore','The formal expression uses scusi and può.']
];
questions.forEach((x,i)=>add(x[0],4,'Say this in Italian:',x[1],x[2],x[3],x[4],x[1],x[5],'tables',3,i===9?'informal':i===10?'formal':i<5?'Use the question word shown by the English meaning.':''));
const pluralRows=[
 ['una cravatta','delle cravatte','Feminine una + consonant → delle; -a → -e'],
 ['un divano','dei divani','Masculine un + consonant → dei; -o → -i'],
 ['un aereo','degli aerei','Masculine un + vowel → degli; -o → -i'],
 ['una notte','delle notti','Feminine noun in -e → delle; -e → -i'],
 ['un ponte','dei ponti','Masculine noun in -e → dei; -e → -i'],
 ['uno specchio','degli specchi','Masculine uno + s + consonant → degli; -o → -i'],
 ['una sedia','delle sedie','Feminine una + consonant → delle; -a → -e'],
 ['un sapone','dei saponi','Masculine noun in -e → dei; -e → -i'],
 ["un’aula",'delle aule','Feminine un’ + vowel → delle; -a → -e'],
 ['un letto','dei letti','Masculine un + consonant → dei; -o → -i'],
 ['una torre','delle torri','Feminine noun in -e → delle; -e → -i'],
 ['un albero','degli alberi','Masculine un + vowel → degli; -o → -i'],
 ['un tavolo','dei tavoli','Masculine un + consonant → dei; -o → -i'],
 ["un’onda",'delle onde','Feminine un’ + vowel → delle; -a → -e'],
 ['uno stadio','degli stadi','Masculine uno + s + consonant → degli; -o → -i']
];
[[2,'deh-lyee ah-EH-reh-ee','deʎʎi aˈɛrei'],[5,'deh-lyee SPEK-kee','deʎʎi ˈspɛkki'],[8,'DEL-leh OW-leh','ˈdelle ˈaule'],[13,'DEL-leh ON-deh','ˈdelle ˈonde'],[14,'deh-lyee STAH-dee','deʎʎi ˈstadi']].forEach(([i,g,ipa])=>{
 const x=pluralRows[i];add('partitive-'+i,5,'Make the whole phrase plural, meaning “some”: ',x[0],x[1],g,ipa,({2:'some aeroplanes',5:'some mirrors',8:'some classrooms',13:'some waves',14:'some stadiums'})[i],esc(x[2]),'plurals',2,'Change both the article and the noun ending.',{sourceClass:'COURSE RECAP',kind:'phrase-transformation'});
});
// Homework/class exercises remain practice sets, not duplicate flashcard stacks.
const sheets=[];
const table=(title,headers,rows)=>({type:'table',title,headers,rows});
const bullets=(title,items)=>({type:'bullets',title,items});
function q(id,prompt,answer,hint,opts={}){return {id,type:opts.choices?'choice':'text',prompt,answers:Array.isArray(answer)?answer:[answer],choices:opts.choices,optional_subjects:opts.subjects||[],hint,model:opts.model||(Array.isArray(answer)?answer[0]:answer),answer_mode:opts.mode||'accent',explanation:opts.explanation||'',source:opts.source||'',answer_origin:opts.origin||'Derived from the supplied teaching table'};}
function sheet(slug,title,subtitle,intro,sections,qs,source,page,kind){sheets.push({slug,title,subtitle,intro,scope:'Lesson 6',lesson:'L6',study_sections:sections,questions:qs,source_id:source,source_page:page,kind});}
const essence=[table('Essere — the six forms',['Pronoun','Form','Meaning'],conjugation),bullets('Use the subject as your clue',['<b>sono</b> serves both <b>io</b> and <b>loro</b>; use the sentence context.','<b>è</b> means is; <b>e</b> means and. Keep the accent.','The task asks for the missing verb form, not a translation of the whole sentence.'])];
const hwGaps=[
 ['Io ___ un professore.','sono','I am a teacher.'],['Tu ___ molto alto.','sei','You are very tall.'],['Roma ___ in Italia.','è','Rome is in Italy.'],['Marco ___ stanco oggi.','è','Marco is tired today.'],['Noi ___ in classe.','siamo','We are in class.'],['Voi ___ inglesi o americani?','siete','Are you English or American?'],['I bambini ___ in giardino.','sono','The children are in the garden.'],['Il caffè ___ caldo.','è','The coffee is hot.'],['Io e Sarah ___ amiche.','siamo','Sarah and I are friends.'],['Tu e Tom ___ pronti per la lezione?','siete','Are you and Tom ready for the lesson?']
];
sheet('l6-essere-matching','Lesson 6 · Essere: match the forms','Homework · 6 matches','Connect the English subject to the Italian pronoun and its essere form.',essence,conjugation.map((x,i)=>q('l6-match-'+(i+1),'Choose the pronoun and form for <b>'+esc(x[2])+'</b>.',x[0]+' '+x[1],'Match the subject before choosing the verb.',{choices:conjugation.map(r=>r[0]+' '+r[1]),explanation:esc(x[0]+' → '+x[1]),source:sourceText('homework',1)})),'homework',1,'homework');
sheet('l6-essere-gaps','Lesson 6 · Essere: sentence gaps','Homework · 10 sentences','Enter only the missing form of essere.',essence,hwGaps.map((x,i)=>q('l6-gap-'+(i+1),esc(x[0])+'<small class="l6-gloss">'+esc(x[2])+'</small>',x[1],'Identify who or what is the subject.',{explanation:esc(x[0].replace('___',x[1])),source:sourceText('homework',2)})),'homework',2,'homework');
const hwMC=[
 ['I am happy',['Io sei felice','Io sono felice','Io siamo felice'],1],['You are my friend',['Tu è mio amico','Tu sei mio amico','Tu siete mio amico'],1],['She is at home',['Lei sono a casa','Lei sei a casa','Lei è a casa'],2],['We are ready',['Noi siamo pronti','Noi siete pronti','Noi sono pronti'],0],['You all are students',['Voi siamo studenti','Voi siete studenti','Voi sono studenti'],1],['They are in London',['Loro è a Londra','Loro siamo a Londra','Loro sono a Londra'],2],['The pizza is good',['La pizza sei buona','La pizza è buona','La pizza sono buona'],1],['Paul and I are in Italy',['Io e Paolo siamo in Italia','Io e Paolo siete in Italia','Io e Paolo sono in Italia'],0]
];
sheet('l6-essere-translation','Lesson 6 · Essere: choose the sentence','Homework · 8 choices','Choose the supplied Italian translation that agrees with the subject.',essence,hwMC.map((x,i)=>q('l6-mc-'+(i+1),'Choose the correct translation: <b>'+esc(x[0])+'</b>.',x[1][x[2]],'Check subject–verb agreement.',{choices:x[1],explanation:'The subject agrees with the verb in <b>'+esc(x[1][x[2]])+'</b>.',source:sourceText('homework',2)})),'homework',2,'homework');
const negHW=[['Io ___ italiano.','non sono','I am not Italian.'],['Tu ___ stanco.','non sei','You are not tired.'],['Anna ___ inglese.','non è','Anna is not English.'],['Noi ___ a scuola.','non siamo','We are not at school.'],['Voi ___ in ritardo.','non siete','You are not late.'],['Marco e Luca ___ fratelli.','non sono','Marco and Luca are not brothers.']];
sheet('l6-negative-homework','Lesson 6 · Negative essere','Homework · 6 sentences','Complete the gap with non and the correct form of essere.',[
 bullets('Non comes before the verb',['<div class="l6-build"><span class="l6-n-join">non</span><span>+</span><span>verb</span><span>→ negative</span></div>']),
 table('Positive → negative',['Positive','Negative'],negatives.map(x=>[esc(x[0]),esc(x[1])]))
],negHW.map((x,i)=>q('l6-neg-'+(i+1),esc(x[0])+'<small class="l6-gloss">'+esc(x[2])+'</small>',x[1],'Use two words: non + the verb.',{explanation:esc(x[0].replace('___',x[1])),source:sourceText('negative',1)})),'negative',1,'homework');
const classGaps=[['Io ___ a casa.','sono','I am at home.'],['Io ___ contento.','sono','I am happy.'],['Tu ___ molto simpatico.','sei','You are very nice.'],['Tu ___ in biblioteca.','sei','You are in the library.'],['Luca ___ un bravo ragazzo.','è','Luca is a good boy.'],['Il gatto ___ nero.','è','The cat is black.'],['La mela ___ rossa e dolce.','è','The apple is red and sweet.'],['Noi ___ a Milano.','siamo','We are in Milan.'],['Noi ___ fratelli.','siamo','We are brothers.'],['Voi ___ al parco.','siete','You all are at the park.'],['I libri ___ sul tavolo.','sono','The books are on the table.'],['Le stelle ___ nel cielo.','sono','The stars are in the sky.']];
sheet('l6-essere-class','Lesson 6 · Essere classroom practice','Class worksheet · 12 sentences','Apply the six forms to the sentences used in class.',essence,classGaps.map((x,i)=>q('l6-class-'+(i+1),esc(x[0])+'<small class="l6-gloss">'+esc(x[2])+'</small>',x[1],'Choose the form that agrees with the subject.',{explanation:esc(x[0].replace('___',x[1])),source:sourceText('class',1)})),'class',1,'class');
const numMap=new Map(numberRows.flatMap(r=>[[r[0],r[1]],[r[2],r[3]],[r[4],r[5]],[r[6],r[7]]]));
sheet('l6-number-patterns','Lesson 6 · Number-building patterns','Numbers 20+ · patterns and age','Use the highlighted repeated parts rather than memorising each long word separately.',[
 bullets('The joins and repeating parts',numberPatterns),
 table('The four source columns',['UNITÀ','DECINE','CENTINAIA','MIGLIAIA'],numberRows.map(r=>[0,2,4,6].map(i=>'<span class="l6-number-value">'+r[i].toLocaleString('en-GB')+'</span> '+num(r[i+1])))),
 table('Age and larger numbers',['Meaning','Italian'],[['How old are you? — informal','Quanti anni hai?'],['How old are you? — formal','Quanti anni ha?'],['I am 34 years old.','Io ho trentaquattro anni.'],['1 million / 2 million','Un milione / Due milioni'],['1 billion / 2 billion','Un miliardo / Due miliardi']])
],[21,23,28,40,200,600,800,1000,2000,4000,9000,10000].map((n,i)=>q('l6-number-practice-'+(i+1),'Write <b>'+n.toLocaleString('en-GB')+'</b> in Italian.',numMap.get(n),n>=1000?'Compare mille with the repeating mila ending.':n>=100?'Look for the repeated cento part.':n===23?'Keep the accented final vowel.':'Look at the join between the number parts.',{explanation:num(numMap.get(n)),source:sourceText('numbers',1),origin:'Adapted recall task using the exact supplied number'})),'numbers',1,'pattern');
const intPairs=[['Sei inglese.','Sei inglese?','Are you English?'],['Sei studente.','Sei studente?','Are you a student?'],['È italiano.','È italiano?','Is he Italian?'],['Siamo pronti.','Siamo pronti?','Are we ready?'],['Siete inglesi.','Siete inglesi?','Are you English? (plural)']];
sheet('l6-intonation','Lesson 6 · Statement or question?','Intonation · see the curve, then say it','Keep the words and notice how the pitch ends in the source diagram.',[
 bullets('Same words, different intonation',[pairFigure,'The source’s statement curve finishes downwards; its question curve finishes upwards. This diagram illustrates these examples, not a universal pitch rule for every Italian question.']),
 table('Statement → question',['Statement','Question','Question meaning'],intPairs),
 bullets('Speak and self-check',['Read <b>Claudia è di Vienna.</b> using the statement curve. Then read <b>Claudia è di Vienna?</b> using the question curve.','This is a visual and speaking exercise. No teacher audio or automatic speech assessment is supplied.'])
],[q('l6-intonation-rise',curve('rise')+'<span lang="it">Claudia è di Vienna</span><p>What does this source curve signal?</p>','A question','Look at the direction at the end.',{choices:['A statement','A question'],explanation:'The source question curve ends upwards.',source:sourceText('tables',2),origin:'Source diagram'}),q('l6-intonation-fall',curve('fall')+'<span lang="it">Claudia è di Vienna</span><p>What does this source curve signal?</p>','A statement','Look at the direction at the end.',{choices:['A statement','A question'],explanation:'The source statement curve ends downwards.',source:sourceText('tables',2),origin:'Source diagram'}),...intPairs.slice(0,4).map((x,i)=>q('l6-intonation-punctuation-'+(i+1),'Write this as a question, keeping the words: <b>'+esc(x[0])+'</b>',x[1],'In speech use question intonation; in writing change the final mark.',{mode:'punctuation',explanation:'Same word order; <b>'+esc(x[1])+'</b> ends with a question mark.',source:sourceText('tables',2),origin:'Supplied statement/question pair'}))],'tables',2,'pattern');
sheet('l6-plural-workshop','Lesson 6 · Plural partitive workshop','Group activity · 15 phrases','Change the complete phrase to the plural meaning “some”. Check both the article and the noun ending.',[
 table('Singular indefinite → plural partitive',['Start','Plural','Opening'],[['un','dei','Most consonants'],['uno / un','degli','s + consonant / z, or a vowel'],['una','delle','Feminine + consonant'],['un’','delle','Feminine + vowel']]),
 bullets('Two decisions in each answer',['Choose <b>dei / degli / delle</b>, then change the noun ending.','The source awards a correct-phrase point and a bonus for explaining the rule. In this individual version, the explanation is revealed after checking; it is not automatically graded.'])
],pluralRows.map((x,i)=>q('l6-plural-'+(i+1),'Make the whole phrase plural: <b>'+esc(x[0])+'</b>.',x[1],'Change the article and the noun ending.',{explanation:esc(x[2]),source:sourceText('plurals',2),origin:"Teacher's answer key"})),'plurals',1,'revision');
sheet('l6-useful-questions','Lesson 6 · Useful questions','Question words and requests','Choose a question that fits the meaning or situation.',[
 table('Question words',['Word','Meaning','Example'],[['Chi?','Who?','Chi sei?'],['Come?','How?','Come stai?'],['Dove?','Where?','Dove sei?'],['Di dove?','Where from?','Di dove sei?'],['Che cosa? / Cosa?','What?','Che cosa è / Cos’è?'],['Quando?','When?','Quando vieni?'],['Perché?','Why?','Perché vieni?']]),
 table('Useful requests',['Situation','Expression'],[['Ask what a word means','Che cosa significa “letto”?'],['Ask for spelling','Come si scrive “letto” in italiano?'],['Ask how to say an English word','Come si dice “bed” in italiano?'],['Say you did not understand','Non ho capito!'],['Request repetition — informal','Come, scusa? Puoi ripetere, per favore?'],['Request repetition — formal','Come, scusi? Può ripetere, per favore?']])
],[["Ask when",'Quando vieni?',['Quando vieni?','Perché vieni?','Chi sei?']],['Ask why','Perché vieni?',['Dove sei?','Perché vieni?','Quando vieni?']],['Ask who','Chi sei?',['Chi sei?','Dove sei?','Cos’è?']],['Ask where','Dove sei?',['Dove sei?','Chi sei?','Come stai?']],['Ask what letto means','Che cosa significa “letto”?',['Come si scrive “letto” in italiano?','Che cosa significa “letto”?','Come si dice “bed” in italiano?']],['Ask how letto is spelt','Come si scrive “letto” in italiano?',['Come si scrive “letto” in italiano?','Non ho capito!','Di dove sei?']],['Say you did not understand','Non ho capito!',['Non ho capito!','Benissimo!','Come va?']],['Request repetition formally','Come, scusi? Può ripetere, per favore?',['Come, scusa? Puoi ripetere, per favore?','Come, scusi? Può ripetere, per favore?','Come va?']]].map((x,i)=>q('l6-useful-'+(i+1),esc(x[0])+'.',x[1],'Choose the question word or register that matches the situation.',{choices:x[2],explanation:esc(x[1]),source:sourceText('tables',3),origin:'Adapted selection task from supplied expressions'})),'tables',3,'pattern');
const categories=[{id:'l6-homework',title:'Lesson 6 · Homework',slugs:['l6-essere-matching','l6-essere-gaps','l6-essere-translation','l6-negative-homework']},{id:'l6-class',title:'Lesson 6 · Patterns and classroom practice',slugs:['l6-number-patterns','l6-intonation','l6-useful-questions','l6-essere-class','l6-plural-workshop']}];
const issues=[
 {source:'tables',page:2,issue:'The final affirmative/interrogative row prints Sono italiani? in both columns.',decision:'Preserved in source inventory; excluded from scored question pairs. No silent correction.'},
 {source:'minutes',page:3,issue:'Sono a casa. is glossed They are at home without context.',decision:'Do not create a single-answer pronoun identification card from this example. Keep contextual distinction from inglese/inglesi.'},
 {source:'minutes',page:5,issue:'Textbook pp.20–21 and p.175 n.19 plus listening recordings are referenced but not supplied.',decision:'No invented workbook answer key, recordings or listening assessment.'},
 {source:'numbers',page:1,issue:'The visual number parts convey patterns which flattened text loses.',decision:'Preserve source column headings and values; highlight the repeated parts and label explicit decomposition as adapted study support.'},
 {source:'tables',page:2,issue:'Intonation curves are visual source evidence, not audio.',decision:'Retain the source curve image; speaking is self-assessed. No fake audio playback.'}
];
function normalise(value,mode='accent'){
 let text=String(value||'').normalize('NFC').trim().toLocaleLowerCase('it').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ');
 if(mode!=='punctuation')text=text.replace(/[.!?,;:]/g,'').trim();
 return text;
}
function checkAnswer(value,answers,mode='accent'){return (answers||[]).some(a=>normalise(a,mode)===normalise(value,mode));}
const api={version,title:'Numbers, Essere and Questions',deckName:'Italian - Lesson 6 - Numbers, Essere and Questions',sources,topics,cards,sheets,categories,numberRows,issues,checkAnswer,normalise};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.ITALIAN_L6=api;
})(typeof window!=='undefined'?window:undefined);
