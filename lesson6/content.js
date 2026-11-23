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
const essence=[table('Essere · the six forms',['Pronoun','Form','Meaning'],conjugation),bullets('Use the subject as your clue',['<b>sono</b> serves both <b>io</b> and <b>loro</b>; use the sentence context.','<b>è</b> means is; <b>e</b> means and. Keep the accent.','The task asks for the missing verb form, not a translation of the whole sentence.'])];
const hwGaps=[
 ['Io ___ un professore.','sono','I am a teacher.'],['Tu ___ molto alto.','sei','You are very tall.'],['Roma ___ in Italia.','è','Rome is in Italy.'],['Marco ___ stanco oggi.','è','Marco is tired today.'],['Noi ___ in classe.','siamo','We are in class.'],['Voi ___ inglesi o americani?','siete','Are you English or American?'],['I bambini ___ in giardino.','sono','The children are in the garden.'],['Il caffè ___ caldo.','è','The coffee is hot.'],['Io e Sarah ___ amiche.','siamo','Sarah and I are friends.'],['Tu e Tom ___ pronti per la lezione?','siete','Are you and Tom ready for the lesson?']
];
sheet('l6-essere-matching','Essere: match the forms','Homework · 6 matches','Connect the English subject to the Italian pronoun and its essere form.',essence,conjugation.map((x,i)=>q('l6-match-'+(i+1),'Choose the pronoun and form for <b>'+esc(x[2])+'</b>.',x[0]+' '+x[1],'Match the subject before choosing the verb.',{choices:conjugation.map(r=>r[0]+' '+r[1]),explanation:esc(x[0]+' → '+x[1]),source:sourceText('homework',1)})),'homework',1,'homework');
sheet('l6-essere-gaps','Essere: sentence gaps','Homework · 10 sentences','Enter only the missing form of essere.',essence,hwGaps.map((x,i)=>q('l6-gap-'+(i+1),esc(x[0])+'<small class="l6-gloss">'+esc(x[2])+'</small>',x[1],'Identify who or what is the subject.',{explanation:esc(x[0].replace('___',x[1])),source:sourceText('homework',2)})),'homework',2,'homework');
const hwMC=[
 ['I am happy',['Io sei felice','Io sono felice','Io siamo felice'],1],['You are my friend',['Tu è mio amico','Tu sei mio amico','Tu siete mio amico'],1],['She is at home',['Lei sono a casa','Lei sei a casa','Lei è a casa'],2],['We are ready',['Noi siamo pronti','Noi siete pronti','Noi sono pronti'],0],['You all are students',['Voi siamo studenti','Voi siete studenti','Voi sono studenti'],1],['They are in London',['Loro è a Londra','Loro siamo a Londra','Loro sono a Londra'],2],['The pizza is good',['La pizza sei buona','La pizza è buona','La pizza sono buona'],1],['Paul and I are in Italy',['Io e Paolo siamo in Italia','Io e Paolo siete in Italia','Io e Paolo sono in Italia'],0]
];
sheet('l6-essere-translation','Essere: choose the sentence','Homework · 8 choices','Choose the supplied Italian translation that agrees with the subject.',essence,hwMC.map((x,i)=>q('l6-mc-'+(i+1),'Choose the correct translation: <b>'+esc(x[0])+'</b>.',x[1][x[2]],'Check subject–verb agreement.',{choices:x[1],explanation:'The subject agrees with the verb in <b>'+esc(x[1][x[2]])+'</b>.',source:sourceText('homework',2)})),'homework',2,'homework');
const negHW=[['Io ___ italiano.','non sono','I am not Italian.'],['Tu ___ stanco.','non sei','You are not tired.'],['Anna ___ inglese.','non è','Anna is not English.'],['Noi ___ a scuola.','non siamo','We are not at school.'],['Voi ___ in ritardo.','non siete','You are not late.'],['Marco e Luca ___ fratelli.','non sono','Marco and Luca are not brothers.']];
sheet('l6-negative-homework','Negative essere','Homework · 6 sentences','Complete the gap with non and the correct form of essere.',[
 bullets('Non comes before the verb',['<div class="l6-build"><span class="l6-n-join">non</span><span>+</span><span>verb</span><span>→ negative</span></div>']),
 table('Positive → negative',['Positive','Negative'],negatives.map(x=>[esc(x[0]),esc(x[1])]))
],negHW.map((x,i)=>q('l6-neg-'+(i+1),esc(x[0])+'<small class="l6-gloss">'+esc(x[2])+'</small>',x[1],'Use two words: non + the verb.',{explanation:esc(x[0].replace('___',x[1])),source:sourceText('negative',1)})),'negative',1,'homework');
const classGaps=[['Io ___ a casa.','sono','I am at home.'],['Io ___ contento.','sono','I am happy.'],['Tu ___ molto simpatico.','sei','You are very nice.'],['Tu ___ in biblioteca.','sei','You are in the library.'],['Luca ___ un bravo ragazzo.','è','Luca is a good boy.'],['Il gatto ___ nero.','è','The cat is black.'],['La mela ___ rossa e dolce.','è','The apple is red and sweet.'],['Noi ___ a Milano.','siamo','We are in Milan.'],['Noi ___ fratelli.','siamo','We are brothers.'],['Voi ___ al parco.','siete','You all are at the park.'],['I libri ___ sul tavolo.','sono','The books are on the table.'],['Le stelle ___ nel cielo.','sono','The stars are in the sky.']];
sheet('l6-essere-class','Essere classroom practice','Class worksheet · 12 sentences','Apply the six forms to the sentences used in class.',essence,classGaps.map((x,i)=>q('l6-class-'+(i+1),esc(x[0])+'<small class="l6-gloss">'+esc(x[2])+'</small>',x[1],'Choose the form that agrees with the subject.',{explanation:esc(x[0].replace('___',x[1])),source:sourceText('class',1)})),'class',1,'class');
const numMap=new Map(numberRows.flatMap(r=>[[r[0],r[1]],[r[2],r[3]],[r[4],r[5]],[r[6],r[7]]]));
// Requested expansion: every integer 0–30 (31 tasks), plus ten larger values.
const basicNumberWords=["zero", "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci", "undici", "dodici", "tredici", "quattordici", "quindici", "sedici", "diciassette", "diciotto", "diciannove", "venti"];
basicNumberWords.forEach((word,n)=>numMap.set(n,word));
const numberPracticeValues=[...Array.from({length:31},(_,n)=>n),40,50,60,70,80,90,100,200,1000,10000];
sheet('l6-number-patterns','Number-building patterns','Numbers 20+ · patterns and age','Use the highlighted repeated parts rather than memorising each long word separately.',[
 bullets('The joins and repeating parts',numberPatterns),
 table('The four source columns',['UNITÀ','DECINE','CENTINAIA','MIGLIAIA'],numberRows.map(r=>[0,2,4,6].map(i=>'<span class="l6-number-value">'+r[i].toLocaleString('en-GB')+'</span> '+num(r[i+1])))),
 table('Age and larger numbers',['Meaning','Italian'],[['How old are you? · informal','Quanti anni hai?'],['How old are you? · formal','Quanti anni ha?'],['I am 34 years old.','Io ho trentaquattro anni.'],['1 million / 2 million','Un milione / Due milioni'],['1 billion / 2 billion','Un miliardo / Due miliardi']])
],numberPracticeValues.map(n=>q('l6-number-write-'+n,'Write <b>'+n.toLocaleString('en-GB')+'</b> in Italian.',numMap.get(n),n===23?'Remember the accent on the final vowel.':n===21||n===28?'Think about the final vowel of venti before uno or otto.':n>=1000?'Compare mille with the repeating mila ending.':n>=100?'Use the repeated cento part.':n>=40?'Use the tens column of the handout.':'Write the number as one Italian word.',{explanation:num(numMap.get(n)),source:n<=20?'Earlier course reference · Avere, numbers and family · Numbers 0–20':sourceText('numbers',1),origin:n<=20?'User-requested revision using the existing 0–20 course reference':'User-requested writing practice using the supplied number handout'})),'numbers',1,'pattern');
const intPairs=[['Sei inglese.','Sei inglese?','Are you English?'],['Sei studente.','Sei studente?','Are you a student?'],['È italiano.','È italiano?','Is he Italian?'],['Siamo pronti.','Siamo pronti?','Are we ready?'],['Siete inglesi.','Siete inglesi?','Are you English? (plural)']];
sheet('l6-intonation','Statement or question?','Intonation · see the curve, then say it','Keep the words and notice how the pitch ends in the source diagram.',[
 bullets('Same words, different intonation',[pairFigure,'The source’s statement curve finishes downwards; its question curve finishes upwards. This diagram illustrates these examples, not a universal pitch rule for every Italian question.']),
 table('Statement → question',['Statement','Question','Question meaning'],intPairs),
 bullets('Speak and self-check',['Read <b>Claudia è di Vienna.</b> using the statement curve. Then read <b>Claudia è di Vienna?</b> using the question curve.','This is a visual and speaking exercise. No teacher audio or automatic speech assessment is supplied.'])
],[q('l6-intonation-rise',curve('rise')+'<span lang="it">Claudia è di Vienna</span><p>What does this source curve signal?</p>','A question','Look at the direction at the end.',{choices:['A statement','A question'],explanation:'The source question curve ends upwards.',source:sourceText('tables',2),origin:'Source diagram'}),q('l6-intonation-fall',curve('fall')+'<span lang="it">Claudia è di Vienna</span><p>What does this source curve signal?</p>','A statement','Look at the direction at the end.',{choices:['A statement','A question'],explanation:'The source statement curve ends downwards.',source:sourceText('tables',2),origin:'Source diagram'}),...intPairs.slice(0,4).map((x,i)=>q('l6-intonation-punctuation-'+(i+1),'Write this as a question, keeping the words: <b>'+esc(x[0])+'</b>',x[1],'In speech use question intonation; in writing change the final mark.',{mode:'punctuation',explanation:'Same word order; <b>'+esc(x[1])+'</b> ends with a question mark.',source:sourceText('tables',2),origin:'Supplied statement/question pair'}))],'tables',2,'pattern');
sheet('l6-plural-workshop','Plural partitive workshop','Group activity · 15 phrases','Change the complete phrase to the plural meaning “some”. Check both the article and the noun ending.',[
 table('Singular indefinite → plural partitive',['Start','Plural','Opening'],[['un','dei','Most consonants'],['uno / un','degli','s + consonant / z, or a vowel'],['una','delle','Feminine + consonant'],['un’','delle','Feminine + vowel']]),
 bullets('Two decisions in each answer',['Choose <b>dei / degli / delle</b>, then change the noun ending.','The source awards a correct-phrase point and a bonus for explaining the rule. In this individual version, the explanation is revealed after checking; it is not automatically graded.'])
],pluralRows.map((x,i)=>q('l6-plural-'+(i+1),'Make the whole phrase plural: <b>'+esc(x[0])+'</b>.',x[1],'Change the article and the noun ending.',{explanation:esc(x[2]),source:sourceText('plurals',2),origin:"Teacher's answer key"})),'plurals',1,'revision');
sheet('l6-useful-questions','Useful questions','Question words and requests','Choose a question that fits the meaning or situation.',[
 table('Question words',['Word','Meaning','Example'],[['Chi?','Who?','Chi sei?'],['Come?','How?','Come stai?'],['Dove?','Where?','Dove sei?'],['Di dove?','Where from?','Di dove sei?'],['Che cosa? / Cosa?','What?','Che cosa è / Cos’è?'],['Quando?','When?','Quando vieni?'],['Perché?','Why?','Perché vieni?']]),
 table('Useful requests',['Situation','Expression'],[['Ask what a word means','Che cosa significa “letto”?'],['Ask for spelling','Come si scrive “letto” in italiano?'],['Ask how to say an English word','Come si dice “bed” in italiano?'],['Say you did not understand','Non ho capito!'],['Request repetition · informal','Come, scusa? Puoi ripetere, per favore?'],['Request repetition · formal','Come, scusi? Può ripetere, per favore?']])
],[["Ask when",'Quando vieni?',['Quando vieni?','Perché vieni?','Chi sei?']],['Ask why','Perché vieni?',['Dove sei?','Perché vieni?','Quando vieni?']],['Ask who','Chi sei?',['Chi sei?','Dove sei?','Cos’è?']],['Ask where','Dove sei?',['Dove sei?','Chi sei?','Come stai?']],['Ask what letto means','Che cosa significa “letto”?',['Come si scrive “letto” in italiano?','Che cosa significa “letto”?','Come si dice “bed” in italiano?']],['Ask how letto is spelt','Come si scrive “letto” in italiano?',['Come si scrive “letto” in italiano?','Non ho capito!','Di dove sei?']],['Say you did not understand','Non ho capito!',['Non ho capito!','Benissimo!','Come va?']],['Request repetition formally','Come, scusi? Può ripetere, per favore?',['Come, scusa? Puoi ripetere, per favore?','Come, scusi? Può ripetere, per favore?','Come va?']]].map((x,i)=>q('l6-useful-'+(i+1),esc(x[0])+'.',x[1],'Choose the question word or register that matches the situation.',{choices:x[2],explanation:esc(x[1]),source:sourceText('tables',3),origin:'Adapted selection task from supplied expressions'})),'tables',3,'pattern');
// Class order from Session 6 minutes pp.1–5. A topic is not a worksheet filename.
// Existing exercise routes/IDs remain available so saved answers and bookmarks survive.
const withStage=(stage,section)=>({...section,stage});
const learn=section=>withStage('learn',section);
const example=section=>withStage('examples',section);
const bySlug=slug=>sheets.find(s=>s.slug===slug);
const formsSections=[
 learn(table('Essere · present tense',['Pronoun','Essere','Meaning'],conjugation)),
 learn(bullets('What to notice',[
  'Essere is irregular: learn each form. <b>Io sono</b> and <b>loro sono</b> use the same verb form.',
  'The subject pronoun is often omitted. Compare <b>Sono inglese</b> (I am English) and <b>Sono inglesi</b> (They are English).',
  '<b>È</b> means “is” or formal “you are”; <b>e</b> means “and”. Keep the accent.',
  'Compare <b>Sono italiano</b> (male speaker) and <b>Sono italiana</b> (female speaker).'
 ])),
 example(table('Using essere',['Use','Example','Meaning'],[
  ['Identity','Sono Laura.','I am Laura.'],['Nationality / origin','Sei italiana.','You are Italian.'],
  ['Profession','È un’insegnante.','She is a teacher.'],['Feelings','Siamo felici.','We are happy.'],
  ['Characteristics','Siete alti.','You are (plural) tall.'],['Existence / presence','Ci sono dei libri.','There are some books.'],['Time','Sono le tre.','It is three o’clock.']
 ])),
 example(bullets('Context matters',[
  '<b>Sono a casa.</b> The source gives “They are at home”; without a subject or context, <b>sono</b> also serves “I am”. This example is not used as a single-answer subject test.',
  '<details><summary>Another use mentioned in class</summary><p>The source also introduces essere as an auxiliary: <b>Io sono andato</b> (“I went / I have gone”). Past-tense practice is not added here.</p></details>'
 ]))
];
for(const slug of ['l6-essere-class','l6-essere-matching','l6-essere-gaps','l6-essere-translation']){
 const item=bySlug(slug);item.title='Essere in the present';item.subtitle='The six forms, their meaning and how they are used.';
 item.intro='Start with the conjugation, then use the sentence context to choose the form.';
 item.study_sections=formsSections;item.topicSlug='l6-essere-class';item.catalogue=slug==='l6-essere-class';
}
const practiceGroups={
 'l6-essere-class':[
  {slug:'l6-essere-class',label:'Class practice · 12 sentences'},
  {slug:'l6-essere-matching',label:'Homework · match the forms (6)'},
  {slug:'l6-essere-gaps',label:'Homework · sentence gaps (10)'},
  {slug:'l6-essere-translation',label:'Homework · choose the sentence (8)'}
 ]
};
const numberSheet=bySlug('l6-number-patterns');
numberSheet.title='Number-building patterns';numberSheet.subtitle='Unità, decine, centinaia, migliaia.';
numberSheet.intro='Follow the repeated word parts in the handout, then use the full table as your reference.';
numberSheet.study_sections=[
 ...numberPatterns.map((item,i)=>learn(bullets(['Ventuno and ventotto','The accent in ventitré','Hundreds: the cento pattern','Thousands: mille and mila'][i],[item]))),
 example(numberSheet.study_sections[1]),
 example(table('Other numbers introduced in class',['Number','Italian'],[['1 million','Un milione'],['2 million','Due milioni'],['1 billion','Un miliardo'],['2 billion','Due miliardi']]))
];
const negativeSheet=bySlug('l6-negative-homework');negativeSheet.title='Negative sentences';negativeSheet.subtitle='Add non before the verb.';
negativeSheet.study_sections=negativeSheet.study_sections.map((x,i)=>(i?example:learn)(x));
const intonationSheet=bySlug('l6-intonation');intonationSheet.title='Statements and questions';intonationSheet.subtitle='Same words, different intonation.';
intonationSheet.study_sections=[learn(intonationSheet.study_sections[0]),example(intonationSheet.study_sections[1]),example(intonationSheet.study_sections[2])];
const pluralsSheet=bySlug('l6-plural-workshop');pluralsSheet.title='Plural partitives';pluralsSheet.subtitle='Revision: un, uno, una, un’ → dei, degli, delle.';
pluralsSheet.study_sections=[learn(pluralsSheet.study_sections[0]),example(table('Explain the change',['Singular','Plural','Rule'],[0,1,2,5,8].map(i=>pluralRows[i]))),example(pluralsSheet.study_sections[1])];
const usefulSheet=bySlug('l6-useful-questions');usefulSheet.title='Question words and useful phrases';usefulSheet.subtitle='Ask who, where, what, when and why; ask for help.';
usefulSheet.study_sections=[learn(usefulSheet.study_sections[0]),
 example(table('Question, example and answer',['Question','Example','Answer'],[
  ['Che cosa significa…?','Che cosa significa “letto”?','“Letto” significa “bed”.'],
  ['Come si scrive … in italiano?','Come si scrive “letto” in italiano?','Si scrive ELLE – E – TI – TI – O.'],
  ['Come si dice … in italiano?','Come si dice “bed” in italiano?','Si dice “letto”.']
 ])),
 example(table('When you need help',['Situation','Supplied expression'],[
  ['I did not understand','Non ho capito!'],
  ['Request repetition · informal','Come, scusa? Puoi ripetere, per favore?'],
  ['Request repetition · formal','Come, scusi? Può ripetere, per favore?']
 ]))
];
sheet('l6-greetings','Greetings and responses','Come va? Come sta? Come stai?',
 'Ask how someone is, then choose a response.',[
 learn(table('Ask how someone is',['Supplied greeting','Use'],[['Come va?','How is it going?'],['Come sta?','Formal'],['Come stai?','Informal']])),
 example(table('Respond',['Supplied response','Meaning'],[['Benissimo!','Very well!'],['Bene.','Well.'],['Non c’è male.','Not bad.'],['Sto proprio male.','I feel really bad.']]))
 ],[
 q('l6-greeting-response-1','Choose the response meaning “Very well”.','Benissimo!','Use a response from the warm-up.',{choices:['Benissimo!','Non c’è male.','Sto proprio male.'],source:sourceText('minutes',1),origin:'Adapted recall of the supplied warm-up expressions',explanation:'Benissimo! · Very well!'}),
 q('l6-greeting-response-2','Choose the response meaning “Not bad”.','Non c’è male.','Use the complete expression.',{choices:['Bene.','Non c’è male.','Sto proprio male.'],source:sourceText('minutes',1),origin:'Adapted recall of the supplied warm-up expressions',explanation:'Non c’è male. · Not bad.'}),
 q('l6-greeting-register-1','Which question addresses someone formally?','Come sta?','Compare sta with stai.',{choices:['Come sta?','Come stai?'],source:sourceText('minutes',1),origin:'Adapted register check from supplied greetings',explanation:'Come sta? · formal.'}),
 q('l6-greeting-register-2','Which question addresses someone informally?','Come stai?','Compare stai with sta.',{choices:['Come sta?','Come stai?'],source:sourceText('minutes',1),origin:'Adapted register check from supplied greetings',explanation:'Come stai? · informal.'})
 ],'minutes',1,'warm-up');
