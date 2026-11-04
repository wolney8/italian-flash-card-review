/* Shared header and breadcrumbs for the guided course and individual study sheets. */
(function(root){
'use strict';
const escapeHtml=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function pair(it,en,italianFirst){
 const first=italianFirst?it:en,second=italianFirst?en:it;
 return '<span class="editorial-label"><span class="editorial-label-main" lang="'+(italianFirst?'it':'en')+'">'+escapeHtml(first)+'</span><span class="editorial-label-sub" lang="'+(italianFirst?'en':'it')+'">'+escapeHtml(second)+'</span></span>';
}
function header(o={}){
 const study=o.context==='study',base=study?'../':'';
 const href=key=>study&&key==='topics'?'study-sheets.html?mode='+(o.mode==='review'?'review':'learn'):base+'?page='+key;
 const active=o.current==='card'?'lessons':o.current||'home';
 const items=[['home','Inizio','Home'],['lessons','Lezioni','Lessons'],['topics','Schede di studio','Study sheets']];
 const nav=items.map(([key,it,en])=>'<a href="'+href(key)+'" data-guide-to="'+key+'"'+(active===key?' aria-current="page"':'')+'>'+pair(it,en,!!o.italianFirst)+'</a>').join('');
 const comment='<button type="button" class="course-site-comment" data-guide-comment data-study-editorial-comment>'+pair('Commenti','Comments',!!o.italianFirst)+'</button>';
 const order='<button type="button" class="course-site-language" data-guide-label-order data-study-editorial-language title="Switch label order" aria-label="Use '+(o.italianFirst?'English':'Italian')+' labels first"><span aria-hidden="true">⇄</span><span>'+(o.italianFirst?'IT · EN':'EN · IT')+'</span></button>';
 const theme='<button type="button" class="course-site-theme" data-guide-theme data-study-editorial-theme title="Change colour theme" aria-label="Switch to '+(o.dark?'light':'dark')+' mode"><span aria-hidden="true">'+(o.dark?'☀':'☾')+'</span><span>'+(o.dark?'Light':'Dark')+'</span></button>';
 const menu='<button type="button" class="course-site-menu" data-guide-menu data-study-editorial-menu aria-controls="courseSiteNavigation" aria-expanded="'+!!o.menuOpen+'"><span aria-hidden="true">☰</span><span>Menu</span></button>';
 return '<header class="course-site-header"><a class="course-site-brand" href="'+href('home')+'" data-guide-to="home"><span class="course-site-brandmark" aria-hidden="true">it.</span><span class="course-site-brand-copy"><strong>Italian for Beginners</strong><small>BSE Course · Beginners · Semester 1</small></span></a><nav id="courseSiteNavigation" class="course-site-navigation'+(o.menuOpen?' is-open':'')+'" aria-label="Main navigation">'+nav+comment+'</nav><div class="course-site-tools">'+order+theme+menu+'</div></header>';
}
function breadcrumb(o={}){
 const segments=Array.isArray(o.segments)?o.segments:[];
 return '<nav class="course-site-breadcrumb" aria-label="Breadcrumb"><a href="'+escapeHtml(o.homeHref||'?page=home')+'"'+(o.homeRoute?' data-guide-to="home"':'')+'>Home</a>'+
 segments.map(s=>'<span class="course-site-breadcrumb-separator" aria-hidden="true">›</span>'+(s.href?'<a href="'+escapeHtml(s.href)+'"'+(s.route?' data-guide-to="'+escapeHtml(s.route)+'"':'')+'>'+escapeHtml(s.label)+'</a>':'<span aria-current="page">'+escapeHtml(s.label)+'</span>')).join('')+'</nav>';
}
const api=Object.freeze({header,breadcrumb});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.ItalianCourseChrome=api;
})(typeof window!=='undefined'?window:undefined);
