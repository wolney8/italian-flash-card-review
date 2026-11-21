/* The website and Anki builder share the plain-text records in cards.json. */
(function (root) {
  'use strict';
  const lesson = {
    id: 'L8', date: '2026-11-17',
    title: 'Grammar, pronunciation and articles', it: 'Grammatica, pronuncia e articoli',
    description: 'Lesson 8 grammar in context, with extra pronunciation and article practice.',
    topics: ['l8-grammar', 'l8-sounds', 'l8-articles'], extra: []
  };
  const topics = [
    {key:'grammar', id:'l8-grammar', title:'Grammar in context', it:'La grammatica nel contesto', deck:'01 Grammar in context', category:'grammar', slug:'l8-grammar-in-context'},
    {key:'sounds', id:'l8-sounds', title:'Pronunciation practice', it:'Esercizi di pronuncia', deck:'02 Pronunciation practice', category:'sounds', slug:'l8-pronunciation-practice'},
    {key:'articles', id:'l8-articles', title:'Articles in context', it:'Gli articoli nel contesto', deck:'03 Articles in context', category:'grammar', slug:'l8-articles-in-context'}
  ];
  const escape = value => String(value || '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[c]);
  const bilingual = (en, it) => '<span class="editorial-label"><span class="editorial-label-main" lang="en">' +
    escape(en) + '</span><span class="editorial-label-sub" lang="it">' + escape(it) + '</span></span>';
  const assetBase = new URL('.', document.currentScript.src);

  function soundButton(word) {
    if (!word) return '';
    return '<button type="button" class="l8-listen" data-l8-speak="' + escape(word) + '"' +
      '>' +
      bilingual('Hear it in Italian', 'Ascolta in italiano') + '</button><small class="l8-audio-status" role="status"></small>';
  }

  function renderCard(row) {
    const topic = topics.find(item => item.key === row.topic);
    if (!topic || !row.key || !row.front || !row.answer) throw new Error('Invalid Lesson 8 card: ' + row.key);
    const pronunciation = [row.pron, row.ipa].filter(Boolean).map(escape).join(' · ');
    const listen = row.topic === 'sounds' ? soundButton(row.spoken || row.answer) : '';
    return {
      key: row.key, lesson: lesson.id, deck: topic.deck,
      panel: '<div class="panel-head"><span class="panel-badge">L8</span><div class="panel-copy"><div class="panel-title">' + escape(topic.title) + '</div></div></div>',
      prompt: '<div class="focus">' + escape(row.front) + '</div>', answer: escape(row.answer),
      pron: pronunciation + (listen ? '<div>' + listen + '</div>' : ''),
      meaning: escape(row.english), pattern: escape(row.notes), literal: '', usage: '', clarification: '',
      reference: topic.key === 'grammar' ? 'Lesson 8, 17 November 2026 · Additional grammar practice' : 'Lesson 8 supplement · Extra practice'
    };
  }

  async function loadCards() {
    const response = await fetch(new URL('cards.json?v=20261121', assetBase));
    if (!response.ok) throw new Error('Could not load Lesson 8 flashcards (' + response.status + ').');
    return (await response.json()).map(renderCard);
  }

  let activeSpeech;
  function stopSound() {
    if (activeSpeech) { root.speechSynthesis.cancel(); activeSpeech = null; }
  }
  if (root.speechSynthesis) root.speechSynthesis.getVoices();
  function playbackUnavailable(status) {
    status.innerHTML = bilingual('No Italian voice is available on this device. Use the written pronunciation guide.',
      'Questo dispositivo non ha una voce italiana disponibile. Usa la guida alla pronuncia.');
  }
  function deviceVoice(word, status) {
    if (!root.speechSynthesis || !root.SpeechSynthesisUtterance) {
      playbackUnavailable(status);
      return;
    }
    const speech = new root.SpeechSynthesisUtterance(word);
    speech.lang = 'it-IT';
    const italian = root.speechSynthesis.getVoices().find(voice => /^it(?:[-_]|$)/i.test(voice.lang));
    if (!italian) { playbackUnavailable(status); return; }
    speech.voice = italian;
    speech.rate = 0.85;
    speech.onerror = event => {
      if (activeSpeech === speech && event.error !== 'interrupted' && event.error !== 'canceled') {
        playbackUnavailable(status);
      }
    };
    activeSpeech = speech;
    root.speechSynthesis.speak(speech);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-l8-speak]');
    if (!button) return;
    stopSound();
    const status = button.nextElementSibling;
    status.textContent = '';
    const word = button.dataset.l8Speak;
    deviceVoice(word, status);
  });
  root.addEventListener('pagehide', stopSound);
  root.ItalianLesson8 = {lesson, topics, escape, bilingual, soundButton, loadCards, renderCard};
})(window);
