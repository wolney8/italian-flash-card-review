/* Shared, present-first reference view. Forms and examples come from the
   canonical verb catalogue; this renderer does not infer another tense. */
(function(root) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const lines = value => esc(value).replace(/\n/g, '<br>');
  const formatItalian = value => '<span class="learning-it" lang="it">' + lines(value) + '</span>';
  const formatMeaning = value => '<span class="learning-gloss" lang="en-GB">' + lines(value) + '</span>';
  const regexEscape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Mark the words being discussed, rather than the surrounding explanation.
  // Short words shared with English need an explicit Italian context.
  const ambiguousTerms = new Set(['a', 'in', 'come', 'i', 'do']);
  const referencePhrases = [
    'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'esso', 'essa', 'essi', 'esse',
    'di', 'da', 'mi', 'ti', 'si', 'ci', 'vi', 'ho fame', 'i compiti',
    'venire da', 'essere di', 'un’insegnante', 'Come stai?', 'Come sta?',
    'Sto proprio male', 'Come va?', 'Dove vivi?', 'a Napoli', 'in Italia',
    'dall’Italia', 'Dove abita Lei?', 'io abito', 'Come si chiama?',
    'Come si scrive', 'Come si dice', 'Che cosa significa', 'Non capisco',
    'Mi dispiace', 'Quando', 'Scusi', 'Scusa', '-isc-'
  ];
  const explanationClarifications = new Map([
    ['Fare means make here.', 'Fare means “to make” in this example.'],
    ['Lavoro means job in this question. Fai is the verb.', 'Lavoro means “job” in this question. Fai is the verb.'],
    ['Quando asks when. Vieni is the form for tu.', 'Quando means “when”. Vieni is the form for tu.'],
    ['Sono can mean I am or they are. The surrounding conversation identifies the subject.', 'Sono can mean “I am” or “they are”. The surrounding conversation identifies the subject.'],
    ['Voi means you are speaking to more than one person. Noi means we or us.', 'Voi means you are speaking to more than one person. Noi means “we” or “us”.'],
    ['Prendere can mean take or pick up an object.', 'Prendere can mean “take” or “pick up” an object.'],
    ['Here prendere means get or buy.', 'Here prendere means “get” or “buy”.'],
    ['With transport, prendere means take or catch.', 'With transport, prendere means “take” or “catch”.'],
    ['In a café, this can be used to order a coffee. Prendo is present tense despite the natural English I’ll have.', 'In a café, this can be used to order a coffee. Prendo is present tense despite the natural English “I’ll have”.'],
    ['This classroom phrase is in the past tense. The present form is Non capisco. Only the present paradigm is provided above.', 'This classroom phrase is in the past tense. The present form is Non capisco. Only the present forms are shown in the table.']
  ]);
  const explicitReferences = [
    {text:'Use in for a workplace and come for a professional role.', terms:['in', 'come']},
    {text:'followed by il and the job', terms:['il']},
    {text:'feminine article una', terms:['una']},
    {text:'The h is silent', terms:['h']},
    {text:'with sport and i compiti', terms:['sport']},
    {text:'da + l’', terms:['l’']},
    {text:'uses -isc with io', terms:['-isc']}
  ];

  function formatExplanation(value, verb) {
    const original = String(value ?? '');
    const text = explanationClarifications.get(original) || original;
    const marks = [];
    function mark(start, end, kind) {
      if (marks.some(item => start < item.end && end > item.start)) return;
      marks.push({start, end, kind});
    }
    // Quotation marks identify translations only in an explicit meaning clause.
    // A quoted Italian word elsewhere is not automatically labelled English.
    for (const match of text.matchAll(/“([^”]+)”/g)) {
      const before = text.slice(0, match.index);
      if (/(?:\bmeans?\s+|\bEnglish\s+)(?:“[^”]+”\s*(?:,|or|and)\s*)*$/i.test(before)) {
        mark(match.index, match.index + match[0].length, 'meaning');
      }
    }
    for (const context of explicitReferences) {
      let start = text.indexOf(context.text);
      while (start !== -1) {
        for (const term of context.terms) {
          const offset = context.text.indexOf(term);
          mark(start + offset, start + offset + term.length, 'italian');
        }
        start = text.indexOf(context.text, start + context.text.length);
      }
    }
    const catalogue = root.ItalianDailyVerbs?.verbs || [];
    const verbs = verb ? [...catalogue, verb] : catalogue;
    const terms = new Set(referencePhrases);
    for (const item of verbs) {
      if (item.name) terms.add(item.name);
      for (const form of item.tenses?.presente?.forms || item.forms || []) terms.add(form);
    }
    for (const term of [...terms].filter(item => item && !ambiguousTerms.has(item.toLowerCase())).sort((a,b) => b.length - a.length)) {
      const expression = new RegExp('(?<![\\p{L}\\p{N}_])' + regexEscape(term) + '(?![\\p{L}\\p{N}_])', 'giu');
      for (const match of text.matchAll(expression)) mark(match.index, match.index + match[0].length, 'italian');
    }
    let end = 0;
    const result = marks.sort((a,b) => a.start - b.start).map(item => {
      const output = lines(text.slice(end, item.start)) + (item.kind === 'meaning' ? formatMeaning : formatItalian)(text.slice(item.start, item.end));
      end = item.end;
      return output;
    }).join('');
    return result + lines(text.slice(end));
  }
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
    return '<div class="verb-use-grid">' + uses.map(use =>
      '<article class="verb-use" data-use-id="' + esc(use.id || 'example') + '" data-source-kind="' + esc(use.source?.kind || 'supplementary') + '">' +
      '<h5>' + esc(use.category || 'Example') + '</h5>' +
      '<p class="verb-use-italian">' + formatItalian(use.italian) + '</p><p class="verb-use-english">' + formatMeaning(use.english) + '</p>' +
      (use.note ? '<p class="verb-use-note">' + formatExplanation(use.note, verb) + '</p>' : '') + '</article>'
    ).join('') + '</div>';
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
      '<header class="verb-card-heading"><h3><span lang="it">' + esc(verb.name) + '</span><span class="verb-card-meaning">' + formatMeaning(verb.meaning) + '</span></h3>' +
      '<p class="verb-card-meta">' + esc(meta) + '</p>' + (verb.sound ? '<p class="verb-reading-guide">Say the infinitive: ' + esc(verb.sound) + '</p>' : '') +
      (sourcePending ? '<p class="verb-coverage-notice">' + esc(verb.source) + '</p>' : '') + '</header>' +
      '<div class="verb-reference-columns"><div class="verb-uses-column"><h4>When to use it</h4>' + (verb.usage ? '<p class="verb-usage-intro">' + formatExplanation(verb.usage, verb) + '</p>' : '') + examples(verb) + '</div>' +
      '<div class="verb-forms-column"><table class="verb-reference-table"><caption>All six present forms</caption><thead><tr><th scope="col">Subject</th><th scope="col">Present form</th>' +
      (hasEndings ? '<th scope="col">Ending</th>' : '') + '</tr></thead><tbody>' + people.map(row).join('') + '</tbody></table>' +
      '<p class="verb-person-note">' + formatExplanation('Formal Lei uses the same form as lui and lei. In formal writing, esso/essa use that form too; essi/esse use the loro form.', verb) + '</p>' +
      (patternNotes[tense.pattern] ? '<p class="verb-pattern-note">' + formatExplanation(patternNotes[tense.pattern], verb) + '</p>' : '') + '</div></div>' +
      '<footer class="verb-reference-notes">' + (verb.coverage ? '<p><strong>Verb coverage:</strong> ' + esc(verb.coverage) + '.</p>' : '') +
      (verb.classificationNote ? '<p>' + formatExplanation(verb.classificationNote, verb) + '</p>' : '') +
      (verb.source && !sourcePending ? '<p>' + esc(verb.source) + '</p>' : '') + (verb.note ? '<p>' + formatExplanation(verb.note, verb) + '</p>' : '') +
      (hasSounds ? '<p>Reading guides are approximate English-friendly study support. Capitals mark the stressed syllable.</p>' : '') + '</footer></section>';
  }

  root.ItalianVerbReferenceView = {render, familyLabel, patternLabel, sourceLabel, formatExplanation, formatItalian, formatMeaning};
})(window);