sheet('l6-age-dialogue','Age and introductions','Use the numbers in a formal and informal conversation.',
 'Ask about age, name and origin using the formal and informal dialogue.',[
 learn(table('Asking someone’s age',['Register','Question','Answer from the minutes'],[['Informal','Quanti anni hai?','Io ho venticinque anni.'],['Formal','Quanti anni ha?','Io ho venticinque anni.']])),
 example(table('The supplied conversation',['Formal','Informal'],[['Come si chiama?','Come ti chiami?'],['Mi chiamo Marco.','Mi chiamo Marco.'],['Quanti anni ha?','Quanti anni hai?'],['Ho 25 anni.','Ho 25 anni.'],['Di dove è? / Da dove viene?','Di dove sei? / Da dove vieni?'],['Sono di Napoli. / Vengo da Napoli.','Sono di Napoli. / Vengo da Napoli.'],['Sono italiano.','Sono italiano.']])),
 example(bullets('Try the paired speaking activity',[
  'The minutes supply <b>Posso darle del tu? / Posso darti del tu?</b> for the formal-to-informal activity. Read the two dialogue columns aloud.',
  'The numbers handout gives another age: <b>Io ho trentaquattro anni.</b> The minutes use 25; the handout uses 34. Both examples are retained.',
  'The classroom identity cards were not supplied. Use the Marco / 25 / Napoli dialogue above rather than an invented identity.'
 ]))
 ],[
 q('l6-dialogue-age-informal','Choose the informal age question.','Quanti anni hai?','Look at the final verb.',{choices:['Quanti anni ha?','Quanti anni hai?'],source:sourceText('minutes',2),origin:'Adapted recall from the supplied dialogue',explanation:'Quanti anni hai? · informal.'}),
 q('l6-dialogue-age-formal','Choose the formal age question.','Quanti anni ha?','Look at the final verb.',{choices:['Quanti anni ha?','Quanti anni hai?'],source:sourceText('minutes',2),origin:'Adapted recall from the supplied dialogue',explanation:'Quanti anni ha? · formal.'}),
 q('l6-dialogue-name','Choose the informal name question from the dialogue.','Come ti chiami?','Compare ti with si.',{choices:['Come ti chiami?','Come si chiama?'],source:sourceText('minutes',2),origin:'Adapted recall from the supplied dialogue',explanation:'Come ti chiami? · informal.'}),
 q('l6-dialogue-origin','Choose the informal origin question using essere.','Di dove sei?','Choose the essere form, not venire.',{choices:['Di dove è?','Di dove sei?','Da dove viene?'],source:sourceText('minutes',2),origin:'Adapted recall from the supplied dialogue',explanation:'Di dove sei? · informal origin with essere.'})
 ],'minutes',2,'dialogue');
