"""Check practice routes, shared course controls and drafts in a real browser."""
from urllib.parse import parse_qs, urlencode, urlsplit

from playwright.sync_api import expect


VIEWS = {
    'daily-practice': '#topic-buttons',
    'visual-exercises': '#visual-activity',
    'jobs-in-photos': '#photo-question',
}
ACTIVITIES = {'verbs', 'sounds', 'sentence', 'forms', 'articles', 'numbers'}


def route(page, view):
    target='today' if view=='daily-practice' else view
    page.wait_for_url(lambda url: urlsplit(url).path == '/' and
                      parse_qs(urlsplit(url).query).get('page') == [target])
    if view=='daily-practice':
        assert parse_qs(urlsplit(page.url).query).get('tab') == ['practice']
    expect(page.locator('#guidedExperience .course-site-header')).to_have_count(1)
    expect(page.locator(VIEWS[view])).to_be_visible()
    expect(page.locator('.course-site-navigation [aria-current]')).to_have_attribute(
        'data-guide-to', 'today')



def theme(page, expected):
    expect(page.locator('html')).to_have_attribute('data-italian-theme', expected)
    assert page.evaluate("localStorage.getItem('italianCourseThemeV1')") == expected
    assert page.evaluate("getComputedStyle(document.documentElement).colorScheme") == expected


def header_link(page, label):
    header = page.locator('.course-site-header')
    menu = header.locator('.course-site-menu')
    if menu.is_visible() and menu.get_attribute('aria-expanded') != 'true':
        menu.click()
    return header.get_by_role('link', name=label, exact=True)


def colour(element):
    return element.evaluate("""el => {
      for (let node=el; node; node=node.parentElement) {
        const rgb=getComputedStyle(node).backgroundColor;
        if (rgb!=='rgba(0, 0, 0, 0)' && rgb!=='transparent') return rgb;
      }
      return null;
    }""")


def check_aliases(page, base):
    sheet = '/study/study-sheets.html?mode=review&lesson=L8&sheet=l8-jobs-workplaces&stage=examples'
    for view in VIEWS:
        for suffix in ('.html', ''):
            params = {'sheetReturn': sheet}
            if view == 'visual-exercises':
                params.update(activity='sounds', round='gi-ghi')
            page.goto(f'{base}/study/{view}{suffix}?{urlencode(params)}')
            route(page, view)
            query = parse_qs(urlsplit(page.url).query)
            assert query.get('sheetReturn') == [sheet], (view, query)
            if view == 'visual-exercises':
                expect(page.locator('#visual-activity')).to_have_value('sounds')
                assert query.get('round') == ['gi-ghi']
                expect(page.locator('#visual-tiles')).to_contain_text('ghi')
            if view != 'daily-practice':
                destination = page.get_by_role('link', name='Back to your study sheet').evaluate('el => el.href')
                assert destination == base + sheet
    page.goto(base + '/study/visual-exercises.html?page=lessons')
    page.wait_for_url(lambda url: urlsplit(url).path == '/' and
                      parse_qs(urlsplit(url).query).get('page') == ['lessons'])
    expect(page.locator('[data-guide-lesson=L8]')).to_be_visible()


def check_worksheet_entries(page, base):
    examples = (
        ('L2', 'class2-definite-articles', 'articles', 'definite', 'singular article'),
        ('L6', 'l6-number-patterns', 'numbers', 'hundreds', 'in hundreds'),
        ('L6', 'l6-essere-class', 'forms', 'essere', 'of essere'),
    )
    for lesson, sheet, activity, round_id, title in examples:
        query = urlencode({'lesson': lesson, 'sheet': sheet, 'set': sheet, 'stage': 'examples'})
        page.goto(f'{base}/study/study-sheets.html?{query}')
        link = page.locator('[data-visual-practice]')
        expect(link).to_be_visible()
        return_url = page.url
        link.click()
        route(page, 'visual-exercises')
        params = parse_qs(urlsplit(page.url).query)
        assert params.get('round') == [round_id], (sheet, params)
        expect(page.locator('#visual-activity')).to_have_value(activity)
        expect(page.locator('#visual-title')).to_contain_text(title)
        page.locator('[data-back-to-sheet]').click()
        expect(page).to_have_url(return_url)
        expect(page.locator('section[data-study-stage=examples]:visible')).to_be_visible()


