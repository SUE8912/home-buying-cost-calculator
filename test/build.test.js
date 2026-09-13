import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

test('production build includes the interaction module imported by app.js', () => {
  const build = spawnSync(process.execPath, ['scripts/build.js'], { encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr);
  assert.equal(
    readFileSync('dist/src/interaction.js', 'utf8'),
    readFileSync('src/interaction.js', 'utf8')
  );
});

test('initial markup shows an empty state and keeps calculated results hidden', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /id="result-empty"/);
  assert.match(html, /id="result-content" hidden/);
});
