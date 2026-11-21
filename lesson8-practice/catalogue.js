(function (root) {
  'use strict';
  const {lesson, topics, sheets = []} = root.ItalianLesson8;
  const catalogue = root.ItalianLibraryMap;
  catalogue.lessons.push(lesson);
  const messages = root.ItalianUILibraryMessages || (root.ItalianUILibraryMessages = {});
  messages['Italian for Beginners · Last updated 21 November 2026'] = 'Italiano per principianti · Ultimo aggiornamento 21 novembre 2026';
  messages[lesson.title] = lesson.it;
  for (const topic of topics) {
    catalogue.topics.push({id: topic.id, title: topic.title, it: topic.it, category: topic.category,
      sets: [topic.slug], flashcards: {lesson: lesson.id, deck: topic.deck}});
    catalogue.labels[topic.slug] = [topic.title, topic.it];
    messages[topic.title] = topic.it;
    messages[topic.deck] = topic.deck.slice(0, 3) + topic.it;
  }
  if (root.ItalianLibraryContent) root.ItalianLibraryContent.sheets.push(...sheets);
  for (const sheet of sheets) {
    messages[sheet.subtitle] = sheet.subtitleIt;
    for (const section of sheet.study_sections) {
      messages[section.title] = section.titleIt;
      if (section.headersIt) section.headers.forEach((header, i) => { messages[header] = section.headersIt[i]; });
    }
  }
})(window);
