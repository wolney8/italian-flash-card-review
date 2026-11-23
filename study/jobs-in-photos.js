export function mountPractice(main, signal) {
  const byId = id => main.querySelector('#'+id);
  const roles = {
    insegnante: {italian:'l’insegnante', english:'teacher'},
    cuoco: {italian:'il cuoco / la cuoca', english:'cook'},
    cameriere: {italian:'il cameriere / la cameriera', english:'waiter or waitress'},
    dottore: {italian:'il dottore / la dottoressa', english:'doctor'},
    infermiere: {italian:'l’infermiere / l’infermiera', english:'nurse'},
    commesso: {italian:'il commesso / la commessa', english:'shop assistant'}
  };
  let photos = [];
  let round = [];
  let position = 0;
  let score = 0;
  let graded = false;
  const shuffle = array => {
    const copy = [...array];
    for (let i = copy.length-1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [copy[i],copy[j]] = [copy[j],copy[i]];
    }
    return copy;
  };
  function link(title, url) {
    const anchor = document.createElement('a');
    anchor.textContent = title;
    anchor.href = url;
    return anchor;
  }
  function renderPhoto(moveFocus = false) {
    const photo = round[position];
    graded = false;
    byId('photo-complete').hidden = true;
    byId('photo-question').hidden = true;
    byId('photo-state').hidden = false;
    byId('photo-state').textContent = 'Loading photograph…';
    byId('retry-photos').hidden = true;
    byId('photo-count').textContent = 'Photograph '+(position+1)+' of '+round.length;
    byId('job-options').replaceChildren();
    for (const role of shuffle([photo.role,...photo.distractors])) {
      const input = document.createElement('input');
      input.name = 'job'; input.type = 'radio'; input.value = role; input.required = true;
      const label = document.createElement('label');
      label.lang = 'it'; label.append(input, roles[role].italian);
      byId('job-options').append(label);
    }
    byId('hint').open = false;
    byId('hint').querySelector('p').textContent = photo.hint;
    byId('photo-credit').open = false;
    byId('photo-attribution').replaceChildren(link(photo.title,photo.source),'. '+photo.credit+', '+photo.date.slice(0,4)+'. ',link(photo.licence,photo.licenceUrl),'.');
    byId('job-choices').disabled = false;
    byId('check-job').hidden = false;
    byId('job-feedback').replaceChildren();
    byId('next-photo').hidden = true;
    const image = byId('job-photo');
    image.alt = photo.alt;
    image.onload = () => {
      if (signal.aborted) return;
      byId('photo-state').hidden = true;
      byId('photo-question').hidden = false;
      if (moveFocus) byId('photo-prompt').focus();
    };
    image.onerror = () => showError('This photograph could not be loaded.');
    image.src = new URL('job-photos/'+photo.file, import.meta.url).href;
  }
  function start() {
    position = 0; score = 0; round = shuffle(photos);
    renderPhoto();
  }
  function showError(message) {
    byId('photo-state').hidden=false;
    byId('photo-state').textContent=message;
    byId('photo-question').hidden=true;
    byId('retry-photos').hidden=false;
  }
  async function load() {
    byId('retry-photos').hidden = true;
    try {
      const response = await fetch(new URL('job-photos/sources.json',import.meta.url),{signal});
      if (!response.ok) throw Error();
      photos = await response.json();
      if (signal.aborted) return;
      if (!photos.length) throw Error();
      start();
    } catch { if (!signal.aborted) showError('The photograph collection could not be loaded.'); }
  }
  byId('retry-photos').addEventListener('click',() => photos.length && round.length ? renderPhoto(true) : load());
  byId('job-form').addEventListener('submit', event => {
    event.preventDefault();
    if (graded) return;
    const answer = byId('job-form').querySelector('input:checked');
    if (!answer) return;
    const photo = round[position], correct = answer.value === photo.role;
    graded = true;
    if (correct) score++;
    byId('job-choices').disabled = true;
    byId('check-job').hidden = true;
    const job = document.createElement('strong'); job.lang = 'it'; job.textContent = roles[photo.role].italian;
    byId('job-feedback').replaceChildren(correct?'Correct. ':'The job is ',job,' ('+roles[photo.role].english+'). '+photo.evidence);
    byId('next-photo').textContent = position+1 === round.length ? 'Finish round' : 'Next photograph';
    byId('next-photo').hidden=false;
    byId('next-photo').focus();
  });
  byId('next-photo').addEventListener('click', () => {
    if (!graded) return;
    position++;
    if (position < round.length) {renderPhoto(true);return;}
    byId('photo-question').hidden=true;
    byId('photo-complete').hidden=false;
    byId('photo-score').textContent=score+' of '+round.length+' correct.';
    byId('photo-complete').querySelector('h2').focus();
  });
  byId('restart-photos').addEventListener('click',start);
  load();
}
