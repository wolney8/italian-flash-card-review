/* Shared, present-first reference view. Forms and examples come from the
   canonical verb catalogue; this renderer does not infer another tense. */
(function(root) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const lines = value => esc(value).replace(/\n/g, '<br>');
  const people = [
    ['io', 'I'],
    ['tu', 'you, one person informally'],
    ['lui / lei / Lei', 'he / she / you politely'],
    ['noi', 'we'],
    ['voi', 'you, more than one person'],
    ['loro', 'they']
  ];

  function present(verb) {
    return verb.tenses?.presente || {label:'Present indicative', regularity:verb.kind, forms:verb.forms};
  }

  function familyLabel(verb) {
    return root.ItalianDailyVerbs.courseGroups?.[verb.courseGroup] || (verb.family ? '-' + verb.family.toUpperCase() : '');
  }

  function patternLabel(verb) {
    return present(verb).regularity === 'regular' ? 'Regular in the present' : 'Irregular in the present';
  }

  const patternNotes = {
    are:'Regular -ARE endings: -o, -i, -a, -iamo, -ate, -ano.',
    ere:'Regular -ERE endings: -o, -i, -e, -iamo, -ete, -ono.',
    ire:'Regular -IRE endings: -o, -i, -e, -iamo, -ite, -ono.',
    'ire-isc':'Add -isc- with io, tu, lui/lei/Lei and loro. Noi and voi use the short stem.',
    irregular:'Learn each whole present form with its subject.'
  };

  function sourceLabel(source) {
    if (source?.kind === 'laura') {
      return ['Laura’s example', source.file, source.location].filter(Boolean).join(' · ');
    }
    return 'Added practice' + (source?.label && source.label !== 'Added practice' ? ' · ' + source.label : '');
  }

  function examples(verb) {
    const uses = verb.uses?.length ? verb.uses : [{category:'Example',italian:verb.example,english:verb.translation,source:{kind:'supplementary'}}];
    const groups = new Map();
    for (const use of uses) {
      const category = use.category || 'Example';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(use);
    }
    return [...groups].map(([category, entries]) => '<section class="verb-use-group"><h5>' + esc(category) + '</h5>' + entries.map(use =>
      '<div class="verb-use"><p class="verb-use-italian" lang="it">' + lines(use.italian) + '</p><p lang="en-GB">' + lines(use.english) + '</p>' +
      (use.note ? '<p class="verb-use-note">' + lines(use.note) + '</p>' : '') +
      '<p class="verb-example-source">' + esc(sourceLabel(use.source)) + '</p></div>'
    ).join('') + '</section>').join('');
  }

  function render(verb) {
    const tense = present(verb);
    const hasEndings = tense.regularity === 'regular' && verb.parts?.length === 6;
    const hasSounds = verb.sounds?.length === 6;
    const sourcePending = verb.sourceStatus === 'learner-report-pending-source';
    const row = (person, index) => '<tr><th scope="row"><span lang="it">' + esc(person[0]) + '</span><span class="verb-person-gloss">' + esc(person[1]) + '</span></th>' +
      '<td><span class="verb-written-form" lang="it">' + esc(tense.forms[index]) + '</span>' +
      (hasSounds ? '<span class="verb-reading-guide">Say: ' + esc(verb.sounds[index]) + '</span>' : '') + '</td>' +
      (hasEndings ? '<td lang="it">-' + esc(verb.parts[index].ending) + '</td>' : '') + '</tr>';
    const meta = [tense.label, patternLabel(verb), familyLabel(verb)].filter(Boolean).join(' · ');
    return '<section class="verb-reference-card" lang="en-GB" data-ui-no-translate aria-label="Forms and uses of ' + esc(verb.name) + '">' +
      '<header class="verb-card-heading"><h3><span lang="it">' + esc(verb.name) + '</span><span class="verb-card-meaning">' + esc(verb.meaning) + '</span></h3>' +
      '<p class="verb-card-meta">' + esc(meta) + '</p>' + (verb.sound ? '<p class="verb-reading-guide">Say the infinitive: ' + esc(verb.sound) + '</p>' : '') +
      (sourcePending ? '<p class="verb-coverage-notice">' + esc(verb.source) + '</p>' : '') + '</header>' +
      '<div class="verb-reference-columns"><div class="verb-forms-column"><table class="verb-reference-table"><caption>All six present forms</caption><thead><tr><th scope="col">Subject</th><th scope="col">Present form</th>' +
      (hasEndings ? '<th scope="col">Ending</th>' : '') + '</tr></thead><tbody>' + people.map(row).join('') + '</tbody></table>' +
      '<p class="verb-person-note">Formal <span lang="it">Lei</span> uses the same form as <span lang="it">lui</span> and <span lang="it">lei</span>. In formal writing, <span lang="it">esso/essa</span> use that form too; <span lang="it">essi/esse</span> use the <span lang="it">loro</span> form.</p>' +
      (patternNotes[tense.pattern] ? '<p class="verb-pattern-note">' + esc(patternNotes[tense.pattern]) + '</p>' : '') + '</div>' +
      '<div class="verb-uses-column"><h4>When to use it</h4>' + (verb.usage ? '<p class="verb-usage-intro">' + esc(verb.usage) + '</p>' : '') + examples(verb) + '</div></div>' +
      '<footer class="verb-reference-notes">' + (verb.coverage ? '<p><strong>Verb coverage:</strong> ' + esc(verb.coverage) + '.</p>' : '') +
      (verb.classificationNote ? '<p>' + esc(verb.classificationNote) + '</p>' : '') +
      (verb.source && !sourcePending ? '<p>' + esc(verb.source) + '</p>' : '') + (verb.note ? '<p>' + esc(verb.note) + '</p>' : '') +
      (hasSounds ? '<p>Reading guides are approximate English-friendly study support. Capitals mark the stressed syllable.</p>' : '') + '</footer></section>';
  }

  root.ItalianVerbReferenceView = {render, familyLabel, patternLabel, sourceLabel};
})(window);
