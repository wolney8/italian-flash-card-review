/* Render recall directions without changing the records shared with Anki. */
(function (root) {
  'use strict';

  function escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[char]);
  }

  function render(card) {
    const exercise = root.ItalianLesson8CardTasks?.get(card.key) || root.ItalianEarlyCardTasks?.get(card);
    if (!exercise) {
      return (card.prompt || '')
        .replace(/<(div|p) class="instruction">/g, '<$1 class="instruction" lang="en" data-ui-no-translate>')
        .replace(/(^|>)([^<]+)/g, (_, start, text) =>
          start + text.replace(/\s*(?:\u2014|&mdash;|&#8212;|&#x2014;)\s*/gi, ' · '));
    }
    const cues = exercise.stimulus.map(row => {
      const label = row.label ? '<span class="recall-cue-label" lang="en">' + escape(row.label) + '</span>' : '';
      return '<div class="recall-cue">' + label +
        '<span lang="' + (row.lang === 'it' ? 'it' : 'en') + '">' + escape(row.text) + '</span></div>';
    }).join('');
    return '<div class="recall-exercise" data-ui-no-translate>' +
      '<p class="instruction" lang="en">' + escape(exercise.task) + '</p>' +
      (cues ? '<div class="recall-cues">' + cues + '</div>' : '') + '</div>';
  }

  root.ItalianCardFront = {render};
})(window);