// The two decisions in each paper matching row use the two original option banks.
const bilingual=(en,it)=>'<span class="editorial-label"><span class="editorial-label-main" lang="en">'+en+'</span><span class="editorial-label-sub" lang="it">'+it+'</span></span>';
const persons=[
 ['One speaker. Use the first-person singular.','Una sola persona parla di sé. Usa la prima singolare.'],
 ['One person you address informally. Use the tu form.','Parli a una persona a cui dai del tu. Usa la seconda singolare.'],
 ['One person or thing. Use the third-person singular.','Una sola persona o cosa. Usa la terza singolare.'],
 ['The group includes the speaker. Use the noi form.','Nel gruppo c’è chi parla. Usa la prima plurale.'],
 ['You address a group. Use the voi form.','Ti rivolgi a più persone. Usa la seconda plurale.'],
 ['Several people or things are being described. Use the loro form.','Si parla di più persone o cose. Usa la terza plurale.']
];
const sourcePronouns=['I','You (singular)','He / She','We','You all','They'];
const matchingGuides=['EE-oh SOH-noh','too say','loo-ee / lay eh','noy SYAH-moh','voy SYEH-teh','LOH-roh SOH-noh'];
const pronIds=['p-io','p-tu','p-lui-lei','p-noi','p-voi','p-loro'];
const verbIds=['C','E','A','B','D','F'];
const pronOptions=[1,5,0,4,2,3].map(i=>({id:pronIds[i],right:conjugation[i][0]}));
const verbOptions=[
 {id:'A',right:'A. è'}, {id:'B',right:'B. siamo'}, {id:'C',right:'C. sono (1ª persona singolare)'},
 {id:'D',right:'D. siete'}, {id:'E',right:'E. sei'}, {id:'F',right:'F. sono (3ª persona plurale)'}
];
const matchSheet=bySlug('l6-essere-matching');
matchSheet.questions=matchSheet.questions.map((old,i)=>{
 const model=JSON.stringify([pronIds[i],verbIds[i]]);
 const pairs=[
  {id:pronIds[i],left:'Pronome italiano',right:conjugation[i][0],options:pronOptions},
  {id:verbIds[i],left:'Forma di essere',right:verbOptions.find(option=>option.id===verbIds[i]).right,options:verbOptions}
 ];
 return {...old,type:'match',answer_mode:'match',worksheetOrder:true,legacyMatchValue:old.model,
  pairs,extras:[],choices:[],model,answers:[model],matchLeftLang:'it',matchRightLang:'it',
  hint:bilingual(...persons[i]),prompt:bilingual('Match <b>'+sourcePronouns[i]+'</b> to its Italian pronoun and verb.','Abbina <b>'+sourcePronouns[i]+'</b> al pronome italiano e alla forma di essere.'),
  support:{hint:{en:persons[i][0],it:persons[i][1],html:''},prompt:null,lines:[{it:old.model,en:conjugation[i][2],pron:matchingGuides[i]}]},
  explanation:bilingual(conjugation[i][2]+' = '+old.model+'.',old.model+' = '+conjugation[i][2]+'.')};
});
const personHint=(n,en='',it='')=>[persons[n][0]+(en?' '+en:''),persons[n][1]+(it?' '+it:'')];
const gapHints=[
 personHint(0),personHint(1),['Roma is one city. Use the same verb form as lei.','Roma è una città. Usa la stessa forma di lei.'],
 ['Marco is one person. Use the form for lui.','Marco è una persona. Usa la forma di lui.'],personHint(3),
 personHint(4,'A question keeps the same verb form.','La domanda mantiene la stessa forma verbale.'),
 ['I bambini means the children. The subject is plural.','I bambini è plurale. Pensa a loro.'],
 ['Il caffè is one drink. Use the third-person singular.','Il caffè è una sola bevanda. Usa la terza singolare.'],
 ['Io e Sarah includes the speaker. Replace the two names with “we”.','Io e Sarah comprende chi parla. Pensa a noi.'],
 ['Tu e Tom are two people you address together.','Tu e Tom indica due persone a cui parli. Pensa a voi.']
];
const classHints=[personHint(0),personHint(0,'Contento describes the speaker.','Contento descrive chi parla.'),personHint(1),personHint(1,'In biblioteca is the place.','In biblioteca indica il luogo.'),
 ['Luca is one boy. Which form goes with lui?','Luca è un ragazzo. Quale forma si usa con lui?'],
 ['Il gatto is singular. Nero describes the cat.','Il gatto è singolare. Nero descrive il gatto.'],
 ['La mela is one apple even though two adjectives follow.','La mela è una sola, anche con due aggettivi.'],
 personHint(3),personHint(3,'Fratelli describes the group.','Fratelli descrive il gruppo.'),personHint(4),
 ['I libri are several books. The table is the place.','I libri è plurale. Il tavolo indica il luogo.'],
 ['Le stelle are several stars. Use the verb for loro.','Le stelle è plurale. Usa la forma di loro.']
];
const translationHints=[personHint(0),personHint(1),['She is one woman. Use the third-person singular of essere.','She indica una donna. Usa essere alla terza singolare.'],personHint(3),personHint(4),personHint(5),['The subject is one pizza. The adjective buona describes it.','Il soggetto è una pizza. Buona la descrive.'],['Paul and I includes the speaker. Look for the form for “we”.','Paul and I comprende chi parla. Cerca la forma di noi.']];
const negativeHints=[personHint(0),personHint(1),['Anna is one person. Think of lei.','Anna è una persona. Pensa a lei.'],personHint(3),personHint(4),['Marco and Luca are two people. Think of loro.','Marco e Luca sono due persone. Pensa a loro.']];
function applyHints(slug,hints){bySlug(slug).questions.forEach((item,i)=>{item.hint=bilingual(...hints[i]);});}
applyHints('l6-essere-class',classHints);
applyHints('l6-essere-gaps',gapHints);
applyHints('l6-negative-homework',negativeHints.map(([en,it])=>['Put non before essere. '+en,'Metti non prima di essere. '+it]));
const translations=bySlug('l6-essere-translation');
translations.questions.forEach((item,i)=>{
 item.worksheetOrder=true;item.hint=bilingual(...translationHints[i]);item.prompt=bilingual('Choose the Italian translation.','Scegli la traduzione italiana.')+' <b lang="en">'+esc(hwMC[i][0])+'</b>';
});
const descriptions={
 'l6-essere-matching':['Homework · Match each English pronoun to its Italian pronoun and verb.','Compiti · Abbina ogni pronome inglese al pronome italiano e al verbo.'],
 'l6-essere-gaps':['Homework · Fill each gap with essere.','Compiti · Completa le frasi con essere.'],
 'l6-essere-translation':['Homework · Choose one of the three Italian sentences.','Compiti · Scegli una delle tre frasi italiane.'],
 'l6-essere-class':['Class worksheet · Fill each gap with essere.','Scheda di classe · Completa le frasi con essere.'],
 'l6-negative-homework':['Homework · Complete each sentence with non and essere.','Compiti · Completa le frasi con non ed essere.'],
 'l6-number-patterns':['Extra practice · Write each number as a word.','Esercizio aggiuntivo · Scrivi ogni numero in lettere.'],
 'l6-intonation':['Extra practice · Read the sentence with the pitch shown.','Esercizio aggiuntivo · Leggi la frase con l’intonazione indicata.'],
 'l6-useful-questions':['Extra practice · Choose the phrase for each situation.','Esercizio aggiuntivo · Scegli la frase adatta alla situazione.'],
 'l6-plural-workshop':['Class group worksheet · Change each phrase from “a” to “some”.','Scheda di gruppo · Trasforma le espressioni dal singolare al plurale con il partitivo.'],
 'l6-greetings':['Warm-up · Choose a greeting or a reply.','Riscaldamento · Scegli un saluto o una risposta.'],
 'l6-age-dialogue':['Dialogue practice · Use tu or Lei for the person you are speaking to.','Dialogo · Usa tu o Lei secondo la persona a cui parli.']
};
for(const [slug,wording] of Object.entries(descriptions))bySlug(slug).intro=bilingual(...wording);
const pluralGlosses=['tie','sofa','aeroplane','night','bridge','mirror','chair','bar of soap','classroom','bed','tower','tree','table','wave','stadium'];
pluralsSheet.questions.forEach((item,i)=>{
 const [start]=pluralRows[i];const noun=start.split(/[ ’]/).at(-1);
 let en,it;
 if(start.startsWith('una ')||start.includes('’')){
   en='Feminine noun. Choose the feminine plural for “some”.';it='Nome femminile. Scegli il partitivo femminile plurale.';
 }else if(start.startsWith('uno ')){
   en='Masculine noun starting with s + consonant. Think of the plural article gli.';it='Nome maschile con s + consonante. Pensa all’articolo plurale gli.';
 }else if(/^[aeiou]/.test(noun)){
   en='Masculine noun starting with a vowel. Think of the plural article gli.';it='Nome maschile che inizia per vocale. Pensa all’articolo plurale gli.';
 }else{
   en='Masculine noun starting with an ordinary consonant. Think of the plural article i.';it='Nome maschile che inizia per consonante semplice. Pensa all’articolo plurale i.';
 }
 const ending=noun.slice(-1);
 item.hint=bilingual(en+' Change the final -'+ending+' too.',it+' Cambia anche la -'+ending+' finale.');
 item.prompt=bilingual('Make it plural with “some”.','Metti al plurale con il partitivo.')+' <b lang="it">'+esc(start)+'</b> <small lang="en">('+pluralGlosses[i]+')</small>';
});
const unitClues=[
 ['It starts with z.','Inizia con z.'],['It starts with u.','Inizia con u.'],['The two vowels after d sound separately.','Le due vocali dopo d si pronunciano separatamente.'],['On its own, “three” has no written accent.','Il numero tre da solo si scrive senza accento.'],
 ['It contains qu and a double consonant.','Contiene qu e una consonante doppia.'],['Its opening ci has the sound of “ch” in chair.','La c iniziale ha un suono dolce.'],['Two vowels follow s.','Dopo la s ci sono due vocali.'],
 ['Double the middle consonant.','Raddoppia la consonante centrale.'],['It starts and ends with o. Double the middle consonant.','Inizia e finisce con o. Raddoppia la consonante centrale.'],
 ['It starts with n and ends in e.','Inizia con n e finisce con e.'],['Its last consonant has a soft c sound.','L’ultima consonante è una c dolce.']
];
numberSheet.questions.forEach((item,i)=>{
 const n=numberPracticeValues[i];let clue;
 if(n<=10)clue=unitClues[n];
 else if(n<=16)clue=['This teen number ends in -dici. Think of '+(n-10)+' first.','Questo numero termina in -dici. Pensa prima a '+(n-10)+'.'];
 else if(n<=19)clue=['Here the part for ten comes first. Join it to the part for '+(n-10)+'.','Qui la parte del dieci viene prima. Uniscila alla parte del '+(n-10)+'.'];
 else if(n===21||n===28)clue=['Before uno or otto, drop the final vowel of venti.','Davanti a uno o otto cade la vocale finale di venti.'];
 else if(n===23)clue=['Join twenty and three. Accent the final é.','Unisci venti e tre. Metti l’accento sulla é finale.'];
 else if(n>=22&&n<=29)clue=['Keep the final i of venti before the word for '+(n-20)+'.','Mantieni la i di venti prima della parola per '+(n-20)+'.'];
 else if(n===100)clue=['Use the single word for one hundred. It begins with ce-.','Usa la parola per un centinaio: inizia con ce-.'];
 else if(n===200)clue=['Join two and hundred as one word.','Unisci due e cento in un’unica parola.'];
 else if(n===1000)clue=['Use the singular thousand form with a double l.','Usa la forma del singolare con la doppia l.'];
 else if(n===10000)clue=['Join ten and the plural thousand ending -mila.','Unisci dieci alla desinenza plurale -mila.'];
 else if(n>=40)clue=['This is a multiple of ten. Its ending is -anta.','È una decina intera. La desinenza è -anta.'];
 else clue=n===20?['It starts with v and ends in -nti.','Inizia con v e termina in -nti.']:['It starts with tr and ends in -enta.','Inizia con tr e termina in -enta.'];
 item.hint=bilingual(...clue);
});
const intonationHints=[
 ['Follow the last part of the curve. It rises.','Segui la parte finale della curva. Sale.'],
 ['Follow the last part of the curve. It falls.','Segui la parte finale della curva. Scende.'],
 ...intPairs.slice(0,4).map(()=>['Keep the words in order. Which final mark asks a question?','Mantieni l’ordine delle parole. Quale segno indica una domanda?'])
];
applyHints('l6-intonation',intonationHints);
intonationSheet.questions.forEach((item,i)=>{
 item.prompt=i<2?curve(i===0?'rise':'fall')+'<span lang="it">Claudia è di Vienna</span> '+bilingual('Statement or question?','Affermazione o domanda?'):
 bilingual('Write it as a question.','Trasforma in domanda.')+' <b lang="it">'+intPairs[i-2][0]+'</b>';
});
const situations=[
 ['Ask when someone is coming.','Chiedi quando arriva qualcuno.','Choose the word for a time.','Scegli la parola che chiede il momento.'],
 ['Ask why someone is coming.','Chiedi perché viene qualcuno.','Ask for a reason.','Chiedi il motivo.'],
 ['Ask who someone is.','Chiedi l’identità di qualcuno.','You want a person’s identity.','Ti interessa l’identità della persona.'],
 ['Ask where someone is.','Chiedi dove si trova qualcuno.','You want their current location.','Ti interessa il luogo in cui si trova.'],
 ['Ask what letto means.','Chiedi il significato di letto.','Look for the verb about meaning.','Cerca il verbo che indica il significato.'],
 ['Ask how letto is spelt.','Chiedi come si scrive letto.','Ask for the letters of the word.','Chiedi le lettere della parola.'],
 ['Say you did not understand.','Di’ che non hai capito.','You need a negative statement.','Serve una frase negativa.'],
 ['Politely ask a stranger to repeat.','Chiedi a un estraneo di ripetere.','Use the Lei form in both parts.','Dai del Lei in entrambe le parti.']
];
usefulSheet.questions.forEach((q,i)=>{q.prompt=bilingual(...situations[i].slice(0,2));q.hint=bilingual(...situations[i].slice(2));});
applyHints('l6-greetings',[
 ['Look for the ending that means “very”.','Cerca il suffisso che rafforza bene.'],
 ['Look for a negative reply that mentions male.','Cerca una risposta negativa con male.'],
 ['One stranger. Use the Lei form of stare.','Un estraneo: usa la forma di stare per il Lei.'],
 ['One friend. Use the tu form of stare.','Un amico: usa la forma di stare per il tu.']
]);
applyHints('l6-age-dialogue',[
 ['Age uses avere. Choose the tu form for one friend.','Per l’età si usa avere. Scegli la forma di tu.'],
 ['Age uses avere. A stranger addressed as Lei takes the third-person singular.','Per l’età si usa avere. Con un estraneo usa la terza singolare, Lei.'],
 ['With a friend, choose a tu form of chiamarsi.','Con un amico scegli la forma di tu del verbo chiamarsi.'],
 ['A friend’s origin uses di dove and the tu form of essere.','Per la provenienza di un amico usa di dove ed essere alla seconda singolare.']
]);
numberSheet.study_sections.push(example(bullets('Homework in your coursebook',[
 bilingual('Page 20, exercise 1. Choose each family member’s age.','Pagina 20, esercizio 1. Scegli l’età di ogni familiare.'),
 bilingual('Page 20, exercise 2A–B. Complete the number list, then check with the book audio.','Pagina 20, esercizio 2A–B. Completa la lista dei numeri, poi controlla con l’audio del libro.'),
 bilingual('Page 21, exercise 3. Tick the numbers you hear.','Pagina 21, esercizio 3. Segna i numeri che senti.'),
 bilingual('Page 21, exercise 4A. Look at the picture and answer the questions.','Pagina 21, esercizio 4A. Guarda l’immagine e rispondi alle domande.')
])));
intonationSheet.study_sections.push(example(bullets('Homework in your coursebook',[
 bilingual('Page 175, exercise 19. Listen and add ? or . to each sentence. Listen again and repeat.','Pagina 175, esercizio 19. Ascolta e aggiungi ? o . a ogni frase. Riascolta e ripeti.')
])));

