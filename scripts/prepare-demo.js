#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create docs directory
const docsDir = path.join(__dirname, '..', 'docs');
if (fs.existsSync(docsDir)) {
  fs.rmSync(docsDir, { recursive: true });
}
fs.mkdirSync(docsDir);

// Copy demo/index.html to docs/index.html
const demoHtml = fs.readFileSync(
  path.join(__dirname, '..', 'demo', 'index.html'),
  'utf8'
);

// Update the import path from ../dist to ./dist
const updatedHtml = demoHtml.replace(
  "import { chart2text } from '../dist/index.esm.js';",
  "import { chart2text } from './dist/index.esm.js';"
);

fs.writeFileSync(
  path.join(docsDir, 'index.html'),
  updatedHtml
);

// Copy dist directory to docs/dist
const distSrc = path.join(__dirname, '..', 'dist');
const distDest = path.join(docsDir, 'dist');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(distSrc, distDest);

// Create .nojekyll file to prevent GitHub Pages from processing files through Jekyll
fs.writeFileSync(
  path.join(docsDir, '.nojekyll'),
  ''
);

// Create a minimal .gitignore for gh-pages branch that doesn't ignore dist/
fs.writeFileSync(
  path.join(docsDir, '.gitignore'),
  '# Minimal gitignore for GitHub Pages deployment\n# Do NOT ignore dist/ - it\'s needed for the demo\nnode_modules/\n'
);

console.log('✅ Demo prepared in docs/ directory');
