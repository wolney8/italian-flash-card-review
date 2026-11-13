#!/usr/bin/env python3
"""Focused Chromium checks for answer reveal, visible countdown and comparison time.

Requires playwright==1.57.0 and its official Chromium installation.
Run locally, use --base-url for a deploy preview, or --live to require exact
production asset bytes before testing. Each case uses an isolated browser context.
"""

import argparse
import hashlib
import json
import re
import sys
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlencode, urlparse

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts/answer-review"
PRODUCTION = "https://italian-flash-card-review.netlify.app"
ASSETS = ("learning-controls-v2.js", "learning-controls-v2.css",
          "study/guided-sheet-pilot-v1.js", "study/study-sheets.html")
ANIMATIONS = ("flow-answer-reveal", "flow-question-enter")


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def verify_deployed(request, base):
    expected = {name: (ROOT / name).read_bytes() for name in ASSETS}
    deadline = time.monotonic() + 120
    mismatch = list(expected)
    while mismatch:
        mismatch = []
        for name, content in expected.items():
            digest = hashlib.sha256(content).hexdigest()
            response = request.get(base + "/" + name + "?verify=" + digest, timeout=30000)
            if not response.ok or response.body() != content:
                mismatch.append(name)
        if not mismatch:
            return {name: hashlib.sha256(content).hexdigest() for name, content in expected.items()}
        assert time.monotonic() < deadline, "Deployed assets differ from checkout: " + ", ".join(mismatch)
        time.sleep(2)


