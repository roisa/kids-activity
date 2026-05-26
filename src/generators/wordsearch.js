// Word Search worksheet: place N theme words randomly in a letter grid,
// fill empty cells with noise, list the words below. Difficulty (grid size,
// word count, allowed directions) scales by age.

import { getActivityRect, escapeXml } from '../templates/worksheet.js';
import { createRng, shuffle, pick } from '../utils/random.js';

const DIRS = {
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  SE: { dx: 1, dy: 1 },
};

const AGE_CONFIG = {
  '3-4': { size: 8, wordCount: 4, dirs: ['E', 'S'] },
  '5-6': { size: 10, wordCount: 6, dirs: ['E', 'S'] },
  '7-8': { size: 12, wordCount: 8, dirs: ['E', 'S', 'SE'] },
};

function fits(grid, word, dir, x, y, cols, rows) {
  const { dx, dy } = DIRS[dir];
  for (let i = 0; i < word.length; i++) {
    const cx = x + dx * i;
    const cy = y + dy * i;
    if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) return false;
    const existing = grid[cy][cx];
    if (existing && existing !== word[i]) return false;
  }
  return true;
}

function place(grid, word, dir, x, y) {
  const { dx, dy } = DIRS[dir];
  for (let i = 0; i < word.length; i++) {
    grid[y + dy * i][x + dx * i] = word[i];
  }
}

function tryPlaceWord(grid, word, dirs, cols, rows, rng) {
  for (let t = 0; t < 80; t++) {
    const dir = pick(dirs, rng);
    const x = Math.floor(rng() * cols);
    const y = Math.floor(rng() * rows);
    if (fits(grid, word, dir, x, y, cols, rows)) {
      place(grid, word, dir, x, y);
      return true;
    }
  }
  return false;
}

export function generate(options) {
  const { theme, age, seed } = options;
  const cfg = AGE_CONFIG[age.id] || AGE_CONFIG['5-6'];
  const rng = createRng(seed);

  // Sanitize: uppercase letters only, drop anything that won't fit.
  const valid = theme.words
    .map((w) => w.replace(/[^A-Z]/gi, '').toUpperCase())
    .filter((w) => w.length >= 3 && w.length <= cfg.size);

  const wordsToHide = shuffle(valid, rng).slice(0, cfg.wordCount);

  const cols = cfg.size;
  const rows = cfg.size;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

  const placed = [];
  for (const w of wordsToHide) {
    if (tryPlaceWord(grid, w, cfg.dirs, cols, rows, rng)) placed.push(w);
  }

  // Fill empties with noise letters (deterministic from rng).
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) grid[y][x] = A[Math.floor(rng() * 26)];
    }
  }

  // Render
  const rect = getActivityRect();
  let body = '';
  const wordListH = 30;
  const cellSize = Math.min(
    (rect.width - 4) / cols,
    (rect.height - wordListH - 4) / rows,
  );
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;
  const ox = rect.x + (rect.width - gridW) / 2;
  const oy = rect.y + 4;

  body += `<rect x="${ox}" y="${oy}" width="${gridW}" height="${gridH}" fill="white" stroke="${theme.palette[0]}" stroke-width="0.6"/>`;
  for (let i = 1; i < cols; i++) {
    const x = ox + i * cellSize;
    body += `<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + gridH}" stroke="#cfd4e6" stroke-width="0.2"/>`;
  }
  for (let i = 1; i < rows; i++) {
    const y = oy + i * cellSize;
    body += `<line x1="${ox}" y1="${y}" x2="${ox + gridW}" y2="${y}" stroke="#cfd4e6" stroke-width="0.2"/>`;
  }

  const fontSize = cellSize * 0.55;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cx = ox + x * cellSize + cellSize / 2;
      const cy = oy + y * cellSize + cellSize / 2 + fontSize * 0.32;
      body += `<text x="${cx}" y="${cy}" font-size="${fontSize}" font-weight="600" fill="#1b1f3a" text-anchor="middle">${escapeXml(grid[y][x])}</text>`;
    }
  }

  // Word list — two columns
  const listY = oy + gridH + 8;
  body += `<text x="${rect.x}" y="${listY}" font-size="4" fill="${theme.palette[0]}" font-weight="700">FIND THESE WORDS</text>`;
  const wordsPerCol = Math.ceil(placed.length / 2);
  const colWidth = rect.width / 2;
  placed.forEach((w, i) => {
    const col = Math.floor(i / wordsPerCol);
    const row = i % wordsPerCol;
    const x = rect.x + col * colWidth + 4;
    const y = listY + 6 + row * 5;
    body += `<text x="${x}" y="${y}" font-size="4" font-weight="500" fill="#1b1f3a">☐  ${escapeXml(w)}</text>`;
  });

  return {
    title: `${theme.label} Word Search`,
    instructions: `Find and circle ${placed.length} hidden ${theme.label.toLowerCase()} words in the grid.`,
    body,
    accent: theme.palette[0],
  };
}
