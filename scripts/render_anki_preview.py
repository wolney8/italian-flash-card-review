#!/usr/bin/env python3
"""Render actual native Anki card HTML with isolated offscreen Qt WebEngine.

Requires Anki and PyQt6-WebEngine in a scratch Python environment. Imports only
the supplied release package into a temporary collection; never opens a user
profile. PNGs and measurements are QA artefacts, not modifications to the deck.
"""
from argparse import ArgumentParser
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
  return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,bodyFont:getComputedStyle(document.body).fontFamily,bodyColor:getComputedStyle(document.body).color,background:getComputedStyle(document.body).backgroundColor,referenceTables:refs,colourSpans:spans,textSamples:text,visibleText:document.body.innerText};
})()'''


def native_cards(package, keys, destination, scratch):
    from anki.collection import Collection
    from anki.import_export_pb2 import ImportAnkiPackageOptions, ImportAnkiPackageRequest
    collection = Collection(str(scratch / 'collection.anki2'))
    try:
        collection.import_anki_package(ImportAnkiPackageRequest(
            package_path=str(package), options=ImportAnkiPackageOptions(
                update_notes=1, update_notetypes=1, with_scheduling=False, with_deck_configs=False)))
        found = {}
        for nid in collection.find_notes(''):
            note = collection.get_note(nid)
            fields = dict(note.items())
            key = next((fields[field] for field in ('StableKey', 'Key', 'ID') if field in fields), None)
            if key in keys:
                card = note.cards()[0]
                found[key] = {'key': key, 'model': note.note_type()['name'], 'fields': fields,
                              'question': card.question(), 'answer': card.answer()}
        missing = set(keys) - set(found)
        if missing:
            raise ValueError('Missing requested cards: ' + ', '.join(sorted(missing)))
        media = scratch / 'collection.media'
        if media.exists():
            shutil.copytree(media, destination / 'media', dirs_exist_ok=True)
        return [found[key] for key in keys]
    finally:
        collection.close()


def html_document(native_html, dark):
    classes = 'card card1' + (' nightMode night_mode' if dark else '')
    return ('<!doctype html><html><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1">'
            '</head><body class="' + classes + '">' + native_html + '</body></html>')


def render(package, output, keys, devices):
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
        cards = native_cards(package, keys, output, Path(folder))
    (output / 'native-card-html.json').write_text(json.dumps(cards, ensure_ascii=False, indent=2) + '\n')
    jobs = []
    for card in cards:
        for width, height, device in [(390, 844, 'phone'), (1440, 1000, 'desktop')]:
            if device not in devices:
                continue
            for dark in (False, True):
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
        QTimer.singleShot(120, lambda: page.runJavaScript(METRICS, measured))

    def measured(metrics):
        if not isinstance(metrics, dict):
            failures.append({'key': current['card']['key'], 'error': 'No layout measurements'})
            QTimer.singleShot(0, next_job)
            return
        entry = {key: current[key] for key in ('device', 'dark', 'side')}
        entry.update(key=current['card']['key'], model=current['card']['model'], metrics=metrics,
                     screenshot=current['stem'] + '.png')
        results.append(entry)
        if metrics['documentWidth'] > current['width'] + 2:
            failures.append({'key': entry['key'], 'device': entry['device'], 'side': entry['side'],
                             'error': 'Horizontal page overflow', 'width': metrics['documentWidth']})
        if current['side'] == 'question' and metrics['referenceTables']:
            failures.append({'key': entry['key'], 'error': 'New full reference is visible on the front'})
        for table in metrics['referenceTables']:
            if table['rows'] != 6 or table['right'] > current['width'] + 2 or table['scrollWidth'] > table['clientWidth'] + 2:
                failures.append({'key': entry['key'], 'error': 'Incomplete or overflowing reference table', 'table': table})
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
              'views': len(results), 'back_details_expanded': True, 'failures': failures, 'results': results}
    (output / 'render-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key: report[key] for key in ('cards', 'views', 'failures')}), flush=True)
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
    args = parser.parse_args()
    raise SystemExit(render(args.package.resolve(), args.output.resolve(),
                            args.key or list(DEFAULT_KEYS), args.device or ['phone', 'desktop']))
