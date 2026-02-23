#!/usr/bin/env node

/**
 * Copies templates/ from the repo root into sdk/js/templates/
 * so they are included in the published npm package.
 *
 * Run automatically via the "prebuild" npm script.
 */

const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../../../templates');
const dest = path.resolve(__dirname, '../templates');

if (!fs.existsSync(src)) {
  console.error(`Source templates directory not found: ${src}`);
  process.exit(1);
}

// Clean destination first
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true });
}

fs.cpSync(src, dest, { recursive: true });

console.log(`Copied templates → ${dest}`);
