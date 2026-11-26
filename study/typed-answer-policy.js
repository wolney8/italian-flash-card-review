/* Accept a complete word or its exact missing part when the question supplies
 * that relationship. This never guesses an ending from an infinitive, accepts
 * an arbitrary suffix, changes canonical content, or grades an answer itself. */
(function (root) {
  'use strict';

  const word = /^[\p{L}\p{M}]+$/u;
  const normal = value => String(value ?? '').normalize('NFC').toLocaleLowerCase('it').replace(/[‘’]/g, "'").trim();
  const unique = values => [...new Set(values.filter(value => typeof value === 'string' && value.trim()))];
  const endingTask = q => q.skill === 'ending' || /\bmissing\s+(?:verb\s+)?ending\b/i.test(q.task || '');
  const fragmentTask = q => endingTask(q) || /\bmissing\s+letter(?:s|\s+group)?\b/i.test(q.task || '');

  function instruction(task) {
    return String(task || '')
      .replace(/\bWrite\s+(?:only\s+)?the\s+missing\s+ending\s+of\s+/gi, 'Write the whole present-tense form of ')
      .replace(/\bWrite\s+(?:only\s+)?the\s+missing\s+ending\b/gi, 'Write the whole word')
      .replace(/\bWrite\s+(?:only\s+)?the\s+missing\s+letters?\s+to\s+spell\s+the\s+Italian\s+word/gi, 'Write the whole Italian word')
      .replace(/\bWrite\s+(?:only\s+)?the\s+missing\s+letter(?:s|\s+group)?\b/gi, 'Write the whole Italian word');
  }

  function describe(q = {}) {
    const model = String(q.model ?? q.answer ?? q.answers?.[0] ?? '');
    const originals = unique([q.answer, q.model, ...(Array.isArray(q.answers) ? q.answers : [])]);
    const result = {answers: originals, model, task: String(q.task || ''), guidance: '', expanded: false};
    const type = q.type || 'text';
    const mode = q.answerMode || q.answer_mode || 'accent';
    if (!['text', 'question'].includes(type) || q.choices?.length ||
        /^(?:en)(?:-|$)/i.test(q.answerLang || q.answer_lang || 'it') ||
        ['match', 'order', 'punctuation'].includes(mode)) return result;

    // Work only with Italian text actually supplied with this question.
    const rows = (Array.isArray(q.stimulus) ? q.stimulus : [])
      .filter(row => row && /^it(?:-|$)/i.test(row.lang || '') && typeof row.text === 'string')
      .map(row => ({...row, text: row.text.normalize('NFC')}));
    const gaps = rows.flatMap(row => [...row.text.matchAll(/_+/g)].map(match => ({row, index: match.index, size: match[0].length})));
    if (gaps.length > 1) return result;
    const full = [], fragments = [];
    let isEnding = endingTask(q);
    const add = (complete, fragment, particle = '') => {
      if (!word.test(complete) || !word.test(fragment) || normal(complete) === normal(fragment)) return;
      if (particle) full.push(particle + ' ' + complete);
      full.push(complete);
      fragments.push(fragment);
      if (isEnding) fragments.push('-' + fragment);
    };

    if (gaps.length === 1) {
      const {row, index, size} = gaps[0];
      const left = row.text.slice(0, index);
      const right = row.text.slice(index + size);
      const prefix = left.match(/[\p{L}\p{M}]+$/u)?.[0] || '';
      const suffix = right.match(/^[\p{L}\p{M}]+/u)?.[0] || '';
      if (!prefix && !suffix && !isEnding && fragmentTask(q) && word.test(model.trim())) {
        // Sometimes the missing letters already make the entire word ("___
        // lavoro fai?" → "che"). Encourage that word without inventing aliases.
        result.task = instruction(result.task);
        result.guidance = 'Try typing the whole word.';
      }
      if (prefix || suffix) {
        const beforeWord = left.slice(0, left.length - prefix.length);
        const particle = beforeWord.match(/(?:^|\s)(mi|ti|si|ci|vi)\s+$/i)?.[1] || '';
        for (const original of originals) {
          let answer = original.trim().normalize('NFC');
          if (particle && normal(answer).startsWith(normal(particle) + ' ')) answer = answer.slice(particle.length + 1);
          if (isEnding) answer = answer.replace(/^-/, '');
          if (!word.test(answer)) continue;
          const value = normal(answer), start = normal(prefix), end = normal(suffix);
          if (value.startsWith(start) && value.endsWith(end) && answer.length > prefix.length + suffix.length) {
            add(answer, answer.slice(prefix.length, answer.length - suffix.length || undefined), particle);
          } else if (fragmentTask(q)) {
            add(prefix + answer + suffix, answer, particle);
          }
        }
      }
    }

    // A labelled stem is sufficient even when the sentence leaves the entire
    // verb blank, e.g. "Io ___", "Stem: lavor-", canonical answer "lavoro".
    if (!full.length) {
      const stems = rows.filter(row => /^(?:stem|radice)$/i.test(String(row.label || '').trim()));
      if (stems.length === 1) {
        const stem = stems[0].text.trim().normalize('NFC').replace(/-$/, '');
        const parts = stem.match(/^(?:(mi|ti|si|ci|vi)\s+)?([\p{L}\p{M}]+)$/iu);
        if (parts) {
          const particle = parts[1] || '', prefix = parts[2];
          isEnding = true;
          for (const original of originals) {
            let answer = original.trim().normalize('NFC');
            if (particle && normal(answer).startsWith(normal(particle) + ' ')) answer = answer.slice(particle.length + 1);
            if (endingTask(q)) answer = answer.replace(/^-/, '');
            if (!word.test(answer)) continue;
            if (normal(answer).startsWith(normal(prefix)) && answer.length > prefix.length) {
              add(answer, answer.slice(prefix.length), particle);
            } else if (endingTask(q)) {
              add(prefix + answer, answer, particle);
            }
          }
        }
      }
    }

    if (!full.length || !fragments.length) return result;
    result.answers = unique([...originals, ...full, ...fragments]);
    result.model = full.find(answer => normal(answer) === normal(model)) || full[0];
    result.task = instruction(result.task);
    result.guidance = isEnding
      ? 'Try typing the whole word. The missing ending is also accepted.'
      : 'Try typing the whole word. The missing letters are also accepted.';
    result.expanded = true;
    return result;
  }

  const api = Object.freeze({describe});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ItalianTypedAnswers = api;
})(typeof window !== 'undefined' ? window : undefined);
