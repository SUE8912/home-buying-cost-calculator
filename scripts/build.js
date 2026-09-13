import { cpSync, mkdirSync, rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/src', { recursive: true });
cpSync('index.html', 'dist/index.html');
cpSync('src/app.js', 'dist/src/app.js');
cpSync('src/calculator.js', 'dist/src/calculator.js');
cpSync('src/ui-state.js', 'dist/src/ui-state.js');
cpSync('src/style.css', 'dist/src/style.css');
console.log('Static production files written to dist/.');
