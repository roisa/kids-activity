// Counting worksheet: groups of themed emojis with blanks for the count.
// 3-4: 1–5 emojis, simple "how many".
// 5-6: 1–10 emojis, same shape.
// 7-8: addition — two groups + blank.

import { getActivityRect } from '../templates/worksheet.js';
import { createRng, shuffle } from '../utils/random.js';

const AGE_CONFIG = {
  '3-4': { problems: 4, maxN: 5, addition: false },
  '5-6': { problems: 5, maxN: 10, addition: false },
  '7-8': { problems: 5, maxN: 8, addition: true },
};

export function generate(options) {
  const { theme, age, seed } = options;
  const cfg = AGE_CONFIG[age.id] || AGE_CONFIG['5-6'];
  const rng = createRng(seed);
  const items = shuffle(theme.items, rng).slice(0, cfg.problems);

  const rect = getActivityRect();
  let body = '';
  const rowH = (rect.height - 4) / cfg.problems;

  items.forEach((item, i) => {
    const y = rect.y + 4 + i * rowH;

    // Row number
    body += `<text x="${rect.x}" y="${y + rowH / 2 + 1}" font-size="4" fill="#5b6079" font-weight="700">${i + 1}.</text>`;

    if (cfg.addition) {
      // Two groups + "=" blank
      const n1 = 1 + Math.floor(rng() * (cfg.maxN - 1));
      const n2 = 1 + Math.floor(rng() * (cfg.maxN - 1));
      const emojiSize = Math.min(rowH * 0.42, 6.5);
      const totalEmojis = n1 + n2;
      const maxFit = Math.floor((rect.width - 30) / (emojiSize * 0.95));
      const eSize = totalEmojis <= maxFit ? emojiSize : emojiSize * (maxFit / totalEmojis);
      let x = rect.x + 6;
      const cy = y + rowH / 2 + eSize * 0.35;
      for (let k = 0; k < n1; k++) {
        body += `<text x="${x}" y="${cy}" font-size="${eSize}">${item.emoji}</text>`;
        x += eSize * 0.95;
      }
      x += 1.5;
      body += `<text x="${x}" y="${cy}" font-size="${eSize * 0.95}" font-weight="700" fill="#1b1f3a">+</text>`;
      x += eSize * 0.9;
      for (let k = 0; k < n2; k++) {
        body += `<text x="${x}" y="${cy}" font-size="${eSize}">${item.emoji}</text>`;
        x += eSize * 0.95;
      }
      body += `<text x="${rect.x + rect.width - 2}" y="${cy}" font-size="${eSize}" font-weight="700" fill="#1b1f3a" text-anchor="end">= ____</text>`;
    } else {
      // "Count the X" + blank
      const n = 1 + Math.floor(rng() * cfg.maxN);
      const boxX = rect.x + 6;
      const boxY = y + 2;
      const boxW = rect.width * 0.62;
      const boxH = rowH - 4;
      body += `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="2.5" fill="white" stroke="${theme.palette[0]}" stroke-width="0.5"/>`;
      const cols = Math.min(5, n);
      const rowsCount = Math.ceil(n / cols);
      const cellW = boxW / cols;
      const cellH = boxH / rowsCount;
      const eSize = Math.min(cellW * 0.7, cellH * 0.7, 9);
      for (let k = 0; k < n; k++) {
        const cx = boxX + (k % cols) * cellW + cellW / 2;
        const cy = boxY + Math.floor(k / cols) * cellH + cellH / 2 + eSize * 0.32;
        body += `<text x="${cx}" y="${cy}" font-size="${eSize}" text-anchor="middle">${item.emoji}</text>`;
      }
      body += `<text x="${rect.x + rect.width - 2}" y="${y + rowH / 2 + 2}" font-size="6" font-weight="700" fill="#1b1f3a" text-anchor="end">= ____</text>`;
    }
  });

  return {
    title: `${theme.label} Counting`,
    instructions: cfg.addition
      ? `Count each group, add them up, and write the total.`
      : `Count the ${theme.label.toLowerCase()} in each box and write the number on the line.`,
    body,
    accent: theme.palette[0],
  };
}
