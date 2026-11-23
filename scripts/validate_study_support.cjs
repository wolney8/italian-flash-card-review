'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
cp.execFileSync(process.execPath,[path.join(__dirname,'validate_course_library.cjs')],{cwd:root});
const data=JSON.parse(fs.readFileSync(path.join(root,'artifacts/course-library/all-sheets.json'),'utf8'));
const help=require('../study/question-support-v1.js');
const before=JSON.stringify(data),records=[];
function hintText(record,lang){
 return record.hint[lang] || (record.hint.html||'').match(new RegExp('<span(?=[^>]*lang="'+lang+'")[^>]*>([\\s\\S]*?)</span>'))?.[1].replace(/<[^>]*>/g,'') || '';
}
for(const s of data)for(let i=0;i<s.questions.length;i++){
 const q=s.questions[i],d=help.describe(q,s,i);records.push({id:s.slug+'-q'+(i+1),...d});
 assert.ok(hintText(d,'en'),'Missing English hint '+s.slug+' '+i);
 assert.doesNotMatch(JSON.stringify(d),/undefined|NaN|a aunt|the city(?=")/);
 assert.ok(hintText(d,'it'),'Missing Italian hint '+s.slug+' '+i);
 assert.doesNotMatch(hintText(d,'en'),/Use the form or phrase shown|Match the subject before/);
 if(d.prompt?.pron&&d.prompt.it.includes('___'))assert.ok(d.prompt.pron.includes('[…]'),'Do not pronounce the missing answer');
}
assert.equal(JSON.stringify(data),before,'Support must not mutate source answers or IDs');
assert.equal(records.length,623);
const get=id=>records.find(r=>r.id===id);
assert.equal(get('l6-essere-gaps-q4').lines[0].en,'Marco is tired today.');
assert.equal(get('l6-essere-gaps-q4').lines[0].it,'Marco è stanco oggi.');
assert.ok(get('l6-essere-gaps-q4').lines[0].pron.includes('MAHR-koh EH'));
assert.match(hintText(get('l6-essere-gaps-q4'),'en'),/Marco.*one person.*lui/i);
assert.equal(get('l6-essere-class-q11').lines[0].en,'The books are on the table.');
assert.equal(get('l6-negative-homework-q1').lines[0].en,'I am not Italian.');
assert.match(hintText(get('l6-negative-homework-q1'),'en'),/non before essere/i);
assert.match(hintText(get('l6-plural-workshop-q3'),'en'),/masculine.*vowel.*gli/i);
assert.match(hintText(get('l6-plural-workshop-q6'),'en'),/s \+ consonant/);
assert.equal(get('l6-number-patterns-q24').lines[0].en,'twenty-three');
assert.match(hintText(get('l6-number-patterns-q24'),'en'),/accent.*é/i);
assert.equal(get('l6-number-patterns-q24').prompt,null);
assert.match(hintText(get('class4-silent-h-q4'),'en'),/destination/i);
assert.equal(get('class4-avere-homework-q2').lines[0].en,'Are you hungry?');
assert.match(hintText(get('class2-c-sounds-q8'),'en'),/hard sound before e or i.*silent/i);
assert.match(hintText(get('class1-register-q4'),'en'),/tu.*chiamarsi/i);
assert.equal(get('plural-articles-q10').lines[0].en,'the cities');
assert.equal(get('class2-indefinite-articles-q8').lines[0].en,'an aunt');
assert.equal(get('class2-definite-articles-q5').lines[0].it,"l'amico.");
assert.equal(get('class3-complete-replies-q1').prompt.en,'Where are you from? (informal)');
assert.equal(get('class3-complete-replies-q1').lines[0].en,'I am from Naples.');
assert.equal(get('practice-essere-q6').lines[0].en,'You are at home.');
const coverage=records.filter(r=>r.lines.every(x=>x.en&&x.pron));
const conceptIds=[
 'di-da-dove-pronouns-q2','avere-numbers-family-q8',
 ...[1,2,3,4,5,6].map(i=>'c-g-sounds-and-spelling-q'+i),
 'mixed-review-challenge-q7','l6-intonation-q1','l6-intonation-q2'
];
assert.equal(get('class2-homework-c-columns-q1').lines[0].en,'basket');
assert.equal(get('class2-homework-g-columns-q2').lines[0].it,'ghiro');
assert.equal(get('class2-homework-article-columns-q3').lines[0].en,'an agency');
assert.equal(get('class5-class-plural-table-q13').lines[0].en,'the birds');
assert.equal(get('class4-homework-number-maze-q1').lines[0].en,'Bye, see you next time!');
const excluded=records.filter(r=>!coverage.includes(r)).map(r=>({id:r.id,model:r.lines.map(x=>x.it)}));
assert.deepEqual(excluded.map(r=>r.id).sort(),conceptIds.sort(),'Every Italian answer needs an English meaning and pronunciation');
const script=fs.readFileSync(path.join(root,'study/guided-sheet-pilot-v1.js'),'utf8');
assert.ok(script.includes('question.hidden!==hidden'),'Do not hide the focused question during every update');
assert.doesNotMatch(script,/article\.addEventListener\('change'/,'Native text blur must not redraw the entire activity');
const checker=fs.readFileSync(path.join(root,'study/study-sheets-v5.js'),'utf8');
assert.ok(checker.includes("if(q&&!e.target.matches('input[type=text]'))"),'Text input blur must not discard feedback');
const report={status:'pass',routes:data.length,tasks:records.length,italian_answer_tasks_with_english_and_pronunciation:coverage.length,non_italian_or_concept_tasks:excluded,source_mutation:false,pronunciation:'Approximate added reading guides, not recordings or IPA',hints:'Source rules and question-specific adaptations'};
const out=path.join(root,'artifacts/study-support');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'content-results.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(out,'support-audit.json'),JSON.stringify(records,null,2));console.log(JSON.stringify(report,null,2));
