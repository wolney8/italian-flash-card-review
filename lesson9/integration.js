/* Additive Lesson 9 card registration. Do not alter the protected course loader.
   The web set is the exact canonical Lesson 9 card set proposed for Anki. */
(function(root){
 'use strict';
 let applied=false;
 function install(){
   if(applied || !root.__COURSE_DATA_READY__ || !root.ItalianLesson9?.cards?.length) return;
   if(typeof cards==='undefined'||!Array.isArray(cards))return;
   const extras=root.ItalianLesson9.cards;
   const ids=new Set(cards.map(card=>card.key));
   for(const card of extras){
     if(!card.key||card.lesson!=='L9'||ids.has(card.key))throw Error('Duplicate or invalid Lesson 9 flashcard identity: '+card.key);
     ids.add(card.key);
   }
   cards=cards.concat(extras);
   applied=true;
   root.__LESSON9_READY__=true;
   if(root.__COURSE_DATA_REPORT__){
     root.__COURSE_DATA_REPORT__.cards=cards.length;
     root.__COURSE_DATA_REPORT__.lessons=new Set(cards.filter(card=>/^L\d+$/.test(card.lesson)).map(card=>card.lesson)).size;
     root.__COURSE_DATA_REPORT__.subdecks=new Set(cards.map(card=>card.lesson+'::'+card.deck)).size;
   }
   if(typeof renderNavigation==='function')renderNavigation();
   if(typeof renderView==='function')renderView();
   root.dispatchEvent(new CustomEvent('italian-course-data-ready',{detail:{...root.__COURSE_DATA_REPORT__,lesson9Cards:extras.length}}));
 }
 root.addEventListener('italian-course-data-ready',install);
 if(root.__COURSE_DATA_READY__)install();
})(window);