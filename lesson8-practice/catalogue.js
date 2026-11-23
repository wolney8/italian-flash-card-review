(function (root) {
  'use strict';
  const {lesson, topics, coreTopics, sheets = []} = root.ItalianLesson8;
  const catalogue = root.ItalianLibraryMap;
  catalogue.lessons.push(lesson);
  const messages = root.ItalianUILibraryMessages || (root.ItalianUILibraryMessages = {});
  messages['Italian for Beginners · Last updated 21 November 2026'] = 'Italiano per principianti · Ultimo aggiornamento 21 novembre 2026';
  messages[lesson.title] = lesson.it;
  for (const topic of topics) {
    const title = 'Extra practice · ' + topic.title;
    const it = 'Esercizi aggiuntivi · ' + topic.it;
    catalogue.topics.push({id: topic.id, title, it, category: topic.category,
      sets: [topic.slug], flashcards: {lesson: lesson.id, deck: topic.deck}});
    catalogue.labels[topic.slug] = [title, it];
    messages[title] = it;
    messages[topic.title] = topic.it;
    messages[topic.deck] = topic.deck.slice(0, 3) + topic.it;
  }
  for (const {id, slug, title, it, category, flashcards} of coreTopics) {
    catalogue.topics.push({id, title, it, category, sets:[slug], flashcards});
    catalogue.labels[slug] = [title, it];
    messages[title] = it;
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
