#!/usr/bin/env python3
"""Render actual native Anki card HTML with isolated offscreen Qt WebEngine.

Requires Anki and PyQt6-WebEngine in a scratch Python environment. Imports only
the supplied release package into a temporary collection; never opens a user
profile. PNGs and measurements are QA artefacts, not modifications to the deck.
"""
from argparse import ArgumentParser
from collections import Counter, defaultdict
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import shutil
import sys
from tempfile import TemporaryDirectory

DEFAULT_KEYS = (
    'italian-l1-chiamarsi',
    'verb_vivere_2',
    'italian-l7-form-work-io',
    'italian-l7-spelling-mangiamo',
    'italian-daily-verb-finire-present-noi',
    'italian-daily-verb-finire-present-io',
    'l9-sentence-prendere-bus',
    'l9-sentence-leggere-emails',
    'l9-rule-endings-plural',
    'l9-rule-subject-omission',
)

METRICS = r'''(() => {
  const visible = el => {const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
  const spans = [...document.querySelectorAll('.verb-stem,.verb-ending,.verb-infix')].filter(visible).map(el=>({text:el.textContent,kind:el.className,color:getComputedStyle(el).color}));
  const refs = [...document.querySelectorAll('.anki-verb-reference')].filter(visible).map(el=>({verb:el.dataset.verbReference,rows:el.querySelectorAll('tbody tr').length,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right,bottom:el.getBoundingClientRect().bottom,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
  const text = [...document.querySelectorAll('.label,.section,.reading-guide,.extra,.l9-answer-en,.anki-verb-reference')].filter(visible).map(el=>({class:el.className,fontSize:getComputedStyle(el).fontSize,color:getComputedStyle(el).color,text:el.innerText.slice(0,160)}));
  const hierarchy = [...document.querySelectorAll('.topic-panel,.panel-head,.panel-title,.panel-subtitle,.panel-badge,.choice-chip,.front-body,.instruction,.focus,.clue,.ask,.italian,h1,.natural,.meaning,.answer,.answer-body,[lang],.gram')].filter(visible).map(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {tag:el.tagName,class:el.className,lang:el.lang,fontSize:s.fontSize,fontWeight:s.fontWeight,fontStyle:s.fontStyle,color:s.color,background:s.backgroundColor,width:r.width,height:r.height,top:r.top,right:r.right,text:el.innerText.slice(0,240)};});
  const tables = [...document.querySelectorAll('table')].filter(visible).map(el=>({class:el.className,rows:el.querySelectorAll('tbody tr').length,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
  const cueLabels = [...document.querySelectorAll('.recall-cue-label')].filter(visible).map(el=>{const s=getComputedStyle(el),r=el.getClientRects()[0],next=el.nextElementSibling,nr=next&&next.getClientRects()[0];return {text:el.textContent,display:s.display,fontSize:s.fontSize,color:s.color,value:next?next.textContent:null,runsIntoValue:!!(r&&nr&&Math.abs(nr.top-r.top)<2&&Math.abs(nr.left-r.right)<2&&!/\s$/.test(el.textContent)&&!/^\s/.test(next.textContent))};});
  const styleText=[...document.querySelectorAll('style')].map(el=>el.textContent).join('\n');
  const targetStyles=selector=>[...document.querySelectorAll(selector)].filter(visible).map(el=>{const s=getComputedStyle(el);return {class:el.className,text:el.innerText.slice(0,120),color:s.color,fontStyle:s.fontStyle,display:s.display};});
  const shared={wrappers:document.querySelectorAll('.anki-course').length,fronts:document.querySelectorAll('.anki-course.anki-front').length,backs:document.querySelectorAll('.anki-course.anki-back').length,tasks:[...document.querySelectorAll('.anki-task')].map(el=>el.innerText.trim()),answers:[...document.querySelectorAll('.anki-answer')].map(el=>el.innerText.trim()),cssMarkers:(styleText.match(/Italian shared card presentation: start/g)||[]).length,italianTargets:targetStyles('.anki-course [lang|="it"]:not(.gram):not(.verb-infix):not(.verb-ending),.anki-course .learning-it:not(.gram)'),glossTargets:targetStyles('.anki-course .learning-gloss,.anki-course .anki-gloss,.anki-course .recall-cue > span[lang|="en"]:not(.recall-cue-label),.anki-course .anki-task > span[style] + span[style] > span[lang|="en"]:last-child,.anki-course .focus > span[style] > span[lang|="en"]:last-child'),labelTargets:targetStyles('.anki-course .recall-cue-label,.anki-course .anki-task > span[style] > span[style*="font-size"],.anki-course .focus > span[style] > span[style*="font-size"]'),visibleBackChoices:[...document.querySelectorAll('.anki-back .choice-row')].filter(visible).length,answerBodies:[...document.querySelectorAll('.anki-course .answer-body')].filter(visible).map(el=>{const s=getComputedStyle(el);return {border:s.borderTopWidth,background:s.backgroundColor};})};
  shared.answerStyles=targetStyles('.anki-course .anki-answer');
  shared.badges=[...document.querySelectorAll('.anki-course .panel-badge')].filter(visible).map(el=>({text:el.innerText,whiteSpace:getComputedStyle(el).whiteSpace,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
  const formRows=[...document.querySelectorAll('.l7-form-row')].filter(visible).map(el=>{const cells=[...el.children].map(c=>{const r=c.getBoundingClientRect();return {tag:c.tagName,text:c.innerText,top:r.top,bottom:r.bottom,left:r.left,right:r.right};});return {cells:cells,twoCellOverlap:cells.length===2?Math.min(cells[0].bottom,cells[1].bottom)-Math.max(cells[0].top,cells[1].top):null};});
  return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,bodyFont:getComputedStyle(document.body).fontFamily,bodyFontSize:getComputedStyle(document.body).fontSize,bodyColor:getComputedStyle(document.body).color,background:getComputedStyle(document.body).backgroundColor,referenceTables:refs,allTables:tables,colourSpans:spans,textSamples:text,learningHierarchy:hierarchy,cueLabels:cueLabels,sharedPresentation:shared,formRows:formRows,visibleText:document.body.innerText};
})()'''


