#!/usr/bin/env python3
"""Focused Lesson 7 release checks against the integrated site in Chromium.

Install playwright==1.57.0 and Chromium (``python -m playwright install chromium``).
Run from any directory: ``python scripts/validate_lesson7_browser.py``.
``--live`` additionally requires the deployed content.js to match this checkout.
Every case uses a new, non-persistent context; external logging is blocked.
Reports and screenshots are written to artifacts/lesson7-browser/.
"""

import argparse
import hashlib
import json
import re
import shutil
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import parse_qs, urlencode, urlparse

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts/lesson7-browser"
PRODUCTION = "https://italian-flash-card-review.netlify.app"
SHEETS = {s["slug"]: s for s in json.loads((ROOT / "lesson7/study-data.json").read_text())}
RECAP = json.loads((ROOT / "lesson7/lesson6-recap-data.json").read_text())["sheets"][0]
SHEETS[RECAP["slug"]] = RECAP


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def contrast(colours):
    """WCAG contrast, compositing transparent ancestor backgrounds first."""
    def rgba(value):
        numbers = [float(v) for v in re.findall(r"[\d.]+", value)]
        assert len(numbers) in (3, 4), ("Unexpected CSS colour", value)
        return numbers[:3] + [numbers[3] if len(numbers) == 4 else 1]

    def over(fg, bg):
        return [fg[i] * fg[3] + bg[i] * (1 - fg[3]) for i in range(3)]

    def luminance(rgb):
        channels = [v / 255 for v in rgb]
        linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in channels]
        return sum(a * b for a, b in zip(linear, [.2126, .7152, .0722]))

    background = [255, 255, 255]
    for colour in reversed(colours["backgrounds"]):
        background = over(rgba(colour), background)
    foreground = over(rgba(colours["foreground"]), background)
    a, b = luminance(foreground), luminance(background)
    return (max(a, b) + .05) / (min(a, b) + .05)


