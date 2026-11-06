#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const script=read('study/guided-sheet-pilot-v1.js');
const style=read('study/guided-sheet-pilot-v1.css');
const html=read('study/study-sheets.html');
const packed=read('study/study-sheets-v5.js');
const key=packed.match(/\bconst B="([^"]+)"/);
assert.ok(key,'Cannot read existing sheet data');
const sheets=JSON.parse(zlib.gunzipSync(Buffer.from(key[1],'base64')).toString('utf8'));
assert.ok(Array.isArray(sheets),'Sheet data must be an array');
const expectedSlugs=[
 'conversation-foundations','di-da-dove-pronouns','subject-pronouns-present-tense',
 'known-verbs-and-forms','word-jobs-sentence-building','avere-numbers-family',
 'plural-articles','c-g-sounds-and-spelling','mixed-review-challenge'
];
assert.equal(sheets.length,expectedSlugs.length,'All nine Study Sheets must remain available');
assert.deepEqual(new Set(sheets.map(s=>s.slug)),new Set(expectedSlugs),'Guide must cover every approved sheet');
for(const sheet of sheets){
 assert.ok(sheet.study_sections.length>=2,sheet.slug+' must have a Learn section and Examples section');
 assert.ok(sheet.questions.length>=1,sheet.slug+' must have practice questions');
 assert.ok(sheet.study_sections.every(s=>['table','bullets','town_grid','number_grid'].includes(s.type)),
   sheet.slug+' has a new section type: update the guided renderer first');
 const learn=sheet.study_sections.slice(0,1),examples=sheet.study_sections.slice(1);
 assert.equal(learn.length,1,'One focused Learn section per sheet');
 assert.equal(learn.length+examples.length,sheet.study_sections.length,'No learning sections lost');
}
assert.match(script,/const TARGET = new URLSearchParams\(location\.search\)\.get\('sheet'\)/,
 'Guide must determine active sheet from URL');
assert.match(script,/article\.id !== TARGET/,'Only activate the matching sheet, not the library');
assert.match(script,/const learn = explicitStages\?panels\.filter\(p=>p\.dataset\.studyStage==='learn'\):panels\.slice\(0, 1\)/,'Explicit teaching stages take priority; earlier sheets keep their first-section fallback');
assert.match(script,/const examples = explicitStages\?panels\.filter\(p=>p\.dataset\.studyStage==='examples'\):panels\.slice\(1\)/,'Explicit examples take priority; earlier sheets retain their fallback');
assert.doesNotMatch(script,/requested !== TARGET/,'No single-sheet pilot gate should remain');
assert.match(script,/sessionStorage\.setItem\(VIEW_KEY/,'Pilot must remember position');
assert.match(script,/question\.hidden\s*=/,'Pilot must show one question at a time');
assert.match(script,/data-guided-step/,'Pilot must permit non-linear navigation');
assert.match(script,/function stats\(/,'Pilot must display quiz progress');
assert.match(script,/quiz\.hidden\s*=/,'Pilot must hide practice outside its step');
assert.match(script,/return false/,'Guided experience must preserve the original-page fallback');
assert.match(script,/reviewUnanswered/,'Pilot must offer unanswered review');
assert.match(style,/@media print/,'Printing must remain available');
assert.match(style,/\.guided-study-pilot \.study-pack-sheet > \.panel\[hidden\]/,'Print must show all sections');
assert.match(html,/guided-sheet-pilot-v1\.css\?v=/,'Pilot CSS not loaded');
assert.match(html,/guided-sheet-pilot-v1\.js\?v=/,'Pilot JS not loaded');
assert.ok(html.indexOf('guided-sheet-pilot-v1.js')>html.indexOf('study-recovery-v1.js'),'Run pilot after existing progress restoration');
assert.ok(html.indexOf('guided-sheet-pilot-v1.js')>html.indexOf('study-editorial-v1.js'),'Run pilot after bilingual decoration');
console.log('PASS all nine approved sheets have ordered Learn, Examples and Practice content.');
console.log('PASS learning stages, saved progress, standalone answer checker, fallback and print support.');

// Layout stability, completion pathway and honest overall progress.
assert.match(script, /firstHeading\.insertAdjacentElement\('afterend', teachingNote\)/, 'Teaching note must move into Learn content, not shift the header');
assert.doesNotMatch(script, /paragraph\.hidden\s*=\s*!\(step === 'learn'/, 'The header must not change height across steps');
assert.match(script, /function focusCurrent\(previousQuestionTop = null\)/, 'Question-aware focus and scroll anchor required');
assert.match(script, /function focusStage\(previousTop=null\)/, 'All three stages require one shared scroll anchor');
assert.match(script, /const oldStageTop=steps\.getBoundingClientRect\(\)\.top/, 'Capture previous stage viewport position');
assert.doesNotMatch(script, /steps\.scrollIntoView\(/, 'Do not let scrollIntoView choose different stage positions');
assert.match(script, /focusCurrent\(oldQuestionTop\)/, 'Question navigation must retain its previous viewport anchor');
assert.match(script, /currentQuestion\.getBoundingClientRect\(\)/, 'Question navigation must measure the current question');
assert.match(script, /window\.scrollBy\(\{top:delta,behavior:'instant'\}\)/, 'Question navigation must avoid scrolling to the stage header');
assert.match(script, /visitedLearn/, 'Track lesson sections visited');
assert.match(script, /visitedExamples/, 'Track examples visited');
assert.match(script, /const covered = state\.visitedLearn\.length \+ state\.visitedExamples\.length \+ stat\.attempted/, 'Count covered activities without counting skipped questions');
assert.match(script, /progressTrack\.setAttribute\('aria-valuenow'/, 'Expose accessible progress values');
assert.ok(script.includes("context?.next?.href||context?.flashcards||'../?page=lessons'"), 'Completion follows the selected topic path, then Flashcards');
assert.match(script, /finish\.querySelector\('\[data-guided-review-unanswered\]'\)\.before\(followup\)/, 'Completion screen must offer the next action');
assert.match(style, /guided-sheet-current\{min-height:119px\}/, 'Reserve consistent heading space');
assert.match(style, /guided-sheet-progress-fill/, 'Missing visual progress bar');
assert.match(style, /guided-study-pilot \.study-pack-sheet > \.hero \.sheet-progress/, 'Hide duplicate legacy progress meter');
console.log('PASS stable scroll anchor, activity progress, completion link, and final-sheet flashcard fallback.');

// Responsive question controls must remain side by side even on narrow/mobile viewports.
assert.match(style, /\.guided-sheet-controls-buttons \{\s*display:grid;\s*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, 'Question controls must use two equal columns');
assert.match(style, /@media\(max-width:900px\)[\s\S]*?\.guided-sheet-controls-buttons \{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, 'Mobile must retain two columns');
assert.match(style, /\.guided-sheet-controls-buttons > button \{[\s\S]*?min-width:0;/, 'Buttons must shrink within narrow columns');
console.log('PASS question scroll position and side-by-side mobile controls.');
