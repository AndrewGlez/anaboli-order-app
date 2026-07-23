#!/usr/bin/env node
// Post-export script: inject <meta name="theme-color"> into all HTML files in dist/
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const THEME_COLOR = '#0a7d4b';

const metaTag = `<meta name="theme-color" content="${THEME_COLOR}" />`;

function injectThemeColor(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      injectThemeColor(fullPath);
    } else if (file.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('theme-color')) {
        // Inject after <head>
        content = content.replace('<head>', `<head>${metaTag}`);
        fs.writeFileSync(fullPath, content);
        console.log(`  Injected theme-color into ${path.relative(DIST_DIR, fullPath)}`);
      }
    }
  }
}

console.log('Injecting theme-color meta tag into dist HTML files...');
injectThemeColor(DIST_DIR);
console.log('Done.');