def check_navigation(browser, base):
    for mobile in (False, True):
        context = browser.new_context(
            viewport={'width': 390 if mobile else 1120, 'height': 844},
            is_mobile=mobile, has_touch=mobile, reduced_motion='reduce',
        )
        context.route('**/*', lambda request: request.continue_() if
                      urlsplit(request.request.url).netloc == urlsplit(base).netloc else request.abort())
        context.add_init_script("""if (localStorage.getItem('italianCourseThemeV1') === null) {
            localStorage.setItem('italianCourseThemeV1','light');
            localStorage.setItem('italianCourseLanguageV1','en');
        }""")
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        try:
            if not mobile:
                check_aliases(page, base)
                check_worksheet_entries(page, base)
            page.goto(base + '/?page=home')
            header_link(page, 'Today').click()
            page.get_by_role('tab', name='Practice', exact=False).click()
            route(page, 'daily-practice')
            theme(page, 'light')

            # An unfinished answer must survive both the repaint and mobile menu interaction.
            page.locator('#topic-buttons [data-topic=verbs]').click()
            page.locator('#group').select_option('regular')
            page.locator('#verb').select_option('parlare')
            page.locator('#focus').select_option('whole')
            answer = page.locator('#exercise input[type=text]')
            answer.fill('parliamo')
            answer.evaluate('el => el.setSelectionRange(2,5)')
            original = answer.element_handle()
            panel = page.locator('#exercise .panel')
            light = colour(panel)
            page.locator('.course-site-theme').click()
            theme(page, 'dark')
            dark = colour(panel)
            assert light and dark and light != dark, (light, dark)
            if mobile:
                menu = page.locator('.course-site-menu')
                menu.click()
                expect(menu).to_have_attribute('aria-expanded', 'true')
                menu.click()
            expect(answer).to_have_value('parliamo')
            assert answer.evaluate('(el, original) => el === original', original)
            assert answer.evaluate('el => [el.selectionStart,el.selectionEnd]') == [2, 5]

            page.get_by_role('link', name='Sort C and G sounds').click()
            route(page, 'visual-exercises')
            theme(page, 'dark')
            picker = page.locator('#visual-activity')
            assert set(picker.locator('option').evaluate_all('opts=>opts.map(o=>o.value)')) == ACTIVITIES
            expect(picker).to_have_value('sounds')
            tile = page.locator('.visual-tile').filter(has_text='chiave')
            tile.click()
            page.locator('.visual-target').filter(has_text='Hard sound').click()
            expect(tile).to_have_attribute('data-placed', 'true')
            tile_dark = colour(tile)
            page.locator('.course-site-theme').click()
            theme(page, 'light')
            expect(tile).to_have_attribute('data-placed', 'true')
            assert colour(tile) != tile_dark

            instruction = page.locator('#visual-instruction')
            english = instruction.inner_text()
            language = page.locator('.course-site-language')
            language.click()
            assert page.evaluate("localStorage.getItem('italianCourseLanguageV1')") == 'it'
            expect(instruction).to_have_text(english)
            expect(tile).to_have_attribute('data-placed', 'true')
            language.click()
            assert page.evaluate("localStorage.getItem('italianCourseLanguageV1')") == 'en'

            for activity in ('forms', 'articles', 'numbers', 'sentence'):
                picker.select_option(activity)
                expect(picker).to_have_value(activity)
                page.wait_for_url(lambda url: parse_qs(urlsplit(url).query).get('activity') == [activity])
                expect(page.locator('#visual-title')).not_to_be_empty()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), activity
            page.go_back()
            expect(picker).to_have_value('numbers')
            page.go_forward()
            expect(picker).to_have_value('sentence')

            header_link(page, 'Today').click()
            page.get_by_role('tab', name='Practice', exact=False).click()
            route(page, 'daily-practice')
            assert 'activity' not in parse_qs(urlsplit(page.url).query)
            page.get_by_role('link', name='Jobs in photographs').click()
            route(page, 'jobs-in-photos')
            theme(page, 'light')
            photo = page.locator('#job-photo')
            first_photo = photo.get_attribute('src')
            option = page.locator('#job-options input').first
            option.check()
            option_value = option.input_value()
            photo_light = colour(page.locator('.photo-panel'))
            page.locator('.course-site-theme').click()
            theme(page, 'dark')
            assert colour(page.locator('.photo-panel')) != photo_light
            expect(photo).to_have_attribute('src', first_photo)
            expect(page.locator('#job-options input:checked')).to_have_value(option_value)
            page.reload()
            route(page, 'jobs-in-photos')
            theme(page, 'dark')

            header_link(page, 'Study sheets').click()
            expect(page.locator('[data-library-ready]')).to_be_visible()
            theme(page, 'dark')
            header_link(page, 'Today').click()
            page.get_by_role('tab', name='Practice', exact=False).click()
            route(page, 'daily-practice')
            theme(page, 'dark')
            assert not errors, errors
            print(f'Practice navigation passed at {390 if mobile else 1120}px.', flush=True)
        finally:
            context.close()
