#!/usr/bin/env node
'use strict';

// Zero-dependency contrast checks for Italian Editorial light/dark palettes.
// Run: node scripts/validate_theme_contrast.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const studyCSS = read('study/study-editorial-v1.css');
const guidedCSS = read('editorial-theme-v1.css');
const studyHTML = read('study/study-sheets.html');

function extractTokens(css, pattern, name) {
  const match = css.match(pattern);
  assert.ok(match, 'Missing ' + name + ' colour palette');
  const pairs = [...match[1].matchAll(/--([\w-]+)\s*:\s*(#[\da-fA-F]{6})/g)]
    .map(([, key, value]) => [key, value]);
  return Object.fromEntries(pairs);
}
function luminance(hex) {
  const channels = [1, 3, 5].map(offset => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function ratio(foreground, background) {
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
let checks = 0;
function check(tokens, label, foreground, background) {
  const fg = tokens[foreground], bg = tokens[background];
  assert.ok(fg && bg, 'Undefined theme token in ' + label + ': ' + foreground + '/' + background);
  const value = ratio(fg, bg);
  assert.ok(value >= 4.5, label + ' (' + foreground + ' on ' + background + ') failed WCAG AA: ' + value.toFixed(2) + ':1');
  checks++;
  console.log('PASS ' + label + ' ' + foreground + '/' + background + ': ' + value.toFixed(2) + ':1');
}
for (const mode of ['light', 'dark']) {
  const palette = extractTokens(
    studyCSS,
    new RegExp('html\\[data-italian-theme="' + mode + '"\\]\\s*\\{([^}]+)\\}'),
    'study ' + mode
  );
  for (const surface of ['paper', 'paper2']) {
    for (const foreground of ['ink', 'correct', 'wrong']) {
      check(palette, 'study ' + mode, foreground, surface);
    }
  }
  check(palette, 'study ' + mode, 'muted', 'paper');
  check(palette, 'study ' + mode, 'mint', 'paper');
  check(palette, 'study ' + mode, 'pink', 'paper');
}
const guidedModes = {
  dark: /body\.card\.guided-enabled,\s*body\.card\.guided-enabled\.nightMode,\s*body\.card\.guided-enabled\.night_mode\s*\{([^}]+)\}/,
  light: /body\.card\.guided-enabled:not\(\.nightMode\):not\(\.night_mode\)\s*\{([^}]+)\}/
};
for (const mode of ['light', 'dark']) {
  const palette = extractTokens(guidedCSS, guidedModes[mode], 'guided ' + mode);
  for (const [foreground, background] of [
    ['ink', 'paper'], ['muted', 'paper'], ['accent', 'paper'],
    ['green', 'paper'], ['primary-ink', 'primary']
  ]) {
    check(palette, 'guided ' + mode, foreground, background);
  }
}
assert.match(studyHTML, /class="quiz-status quiz-status-correct"/, 'Missing theme-aware success class');
assert.match(studyHTML, /class="quiz-status quiz-status-wrong"/, 'Missing theme-aware error class');
assert.doesNotMatch(studyHTML, /style="color:#(?:65c992|ef777f)"/i, 'Old fixed-colour statuses remain');
assert.match(studyCSS, /\.quiz-status-correct\s*\{color:var\(--correct\)\}/);
assert.match(studyCSS, /\.quiz-status-wrong\s*\{color:var\(--wrong\)\}/);
console.log('PASS semantic labels use theme colours');
console.log(checks + ' contrast combinations passed WCAG AA (4.5:1).');
