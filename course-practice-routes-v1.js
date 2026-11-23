/* The guided course owns navigation and theme. Practice activities supply the main content. */
(function () {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const pages = new Map([
    ['daily-practice','Daily practice'],
    ['visual-exercises','Visual exercises'],
    ['jobs-in-photos','Jobs in photographs']
  ]);
  const current = new URL(location.href);
  const alias = [...pages.keys()].find(page => {
    const path = new URL('study/'+page,base).pathname;
    return current.pathname === path || current.pathname === path+'.html' || current.pathname === path+'/';
  });
  if (alias) {
    const page = current.searchParams.get('page') || alias;
    const url = new URL(base);
    url.search = current.search;
    url.searchParams.set('page',page);
    if (page !== 'visual-exercises') {
      url.searchParams.delete('activity');
      url.searchParams.delete('round');
    }
    if (!pages.has(page)) url.searchParams.delete('sheetReturn');
    url.hash = current.hash;
    location.replace(url.href);
    return;
  }

  const templates = new Map();
  let controller;
  function unmount() {
    if (controller) controller.abort();
    controller = null;
  }
  function returnLink(main) {
    const link=main.querySelector('[data-back-to-sheet]');
    const value=new URL(location.href).searchParams.get('sheetReturn');
    if (!link || !value) return;
    let destination;
    try { destination=new URL(value,base); } catch { return; }
    const path=new URL('study/study-sheets',base).pathname;
    if (destination.origin !== base.origin || ![path,path+'.html'].includes(destination.pathname)) return;
    link.href=destination.href;
    link.textContent='Back to your study sheet';
    link.hidden=false;
  }
  async function template(page) {
    if (!templates.has(page)) {
      const response=await fetch(new URL('study/'+page+'.html',base));
      if (!response.ok) throw Error('Could not load practice page');
      const doc=new DOMParser().parseFromString(await response.text(),'text/html');
      const main=doc.querySelector('main.course-practice');
      if (!main) throw Error('Missing practice content');
      templates.set(page,main);
    }
    return document.importNode(templates.get(page),true);
  }
  async function mount(host,page,breadcrumb) {
    unmount();
    controller=new AbortController();
    const {signal}=controller;
    host.setAttribute('aria-busy','true');
    try {
      const [main,module]=await Promise.all([template(page),import(new URL('study/'+page+'.js?v=practice-routes-1',base).href)]);
      if (signal.aborted || !host.isConnected) return;
      main.insertAdjacentHTML('afterbegin',breadcrumb);
      returnLink(main);
      host.replaceChildren(main);
      module.mountPractice(main,signal);
      host.removeAttribute('aria-busy');
      window.ItalianUI?.refresh();
    } catch (error) {
      if (signal.aborted || !host.isConnected) return;
      console.error('Could not open practice activity',error);
      host.removeAttribute('aria-busy');
      const message=document.createElement('p');
      message.textContent='This exercise could not be loaded.';
      const retry=document.createElement('button');
      retry.type='button'; retry.textContent='Try again';
      retry.addEventListener('click',() => mount(host,page,breadcrumb),{once:true});
      host.replaceChildren(message,retry);
    }
  }
  window.ItalianPracticeRoutes={has:page=>pages.has(page),title:page=>pages.get(page),mount,unmount};
})();