def run_case(browser, base, width, height, language, theme, live):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        has_touch=width < 600, is_mobile=width < 600,
        reduced_motion="reduce", service_workers="block",
    )
    # A temporary context never reads, resets or exports the learner's own profile.
    origin = urlparse(base).netloc
    context.route("**/*", lambda route: route.continue_()
                  if urlparse(route.request.url).netloc == origin else route.abort())
    context.add_init_script("""if (window === top) { try {
      localStorage.setItem('italianCourseLanguageV1', %s);
      localStorage.setItem('italianCourseThemeV1', %s);
    } catch (_) {} }""" % (json.dumps(language), json.dumps(theme)))
    page = context.new_page()
    page.set_default_timeout(15000)
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    case = {"width": width, "height": height, "language": language, "theme": theme,
            "checks": [], "screenshots": [], "status": "running"}
    prefix = ("live-" if live else "") + f"{width}-{language}-{theme}"

    def screenshot(name):
        filename = f"{prefix}-{name}.png"
        page.screenshot(path=str(OUT / filename), full_page=False)
        case["screenshots"].append(filename)

    def overflow(label):
        size = page.evaluate("""() => ({width: innerWidth,
          document: document.documentElement.scrollWidth, body: document.body.scrollWidth})""")
        assert max(size["document"], size["body"]) <= size["width"] + 2, (label, size)

    def usable(locator, allow_disabled=False):
        expect(locator).to_be_visible()
        if not allow_disabled:
            expect(locator).to_be_enabled()
        locator.evaluate("e => e.scrollIntoView({block:'center', inline:'nearest', behavior:'instant'})")
        geometry = locator.evaluate("""e => {
          const r=e.getBoundingClientRect();
          return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,
            viewportWidth:innerWidth,viewportHeight:innerHeight,
            unobscured:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};
        }""")
        assert geometry["left"] >= -1 and geometry["right"] <= width + 1, geometry
        assert geometry["top"] >= -1 and geometry["bottom"] <= height + 1, geometry
        assert geometry["width"] > 0 and geometry["height"] > 0 and geometry["unobscured"], geometry

    def goto(path):
        response = page.goto(base + path, wait_until="networkidle", timeout=60000)
        assert response and response.ok, (path, response.status if response else None)

    def visit(slug, stage="practise", topic=None):
        params = {"mode": "learn", "lesson": "L6" if slug.startswith("l6-") else "L7",
                  "sheet": slug, "stage": stage}
        if topic:
            params["topic"] = topic
        goto("/study/study-sheets.html?" + urlencode(params))
        page.wait_for_selector(".study-pack-sheet[data-guided-pilot=ready]")
        page.wait_for_function("!!window.ItalianGuidedStudy && !!document.querySelector('[data-flow-skip]')")
        expect(page.locator(".study-pack-sheet")).to_have_attribute("id", slug)
        assert page.evaluate("ItalianGuidedStudy.getState().step") == stage

    def question():
        current = page.locator(".quiz-question:not([hidden])")
        expect(current).to_have_count(1)
        return current

    def index():
        return page.evaluate("ItalianGuidedStudy.getState().question")

    def pause():
        page.keyboard.press("Escape")
        expect(page.locator(".flow-countdown-help")).to_have_text("")

    def next_question(expected):
        page.locator("[data-guided-action=next]").click()
        page.wait_for_function("n => ItalianGuidedStudy.getState().question === n", arg=expected)

    def checked(result):
        expect(question()).to_have_attribute("data-result", result)
        expect(question().locator(".model-answer")).to_be_visible()
        expect(question().locator(".check-button")).to_be_disabled()
        expect(question().locator(".model-answer > strong")).to_have_text(
            "Risposta:" if language == "it" else "Answer:")

    def text_answer(value=None):
        q = question()
        expected = json.loads(q.get_attribute("data-answers"))[0]
        q.locator("input[type=text]").fill(expected if value is None else value)
        usable(q.locator(".check-button"))
        q.locator(".check-button").click()

    def card_contrast(selector, name):
        locator = page.locator(".guided-card-host " + selector)
        expect(locator).to_be_visible()
        colours = locator.evaluate("""e => {
          const backgrounds=[]; for(let node=e;node;node=node.parentElement)
            backgrounds.push(getComputedStyle(node).backgroundColor);
          return {foreground:getComputedStyle(e).color,backgrounds};
        }""")
        ratio = contrast(colours)
        assert ratio >= 4.5, (name, theme, ratio, colours)
        case.setdefault("flashcard_contrast", {})[name] = round(ratio, 2)

    try:
        # Real L7 catalogue and card renderer, including recall scheduling.
        goto("/study/study-sheets.html?mode=learn&lesson=L7")
        page.wait_for_selector("[data-library-ready]")
        expect(page.locator("[data-library-topic='l7-core-verbs']")).to_be_visible()
        overflow("L7 lesson catalogue")
        case["checks"].append("L7 lesson catalogue")
        goto("/?page=card&lesson=L7&mode=learn")
        page.wait_for_selector("[data-guide-flip]")
        card = page.locator(".guided-card-host .review-card")
        first = card.get_attribute("data-key")
        assert first and first.startswith("italian-l7-"), first
        expect(card).to_have_attribute("data-lesson", "L7")
        card_contrast(".recall-side .focus", "front")
        usable(page.locator("[data-guide-flip]"))
        overflow("L7 card front")
        screenshot("card-front")
        page.locator("[data-guide-flip]").click()
        expect(card).to_have_class(re.compile(r"\bshow-answer\b"))
        page.wait_for_timeout(450)  # Finish the existing card-flip transition.
        card_contrast(".answer-side .italian", "answer")
        expect(page.locator("[data-guide-rate]")).to_have_count(3)
        for rating in ("again", "unsure", "known"):
            usable(page.locator(f"[data-guide-rate={rating}]"))
        overflow("L7 card answer")
        screenshot("card-answer")
        page.locator("[data-guide-rate=again]").click()
        expect(card).not_to_have_attribute("data-key", first)
        page.locator("[data-guide-flip]").click()
        page.wait_for_timeout(450)
        page.locator("[data-guide-rate=known]").click()
        expect(card).to_have_attribute("data-key", first)
        case["checks"].append("L7 flip, grading, Again return and front/answer contrast")

        # Explicit check/Next gate; auto advance once, pause, wrong and skip paths.
        visit("l7-class-lavorare")
        assert index() == 0
        expect(page.locator("[data-guided-action=next]")).to_be_disabled()
        expect(question().locator(".check-button")).to_be_disabled()
        expect(question().locator(".model-answer")).to_be_hidden()
        question().locator("input[type=text]").fill("lavoro")
        expect(page.locator("[data-guided-action=next]")).to_be_disabled()
        page.keyboard.press("Alt+ArrowRight")
        assert index() == 0, "Keyboard Next bypassed an unchecked answer"
        text_answer()
        checked("correct")
        expect(question().locator(".question-support-english").last).to_contain_text("I work")
        expect(question().locator(".question-support-pron").last).to_be_visible()
        if width == 1280:
            page.wait_for_function("ItalianGuidedStudy.getState().question === 1", timeout=8000)
        else:
            pause()
            next_question(1)
        text_answer("zzzz")
        checked("wrong")
        # The first click while counting down pauses, and must not discard feedback.
        page.locator("[data-guided-action=next]").click()
        assert index() == 1, "First countdown click must pause"
        expect(page.locator(".flow-countdown-help")).to_have_text("")
        if width == 1280:
            page.wait_for_timeout(5300)
            assert index() == 1, "Paused countdown still advanced"
        next_question(2)
        page.locator("[data-flow-skip]").click()
        checked("skipped")
        pause()
        for selector in ("[data-guided-action=back]", "[data-guided-action=next]", "[data-flow-skip]"):
            usable(page.locator(selector), allow_disabled=selector == "[data-flow-skip]")
        overflow("L7 checked/skipped answer and bottom controls")
        screenshot("study-feedback")
        next_question(3)
        expect(question().locator(".model-answer")).to_be_hidden()
        expect(page.locator("[data-guided-action=next]")).to_be_disabled()
        case["checks"].append("correct, wrong, skip, Next gate and countdown pause")
        if width == 1280:
            case["checks"].append("five-second auto advance and paused timer expiry")

        # A single real matching screen, with all five independently chosen pairs.
        visit("l7-homework-matching")
        q = question()
        expect(q).to_have_attribute("data-type", "match")
        selects = q.locator("select[data-match-select]")
        expect(selects).to_have_count(5)
        values = json.loads(q.get_attribute("data-match-model"))
        selects.nth(0).select_option(values[0])
        expect(q.locator(".check-button")).to_be_disabled()
        expect(page.locator("[data-guided-action=next]")).to_be_disabled()
        for i, value in enumerate(values):
            usable(selects.nth(i))
            selects.nth(i).select_option(value)
        usable(q.locator(".check-button"))
        q.locator(".check-button").click()
        checked("correct")
        pause()
        expect(q.locator(".practice-match-key p")).to_have_count(5)
        for word in ("lavorare", "dormire", "parlare", "leggere", "mangiare"):
            expect(q.locator(".practice-match-key")).to_contain_text(word)
        assert '["0"' not in q.locator(".model-answer").inner_text(), "Raw matching JSON shown"
        overflow("five-pair matching")
        screenshot("matching")
        case["checks"].append("five matching pairs, partial-answer gate and readable answer key")

        visit("l7-homework-choices")
        q = question()
        radios = q.locator("input[type=radio]")
        expect(radios).to_have_count(6)
        assert len(set(radios.evaluate_all("els => els.map(e=>e.value)"))) == 6
        for choice in q.locator("label.choice").all():
            usable(choice)
        expected = json.loads(q.get_attribute("data-answers"))[0]
        next(r for r in radios.all() if r.input_value() == expected).check()
        expect(page.locator("[data-guided-action=next]")).to_be_disabled()
        q.locator(".check-button").click()
        checked("correct")
        pause()
        overflow("six-choice MCQ")
        screenshot("six-choices")
        case["checks"].append("six distinct visible MCQ choices and check-before-Next")

        # Reference layouts are semantic bullet groups/grids (and tables if present).
        # Inspect every Learn/Examples panel in representative new reference sets.
        reference_panels = 0
        for slug in ("l7-class-studiare", "l7-families", "l7-stress-spelling"):
            visit(slug, "learn")
            for stage in ("learn", "examples"):
                page.locator(f"[data-guided-step={stage}]").click()
                sections = [s for s in SHEETS[slug]["study_sections"] if s["stage"] == stage]
                for i, section in enumerate(sections):
                    panel = page.locator(f"section.panel[data-study-stage={stage}]:not([hidden])")
                    expect(panel).to_have_count(1)
                    expect(panel.locator("h2")).to_contain_text(
                        section.get("titleIt", section["title"]) if language == "it" else section["title"])
                    assert panel.inner_text().strip(), (slug, stage, i)
                    expect(page.locator("html")).to_have_attribute("data-ui-language", language)
                    # UI labels intentionally show one language. Teaching examples
                    # outside those paired labels retain their Italian and English.
                    expect(panel.locator(f"[lang={language}]:visible").first).to_be_visible()
                    for code in ("it", "en"):
                        expect(panel.locator(f"[lang={code}]").first).to_be_attached()
                        examples = panel.locator(
                            f".bullets [lang={code}]:not(.editorial-label-main):not(.editorial-label-sub)")
                        if examples.count():
                            expect(examples.first).to_be_visible()
                        label = panel.locator(f".bullets .editorial-label > [lang={code}]")
                        if label.count():
                            if code == language:
                                expect(label.first).to_be_visible()
                            else:
                                expect(label.first).to_be_hidden()
                    usable(page.locator("[data-guided-action=next]"))
                    overflow(f"{slug} {stage} reference {i + 1}")
                    reference_panels += 1
                    if i == 0 and slug == "l7-class-studiare":
                        panel.scroll_into_view_if_needed()
                        screenshot("reference-" + stage)
                    if i + 1 < len(sections):
                        page.locator("[data-guided-action=next]").click()
        case["reference_panels"] = reference_panels
        case["checks"].append("Learn/Examples reference layouts and bilingual teaching support")

        visit("l6-recap-useful-requests", topic="questions")
        expect(page.locator(".quiz-question")).to_have_count(12)
        q = question()
        expect(q.locator(".question-heading [lang=en]")).to_have_count(1)
        expect(q.locator(".question-heading [lang=it]")).to_have_count(1)
        # Natural quoted wording observed during production review must be accepted.
        text_answer('Che cosa significa "letto"?')
        checked("correct")
        pause()
        expect(q.locator(".model-answer")).to_contain_text("Che cosa significa letto?")
        overflow("L6 recap")
        screenshot("lesson6-recap")
        related = page.locator("[data-related-flashcards]")
        target = parse_qs(urlparse(related.get_attribute("href")).query)
        assert target.get("lesson") == ["L6"], target
        assert target.get("topic") == ["Question words and useful phrases"], target
        usable(related)
        related.click()
        page.wait_for_selector(".guided-card-host .review-card")
        expect(page.locator(".guided-card-host .review-card")).to_have_attribute(
            "data-deck", "Question words and useful phrases")
        case["checks"].append("L6 12-question recap, quoted meaning question and actual related-card destination")
        assert not errors, errors
        case["status"] = "pass"
    except Exception as error:
        case["status"] = "fail"
        case["error"] = str(error)
        case["url"] = page.url
        try:
            screenshot("failure")
        except Exception as screenshot_error:
            case["screenshot_error"] = str(screenshot_error)
    finally:
        case["page_errors"] = errors
        context.close()
    return case


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", help="Verify and test the exact deployed Lesson 7 build")
    parser.add_argument("--base-url", help="Override the server URL, for example a deploy preview")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    server = None
    base = (args.base_url or (PRODUCTION if args.live else "")).rstrip("/")
    report = {"status": "running", "environment": "production" if args.live else "repository",
              "cases": [], "progress_isolation": "fresh temporary browser contexts; external logging blocked"}
    content = (ROOT / "lesson7/content.js").read_bytes()
    report["content_sha256"] = hashlib.sha256(content).hexdigest()
    try:
        if not base:
            server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Quiet, directory=str(ROOT)))
            Thread(target=server.serve_forever, daemon=True).start()
            base = f"http://127.0.0.1:{server.server_port}"
        report["base_url"] = base
        with sync_playwright() as playwright:
            if args.live:
                request = playwright.request.new_context()
                try:
                    response = request.get(base + "/lesson7/content.js?verify=" + report["content_sha256"], timeout=30000)
                    assert response.ok and response.body() == content, "Served Lesson 7 content.js differs from this checkout"
                    report["served_content_exact"] = True
                finally:
                    request.dispose()
            executable = shutil.which("google-chrome") or shutil.which("chromium")
            report["browser"] = executable or "Playwright Chromium"
            browser = playwright.chromium.launch(executable_path=executable, headless=True, args=["--no-sandbox"])
            try:
                for width, height, language, theme in ((320, 740, "en", "light"), (390, 844, "en", "light"),
                                                       (1280, 900, "en", "light"), (390, 844, "it", "dark")):
                    case = run_case(browser, base, width, height, language, theme, args.live)
                    report["cases"].append(case)
                    print(f"{case['status'].upper()}: {width}px {language}/{theme}", flush=True)
                report["status"] = "pass" if all(c["status"] == "pass" for c in report["cases"]) else "fail"
            finally:
                browser.close()
    except Exception as error:
        report["status"] = "fail"
        report["error"] = str(error)
    finally:
        if server:
            server.shutdown()
            server.server_close()
        target = OUT / ("live-results.json" if args.live else "results.json")
        target.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
        print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
