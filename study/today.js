/* Today is an accessible shell around the existing Focus and Practice experiences.
 * Their individual storage keys, canonical IDs and Anki data are unchanged. */
export function mountPractice(main, signal) {
  const panel=main.querySelector('#todayPanel');
  const buttons=[...main.querySelectorAll('[data-today-tab]')];
  const ROOT=new URL('../',import.meta.url);
  const templates=new Map();
  const modules=new Map();
  let activeTab='',innerAbort=null,request=0;
  const selected=()=>{
    const value=new URL(location.href).searchParams.get('tab');
    return value==='practice'?'practice':'focus';
  };
  function tabButton(tab){return buttons.find(btn=>btn.dataset.todayTab===tab);}
  function tabUrl(tab){
    const url=new URL(location.href);
    url.searchParams.set('page','today');
    if(tab==='practice')url.searchParams.set('tab','practice');else url.searchParams.delete('tab');
    return url.pathname+url.search+url.hash;
  }
  async function resource(tab){
    if(!templates.has(tab)){
      const page=tab==='focus'?'daily-focus':'daily-practice';
      const response=await fetch(new URL('study/'+page+'.html',ROOT));
      if(!response.ok)throw Error('Cannot load this practice view.');
      const doc=new DOMParser().parseFromString(await response.text(),'text/html');
      const node=doc.querySelector('main.course-practice');
      if(!node)throw Error('The practice view is missing.');
      templates.set(tab,node);
    }
    if(!modules.has(tab)){
      const page=tab==='focus'?'daily-focus':'daily-practice';
      modules.set(tab,import(new URL('study/'+page+'.js?v=20261126references1',ROOT).href));
    }
    return {node:document.importNode(templates.get(tab),true),module:await modules.get(tab)};
  }
  function paint(tab){
    for(const button of buttons){
      const on=button.dataset.todayTab===tab;
      button.setAttribute('aria-selected',String(on));
      button.tabIndex=on?0:-1;
    }
    panel.setAttribute('aria-labelledby',tabButton(tab).id);
  }
  async function show(tab,push=true){
    if(signal.aborted)return;
    if(tab!== 'focus' && tab!=='practice')tab='focus';
    if(activeTab===tab)return;
    if(innerAbort)innerAbort.abort(); // Focus autosaves unfinished work on abort.
    innerAbort=new AbortController();
    const current=++request;activeTab=tab;paint(tab);
    panel.setAttribute('aria-busy','true');
    panel.innerHTML='<p role="status">Loading practice...</p>';
    if(push)history.pushState({},'',tabUrl(tab));
    try{
      const {node,module}=await resource(tab);
      if(signal.aborted || innerAbort.signal.aborted || current!==request)return;
      // Replace only the activity, never the Today header or the tab navigation.
      const body=document.createElement('div');
      body.className=node.className;
      body.lang=node.lang;
      if(node.hasAttribute('data-ui-no-translate'))body.setAttribute('data-ui-no-translate','');
      body.innerHTML=node.innerHTML;
      panel.replaceChildren(body);
      panel.removeAttribute('aria-busy');
      const result=module.mountPractice(body,innerAbort.signal);
      if(result?.then)await result;
      if(signal.aborted || innerAbort.signal.aborted)return;
      window.ItalianUI?.refresh();
    }catch(error){
      if(signal.aborted || innerAbort.signal.aborted)return;
      panel.removeAttribute('aria-busy');
      console.error('Today tab failed',error);
      const message=document.createElement('p');message.textContent='This practice view could not be opened. Your saved work is unchanged.';
      const retry=document.createElement('button');retry.textContent='Try again';retry.type='button';
      retry.addEventListener('click',()=>{activeTab='';show(tab,false);},{once:true});
      panel.replaceChildren(message,retry);
    }
  }
  main.addEventListener('click',event=>{
    const button=event.target.closest('[data-today-tab]');
    if(!button)return;
    show(button.dataset.todayTab,true);
  },{signal});
  main.addEventListener('keydown',event=>{
    const current=event.target.closest('[data-today-tab]');
    if(!current || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?'focus':event.key==='End'?'practice':current.dataset.todayTab==='focus'?'practice':'focus';
    tabButton(next)?.focus({preventScroll:true});
    show(next,true);
  },{signal});
  window.addEventListener('popstate',()=>show(selected(),false),{signal});
  signal.addEventListener('abort',()=>{++request;innerAbort?.abort();},{once:true});
  show(selected(),false);
}