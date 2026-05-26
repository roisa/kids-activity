#!/usr/bin/env node
// Optimize coloring SVGs in place. The biggest single win is reducing path-data
// precision: potrace emits 3–6 decimal places of coordinates inside a
// 768×768 viewBox, but at A4 print resolution (8 in / 768 units = ~28 dpi per
// unit) sub-pixel decimals are pure overhead.
//
// Run after generating fresh SVGs:
//   npm run optimize:coloring

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../src/assets/coloring');

function optimize(svg) {
  return (
    svg
      // Round all decimals inside path data (d="…") to 1 decimal place.
      // Other attributes (transforms, viewBox, etc.) are left untouched.
      .replace(/d="([^"]+)"/g, (m, dValue) => {
        const rounded = dValue.replace(/-?\d+\.\d+/g, (n) => {
          return (Math.round(parseFloat(n) * 10) / 10).toString();
        });
        return `d="${rounded}"`;
      })
      // Collapse whitespace between elements.
      .replace(/>\s+</g, '><')
      // Trim leading/trailing whitespace per line.
      .replace(/^\s+/gm, '')
      .replace(/\s+$/gm, '')
      // Drop empty newlines.
      .replace(/\n+/g, '\n')
      .trim()
  );
}

async function main() {
  const themes = await readdir(ROOT);
  let beforeTotal = 0;
  let afterTotal = 0;
  let count = 0;
  for (const theme of themes) {
    const dir = path.join(ROOT, theme);
    let st;
    try {
      st = await stat(dir);
    } catch {
      continue;
    }
    if (!st.isDirectory()) continue;
    const files = (await readdir(dir)).filter((f) => f.endsWith('.svg'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const original = await readFile(filePath, 'utf8');
      const optimized = optimize(original);
      beforeTotal += original.length;
      afterTotal += optimized.length;
      count++;
      await writeFile(filePath, optimized);
    }
  }
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  const pct = ((1 - afterTotal / beforeTotal) * 100).toFixed(1);
  console.log(`Files optimized: ${count}`);
  console.log(`Total before:    ${kb(beforeTotal)}`);
  console.log(`Total after:     ${kb(afterTotal)}`);
  console.log(`Saved:           ${pct}%`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
