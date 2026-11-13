/* Question-level learning support. Does not alter answers, IDs or scoring.
 * Supplied glosses are retained. Additional meanings, reading guides and hints are
 * teaching adaptations. Reading guides are approximate, not tutor recordings/IPA.
 */
(function(root){
'use strict';
const text=s=>String(s??'').replace(/<span[^>]*class="editorial-label-sub"[^>]*>[\s\S]*?<\/span>/g,'').replace(/<small[^>]*>[\s\S]*?<\/small>/g,'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').replace(/\s+([.!?,;:])/g,'$1').replace(/’\s+/g,'’').trim();
const norm=s=>text(s).normalize('NFC').toLowerCase().replace(/[’‘]/g,"'").replace(/[.!?,;:]+$/g,'').trim();
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lex={},nouns={};
function words(lines){for(const row of lines.trim().split('\n')){const [it,en,pron]=row.split('|');lex[norm(it)]={en,pron};}}
words(`laura|Laura|LOW-rah
quanti|how many|KWAHN-tee
pizza|pizza|PEET-tsah
città|city|cheet-TAH
porto|port|POHR-toh
spiaggia|beach|SPYAHD-jah
cena|dinner|CHEH-nah
cinema|cinema|CHEE-neh-mah
cucina|kitchen|koo-CHEE-nah
barche|boats|BAHR-keh
gelato|ice cream|jeh-LAH-toh
giro|lap|JEE-roh
gonna|skirt|GOHN-nah
gufo|owl|GOO-foh
ghepardo|cheetah|geh-PAHR-doh
ghiaccio|ice|GYAHT-choh
funghi|mushrooms|FOON-gee
portogallo|Portugal|pohr-toh-GAHL-loh
gi|letter G|jee
acca|letter H|AHK-kah
elle|letter L|EHL-leh
emme|letter M|EHM-meh
enne|letter N|EHN-neh
erre|letter R|EHR-reh
u|letter U|oo
vuoi|you want|VWOH-ee
trent'anni|thirty years|trehnt-AHN-nee
vent'anni|twenty years|vehnt-AHN-nee
io|I|EE-oh
tu|you|too
lui|he|LOO-ee
lei|she / formal you|LEH-ee
noi|we|NOH-ee
voi|you all|VOH-ee
loro|they|LOH-roh
esso|it, masculine singular|EHSS-soh
essa|it, feminine singular|EHSS-sah
essi|they, masculine plural|EHSS-see
esse|they, feminine plural|EHSS-seh
sono|am / are|SOH-noh
sei|are|SEH-ee
è|is|EH
siamo|are|SYAH-moh
siete|are|SYEH-teh
ho|have|OH
hai|have|AH-ee
ha|has / formal have|AH
abbiamo|have|ahb-BYAH-moh
avete|have|ah-VEH-teh
hanno|have|AHN-noh
vengo|come|VEHN-goh
vieni|come|VYEH-nee
viene|comes / formal come|VYEH-neh
veniamo|come|veh-NYAH-moh
venite|come|veh-NEE-teh
vengono|come|VEHN-goh-noh
sto|am / stay|STOH
stai|are / stay|STAH-ee
sta|is / stays|STAH
stiamo|are / stay|STYAH-moh
state|are / stay|STAH-teh
stanno|are / stay|STAHN-noh
vado|go|VAH-doh
vai|go|VAH-ee
va|goes|VAH
andiamo|go|ahn-DYAH-moh
andate|go|ahn-DAH-teh
vanno|go|VAHN-noh
vivo|live|VEE-voh
vivi|live|VEE-vee
vive|lives|VEE-veh
viviamo|live|vee-VYAH-moh
vivete|live|vee-VEH-teh
vivono|live|VEE-voh-noh
abito|live|AH-bee-toh
abiti|live|AH-bee-tee
abita|lives|AH-bee-tah
abitiamo|live|ah-bee-TYAH-moh
abitate|live|ah-bee-TAH-teh
abitano|live|AH-bee-tah-noh
chiamo|call|KYAH-moh
chiami|call|KYAH-mee
chiama|calls|KYAH-mah
chiamiamo|call|kyah-MYAH-moh
chiamate|call|kyah-MAH-teh
chiamano|call|KYAH-mah-noh
mi|myself / me|mee
ti|yourself / you|tee
si|oneself|see
ci|ourselves / there|chee
vi|yourselves|vee
non|not|nohn
il|the|eel
lo|the|loh
la|the|lah
l'|the|l
un|a / an|oon
uno|one / a|OO-noh
una|a / an|OO-nah
un'|an|oon
i|the|ee
gli|the|lyee
le|the|leh
dei|some|DEH-ee
degli|some|DEH-lyee
delle|some|DEHL-leh
di|of / from|dee
da|from|dah
a|to / at|ah
in|in|een
al|at the|ahl
sul|on the|sool
nel|in the|nehl
e|and|eh
o|or|oh
come|how|KOH-meh
dove|where|DOH-veh
chi|who|kee
che|what / which|keh
cosa|what / thing|KOH-zah
quando|when|KWAHN-doh
perché|why / because|pehr-KEH
molto|very|MOHL-toh
molti|many|MOHL-tee
oggi|today|OHD-jee
bene|well|BEH-neh
benissimo|very well|beh-NEESS-see-moh
male|badly / unwell|MAH-leh
proprio|really|PROH-pryoh
fame|hunger|FAH-meh
sete|thirst|SEH-teh
fretta|hurry|FREHT-tah
paura|fear|pah-OO-rah
ragione|being right|rah-JOH-neh
voglia|desire|VOH-lyah
uscire|to go out|oo-SHEE-reh
mio|my|MEE-oh
mia|my|MEE-ah
miei|my|MYEH-ee
stessa|same|STEHSS-sah
sì|yes|see
no|no|noh
italiano|Italian|ee-tah-LYAH-noh
italiana|Italian|ee-tah-LYAH-nah
italiani|Italian|ee-tah-LYAH-nee
italiane|Italian|ee-tah-LYAH-neh
inglese|English|een-GLEH-zeh
inglesi|English|een-GLEH-zee
francese|French|frahn-CHEH-zeh
francesi|French|frahn-CHEH-zee
tedesco|German|teh-DEHS-koh
tedesca|German|teh-DEHS-kah
americani|American|ah-meh-ree-KAH-nee
alto|tall|AHL-toh
alti|tall|AHL-tee
contento|happy|kohn-TEHN-toh
felice|happy|feh-LEE-cheh
felici|happy|feh-LEE-chee
stanco|tired|STAHN-koh
pronti|ready|PROHN-tee
simpatico|nice|seem-PAH-tee-koh
bravo|good|BRAH-voh
buona|good|BWOH-nah
nero|black|NEH-roh
rossa|red|ROHSS-sah
dolce|sweet|DOHL-cheh
caldo|hot|KAHL-doh
grande|big|GRAHN-deh
italia|Italy|ee-TAH-lyah
napoli|Naples|NAH-poh-lee
roma|Rome|ROH-mah
milano|Milan|mee-LAH-noh
londra|London|LOHN-drah
vienna|Vienna|VYEHN-nah
francia|France|FRAHN-chah
germania|Germany|jehr-MAH-nyah
spagna|Spain|SPAH-nyah
inghilterra|England|een-gheel-TEHR-rah
ancona|Ancona|ahn-KOH-nah
imola|Imola|EE-moh-lah
zara|Zara|DZAH-rah
marco|Marco|MAHR-koh
anna|Anna|AHN-nah
luca|Luca|LOO-kah
paolo|Paul|PAH-oh-loh
sarah|Sarah|SAH-rah
tom|Tom|TOHM
martedì|Tuesday|mahr-teh-DEE
venerdì|Friday|veh-nehr-DEE
buongiorno|good morning / good day|bwohn-JOHR-noh
buonasera|good evening|bwoh-nah-SEH-rah
ciao|hello / bye, informal|CHOW
piacere|nice to meet you|pyah-CHEH-reh
grazie|thank you|GRAHT-tsyeh
capito|understood|kah-PEE-toh
scusa|excuse me, informal|SKOO-zah
scusi|excuse me, formal|SKOO-zee
puoi|you can, informal|PWOH-ee
può|can, formal|pwoh
ripetere|repeat|ree-PEH-teh-reh
per|for|pehr
favore|favour|fah-VOH-reh
significa|means|see-NYEE-fee-kah
scrive|writes|SKREE-veh
dice|says|DEE-cheh
posso|I can / may|POHSS-soh
darle|to address you, formal|DAHR-leh
darti|to address you, informal|DAHR-tee
del|of the|dehl
c'è|there is|cheh
prego|you are welcome|PREH-goh
arrivederci|goodbye|ahr-ree-veh-DEHR-chee
scuola|school|SKWOH-lah
biblioteca|library|bee-blyoh-TEH-kah
ritardo|lateness|ree-TAHR-doh
giardino|garden|jahr-DEE-noh
parco|park|PAHR-koh
cielo|sky|CHEH-loh
classe|class|KLAHSS-seh
caffè|coffee|kahf-FEH
tè|tea|teh
febbre|fever|FEHB-breh
idea|idea|ee-DEH-ah
lezione|lesson|leht-TSYOH-neh
professore|teacher|proh-fehs-SOH-reh
studenti|students|stoo-DEHN-tee
studente|student|stoo-DEHN-teh
regno|kingdom|REH-nyoh
unito|united|oo-NEE-toh`);
// Noun family entries keep gender, spelling and pronunciation together.
const nounRows=`libro|libri|book|books|LEE-broh|LEE-bree|m
casa|case|house|houses|KAH-zah|KAH-zeh|f
cane|cani|dog|dogs|KAH-neh|KAH-nee|m
amico|amici|friend|friends|ah-MEE-koh|ah-MEE-chee|m
amica|amiche|friend|friends|ah-MEE-kah|ah-MEE-keh|f
cravatta|cravatte|tie|ties|krah-VAHT-tah|krah-VAHT-teh|f
divano|divani|sofa|sofas|dee-VAH-noh|dee-VAH-nee|m
aereo|aerei|aeroplane|aeroplanes|ah-EH-reh-oh|ah-EH-reh-ee|m
notte|notti|night|nights|NOHT-teh|NOHT-tee|f
ponte|ponti|bridge|bridges|POHN-teh|POHN-tee|m
specchio|specchi|mirror|mirrors|SPEHK-kyoh|SPEHK-kee|m
sedia|sedie|chair|chairs|SEH-dyah|SEH-dyeh|f
sapone|saponi|soap|soaps|sah-POH-neh|sah-POH-nee|m
aula|aule|classroom|classrooms|OW-lah|OW-leh|f
letto|letti|bed|beds|LEHT-toh|LEHT-tee|m
torre|torri|tower|towers|TOHR-reh|TOHR-ree|f
albero|alberi|tree|trees|AHL-beh-roh|AHL-beh-ree|m
tavolo|tavoli|table|tables|TAH-voh-loh|TAH-voh-lee|m
onda|onde|wave|waves|OHN-dah|OHN-deh|f
stadio|stadi|stadium|stadiums|STAH-dyoh|STAH-dee|m
telefono|telefoni|phone|phones|teh-LEH-foh-noh|teh-LEH-foh-nee|m
macchina|macchine|car|cars|MAHK-kee-nah|MAHK-kee-neh|f
fiore|fiori|flower|flowers|FYOH-reh|FYOH-ree|m
porta|porte|door|doors|POHR-tah|POHR-teh|f
orologio|orologi|clock / watch|clocks / watches|oh-roh-LOH-joh|oh-roh-LOH-jee|m
isola|isole|island|islands|EE-zoh-lah|EE-zoh-leh|f
stivale|stivali|boot|boots|stee-VAH-leh|stee-VAH-lee|m
matita|matite|pencil|pencils|mah-TEE-tah|mah-TEE-teh|f
treno|treni|train|trains|TREH-noh|TREH-nee|m
borsa|borse|bag|bags|BOHR-sah|BOHR-seh|f
nave|navi|ship|ships|NAH-veh|NAH-vee|f
albergo|alberghi|hotel|hotels|ahl-BEHR-goh|ahl-BEHR-gee|m
lettera|lettere|letter|letters|LEHT-teh-rah|LEHT-teh-reh|f
quadro|quadri|painting|paintings|KWAH-droh|KWAH-dree|m
scarpa|scarpe|shoe|shoes|SKAHR-pah|SKAHR-peh|f
scoiattolo|scoiattoli|squirrel|squirrels|skoh-YAHT-toh-loh|skoh-YAHT-toh-lee|m
maestro|maestri|teacher|teachers|mah-EHS-troh|mah-EHS-tree|m
maestra|maestre|teacher|teachers|mah-EHS-trah|mah-EHS-treh|f
straniero|stranieri|foreigner|foreigners|strah-NYEH-roh|strah-NYEH-ree|m
zio|zii|uncle|uncles|TSEE-oh|TSEE-ee|m
zia|zie|aunt|aunts|TSEE-ah|TSEE-eh|f
fratello|fratelli|brother|brothers|frah-TEHL-loh|frah-TEHL-lee|m
sorella|sorelle|sister|sisters|soh-REHL-lah|soh-REHL-leh|f
figlio|figli|son / child|sons / children|FEE-lyoh|FEE-lyee|m
figlia|figlie|daughter|daughters|FEE-lyah|FEE-lyeh|f
gatto|gatti|cat|cats|GAHT-toh|GAHT-tee|m
mela|mele|apple|apples|MEH-lah|MEH-leh|f
stella|stelle|star|stars|STEHL-lah|STEHL-leh|f
bambino|bambini|child|children|bahm-BEE-noh|bahm-BEE-nee|m
ragazzo|ragazzi|boy|boys|rah-GAHT-tsoh|rah-GAHT-tsee|m
anno|anni|year|years|AHN-noh|AHN-nee|m
mese|mesi|month|months|MEH-zeh|MEH-zee|m
problema|problemi|problem|problems|proh-BLEH-mah|proh-BLEH-mee|m
ragno|ragni|spider|spiders|RAH-nyoh|RAH-nyee|m
nonno|nonni|grandfather|grandfathers|NOHN-noh|NOHN-nee|m
nonna|nonne|grandmother|grandmothers|NOHN-nah|NOHN-neh|f
padre|padri|father|fathers|PAH-dreh|PAH-dree|m
madre|madri|mother|mothers|MAH-dreh|MAH-dree|f
marito|mariti|husband|husbands|mah-REE-toh|mah-REE-tee|m
moglie|mogli|wife|wives|MOH-lyeh|MOH-lyee|f`;
for(const row of nounRows.split('\n')){const [s,p,en,ens,ph,php,g]=row.split('|');for(const [it,e,r,num] of [[s,en,ph,'singular'],[p,ens,php,'plural']]){lex[it]={en:e,pron:r};nouns[it]={singular:s,plural:p,gender:g,number:num};}}
for(const [w,g] of [['porto','m'],['spiaggia','f']])nouns[w]={gender:g,number:'singular',singular:w,plural:w==='porto'?'porti':'spiagge'};
const numberWords='zero uno due tre quattro cinque sei sette otto nove dieci undici dodici tredici quattordici quindici sedici diciassette diciotto diciannove venti ventuno ventidue ventitré ventiquattro venticinque ventisei ventisette ventotto ventinove trenta quaranta cinquanta sessanta settanta ottanta novanta cento duecento mille diecimila'.split(' ');
const numberEnglish='zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twenty-one|twenty-two|twenty-three|twenty-four|twenty-five|twenty-six|twenty-seven|twenty-eight|twenty-nine|thirty|forty|fifty|sixty|seventy|eighty|ninety|one hundred|two hundred|one thousand|ten thousand'.split('|');
const numberPron='DZEH-roh|OO-noh|DOO-eh|treh|KWAHT-troh|CHEEN-kweh|SEH-ee|SEHT-teh|OHT-toh|NOH-veh|DYEH-chee|OON-dee-chee|DOH-dee-chee|TREH-dee-chee|kwaht-TOHR-dee-chee|KWEEN-dee-chee|SEH-dee-chee|dee-chahs-SEHT-teh|dee-CHOHT-toh|dee-chahn-NOH-veh|VEHN-tee|vehn-TOO-noh|vehn-tee-DOO-eh|vehn-tee-TREH|vehn-tee-KWAHT-troh|vehn-tee-CHEEN-kweh|vehn-tee-SEH-ee|vehn-tee-SEHT-teh|vehn-TOHT-toh|vehn-tee-NOH-veh|TREHN-tah|kwah-RAHN-tah|cheen-KWAHN-tah|sehs-SAHN-tah|seht-TAHN-tah|oht-TAHN-tah|noh-VAHN-tah|CHEHN-toh|doo-eh-CHEHN-toh|MEEL-leh|dyeh-chee-MEE-lah'.split('|');
numberWords.forEach((w,i)=>{if(w!=='sei'&&w!=='uno')lex[w]={en:numberEnglish[i],pron:numberPron[i]};});
const phrases={};
function phrasesFrom(lines){for(const row of lines.trim().split('\n')){const [it,en]=row.split('|');phrases[norm(it)]=en;}}
phrasesFrom(`come ti chiami|What is your name? (informal)
come si chiama|What is your name? (formal)
come stai|How are you? (informal)
come sta|How are you? (formal)
come state|How are you all?
come va|How is it going?
di dove sei|Where are you from? (informal)
di dove sei tu|Where are you from? (informal)
di dove è lei|Where are you from? (formal)
di dov'è lei|Where are you from? (formal)
di dove siete|Where are you all from?
da dove vieni|Where do you come from? (informal)
da dove viene lei|Where do you come from? (formal)
da dove venite|Where do you all come from?
dove vivi|Where do you live? (informal)
dove abiti|Where do you live? (informal)
dove vive lei|Where do you live? (formal)
dove abita lei|Where do you live? (formal)
dove sei|Where are you?
quanti anni hai|How old are you? (informal)
quanti anni ha|How old are you? (formal)
non ho capito|I did not understand.
non c'è male|Not bad.
sto proprio male|I feel really bad.
non benissimo|Not very well.
a martedì|See you on Tuesday!
a venerdì|See you on Friday!
ci sono dei libri|There are some books.
posso darle del tu|May I address you informally? (formal)
posso darti del tu|May I address you informally? (informal)
come si dice|How do you say it?
come si scrive|How is it written / spelt?
che cosa significa|What does it mean?
che cosa significa letto|What does letto mean?
sei inglese|You are English.
sei studente|You are a student.
è italiano|He is Italian.
siamo pronti|We are ready.
siete inglesi|You all are English.
sono italiani|They are Italian.
a casa|at home
in italia|in Italy
a napoli|in Naples
di napoli|from Naples
da napoli|from Naples
dall'italia|from Italy
in classe|in class
in giardino|in the garden
in biblioteca|in the library
a scuola|at school
in ritardo|late
al parco|at the park
sul tavolo|on the table
nel cielo|in the sky
paura dei ragni|afraid of spiders
voglia di uscire|feel like going out
la stessa idea|the same idea
un bravo ragazzo|a good boy
una casa grande|a big house
mio amico|my friend
molto alto|very tall
molto simpatico|very nice
pronti per la lezione|ready for the lesson
inglesi o americani|English or American`);

const sentenceMeanings={
 'le città':'the cities',
 'lui / lei è':'He / she / it is.', 'io sono laura':'I am Laura.', 'lei è laura':'She is Laura.',
 'lei si chiama laura':'Her name is Laura.', 'marco ha trent\'anni':'Marco is thirty years old.',
 'lei ha trent\'anni':'She is thirty years old.', 'loro hanno vent\'anni':'They are twenty years old.',
 'voi avete lezione oggi':'Do you all have a lesson today?', 'un anno ha dodici mesi':'A year has twelve months.',
 'vuoi il tè o il caffè':'Do you want tea or coffee?', 'tu quanti anni hai':'How old are you? (informal)',
 'm di milano, i di imola, a di ancona':'Spell MIA: M as in Milano, I as in Imola, A as in Ancona.',
 'a di ancona':'A as in Ancona.', 'elle u ci a':'L, U, C, A: the spelling of LUCA.',
 'quando vieni':'When are you coming?', 'perché vieni':'Why are you coming?', 'chi sei':'Who are you?',
 'come si scrive letto in italiano':'How is letto written / spelt in Italian?',
 'come, scusi? può ripetere, per favore':'Sorry, what did you say? Can you repeat, please? (formal)',
 'a: buongiorno! come si chiama':'A: Good morning! What is your name? (formal)',
 'b: mi chiamo marco. e lei':'B: My name is Marco. And yours? (formal)',
 'a: mi chiamo laura':'A: My name is Laura.', 'b: piacere, laura':'B: Nice to meet you, Laura!',
 'a: ciao! mi chiamo marco. come ti chiami':'A: Hi! My name is Marco. What is your name? (informal)',
 'b: mi chiamo anna. piacere! di dove sei':'B: My name is Anna. Nice to meet you! Where are you from?',
 'a: sono di napoli. e tu':'A: I am from Naples. And you?',
 'b: sono di roma. dove vivi':'B: I am from Rome. Where do you live?',
 'a: vivo a napoli. e tu':'A: I live in Naples. And you?', 'b: abito a roma':'B: I live in Rome.',
 'a: buonasera! mi chiamo marco. come si chiama':'A: Good evening! My name is Marco. What is your name? (formal)',
 'b: mi chiamo anna. piacere! da dove viene':'B: My name is Anna. Nice to meet you! Where do you come from? (formal)',
 'a: vengo da napoli. e lei':'A: I come from Naples. And you? (formal)',
 'b: vengo da roma. dove abita':'B: I come from Rome. Where do you live? (formal)',
 'a: abito a napoli. e lei':'A: I live in Naples. And you? (formal)'
};
Object.assign(phrases,sentenceMeanings);

// Exact expansions: not a general-purpose translator or guessed sound algorithm.
function pronounce(value){
 const s=norm(value).replace(/^[ab]:\s*/, '').replace(/\bdall'/g,'dahl ').replace(/\bdov'è/g,'DOHVEH').replace(/\bl'/g,'l ').replace(/\bun'/g,'un ').replace(/[“”"()]/g,'').replace(/___+/g,' BLANK ');
 const parts=s.split(/[\s,;:!?./]+/).filter(Boolean);if(!parts.length)return '';
 const sounds=parts.map(w=>w==='BLANK'?'[…]':w==='DOHVEH'?'doh-VEH':w==='l'?'l':w==='dahl'?'dahl':lex[w]?.pron);
 return sounds.every(Boolean)?sounds.join(' ').replace('l ','l-').replace('CH EH','CHEH'):'';
}
function nounPhrase(value){const s=norm(value);if(phrases[s])return phrases[s];if(lex[s])return lex[s].en;
 const m=s.match(/^(il|lo|la|i|gli|le|uno|una|un|dei|degli|delle|due|tre|molti)\s+(.+)$/)||s.match(/^(l'|un')\s*(.+)$/);if(m&&lex[m[2]]){const article=['il','lo','la',"l'",'i','gli','le'].includes(m[1])?'the':['un','uno','una',"un'"].includes(m[1])?'a':['dei','degli','delle'].includes(m[1])?'some':lex[m[1]]?.en;return (article==='a'&&/^[aeiou]/i.test(lex[m[2]].en)?'an':article)+' '+lex[m[2]].en;}return '';}
const verbRows={essere:['sono','sei','è','siamo','siete','sono'],avere:['ho','hai','ha','abbiamo','avete','hanno'],venire:['vengo','vieni','viene','veniamo','venite','vengono'],stare:['sto','stai','sta','stiamo','state','stanno'],andare:['vado','vai','va','andiamo','andate','vanno'],vivere:['vivo','vivi','vive','viviamo','vivete','vivono'],abitare:['abito','abiti','abita','abitiamo','abitate','abitano'],chiamarsi:['mi chiamo','ti chiami','si chiama','ci chiamiamo','vi chiamate','si chiamano']};
const subjectNames={io:'I',tu:'You',lei:'She',lui:'He',noi:'We',voi:'You all',loro:'They',esso:'It',essa:'It',essi:'They',esse:'They',roma:'Rome',marco:'Marco',anna:'Anna',luca:'Luca','io e sarah':'Sarah and I','io e paolo':'Paul and I','tu e tom':'You and Tom','tu e io':'You and I','marco e luca':'Marco and Luca','i bambini':'The children','i ragazzi':'The boys','i libri':'The books','le stelle':'The stars','il gatto':'The cat','la mela':'The apple','il caffè':'The coffee','la pizza':'The pizza','mia sorella':'My sister','i miei figli':'My children','un anno':'A year'};
function english(value,formal=false){const s=norm(value).replace(/[“”"]/g,'');if(phrases[s]){let en=phrases[s];if(String(value).trim().endsWith('?'))en=({'You are English.':'Are you English?','You are a student.':'Are you a student?','He is Italian.':'Is he Italian?','We are ready.':'Are we ready?','You all are English.':'Are you all English?'}[en]||en);return en;}
 let subject='',enSubject='',rest=s;
 for(const x of Object.keys(subjectNames).sort((a,b)=>b.length-a.length)){if(s.startsWith(x+' ')){subject=x;enSubject=x==='lei'&&formal?'You':subjectNames[x];rest=s.slice(x.length+1);break;}}
 let negative=false;if(rest.startsWith('non ')){negative=true;rest=rest.slice(4);}
 for(const [verb,forms] of Object.entries(verbRows))for(let i=0;i<forms.length;i++){const form=forms[i];if(rest!==form&&!rest.startsWith(form+' '))continue;
  const tail=rest.slice(form.length).trim();let enTail=nounPhrase(tail),who=enSubject||['I','You',formal?'You':'He/she','We','You all','They'][i];
  const singular=['He','She','It','He/she','Rome','Marco','Anna','Luca','The cat','The apple','The coffee','The pizza','My sister','A year'].includes(who);
  const be=who==='I'?'am':singular?'is':'are';let predicate='';
  if(!enTail&&/^(a|in|da|di) (roma|milano|londra)$/.test(tail)){const [prep,place]=tail.split(' ');enTail=(prep==='da'||prep==='di'?'from ':'in ')+lex[place].en;}
  if(!enTail&&tail.endsWith(' anni')){const n=tail.slice(0,-5);enTail=n.split(' e ').map(x=>lex[x]?.en||'').join(' and ');if(enTail.trim())enTail+=' years old';}
  if(!enTail&&tail==='rossa e dolce')enTail='red and sweet';
  if(verb==='chiamarsi'&&(tail===''||lex[tail]))return who+' '+be+(negative?' not':'')+' called'+(tail?' '+lex[tail].en:'')+'.';
  if(tail&&!enTail)return '';
  if(verb==='essere'||verb==='stare')predicate=be+(negative?' not':'');
  else if(verb==='avere'&&tail==='fame'){predicate=be+(negative?' not':'');enTail='hungry';}
  else if(verb==='avere'&&tail==='sete'){predicate=be+(negative?' not':'');enTail='thirsty';}
  else if(verb==='avere'&&tail==='fretta'){predicate=be+(negative?' not':'');enTail='in a hurry';}
  else if(verb==='avere'&&tail==='ragione'){predicate=be+(negative?' not':'');enTail='right';}
  else if(verb==='avere'&&tail==='paura dei ragni'){predicate=be+(negative?' not':'');enTail='afraid of spiders';}
  else if(verb==='avere'&&tail==='voglia di uscire'){predicate=singular?'feels like':'feel like';enTail='going out';}
  else if(verb==='avere'&&tail==='la febbre'){predicate=singular?'has':'have';enTail='a fever';}
  else if(verb==='avere'&&tail.endsWith(' anni'))predicate=be+(negative?' not':'');
  else {const infinitive={avere:'have',venire:'come',andare:'go',vivere:'live',abitare:'live'}[verb];predicate=negative?(singular?'does not ':'do not ')+infinitive:singular?({have:'has',go:'goes'}[infinitive]||infinitive+'s'):infinitive;if(verb==='andare'&&tail==='a casa')enTail='home';else if(verb==='andare'&&tail.startsWith('a '))enTail='to '+(lex[tail.slice(2)]?.en||'');}
  let result=who+' '+predicate+(enTail?' '+enTail:'')+'.';
  if(String(value).trim().endsWith('?')){if(verb==='essere'||verb==='stare'||verb==='avere'&&['fame','fretta','ragione'].includes(tail))result=be[0].toUpperCase()+be.slice(1)+' '+who.toLowerCase()+(negative?' not':'')+(enTail?' '+enTail:'')+'?';else result=(singular?'Does ':'Do ')+who.toLowerCase()+' '+({avere:'have',venire:'come',andare:'go',vivere:'live',abitare:'live'}[verb]||'')+(enTail?' '+enTail:'')+'?';}return result;
 }
 return nounPhrase(s);
}
function promptItalian(q){const p=text(q.prompt);if(!/_{2,}/.test(p))return '';
 const quoted=p.match(/[“"]([^”"]*_{2,}[^”"]*)[”"]/);let s=(quoted?quoted[1]:p.split(':').at(-1)).trim().replace(/\s*\(formal you\)\.?$/,'').replace(/([.!?])\s*(?:Use|Write)\b[\s\S]*$/i,'$1');
 if(s.includes('___')&&(!/:/.test(p)||s.length<p.length))return s;return '';
}
function modelItalian(q){if(q.type==='match')return q.pairs.map(x=>x.right);if(q.type==='order')return (q.items||[]).map(x=>x.text||x.label||'');const p=q.kind==='sentence'?null:promptItalian(q);return [p?p.replace(/_{2,}/,text(q.model)).replace(/(['’])\s+(?=[a-zàèéìòù])/gi,'$1'):text(q.model)];}
function identifyVerb(q,sheet){const p=text(q.prompt);const own=sheet.slug.replace(/^practice-/, '');if(verbRows[own])return own;for(const v of Object.keys(verbRows)){if(new RegExp('\\b'+v+'\\b').test(p))return v;}if(/essere|negative-homework/.test(sheet.slug))return 'essere';if(/avere|ages-homework/.test(sheet.slug))return 'avere';return '';}
function subject(q){const s=promptItalian(q)||text(q.model),p=text(q.prompt);for(const who of Object.keys(subjectNames).sort((a,b)=>b.length-a.length)){if(norm(s).startsWith(who+' ')||norm(s)===who)return who;}
 const m=p.match(/\band\s+(Io|Tu|Lei|Noi|Voi|Loro)\b/i);return m?m[1].toLowerCase():'';}
function hint(q,sheet,i){const p=text(q.prompt),model=text(q.model),v=identifyVerb(q,sheet),who=subject(q),negative=/negative|negativ|\bnon\b/.test(p)||/^non /.test(model);let en='',it='';
 if(who&&v){let person=(['io','noi','tu e io','io e sarah','io e paolo'].includes(who)?'first':who==='tu'||who==='voi'||who==='tu e tom'?'second':'third');let plural=['noi','voi','loro','essi','esse','tu e io','io e sarah','io e paolo','tu e tom','marco e luca','i bambini','i ragazzi','i libri','le stelle','i miei figli'].includes(who);if(who==='lei')person='third';
  en='“'+who+'” is the subject'+(who==='lei'?' (she, or polite you when the prompt specifies formal address)':'')+'. Use the '+person+'-person '+(plural?'plural':'singular')+' form of '+v+'. '+(negative?'Put non immediately before the verb phrase. ':'')+(q.kind==='sentence'?'Keep the named subject and the full place or description.':q.kind==='phrase'?'Enter the complete missing phrase, not the whole sentence.':'Enter only what replaces the gap.');
  it='Il soggetto è “'+who+'”. Usa la '+({first:'prima',second:'seconda',third:'terza'}[person]||person)+' persona '+(plural?'plurale':'singolare')+' di '+v+'. '+(negative?'Metti non subito prima del gruppo verbale. ':'')+'Scrivi soltanto ciò che richiede la domanda.';
 }
 if(sheet.slug==='l6-number-patterns'){
  const n=(root?.ITALIAN_L6?.numberPracticeValues||[...Array(31).keys(),40,50,60,70,80,90,100,200,1000,10000])[i];
  const clues={0:['It starts with z and has four letters.','Inizia con z e ha quattro lettere.'],1:['It starts with u. This is the number, not a gendered article.','Inizia con u. Qui è un numero, non un articolo.'],2:['Use three letters and pronounce both vowels.','Usa tre lettere e pronuncia entrambe le vocali.'],3:['The number on its own has no written accent.','Il numero da solo non ha accento scritto.'],4:['It starts with qu and has a double t.','Inizia con qu e contiene doppia t.'],5:['It starts with ci and contains qu.','Inizia con ci e contiene qu.'],6:['The spelling is also a present-tense form of essere.','La grafia coincide con una forma del presente di essere.'],7:['Start with se and hold the double t.','Inizia con se e mantieni la doppia t.'],8:['It starts with o and has a double t.','Inizia con o e ha doppia t.'],9:['It starts with no and ends with ve.','Inizia con no e finisce con ve.'],10:['It starts with die and ends with ci.','Inizia con die e finisce con ci.'],11:['Look for the unit-like beginning un- and the ending -dici.','Cerca l’inizio un- e la parte finale -dici.'],12:['It begins do- and ends -dici.','Inizia con do- e finisce con -dici.'],13:['It begins tre- and ends -dici.','Inizia con tre- e finisce con -dici.'],14:['It begins quattor- and ends -dici.','Inizia con quattor- e finisce con -dici.'],15:['It begins quin- and ends -dici.','Inizia con quin- e finisce con -dici.'],16:['It begins se- and ends -dici.','Inizia con se- e finisce con -dici.'],17:['The order changes: dici- comes first. Keep the double s and double t.','L’ordine cambia: dici- va all’inizio. Mantieni doppia s e doppia t.'],18:['Join the ten-like start to otto without an extra a. Keep double t.','Unisci l’inizio a otto senza una a aggiuntiva. Mantieni doppia t.'],19:['It begins dicia- and has a double n before the unit.','Inizia con dicia- e ha doppia n prima dell’unità.'],20:['The tens stem you will use for the next nine numbers ends in i.','La base delle decine per i nove numeri successivi finisce in i.'],30:['It begins tre- and ends -nta.','Inizia con tre- e finisce con -nta.'],40:['Think quar- plus the recurring -anta ending.','Pensa a quar- e alla parte finale -anta.'],50:['Think cinqu- plus -anta.','Pensa a cinqu- e -anta.'],60:['Do not confuse it with seventy. This one has double s.','Non confonderlo con settanta. Qui c’è doppia s.'],70:['Do not confuse it with sixty. This one has double t.','Non confonderlo con sessanta. Qui c’è doppia t.'],80:['Start from ott- and add the tens ending.','Parti da ott- e aggiungi la parte finale delle decine.'],90:['Start from nov- and add the tens ending.','Parti da nov- e aggiungi la parte finale delle decine.'],100:['Use the base repeated in duecento and trecento.','Usa la base ripetuta in duecento e trecento.'],200:['Combine the word for two with the hundred base, as one word.','Unisci la parola per due con la base cento, in una sola parola.'],1000:['Use the singular thousand word. It has double l.','Usa la parola singolare per 1.000, con doppia l.'],10000:['Combine ten with the plural thousand ending -mila.','Unisci dieci alla parte finale plurale -mila.']};
  if(n>20&&n<30){en='Build '+n+' from venti and '+(n-20)+'. '+([21,28].includes(n)?'Drop the final i of venti before uno or otto.':n===23?'Keep the final acute accent: é.':'Keep the final i of venti. Write one word.');it='Forma '+n+' con venti e '+(n-20)+'. '+([21,28].includes(n)?'Togli la i finale di venti prima di uno o otto.':n===23?'Mantieni l’accento acuto finale: é.':'Mantieni la i finale di venti. Scrivi una sola parola.');}else [en,it]=clues[n];
 }
 const nounTokens=norm(p+' '+model).match(/[a-zàèéìòù]+/g)||[],noun=nounTokens.find(w=>nouns[w]);
 if(noun&&(/plural|singular|article|partitive|partitivi|partitives|Correct/.test(p)||/plural|articles|partitives/.test(sheet.slug))){const n=nouns[noun],gender=n.gender==='m'?'masculine':'feminine',reverse=/singular/.test(p)&&!/plural.*singular.*plural/.test(p),some=/some|partitive/.test(p)||/l6-plural-workshop|connected-partitives/.test(sheet.slug);const ending=n.singular.slice(-1),next=n.plural.slice(-1),opening=/^[aeiou]/.test(noun)?'a vowel':/^s[^aeiou]|^z/.test(noun)?'s + consonant or z':'an ordinary consonant';
  en='“'+noun+'” is '+gender+'. '+(some?'You need “some”, not “the”. ':'')+'The noun begins with '+opening+'. '+(/only.*article/.test(p)?'Choose the article; do not rewrite the noun.':reverse?'For one item, restore '+n.singular+' and its singular article.':'Check both the article and the ending'+(ending!==next?': '+ending+' becomes '+next:'. The noun’s spelling stays unchanged')+'.');
  it='“'+noun+'” è '+(n.gender==='m'?'maschile':'femminile')+'. '+(some?'Serve un articolo partitivo. ':'')+'Controlla l’inizio del nome e '+(/only.*article/.test(p)?'scrivi soltanto l’articolo.':'la concordanza tra articolo e nome.');
 }
 if(sheet.slug==='class4-silent-h'){const clues=[['The speaker has hunger. This gap is a verb, not a choice between two drinks.','Chi parla ha fame. Serve un verbo.'],['Tea and coffee are alternatives. The gap joins the choices; it does not express possession.','Tè e caffè sono alternative. Serve la congiunzione.'],['Lei is the subject and un figlio is what she has. You need a verb.','Lei è il soggetto e un figlio è ciò che ha. Serve un verbo.'],['Vado already supplies the verb. The gap introduces Roma as the destination.','Vado è già il verbo. Lo spazio introduce Roma come destinazione.'],['Loro is plural and Italian uses avere for age. The silent h belongs to the verb.','Loro è plurale e per l’età si usa avere. Il verbo ha l’h muta.'],['Un introduces a noun, and twelve months make a year. You do not need another verb.','Un introduce un nome e dodici mesi formano un anno. Non serve un altro verbo.']];[en,it]=clues[i];}
 if(sheet.slug==='l6-intonation'){en=i<2?'Follow the end of this curve, not its highest point: rising at the end signals a question in this exercise; falling signals a statement.':'Keep the supplied Italian words in their order. To turn this statement into a written question, change the final punctuation and read the ending with rising intonation.';it=i<2?'Osserva la fine della curva: se sale indica una domanda in questo esercizio; se scende indica un’affermazione.':'Mantieni le parole italiane nello stesso ordine. Cambia la punteggiatura finale e leggi con intonazione interrogativa.';}
 if(sheet.slug==='class3-complete-replies'){const verb=text(q.prompt).match(/using\s+(essere|venire|vivere|abitare)/i)?.[1]||'';en=verb==='essere'?'Use io with essere. Origin uses di + the supplied city, unlike current location.':verb==='venire'?'Use io with venire. The source uses da; with l’Italia, da joins the article as dall’.':/vivere|abitare/.test(verb)?'Use io with '+verb+'. Residence uses a before Napoli and in before Italia. The question needs dove without di or da.':['Sono expresses origin here: choose the preposition that belongs to essere di, not venire da.','Vengo expresses coming from a source: choose the preposition that belongs to venire da.','Vivo describes residence, and Italia is a country. Compare in Italia with a Napoli.','Abito describes residence, and Napoli is a city. Compare a Napoli with in Italia.'][i-6];it='Usa il soggetto richiesto e una risposta completa: essere di, venire da, vivere o abitare a/in. Mantieni il luogo indicato.';}
 if(sheet.slug==='class1-introductions'&&i>=6&&q.type!=='order'){const formal=i===8;en=i===6?'The speaker introduces their own name. Use the io reflexive pronoun with chiamarsi, then Marco.':'Ask for a name, not an origin. Begin with Come and choose the '+(formal?'formal Lei':'informal tu')+' reflexive pronoun and chiamarsi form.';it=i===6?'Chi parla presenta il proprio nome. Usa il pronome riflessivo di io con chiamarsi, poi Marco.':'Chiedi il nome, non la provenienza. Inizia con Come e scegli pronome riflessivo e forma di chiamarsi per '+(formal?'Lei':'tu')+'.';}
 if(sheet.slug==='class1-greetings'){const clues=['This is a friend, so use the short informal greeting, not the morning/evening formula.','The clue is morning. Choose the greeting built around giorno, not sera.','The clue is evening. Choose the greeting built around sera, not giorno.','You are meeting someone for the first time. Use the phrase meaning it is a pleasure.','This responds to help or a kindness, rather than starting or ending a conversation.'];en=clues[i];it=['È un amico: usa il saluto breve e informale.','È mattina: pensa a giorno, non a sera.','È sera: pensa al saluto per la sera.','È il primo incontro: esprimi il piacere di conoscere qualcuno.','Rispondi a un aiuto o a una gentilezza, non saluti.'][i];}
 if(q.type==='match'){const left=q.pairs.map(p=>p.left).join('; ');en='Start with '+q.pairs[0].left+'. '+(v?'Identify the person and use only phrases with '+v+'.':'Compare the meaning and whether each item is singular or plural.')+' Then match the other rows; the two unused choices belong to a different meaning or form.';it='Inizia da '+q.pairs[0].left+'. Confronta significato, persona e numero in ogni riga. Due opzioni non si usano.';}
 if(q.type==='order'){en=/dialogue/.test(p)?'Begin with a greeting or introduction, then place each question before its reply. Keep the formal or informal register consistent.':'Find the subject first, then its verb, then the remaining phrase. Keep the negative word before the verb.';it=/dialogue/.test(p)?'Inizia con un saluto o una presentazione. Metti ogni domanda prima della risposta e mantieni lo stesso registro.':'Trova prima il soggetto, poi il verbo e il resto della frase. La negazione va prima del verbo.';}

 if(sheet.slug==='class2-alphabet'){const l=p.match(/for ([A-Z])\b/)?.[1];en=l?'Give the Italian letter name for '+l+', not an English letter sound. '+(['H','L','M','N','R','S'].includes(l)?'This letter name contains a doubled consonant.':'Use the letter name from the alphabet chart.'):'Write the four Italian letter names for L, U, C and A in that order, separated by spaces.';it=l?'Scrivi il nome italiano della lettera '+l+', non il suono inglese.':'Scrivi in ordine i nomi italiani di L, U, C e A, separati da spazi.';}
 if(/^class2-[cg]-sounds$/.test(sheet.slug)&&q.type!=='match'){const letter=sheet.slug.includes('-c-')?'C':'G',w=modelItalian(q)[0],hard=/[cg]h[ei]/i.test(w),soft=/^[cg][ei]/i.test(w);en='In “'+p.match(/meaning\s+([^:]+)/)?.[1]+'”, check the vowel after '+letter+'. '+(hard?'An H before E or I keeps the consonant hard.':soft?'Before E or I, this consonant is soft; do not add H.':'Before A, O or U the consonant is hard without H.')+' Type only the missing letters.';it='Controlla la vocale dopo '+letter+'. '+(hard?'H prima di E o I mantiene il suono duro.':soft?'Davanti a E o I il suono è dolce: non aggiungere H.':'Davanti ad A, O o U il suono è duro senza H.')+' Scrivi solo le lettere mancanti.';}
 if(sheet.slug==='class3-countries'){const parts=p.split(':').at(-1);en='Join '+parts+' in the given order as one country name. Keep any double consonants in the supplied syllables.';it='Unisci '+parts+' nell’ordine indicato, formando un solo nome di paese. Mantieni le consonanti doppie.';}
 if(sheet.slug==='class3-nationality'&&q.type!=='match'){en=i<2?'The speaker is '+(i===0?'Marco, one male person':'Anna, one female person')+'. Keep sono and change the nationality ending to agree with that speaker.':i<4?'Inglese has the same singular ending for a male or female speaker. Do not change it to -o or -a.':'Siamo means we are. Use a plural nationality ending: '+(i===4?'masculine for the specified mixed or male group.':'feminine for the specified all-female group.');it=i<2?'Il soggetto è '+(i===0?'Marco':'Anna')+': concorda l’aggettivo con la persona.':i<4?'Inglese ha la stessa forma singolare al maschile e al femminile.':'Siamo indica noi: usa la desinenza plurale adatta al gruppo.';}
 if(sheet.slug==='class1-register'){const informal=[1,3,4].includes(i);en='You are speaking to '+(informal?'a friend with tu':'one person politely with Lei')+'. '+(i<4?'For a name question, compare ti chiami with si chiama.':'For a wellbeing question, compare the tu and Lei forms of stare.');it='Ti rivolgi '+(informal?'a un amico con tu':'a una persona con il Lei formale')+'. '+(i<4?'Confronta ti chiami e si chiama.':'Confronta le forme di stare per tu e Lei.');}
 if(sheet.slug==='class4-family'&&q.type!=='match'){en='The subject is io, so keep the first-person form of avere. '+(i===1?'Use the singular article and noun for one brother.':i===2?'After due, use the plural noun for brothers.':'Place non before the verb, then use the plural noun for children.');it='Il soggetto è io: usa la prima persona di avere. '+(i===1?'Per un fratello usa articolo e nome singolari.':i===2?'Dopo due usa il nome plurale.':'Metti non prima del verbo e usa il nome plurale per figli.');}
 if(sheet.slug==='practice-things-pronouns'){const row=Math.floor(i/4),number=row<2?'singular':'plural',gender=row%2?'feminine':'masculine';en='The noun in this question is '+gender+' '+number+'. '+(i%4===1?'Use the same essere form as third-person '+number+'. Gender does not change the verb.':'Choose the traditional subject pronoun that agrees with both gender and number, then keep the remaining sentence.');it='Il nome è '+(row%2?'femminile':'maschile')+' '+(row<2?'singolare':'plurale')+'. '+(i%4===1?'Usa la terza persona di essere. Il genere non cambia il verbo.':'Il pronome concorda in genere e numero.');}
 if(sheet.slug==='l6-essere-matching'){const labels=['the speaker alone: io','one person addressed informally: tu','one person or thing: third-person singular','the speaker together with others: noi','several people being addressed: voi','several people being spoken about: loro'];en='“'+p.replace(/^.*for /,'').replace(/\.$/,'')+'” refers to '+labels[i]+'. Match the pronoun first, then use its essere form.';it='Prima scegli il pronome per il significato richiesto, poi la forma corrispondente di essere. '+['Io: chi parla.','Tu: una persona a cui parli.','Terza persona singolare: una persona o cosa.','Noi: chi parla insieme ad altri.','Voi: più persone a cui parli.','Loro: più persone di cui parli.'][i];}
 if(!en){const original=String(q.hint||'');if(!/Use the form or phrase shown|Match the subject before|Identify who or what|Check subject|Use the present form/.test(text(original))){return {en:'',it:'',html:original};}en='For this question, focus on '+(p.match(/“([^”]+)”|"([^"]+)"|\bUse\s+(\w+)/)?.slice(1).find(Boolean)||'the exact word or phrase requested')+'. '+(/\bformal\b/.test(p)?'A formal question to one person uses the Lei form, while the person replying uses io.':'Use the meaning in the prompt to choose the subject and the appropriate form.');it='Concentrati sulla parola o frase richiesta in questa domanda. Controlla il soggetto e il significato prima di scegliere la forma.';}
 return {en,it,html:''};
}
function describe(q,sheet,i){if(q.support)return q.support;const formal=/formal/.test(text(q.prompt))&&!/informal/.test(text(q.prompt))||sheet.slug.startsWith('practice-')&&/^lei\b/.test(norm(promptItalian(q)||q.model));const italian=modelItalian(q);const supplied=String(q.prompt).match(/<small class="l6-gloss">([\s\S]*?)<\/small>/)?.[1];const lines=italian.map((it,n)=>({it,en:q.type==='match'?q.pairs[n].left:supplied?text(supplied):sheet.slug==='l6-number-patterns'?numberEnglish[i]:english(it,formal),pron:pronounce(it)}));
 if(sheet.slug==='class2-alphabet'){const letter=text(q.prompt).match(/for ([A-Z])\b/)?.[1];if(letter)lines[0].en='The Italian name for the letter '+letter+'.';}
 if(sheet.slug==='c-g-sounds-and-spelling'&&i===8)lines[0].pron='EHM-meh dee mee-LAH-noh, ee dee EE-moh-lah, ah dee ahn-KOH-nah';let prompt=q.kind==='sentence'?null:promptItalian(q);
 if(!prompt&&/Give the complete/.test(text(q.prompt)))prompt=text(String(q.prompt).match(/<span lang="it">([\s\S]*?)<\/span>/)?.[1]||'');
 return {hint:hint(q,sheet,i),prompt:prompt?{it:prompt,en:supplied?text(supplied):english(prompt.replace(/_{2,}/,text(q.model)),formal),pron:pronounce(prompt)}:null,lines,source:supplied?'worksheet':'added study support',pronunciationStatus:'Approximate English-friendly guide; added study support, not IPA or tutor audio'};}
const api={describe,english,pronounce,modelItalian,version:'study-support-20261111',lexicon:lex};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(!root)return;
root.ItalianStudySupport=api;
const pair=(en,it)=>root.ItalianPracticeBank.pair(en,it),host=document.getElementById('studySheets');
function lineMarkup(x,showItalian){return '<div class="question-language-line" data-ui-no-translate>'+ (showItalian?'<p class="question-support-italian" lang="it">'+escape(x.it)+'</p>':'')+(x.pron?'<p class="question-support-pron" lang="en">'+escape(x.pron)+'</p>':'')+(x.en?'<p class="question-support-english" lang="en">'+escape(x.en)+'</p>':'')+'</div>';}
function mount(){const article=host?.querySelector('.study-pack-sheet');if(!article||!root.ItalianStudyData)return;
 const sheet=root.ItalianStudyData.find(s=>s.slug===article.id);if(!sheet)return;
 article.querySelectorAll('.quiz-question').forEach((el,i)=>{if(el.dataset.languageSupport)return;const q=sheet.questions[i];if(!q)return;const d=describe(q,sheet,i);el.dataset.languageSupport='ready';
  const tip=el.querySelector('.hint');if(tip&&(d.hint.en||d.hint.html))tip.innerHTML=d.hint.html||pair(d.hint.en,d.hint.it);
  if(d.prompt&&(d.prompt.en||d.prompt.pron)){
   // Existing worksheet gloss is already visible in the prompt. Do not duplicate it.
   const view={...d.prompt,en:el.querySelector('.l6-gloss')?'':d.prompt.en};
   if(view.en||view.pron){const support=document.createElement('div');support.className='question-prompt-support';support.innerHTML=lineMarkup(view,false);el.querySelector('.question-heading')?.after(support);}
  }
  const usable=d.lines.filter(x=>x.en||x.pron);if(usable.length){const answer=el.querySelector('.model-answer');const block=document.createElement('div');block.className='question-answer-support';block.innerHTML=usable.map(x=>lineMarkup(x,q.type==='match'||q.type==='order'||norm(x.it)!==norm(q.model))).join('')+'<small class="question-pron-note">'+pair('Pronunciation is approximate. Capitals mark stress.','La pronuncia è approssimativa. Le maiuscole indicano l’accento.')+'</small>';answer?.append(block);}
 });}
api.refreshQuestion=()=>{};
if(host)new MutationObserver(mount).observe(host,{childList:true,subtree:true});mount();
})(typeof window!=='undefined'?window:null);
