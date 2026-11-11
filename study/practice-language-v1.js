/* Additional authored UI copy; canonical exercise targets are not translated. */
(function(root){
'use strict';
const c=root.ItalianUICatalogue;if(!c)return;
const m={
'Repeatable verb practice':'Esercizi ripetibili sui verbi',
'Verb practice':'Esercizi sui verbi',
'Verb reference — regular and irregular':'Guida ai verbi — regolari e irregolari',
'Forms, pronunciation and usage — for looking things up':'Forme, pronuncia e uso — per la consultazione',
'Words, gaps, full sentences, choices and matching':'Parole, completamenti, frasi intere, scelte e abbinamenti',
'Irregular verb — mixed exercises':'Verbo irregolare — esercizi misti',
'Regular present — mixed exercises':'Presente regolare — esercizi misti',
'Reflexive verb — mixed exercises':'Verbo riflessivo — esercizi misti',
'Use the whole sentence':'Usa la frase completa',
'Approximate pronunciation':'Pronuncia approssimativa',
'Regular present — mixed practice':'Presente regolare — esercizi misti',
'Irregular verbs — mixed practice':'Verbi irregolari — esercizi misti',
'Choose the verb and use it in a complete sentence':'Scegli il verbo e usalo in una frase completa',
'Compare the patterns':'Confronta gli schemi',
'Keep meaning and grammar together':'Collega significato e grammatica',
'Things and animals — esso, essa, essi, esse':'Cose e animali — esso, essa, essi, esse',
'Recognise the pronoun and practise singular/plural agreement':'Riconosci il pronome ed esercita la concordanza al singolare e al plurale',
'Things and animals — pronoun forms':'Cose e animali — forme dei pronomi',
'Gender and number':'Genere e numero',
'From the noun to the pronoun':'Dal nome al pronome',
'Choose…':'Scegli…',
'Plural forms — noi, voi, loro / essi / esse':'Forme plurali — noi, voi, loro / essi / esse',
'Treccani — supplementary usage note':'Treccani — nota d’uso integrativa',
'Regular in this present-tense exercise; other tenses have irregular forms.':'Regolare in questi esercizi al presente; altri tempi hanno forme irregolari.',
'Reflexive: keep mi / ti / si / ci / vi / si with the verb.':'Riflessivo: mantieni mi / ti / si / ci / vi / si con il verbo.',
'Learn the irregular forms; do not apply one regular ending pattern.':'Impara le forme irregolari; non applicare un solo schema di desinenze regolari.',
'Compare the repeating stem and the present endings.':'Confronta la radice ripetuta e le desinenze del presente.'
};
for(const v of ['essere','avere','venire','stare','andare','vivere','abitare','chiamarsi']){
 m['Practise '+v]='Esercizi: '+v;m[v+' — forms and pronunciation']=v+' — forme e pronuncia';
}
root.ItalianUICatalogue=Object.freeze({messages:Object.freeze({...c.messages,...m}),blocks:c.blocks});
})(window);
