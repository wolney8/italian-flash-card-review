#!/usr/bin/env python3
"""Check reference navigation, six-person tables and coloured endings in isolated browsers."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
import json
import shutil
import threading

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INIT = """
if (location.protocol === 'http:' || location.protocol === 'https:') {
  localStorage.setItem('italianCourseLanguageV1', 'en');
  localStorage.setItem('italianAutoAdvanceV2', 'off');
}
"""


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def query(page):
    return {key: values[-1] for key, values in parse_qs(urlsplit(page.url).query).items()}


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), 'Page has horizontal overflow'


def six_person_comparison(scope):
    matrix = scope.locator('.conj-matrix')
    expect(matrix).to_have_count(1)
    rows = matrix.locator('tbody tr')
    expect(rows).to_have_count(6)
    for index in range(6):
        expect(rows.nth(index)).to_be_visible()
        expect(rows.nth(index).locator('td')).to_have_count(4)
    assert scope.locator('.conj-plural, details').count() == 0, 'Plural rows require a second reveal'
    singular = rows.nth(0).locator('td').nth(3)
    plural = rows.nth(3).locator('td').nth(3)
    expect(singular.locator('.conj-form')).to_have_text('finisco')
    expect(singular.locator('.verb-stem')).to_have_text('fin')
    expect(singular.locator('.verb-infix')).to_have_text('isc')
    expect(singular.locator('.verb-ending').first).to_have_text('o')
    expect(plural.locator('.conj-form')).to_have_text('finiamo')
    expect(plural.locator('.verb-stem')).to_have_text('fin')
    expect(plural.locator('.verb-ending').first).to_have_text('iamo')
    expect(plural.locator('.verb-infix')).to_have_count(0)


def colour_check(scope):
    """Check final computed colours against their actual composite backgrounds."""
    colours = scope.locator('.verb-ending, .verb-infix').evaluate_all(r"""elements => {
      const rgba = text => (text.match(/[\d.]+/g) || []).map(Number);
      const blend = (fg,bg) => fg.slice(0,3).map((value,i) => value*(fg[3] ?? 1)+bg[i]*(1-(fg[3] ?? 1)));
      const luminance = rgb => rgb.map(value => {
        const c=value/255; return c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
      }).reduce((sum,value,i) => sum+value*[0.2126,0.7152,0.0722][i],0);
      return elements.filter(element => element.getClientRects().length).map(element => {
        let background=[255,255,255], ancestors=[];
        for(let node=element;node;node=node.parentElement) ancestors.unshift(node);
        for(const node of ancestors) background=blend(rgba(getComputedStyle(node).backgroundColor),background);
        const colour=getComputedStyle(element).color, foreground=blend(rgba(colour),background);
        const values=[luminance(foreground),luminance(background)].sort((a,b)=>a-b);
        return {text:element.textContent,colour,ratio:(values[1]+0.05)/(values[0]+0.05)};
      });
    }""")
    assert colours, 'No visible highlighted endings'
    assert len({row['colour'] for row in colours}) == 1, colours
    assert all(row['ratio'] >= 4.5 for row in colours), colours
    stems = scope.locator('.verb-stem').evaluate_all('elements => elements.filter(element => element.getClientRects().length).map(element => getComputedStyle(element).color)')
    assert stems and all(colour != colours[0]['colour'] for colour in stems), 'Endings are not visually distinct from stems'
    return colours[0]['colour']


def set_theme(page, theme):
    if page.locator('html').get_attribute('data-italian-theme') != theme:
        page.locator('.course-site-theme').click()
    expect(page.locator('html')).to_have_attribute('data-italian-theme', theme)


def sidebar_consistency(page):
    links = page.locator('#reference-links')
    expect(links).to_be_visible()
    assert links.get_attribute('aria-label') == 'Reference sheets'
    for reference in ['all', 'verb-endings', 'verb-forms', 'articles', 'sounds']:
        link = links.locator('[data-reference="' + reference + '"]')
        expect(link).to_be_visible()
        target = parse_qs(urlsplit(link.get_attribute('href')).query)
        assert target.get('page') == ['today'] and target.get('tab') == ['practice']
        assert target.get('reference') == [reference]
    rows = page.locator('#topics a, #topics button').evaluate_all("""elements => elements.map(element => {
      const style=getComputedStyle(element);
      return {label:element.textContent.trim(),uniform:element.classList.contains('practice-nav-row'),
        font:style.fontFamily,size:style.fontSize,padding:style.padding,border:style.borderRadius,
        height:element.getBoundingClientRect().height};
    })""")
    assert rows and all(row['uniform'] for row in rows), rows
    assert len({(row['font'], row['size'], row['padding'], row['border']) for row in rows}) == 1, rows
    assert all(row['height'] >= 43 for row in rows), rows


def open_reference(page, reference):
    page.locator('#reference-links [data-reference="' + reference + '"]').click()
    expect(page.locator('#practice-reference-view')).to_be_visible()
    expect(page.locator('#practice-drill')).to_be_hidden()
    expect(page.locator('#reference-links [data-reference="' + reference + '"]')).to_have_attribute('aria-current', 'page')
    assert query(page).get('reference') == reference
    assert page.locator('#topic-buttons [aria-pressed=true]').count() == 0


def check_practice(page, base, width):
    page.goto(base + '/?page=daily-practice', wait_until='domcontentloaded', timeout=60000)
    page.locator('#exercise .panel').wait_for(timeout=60000)
    expect(page.locator('#overview')).to_have_attribute('open', '')
    six_person_comparison(page.locator('#overview-body'))
    sidebar_consistency(page)
    page.select_option('#family', 'ire')
    page.select_option('#verb', 'finire')
    page.select_option('#focus', 'ending')
    page.locator('#ref-title').click()
    expect(page.locator('#reference')).to_have_attribute('open', '')
    answer = page.locator('#exercise input[name=answer]')
    answer.fill('tentativo salvato')
    original_input = answer.element_handle()
    title = page.locator('#exercise .question-title').inner_text()
    state = page.evaluate("localStorage.getItem('italianDailyPractice.v1')")

    open_reference(page, 'all')
    for reference in ['verb-endings', 'verb-forms', 'articles', 'sounds']:
        card = page.locator('#practice-reference-body .practice-reference-card[data-reference="' + reference + '"]')
        expect(card).to_be_visible()
        assert card.get_attribute('href') == page.locator('#reference-links [data-reference="' + reference + '"]').get_attribute('href')
    page.locator('#practice-reference-body .practice-reference-card[data-reference=verb-endings]').click()
    six_person_comparison(page.locator('#practice-reference-body'))
    set_theme(page, 'light')
    light = colour_check(page.locator('#practice-reference-body'))
    set_theme(page, 'dark')
    dark = colour_check(page.locator('#practice-reference-body'))

    open_reference(page, 'verb-forms')
    page.select_option('#practice-reference-verb', 'finire')
    assert query(page).get('verb') == 'finire'
    forms = page.locator('#practice-reference-verb-body .verb-reference-table tbody tr')
    expect(forms).to_have_count(6)
    for index, expected in enumerate(['finisco','finisci','finisce','finiamo','finite','finiscono']):
        expect(forms.nth(index)).to_be_visible()
        expect(forms.nth(index).locator('.verb-written-form')).to_have_text(expected)
    assert colour_check(page.locator('#practice-reference-verb-body')) == dark
    set_theme(page, 'light')
    assert colour_check(page.locator('#practice-reference-verb-body')) == light
    page.go_back()
    assert query(page).get('reference') == 'verb-forms' and query(page).get('verb') != 'finire'
    page.go_back()
    assert query(page).get('reference') == 'verb-endings'
    six_person_comparison(page.locator('#practice-reference-body'))
    page.go_forward()
    page.go_forward()
    expect(page.locator('#practice-reference-verb')).to_have_value('finire')
    page.locator('[data-reference-return]').click()
    expect(page.locator('#practice-drill')).to_be_visible()
    expect(page.locator('#practice-reference-view')).to_be_hidden()
    assert 'reference' not in query(page)
    assert original_input.evaluate('element => element.isConnected && element === document.querySelector("#exercise input[name=answer]")'), 'Reference navigation replaced the draft input'
    expect(answer).to_have_value('tentativo salvato')
    expect(page.locator('#exercise .question-title')).to_have_text(title)
    assert page.evaluate("localStorage.getItem('italianDailyPractice.v1')") == state, 'Reference navigation changed practice progress'
    expect(page.locator('#family')).to_have_value('ire')
    expect(page.locator('#verb')).to_have_value('finire')
    expect(page.locator('#focus')).to_have_value('ending')

    page.locator('#exercise button[type=submit]').click()
    page.locator('#exercise [data-action=next]').wait_for()
    checked = page.evaluate("localStorage.getItem('italianDailyPractice.v1')")
    open_reference(page, 'articles')
    expect(page.locator('#practice-reference-body')).to_contain_text('il libro')
    page.locator('[data-reference-return]').click()
    assert page.evaluate("localStorage.getItem('italianDailyPractice.v1')") == checked
    page.locator('#exercise [data-action=next]').click()
    expect(page.locator('#reference')).to_have_attribute('open', '')
    expect(page.locator('#overview')).to_have_attribute('open', '')
    no_overflow(page)
    if width == 1280:
        icon = page.locator('.course-site-comment')
        expect(icon).to_be_visible()
        assert icon.locator('svg').count() == 1 and not icon.inner_text().strip()
        assert icon.get_attribute('aria-label') == 'Comments'
        assert page.locator('.course-site-navigation').inner_text().count('Today') == 1
    else:
        page.locator('.course-site-menu').click()
        expect(page.locator('.course-site-comment')).to_be_visible()
        page.locator('.course-site-menu').click()

    page.goto(base + '/?page=today&tab=practice&reference=verb-forms&verb=finire', wait_until='domcontentloaded')
    expect(page.locator('#practice-reference-view')).to_be_visible(timeout=60000)
    expect(page.locator('#practice-reference-verb')).to_have_value('finire')
    page.reload(wait_until='domcontentloaded')
    expect(page.locator('#practice-reference-verb')).to_have_value('finire', timeout=60000)
    page.goto(base + '/?page=today&tab=practice&reference=verb-endings', wait_until='domcontentloaded')
    expect(page.locator('#practice-reference-view')).to_be_visible(timeout=60000)
    six_person_comparison(page.locator('#practice-reference-body'))
    no_overflow(page)


def check_study_tables(page, base):
    page.goto(base + '/study/study-sheets.html?mode=learn&sheet=l9-ere-class&stage=examples', wait_until='domcontentloaded')
    page.locator('.study-pack-sheet[data-guided-pilot=ready]').wait_for(timeout=60000)
    table = page.locator('section.panel[data-study-stage=examples]:not([hidden]) table')
    expect(table).to_have_count(1)
    rows = table.locator('tbody tr')
    expect(rows).to_have_count(6)
    for index, form in enumerate(['prendo','prendi','prende','prendiamo','prendete','prendono']):
        cell = rows.nth(index).locator('td').last
        expect(cell).to_be_visible()
        expect(cell).to_have_text(form)
        expect(cell.locator('.verb-stem')).to_have_text('prend')
        expect(cell.locator('.verb-ending')).to_have_text(['o','i','e','iamo','ete','ono'][index])
    for theme in ['light', 'dark']:
        set_theme(page, theme)
        colour_check(table)
    no_overflow(page)
    page.goto(base + '/study/study-sheets.html?mode=learn&sheet=practice-irregular-verbs&stage=learn', wait_until='domcontentloaded')
    page.locator('.study-pack-sheet[data-guided-pilot=ready]').wait_for(timeout=60000)
    table = page.locator('section.panel[data-study-stage=learn]:not([hidden]) table')
    expect(table).to_have_count(1)
    headers = table.locator('thead th').all_inner_texts()
    assert len(headers) == 7 and headers[-3:] == ['noi','voi','loro'], headers
    actual = table.locator('tbody tr').evaluate_all('rows => rows.map(row => Array.from(row.children).map(cell => cell.textContent.trim()))')
    expected = page.evaluate('ItalianDailyVerbs.verbs.map(verb => [verb.name, ...verb.forms])')
    for row in actual:
        assert row in expected, ('Irregular comparison must contain six approved forms', row)
    assert table.locator('.verb-ending, .verb-infix').count() == 0, 'Irregular forms have invented regular endings'
    no_overflow(page)


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = 'http://127.0.0.1:' + str(server.server_port)
try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'), headless=True, args=['--no-sandbox'])
        for width in [1280,390]:
            context = browser.new_context(viewport={'width':width,'height':850}, reduced_motion='reduce')
            context.add_init_script(INIT)
            page = context.new_page()
            page.set_default_timeout(15000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            check_practice(page, base, width)
            check_study_tables(page, base)
            assert not errors, 'Page errors: ' + json.dumps(errors)
            context.close()
        browser.close()
        print('PASS Reference catalogue, consistent sidebar, six visible persons, light/dark ending contrast, direct links/history, drafts/results, Study Sheet tables and mobile layout')
finally:
    server.shutdown()
