// Simple Puzzle worksheet: a "cut & paste" jigsaw. We draw a large themed
// picture frame split into an NxN grid; below it, the same N*N pieces are
// scrambled and labeled. The child cuts the bottom row out and arranges the
// pieces in the empty grid above.

import { getActivityRect } from '../templates/worksheet.js';
import { createRng, shuffle } from '../utils/random.js';

export function generate(options) {
  const { theme, age, seed } = options;
  const rng = createRng(seed);
  const pieces = age.difficulty.puzzlePieces; // 4, 6, or 9
  const grid = pieces === 4 ? 2 : pieces === 6 ? 3 : 3; // 2x2, 3x2, 3x3
  const cols = grid;
  const rows = pieces === 6 ? 2 : grid;

  const rect = getActivityRect();
  let body = '';

  // Layout: top half = empty target grid, bottom half = scrambled pieces row.
  const targetH = rect.height * 0.55;
  const scrambleY = rect.y + targetH + 8;
  const scrambleH = rect.height - targetH - 12;

  // Target frame
  const cellW = rect.width / cols;
  const cellH = targetH / rows;
  body += `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${targetH}" fill="white" stroke="${theme.palette[0]}" stroke-width="0.6" stroke-dasharray="2 2" rx="2"/>`;
  body += `<text x="${rect.x + 3}" y="${rect.y - 1}" font-size="3.6" fill="#5b6079">Place the pieces in the empty frame ↓</text>`;

  // Draw faint grid lines
  for (let c = 1; c < cols; c++) {
    const x = rect.x + c * cellW;
    body += `<line x1="${x}" y1="${rect.y}" x2="${x}" y2="${rect.y + targetH}" stroke="#cfd4e6" stroke-width="0.3"/>`;
  }
  for (let r = 1; r < rows; r++) {
    const y = rect.y + r * cellH;
    body += `<line x1="${rect.x}" y1="${y}" x2="${rect.x + rect.width}" y2="${y}" stroke="#cfd4e6" stroke-width="0.3"/>`;
  }
  // Number each target cell faintly so kids/teachers can self-check
  let n = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = rect.x + c * cellW + 2.5;
      const cy = rect.y + r * cellH + 4.5;
      body += `<text x="${cx}" y="${cy}" font-size="3" fill="#bfc4dc" font-weight="600">${n}</text>`;
      n++;
    }
  }

  // Scrambled pieces: build a numbered ordering of pieces and shuffle them.
  const order = shuffle(
    Array.from({ length: cols * rows }, (_, i) => i),
    rng,
  );
  // Each regen picks a different subset of the theme's items so the same
  // 2x2 dinosaur puzzle doesn't always show the same first four animals.
  const pieceItems = shuffle(theme.items, rng).slice(0, cols * rows);
  const sCols = cols * rows; // single row of pieces below
  const sCellW = Math.min(scrambleH * 0.9, rect.width / sCols);
  const totalW = sCellW * sCols;
  const sx0 = rect.x + (rect.width - totalW) / 2;
  const sy0 = scrambleY;
  body += `<text x="${rect.x + 3}" y="${sy0 - 2}" font-size="3.6" fill="#5b6079">✂ Cut along the lines below.</text>`;

  // Each piece shows a themed emoji and a number badge.
  order.forEach((targetIndex, slot) => {
    const px = sx0 + slot * sCellW;
    const py = sy0;
    body += `<rect x="${px}" y="${py}" width="${sCellW}" height="${sCellW}" fill="white" stroke="#1b1f3a" stroke-width="0.4" stroke-dasharray="1 1"/>`;
    const item = pieceItems[targetIndex];
    body += `<text x="${px + sCellW / 2}" y="${py + sCellW * 0.6}" text-anchor="middle" font-size="${sCellW * 0.5}" font-family="Arial, Helvetica, sans-serif">${item.emoji}</text>`;
    // Number badge (matches the target cell number)
    const badgeR = Math.min(sCellW * 0.13, 2.4);
    body += `<circle cx="${px + sCellW - badgeR - 0.6}" cy="${py + badgeR + 0.6}" r="${badgeR}" fill="${theme.palette[0]}"/>`;
    body += `<text x="${px + sCellW - badgeR - 0.6}" y="${py + badgeR * 1.5}" text-anchor="middle" font-size="${badgeR * 1.3}" font-weight="700" fill="white">${targetIndex + 1}</text>`;
  });

  return {
    title: `${theme.label} Puzzle`,
    instructions: `Cut out the ${cols * rows} pieces below and paste each one onto its matching number in the frame above.`,
    body,
    accent: theme.palette[0],
  };
}
