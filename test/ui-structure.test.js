import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const build = readFileSync(new URL('../scripts/build.js', import.meta.url), 'utf8');

test('initial results use an empty state with calculated content hidden', () => {
  assert.match(html, /id="result-empty"/);
  assert.match(html, /id="calculated-results" hidden/);
  assert.doesNotMatch(html, /<strong id="hero-price">7억원<\/strong>/);
  assert.doesNotMatch(html, /<h3 id="extra-summary">약 1,451만원/);
  assert.doesNotMatch(app, /\nrender\(\);\s*$/);
});

test('render reveals results and retains detail panel wiring', () => {
  assert.match(app, /\$\('#result-empty'\)\.hidden = true/);
  assert.match(app, /\$\('#calculated-results'\)\.hidden = false/);
  assert.match(app, /openDetail\(b\.dataset\.detail\)/);
  assert.match(html, /<details class="settings">/);
});

test('production build includes every JavaScript module imported by the app', () => {
  assert.match(build, /cpSync\('src\/interaction\.js', 'dist\/src\/interaction\.js'\)/);
});