def run_case(browser, base, width, height, language, theme, reduced, live):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        has_touch=width < 600, is_mobile=width < 600,
        reduced_motion="reduce" if reduced else "no-preference",
        service_workers="block",
    )
    origin = urlparse(base).netloc
    context.route("**/*", lambda route: route.continue_()
                  if urlparse(route.request.url).netloc == origin else route.abort())
    # Do not reset the auto preference here: the reload check must test persistence.
    context.add_init_script("""if(window === top) {
      localStorage.setItem('italianCourseLanguageV1', %s);
      localStorage.setItem('italianCourseThemeV1', %s);
      window.__answerReviewAnimations = [];
      document.addEventListener('animationstart', event => {
        if(['flow-answer-reveal','flow-question-enter'].includes(event.animationName))
          window.__answerReviewAnimations.push(event.animationName);
      });
    }""" % (json.dumps(language), json.dumps(theme)))
    page = context.new_page()
    page.set_default_timeout(12000)
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    case = {"width": width, "height": height, "language": language, "theme": theme,
            "reduced_motion": reduced, "checks": [], "screenshots": [], "status": "running"}
    prefix = ("live-" if live else "") + f"{width}-{language}-{theme}" + ("-reduced" if reduced else "")

    def screenshot(name):
        filename = prefix + "-" + name + ".png"
        page.screenshot(path=str(OUT / filename), full_page=False)
        case["screenshots"].append(filename)

    def question():
        current = page.locator(".quiz-question:not([hidden])")
        expect(current).to_have_count(1)
        return current

    def index():
        return page.evaluate("ItalianGuidedStudy.getState().question")

    def countdown():
        return page.locator(".flow-countdown")

    def timer_state(state):
        expect(countdown()).to_have_attribute("data-flow-countdown-state", state)

    def remaining():
        return float(countdown().get_attribute("data-flow-countdown-remaining-ms"))

    def geometry(locator, check_hit=False):
        expect(locator).to_be_visible()
        data = locator.evaluate("""element => {
          const rect=element.getBoundingClientRect(), v=visualViewport;
          const x=rect.x+rect.width/2, y=rect.y+rect.height/2;
          return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
            width:rect.width,height:rect.height,viewportWidth:innerWidth,
            viewportTop:v?v.offsetTop:0,viewportBottom:v?v.height+v.offsetTop:innerHeight,
            clear:element.contains(document.elementFromPoint(x,y))};
        }""")
        assert data["left"] >= -1 and data["right"] <= data["viewportWidth"] + 1, data
        assert data["top"] >= data["viewportTop"] - 1 and data["bottom"] <= data["viewportBottom"] + 1, data
        assert data["width"] > 0 and data["height"] > 0, data
        if check_hit:
            assert data["clear"], data
        return data

    def native_activate(locator, allow_scroll=False):
        expect(locator).to_be_enabled()
        if allow_scroll:
            locator.scroll_into_view_if_needed()
        data = geometry(locator, check_hit=True)
        x, y = (data["left"] + data["right"]) / 2, (data["top"] + data["bottom"]) / 2
        if width < 600:
            page.touchscreen.tap(x, y)
        else:
            page.mouse.move(x, y)
            page.mouse.down()
            page.wait_for_timeout(35)
            page.mouse.up()

    def controls():
        geometry(countdown())
        geometry(page.locator(".flow-countdown-label"))
        assert page.locator(".flow-countdown-label").inner_text().strip()
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2")
        for selector in ("[data-guided-action=back]", "[data-guided-action=next]", "[data-flow-skip]"):
            geometry(page.locator(selector), check_hit=True)
        if countdown().get_attribute("data-flow-countdown-state") in ("running", "paused"):
            geometry(page.locator(".flow-countdown-track"))
            button = page.locator("[data-flow-countdown-toggle]")
            data = geometry(button, check_hit=True)
            assert data["height"] >= 40, data
            assert button.inner_text().strip(), "Timer control needs a visible label"

    def visit(slug):
        query = urlencode({"lesson": "L7", "sheet": slug, "set": slug, "stage": "practise"})
        response = page.goto(base + "/study/study-sheets.html?" + query, wait_until="networkidle", timeout=60000)
        assert response and response.ok
        page.wait_for_selector(".study-pack-sheet[data-guided-pilot=ready]")
        page.wait_for_selector(".flow-countdown", state="attached")

    def visible_answer(result, value=None):
        current = question()
        expect(current).to_have_attribute("data-result", result)
        expect(current.locator(".model-answer")).to_be_visible()
        expect(current.locator(".check-button")).to_be_disabled()
        if value is not None:
            expect(current.locator("input[type=text]")).to_have_value(value)
        # Inspect the model text itself, not just a full-page screenshot or display:none.
        # The fixed dock must not cover the first answer line after the reveal settles.
        page.wait_for_function("""() => {
          const q=document.querySelector('.quiz-question:not([hidden])');
          const answer=q?.querySelector('.model-answer'), dock=document.querySelector('.flow-bottom-dock');
          if(!answer || answer.hidden || !dock)return false;
          const label=answer.querySelector('strong'), text=[...answer.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
          let rect;
          if(text){const range=document.createRange();range.selectNodeContents(text);rect=range.getBoundingClientRect();}
          else rect=answer.querySelector('.practice-match-key p')?.getBoundingClientRect();
          const heading=label?.getBoundingClientRect(), top=visualViewport?.offsetTop||0, bottom=dock.getBoundingClientRect().top;
          return !!rect&&!!heading&&heading.top>=top-1&&rect.top>=top-1&&rect.bottom<=bottom-4;
        }""", timeout=3000)
        if reduced:
            active = page.evaluate("""() => document.getAnimations().filter(animation =>
              ['flow-answer-reveal','flow-question-enter'].includes(animation.animationName)
              && animation.playState !== 'finished').map(animation=>animation.animationName)""")
            assert not active, ("Reduced motion must disable reveal/navigation animations", active)
        controls()

    def text_answer(value=None):
        current = question()
        if value is None:
            value = json.loads(current.get_attribute("data-answers"))[0]
        current.locator("input[type=text]").fill(value)
        native_activate(current.locator(".check-button"), allow_scroll=True)
        return value

    def next_question(expected):
        animations_before = page.evaluate("window.__answerReviewAnimations.filter(name=>name==='flow-question-enter').length")
        native_activate(page.locator("[data-guided-action=next]"))
        page.wait_for_function("n=>ItalianGuidedStudy.getState().question===n", arg=expected)
        expect(question().locator(".model-answer")).to_be_hidden()
        expect(page.locator("[data-guided-action=next]")).to_be_disabled()
        if not reduced:
            page.wait_for_function("n=>window.__answerReviewAnimations.filter(name=>name==='flow-question-enter').length>n", arg=animations_before)

    def auto_setting(enabled):
        settings = page.locator(".flow-settings")
        if settings.get_attribute("open") is None:
            settings.locator("summary").click()
        checkbox = page.locator("[data-flow-auto]")
        checkbox.set_checked(enabled)
        expect(checkbox).to_be_checked(checked=enabled)
        settings.locator("summary").click()

    try:
        visit("l7-class-lavorare")
        assert index() == 0
        expect(page.locator("[data-flow-auto]")).to_be_checked()
        expect(page.locator("[data-guided-action=next]")).to_be_disabled()
        original_key = question().get_attribute("data-progress-key")
        text_answer("zzzz")
        timer_state("running")
        visible_answer("wrong", "zzzz")
        expect(question().locator(".model-answer")).to_contain_text("lavoro")
        page.wait_for_function("Number(document.querySelector('.flow-countdown').dataset.flowCountdownRemaining)<=4")
        assert 0 < remaining() < 5000
        seconds = countdown().get_attribute("data-flow-countdown-remaining")
        assert seconds in re.findall(r"\d+", page.locator(".flow-countdown-label").inner_text()), "Visible countdown is not showing its remaining seconds"
        screenshot("countdown-running")
        running_label = page.locator("[data-flow-countdown-toggle]").inner_text()
        held_press = width == 1280 and language == "en" and not reduced
        if held_press:
            # Freeze at press-start, even if mouseup arrives after the old deadline.
            # Reuse the comparison hold below rather than adding another long wait.
            data = geometry(page.locator("[data-flow-countdown-toggle]"), check_hit=True)
            page.mouse.move((data["left"] + data["right"]) / 2, (data["top"] + data["bottom"]) / 2)
            page.mouse.down()
        else:
            native_activate(page.locator("[data-flow-countdown-toggle]"))
        timer_state("paused")
        paused_ms = remaining()
        assert 0 < paused_ms < 5000
        assert page.locator("[data-flow-countdown-toggle]").inner_text() != running_label
        page.wait_for_timeout(5300)
        timer_state("paused")
        assert remaining() == paused_ms, "Paused remaining time changed"
        assert index() == 0 and question().get_attribute("data-progress-key") == original_key
        if held_press:
            page.mouse.up()
            timer_state("paused")
            assert remaining() == paused_ms, "Releasing a held Pause press resumed the timer"
            assert index() == 0 and question().get_attribute("data-progress-key") == original_key
            case["checks"].append("held native Pause press freezes before the deadline and remains paused on release")
        visible_answer("wrong", "zzzz")
        screenshot("comparison-paused")
        case["checks"].append("native mouse/touch Pause retains wrong answer and remaining time beyond five seconds")

        toggle = page.locator("[data-flow-countdown-toggle]")
        toggle.focus()
        page.keyboard.press("Enter")
        timer_state("running")
        assert 0 < remaining() <= paused_ms + 5, "Resume restarted the five-second countdown"
        next_question(1)  # Must advance on this one real click, even while running.
        case["checks"].append("keyboard Resume preserves remaining time; one native Next advances immediately")

        answer = text_answer()
        timer_state("running")
        visible_answer("correct", answer)
        page.wait_for_function("ItalianGuidedStudy.getState().question===2", timeout=8000)
        expect(question().locator(".model-answer")).to_be_hidden()
        expect(page.locator("[data-guided-action=next]")).to_be_disabled()
        case["checks"].append("normal five-second auto advance moves exactly once")

        native_activate(page.locator("[data-flow-skip]"))
        timer_state("running")
        visible_answer("skipped")
        page.keyboard.press("Escape")
        timer_state("paused")
        assert index() == 2
        next_question(3)
        case["checks"].append("Skip reveals the model and Escape pauses without altering the question")

        observed = page.evaluate("window.__answerReviewAnimations")
        if reduced:
            assert not observed, ("Reduced motion still fired review animations", observed)
        else:
            assert all(name in observed for name in ANIMATIONS), ("Expected gentle reveal and next-question animations", observed)
        case["animation_events"] = observed

        # The persistent five-second preference remains user-controlled.
        auto_setting(False)
        answer = text_answer()
        timer_state("manual")
        visible_answer("correct", answer)
        page.wait_for_timeout(5300)
        assert index() == 3
        timer_state("manual")
        visible_answer("correct", answer)
        screenshot("manual-review")
        page.reload(wait_until="networkidle")
        page.wait_for_selector(".flow-countdown", state="attached")
        expect(page.locator("[data-flow-auto]")).not_to_be_checked()
        assert index() == 3
        timer_state("manual")
        expect(question().locator("input[type=text]")).to_have_value(answer)
        expect(question().locator(".model-answer")).to_be_visible()
        case["checks"].append("auto-off manual review never advances; preference and checked answer survive reload")

        # The final question must finish the round without leaving a live timer.
        next_question(4)
        text_answer()
        timer_state("manual")
        next_question(5)
        text_answer()
        timer_state("manual")
        native_activate(page.locator("[data-guided-action=next]"))
        expect(page.locator(".guided-sheet-finish")).to_be_visible()
        assert page.evaluate("ItalianGuidedStudy.getState().finished")
        assert countdown().get_attribute("data-flow-countdown-state") != "running"
        case["checks"].append("final question enters the summary without a stale countdown")

        # One compact long-answer case covers the extra support content and scrolling.
        if width == 390 and language == "en":
            visit("l7-homework-matching")
            current = question()
            expected = json.loads(current.get_attribute("data-match-model"))
            for select, value in zip(current.locator("[data-match-select]").all(), expected):
                select.select_option(value)
            native_activate(current.locator(".check-button"), allow_scroll=True)
            timer_state("manual")
            visible_answer("correct")
            expect(current.locator(".practice-match-key p")).to_have_count(5)
            screenshot("long-answer-review")
            case["checks"].append("long five-pair matching reveal clears the footer without hiding its first model line")

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
    parser.add_argument("--live", action="store_true", help="Require exact production review assets before testing")
    parser.add_argument("--base-url", help="Test a specified preview URL")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    server = None
    base = (args.base_url or (PRODUCTION if args.live else "")).rstrip("/")
    report = {"status": "running", "environment": "production" if args.live else "preview" if args.base_url else "repository",
              "cases": [], "browser": "Playwright official Chromium",
              "progress_isolation": "temporary contexts; external requests blocked",
              "asset_sha256": {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in ASSETS}}
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
                    report["served_assets_exact"] = verify_deployed(request, base)
                finally:
                    request.dispose()
            browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
            try:
                cases = [(width, height, language, theme, False)
                         for width, height in ((320, 740), (390, 844), (1280, 900))
                         for language, theme in (("en", "light"), ("it", "dark"))]
                cases.append((390, 844, "en", "light", True))
                for width, height, language, theme, reduced in cases:
                    case = run_case(browser, base, width, height, language, theme, reduced, args.live)
                    report["cases"].append(case)
                    print(f"{case['status'].upper()}: {width}px {language}/{theme} reduced_motion={reduced}", flush=True)
                report["status"] = "pass" if all(case["status"] == "pass" for case in report["cases"]) else "fail"
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
        target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