def native_cards(package, keys, destination, scratch, coverage=None):
    from anki.collection import Collection
    from anki.import_export_pb2 import ImportAnkiPackageOptions, ImportAnkiPackageRequest
    collection = Collection(str(scratch / 'collection.anki2'))
    try:
        collection.import_anki_package(ImportAnkiPackageRequest(
            package_path=str(package), options=ImportAnkiPackageOptions(
                update_notes=1, update_notetypes=1, with_scheduling=False, with_deck_configs=False)))
        found = {}
        models = {}
        for nid in collection.find_notes(''):
            note = collection.get_note(nid)
            fields = dict(note.items())
            key = next((fields[field] for field in ('StableKey', 'Key', 'ID') if field in fields), None)
            if key in keys or coverage:
                card = note.cards()[0]
                model = note.note_type()
                models[model['id']] = model
                found[key] = {'key': key, 'model': model['name'], 'modelId': model['id'],
                              'deck': collection.decks.name(card.did), 'fields': fields,
                              'question': card.question(), 'answer': card.answer()}
        missing = set(keys) - set(found)
        if missing:
            raise ValueError('Missing requested cards: ' + ', '.join(sorted(missing)))
        selected = list(dict.fromkeys(keys))
        if coverage == 'all':
            selected.extend(key for key in sorted(found) if key not in selected)
        elif coverage:
            groups = defaultdict(list)
            for card in found.values():
                group = ((card['model'], card['deck']) if coverage == 'decks'
                         else (card['model'],))
                groups[group].append(card)
            for group in sorted(groups):
                if any(card['key'] in selected for card in groups[group]):
                    continue
                # Prefer a rich representative so tables, tiles and semantic
                # classes are exercised, with stable-key tie breaking.
                def richness(card):
                    html = card['question'] + card['answer']
                    classes = set(re.findall(r'class=[\"\']([^\"\']+)', html))
                    return (len(classes), min(len(html), 40000), card['key'])
                selected.append(max(groups[group], key=richness)['key'])
        selected_cards = [found[key] for key in selected]
        coverage_report = {
            'mode': coverage or 'explicit-keys',
            'availableNotes': len(found),
            'availableModels': sorted({card['model'] for card in found.values()}),
            'availableDecks': sorted({card['deck'] for card in found.values()}),
            'selectedModels': sorted({card['model'] for card in selected_cards}),
            'selectedDecks': sorted({card['deck'] for card in selected_cards}),
            'selectedKeys': selected,
            'modelNoteCounts': dict(Counter(card['model'] for card in found.values())),
            'deckNoteCounts': dict(Counter(card['deck'] for card in found.values())),
        }
        (destination / 'coverage.json').write_text(json.dumps(coverage_report, ensure_ascii=False, indent=2) + '\n')
        (destination / 'native-models.json').write_text(json.dumps(models, ensure_ascii=False, indent=2) + '\n')
        media = scratch / 'collection.media'
        if media.exists():
            shutil.copytree(media, destination / 'media', dirs_exist_ok=True)
        return selected_cards, coverage_report
    finally:
        collection.close()