// Keep the action and the material the learner acts on in separate blocks.
function practiceTask(slug, build) {
 bySlug(slug).questions.forEach((question, index) => Object.assign(question, build(index)));
}
for (const [slug, rows] of [['l6-essere-class',classGaps],['l6-essere-gaps',hwGaps],['l6-negative-homework',negHW]]) {
 const task = rows === negHW ? 'Make the sentence negative. Write non and the missing form of essere (to be).' : 'Write the missing form of essere (to be).';
 practiceTask(slug, i => ({task, stimulus:[{label:'Italian',lang:'it',text:rows[i][0]},{label:'Meaning',lang:'en',text:rows[i][2]}]}));
}
practiceTask('l6-essere-matching', i => ({
 task:'Choose the Italian pronoun. Then choose its form of essere (to be).', stimulus:[{label:'English pronoun',lang:'en',text:sourcePronouns[i]}]
}));
practiceTask('l6-essere-translation', i => ({
 task:'Choose the Italian translation with the correct form of essere (to be).', stimulus:[{label:'English',lang:'en',text:hwMC[i][0]}]
}));
practiceTask('l6-number-patterns', i => ({
 task:'Write the number in Italian as one word.', stimulus:[{label:'Number',lang:'en',text:numberPracticeValues[i].toLocaleString('en-GB')}]
}));
practiceTask('l6-intonation', i => i < 2 ? {
 task:'Follow the line to the end. Choose whether the speaker is asking a question or making a statement.',
 stimulusHtml:curve(i===0?'rise':'fall')+'<p lang="it">Claudia è di Vienna</p>'
} : {
 task:'Turn the statement into a question. Write the whole sentence with its new punctuation.', stimulus:[{label:'Statement',lang:'it',text:intPairs[i-2][0]}]
});
practiceTask('l6-plural-workshop', i => ({
 task:'Change “a” to “some”. Write the plural article and noun in Italian.', stimulus:[{label:'Singular',lang:'it',text:pluralRows[i][0]},{label:'Noun meaning',lang:'en',text:pluralGlosses[i]}]
}));
const questionSituations=[
 'You want to know when your friend is coming.', 'You want to know why your friend is coming.',
 'You want to ask someone who they are.', 'You want to know where your friend is now.',
 'You hear the word letto and want to know what it means.', 'You hear the word letto and want to know how to spell it.',
 'You did not understand what the teacher said.', 'You would like a stranger to repeat what they said.'
];
practiceTask('l6-useful-questions', i => ({
 task:i===6?'Choose what you would say in Italian.':'Choose the Italian question you would ask.', stimulus:[{label:'Situation',lang:'en',text:questionSituations[i]}]
}));
practiceTask('l6-greetings', i => i<2 ? {
 task:'Choose the Italian reply with this meaning.', stimulus:[{label:'English',lang:'en',text:['Very well!','Not bad.'][i]}]
} : {
 task:'Choose how to ask this person how they are.', stimulus:[{label:'Situation',lang:'en',text:i===2?'You are speaking politely to a stranger.':'You are speaking to a friend.'}]
});
const introductionCues=[
 ['Choose the Italian question about age.','You are speaking to a friend.'],
 ['Choose the Italian question about age.','You are speaking politely to a stranger.'],
 ['Choose how to ask someone their name in Italian.','You are meeting a new classmate. Use tu.'],
 ['Choose how to ask where someone comes from. Use essere (to be).','You are speaking to a friend.']
];
practiceTask('l6-age-dialogue', i => ({task:introductionCues[i][0],stimulus:[{label:'Situation',lang:'en',text:introductionCues[i][1]}]}));

const flow=['l6-greetings','l6-plural-workshop','l6-number-patterns','l6-age-dialogue','l6-essere-class','l6-negative-homework','l6-intonation','l6-useful-questions'];
for(const item of sheets){
 item.topicSlug=item.topicSlug||item.slug;
 if(item.catalogue===undefined)item.catalogue=true;
 item.lessonPosition=flow.indexOf(item.topicSlug)+1;
}
const categories=[
 {id:'conversation',title:'Conversation and context',slugs:['l6-greetings','l6-age-dialogue','l6-useful-questions']},
 {id:'numbers',title:'Numbers',slugs:['l6-number-patterns']},
 {id:'verbs',title:'Verbs and pronouns',slugs:['l6-essere-class','l6-negative-homework']},
 {id:'grammar',title:'Grammar and sentence building',slugs:['l6-plural-workshop']},
 {id:'sounds',title:'Sounds and spelling',slugs:['l6-intonation']}
];
// Preserve old card identity and old deck/index links while putting the web lesson in class order.
const legacyTopics=Object.fromEntries(topics.map(t=>[t,cards.filter(c=>c.deck===t).map(c=>c.key)]));
const orderedTopics=['Greetings and responses','Plural partitives — revision','Number-building patterns','Age and introductions','Essere in the present','Negative sentences','Statements and questions','Question words and useful phrases'];
for(const card of cards){
 const key=card.key.replace('italian-l6-','');
 const slot=/^partitive-/.test(key)?1:/^(number-|pattern-)/.test(key)?2:/^(darle-|darti-|age-)/.test(key)?3:/^negative-/.test(key)?5:/^(intonation-|question-sei)/.test(key)?6:card.deck===topics[2]?4:card.deck===topics[4]?7:0;
 card.deck=orderedTopics[slot];card.panel=card.panel.replace(/<div class="panel-title">[^<]*<\/div>/,'<div class="panel-title">'+esc(card.deck)+'</div>');
}
cards.sort((a,b)=>orderedTopics.indexOf(a.deck)-orderedTopics.indexOf(b.deck));
topics.splice(0,topics.length,...orderedTopics);
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
function migrateNumberPractice(storage){
 if(!storage)return;
 try{
  const key='italianCourseSessionProgressV2',viewKey='italianGuidedSheetPilotV1:l6-number-patterns';
  const progress=JSON.parse(storage.getItem(key)||'{}');
  progress.study=progress.study||{answers:{}};
  if(progress.study.numberPracticeVersion===2)return;
  const answers=progress.study.answers||{};
  const previousValues=[21,23,28,40,200,600,800,1000,2000,4000,9000,10000];
  const archive={};
  previousValues.forEach((n,i)=>{const id='l6-number-patterns-q'+(i+1);if(answers[id])archive[id]=answers[id];});
  Object.keys(answers).filter(k=>/^l6-number-patterns-q\d+$/.test(k)).forEach(k=>delete answers[k]);
  previousValues.forEach((n,i)=>{const saved=archive['l6-number-patterns-q'+(i+1)],next=numberPracticeValues.indexOf(n);if(saved&&next>=0)answers['l6-number-patterns-q'+(next+1)]=saved;});
  progress.study.answers=answers;
  if(Object.keys(archive).length)progress.study.numberPracticeArchiveV1=archive;
  const rawView=storage.getItem(viewKey);
  if(rawView){
   const view=JSON.parse(rawView);
   if(view.numberPracticeVersion!==2){
    view.question=Math.max(0,numberPracticeValues.indexOf(previousValues[view.question]));
    view.finished=false;view.reviewIncorrect=false;view.reviewQueue=[];view.numberPracticeVersion=2;
    storage.setItem(viewKey,JSON.stringify(view));
   }
  }
  progress.study.numberPracticeVersion=2;
  storage.setItem(key,JSON.stringify(progress));
 }catch(_){/* Storage unavailable: practice still works without erasing user data. */}
}
const api={numberPracticeValues,migrateNumberPractice,version,title:'Numbers, Essere and Questions',deckName:'Italian - Lesson 6 - Numbers, Essere and Questions',sources,topics,cards,sheets,categories,flow,practiceGroups,legacyTopics,numberRows,issues,checkAnswer,normalise};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root){root.ITALIAN_L6=api;try{migrateNumberPractice(root.sessionStorage);}catch(_){}}
})(typeof window!=='undefined'?window:undefined);