def html_document(native_html, dark):
    classes = 'card card1' + (' nightMode night_mode' if dark else '')
    return ('<!doctype html><html><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1">'
            '</head><body class="' + classes + '">' + native_html + '</body></html>')


def render(package, output, keys, devices, coverage=None, themes=None, smoke=False,
           require_shared_theme=False):
    os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')
    os.environ.setdefault('QTWEBENGINE_CHROMIUM_FLAGS', '--disable-gpu --disable-dev-shm-usage --no-sandbox')
    os.environ.setdefault('QT_QUICK_BACKEND', 'software')
    from PyQt6.QtCore import QTimer, QUrl
    from PyQt6.QtWidgets import QApplication
    from PyQt6.QtWebEngineCore import QWebEnginePage, QWebEngineProfile, QWebEngineSettings, QWebEngineUrlRequestInterceptor
    from PyQt6.QtWebEngineWidgets import QWebEngineView
    output.mkdir(parents=True, exist_ok=True)
    package_sha256 = sha256(package.read_bytes()).hexdigest()
    with TemporaryDirectory(prefix='anki-preview-') as folder:
        cards, coverage_report = native_cards(package, keys, output, Path(folder), coverage)
    (output / 'native-card-html.json').write_text(json.dumps(cards, ensure_ascii=False, indent=2) + '\n')
    jobs = []
    for card in cards:
        for width, height, device in [(390, 844, 'phone'), (1440, 1000, 'desktop')]:
            if device not in devices:
                continue
            for dark in (False, True):
                if ('dark' if dark else 'light') not in (themes or ['light', 'dark']):
                    continue
                for side in ('question', 'answer'):
                    jobs.append({'card': card, 'width': width, 'height': height, 'device': device,
                                 'dark': dark, 'side': side})
    app = QApplication(['anki-preview'])
    view = QWebEngineView()
    profile = QWebEngineProfile(view)

    class LocalOnly(QWebEngineUrlRequestInterceptor):
        def interceptRequest(self, info):
            if info.requestUrl().scheme() not in ('file', 'data', 'about', 'qrc'):
                info.block(True)

    interceptor = LocalOnly(profile)
    profile.setUrlRequestInterceptor(interceptor)
    page = QWebEnginePage(profile, view)
    view.setPage(page)
    settings = page.settings()
    # Explicit Linux equivalents avoid missing system-font aliases in a headless
    # environment. The card's own CSS and font sizes remain unchanged.
    settings.setFontFamily(QWebEngineSettings.FontFamily.StandardFont, 'Liberation Sans')
    settings.setFontFamily(QWebEngineSettings.FontFamily.SansSerifFont, 'Liberation Sans')
    settings.setFontFamily(QWebEngineSettings.FontFamily.SerifFont, 'Liberation Serif')
    view.show()
    results = []
    failures = []
    current = {}

    def next_job():
        if not jobs:
            app.quit()
            return
        current.clear()
        current.update(jobs.pop(0))
        view.resize(current['width'], current['height'])
        name = re.sub(r'[^a-zA-Z0-9_-]+', '-', current['card']['key'])
        current['stem'] = name + '-' + current['device'] + '-' + ('dark' if current['dark'] else 'light') + '-' + current['side']
        html = html_document(current['card'][current['side']], current['dark'])
        if not smoke:
            (output / (current['stem'] + '.html')).write_text(html)
        page.setHtml(html, QUrl.fromLocalFile(str(output / 'media') + '/'))

    def loaded(ok):
        if not ok:
            failures.append({'key': current['card']['key'], 'error': 'Page did not load'})
            QTimer.singleShot(0, next_job)
            return
        # Expand the optional source/reference sections only on backs, so their
        # text is included in the captured QA state and can be inspected.
        if current['side'] == 'answer':
            page.runJavaScript("document.querySelectorAll('details').forEach(el=>el.open=true)")
        QTimer.singleShot(0 if smoke else 120, lambda: page.runJavaScript(METRICS, measured))

    def measured(metrics):
        if not isinstance(metrics, dict):
            failures.append({'key': current['card']['key'], 'error': 'No layout measurements'})
            QTimer.singleShot(0, next_job)
            return
        entry = {key: current[key] for key in ('device', 'dark', 'side')}
        entry.update(key=current['card']['key'], model=current['card']['model'],
                     deck=current['card']['deck'], metrics=metrics,
                     screenshot=None if smoke else current['stem'] + '.png')
        results.append(entry)
        if metrics['documentWidth'] > current['width'] + 2:
            failures.append({'key': entry['key'], 'device': entry['device'], 'side': entry['side'],
                             'error': 'Horizontal page overflow', 'width': metrics['documentWidth']})
        if current['side'] == 'question' and metrics['referenceTables']:
            failures.append({'key': entry['key'], 'error': 'New full reference is visible on the front'})
        for label in metrics['cueLabels']:
            if label['runsIntoValue']:
                failures.append({'key': entry['key'], 'device': entry['device'],
                                 'side': entry['side'], 'error': 'Cue label runs into its value',
                                 'label': label['text'], 'value': label['value']})
        if require_shared_theme:
            shared = metrics['sharedPresentation']
            expected_side = 'fronts' if current['side'] == 'question' else 'backs'
            content_key = 'tasks' if current['side'] == 'question' else 'answers'
            def style_failure(message, **details):
                failures.append({'key': entry['key'], 'device': entry['device'],
                                 'side': entry['side'], 'error': message, **details})
            if shared['wrappers'] != 1 or shared[expected_side] != 1:
                style_failure('Shared card wrapper missing or duplicated')
            if len(shared[content_key]) != 1 or not all(shared[content_key]):
                style_failure('Single nonempty task/answer wrapper required', content=shared[content_key])
            if shared['cssMarkers'] != 1:
                style_failure('Shared CSS marker missing or duplicated', count=shared['cssMarkers'])
            if shared['visibleBackChoices']:
                style_failure('Front choice chips remain visible on answer back')
            for body in shared['answerBodies']:
                if body['border'] != '0px' or body['background'] != 'rgba(0, 0, 0, 0)':
                    style_failure('Legacy inner answer frame remains', frame=body)
            for badge in shared['badges']:
                if badge['whiteSpace'] != 'nowrap' or badge['scrollWidth'] > badge['clientWidth'] + 1:
                    style_failure('Header badge wraps or overflows', badge=badge)
            expected_background = 'rgb(29, 28, 26)' if current['dark'] else 'rgb(248, 243, 235)'
            if metrics['background'] != expected_background:
                style_failure('Shared theme background not applied', colour=metrics['background'])
            expected_green = 'rgb(188, 212, 189)' if current['dark'] else 'rgb(40, 93, 71)'
            expected_gloss = 'rgb(240, 179, 154)' if current['dark'] else 'rgb(140, 73, 56)'
            expected_amber = 'rgb(240, 197, 139)' if current['dark'] else 'rgb(139, 77, 21)'
            if (current['side'] == 'answer' and
                    current['card']['modelId'] in (1675731218, 1836873404)):
                pronunciation = current['card']['fields'].get('Pronunciation', '').strip()
                for target in shared['answerStyles']:
                    if pronunciation:
                        if target['color'] != expected_green or target['fontStyle'] != 'italic':
                            style_failure('Authored L6/L7 Italian answer style not applied', target=target)
                    elif target['fontStyle'] != 'normal' or target['color'] == expected_green:
                        style_failure('L6/L7 conceptual answer incorrectly styled as Italian', target=target)
            for target in shared['italianTargets']:
                if target['color'] != expected_green or target['fontStyle'] != 'italic':
                    style_failure('Explicit Italian language style not applied', target=target)
            for target in shared['glossTargets']:
                if target['color'] != expected_gloss or target['fontStyle'] != 'italic':
                    style_failure('English cue/gloss style not applied', target=target)
            for target in shared['labelTargets']:
                if target['display'] != 'block' or target['fontStyle'] != 'normal':
                    style_failure('Cue label block/upright style not applied', target=target)
            for target in metrics['colourSpans']:
                expected_colour = expected_green if 'verb-stem' in target['kind'].split() else expected_amber
                if target['color'] != expected_colour:
                    style_failure('Canonical verb colour not applied', target=target)
            for row in metrics['formRows']:
                if row['twoCellOverlap'] is not None and row['twoCellOverlap'] <= 0:
                    style_failure('Two-column verb row has stacked subject and form', row=row)
        for table in metrics['referenceTables']:
            if table['rows'] != 6 or table['right'] > current['width'] + 2 or table['scrollWidth'] > table['clientWidth'] + 2:
                failures.append({'key': entry['key'], 'error': 'Incomplete or overflowing reference table', 'table': table})
        if smoke:
            if len(results) % 100 == 0:
                print('Measured ' + str(len(results)) + ' views', flush=True)
            QTimer.singleShot(0, next_job)
            return
        # Keep the width fixed and extend only the screenshot height to include
        # all document content. Initial viewport measurements above stay intact.
        target_height = max(current['height'], int(metrics['documentHeight']) + 2)
        if target_height > 14000:
            failures.append({'key': entry['key'], 'error': 'Card exceeds capture height', 'height': target_height})
        view.resize(current['width'], min(target_height, 14000))
        QTimer.singleShot(90, capture)

    def capture():
        path = output / (current['stem'] + '.png')
        if not view.grab().save(str(path)):
            failures.append({'key': current['card']['key'], 'error': 'Screenshot save failed'})
        if len(results) % 8 == 0:
            print('Rendered ' + str(len(results)) + ' views: ' + current['card']['key'], flush=True)
        QTimer.singleShot(0, next_job)

    view.loadFinished.connect(loaded)
    timeout = QTimer()
    timeout.setSingleShot(True)
    timeout.timeout.connect(lambda: (failures.append({'error': 'Renderer timed out'}), app.quit()))
    timeout.start(max(60000, len(jobs) * 3000))
    QTimer.singleShot(0, next_job)
    app.exec()
    report = {'package': str(package), 'package_sha256': package_sha256,
              'renderer': 'Native Anki HTML in offscreen Qt WebEngine', 'cards': len(cards),
              'views': len(results), 'screenshots_saved': not smoke,
              'shared_theme_required': require_shared_theme,
              'back_details_expanded': True, 'coverage': coverage_report,
              'failures': failures, 'results': results}
    (output / 'render-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'cards': len(cards), 'views': len(results),
                      'failure_count': len(failures), 'failures': failures[:12]}), flush=True)
    # Destroy the page before its profile after the event loop has stopped.
    # deleteLater() would otherwise leave the deferred deletion unprocessed.
    from PyQt6 import sip
    view.close()
    sip.delete(page)
    sip.delete(profile)
    sip.delete(view)
    return 1 if failures else 0


if __name__ == '__main__':
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('package', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--key', action='append', help='Stable key to inspect; defaults to the release sample set')
    parser.add_argument('--device', action='append', choices=('phone', 'desktop'),
                        help='Viewport to inspect; defaults to both')
    parser.add_argument('--coverage', choices=('notetypes', 'decks', 'all'),
                        help='Cover each note type, each note-type/deck pair, or every note')
    parser.add_argument('--theme', action='append', choices=('light', 'dark'),
                        help='Theme to inspect; defaults to both')
    parser.add_argument('--smoke', action='store_true',
                        help='Measure layout without PNG/HTML output or artificial settle delay')
    parser.add_argument('--require-shared-theme', action='store_true',
                        help='Assert shared wrappers, CSS, language cues and canonical verb colours')
    args = parser.parse_args()
    raise SystemExit(render(args.package.resolve(), args.output.resolve(),
                            args.key or ([] if args.coverage else list(DEFAULT_KEYS)),
                            args.device or ['phone', 'desktop'], args.coverage,
                            args.theme, args.smoke, args.require_shared_theme))
