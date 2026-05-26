// First Letter worksheet: show themed items; child writes the first letter
// of each item's name in the box. Younger ages get the rest of the word
// shown as a hint ("__PPLE"); older ages get just the picture.

import { getActivityRect, escapeXml } from '../templates/worksheet.js';
import { createRng, shuffle } from '../utils/random.js';

const AGE_CONFIG = {
  '3-4': { itemCount: 4, showHint: true },
  '5-6': { itemCount: 6, showHint: true },
  '7-8': { itemCount: 8, showHint: false },
};

// Strip "A · " style prefix from alphabet items so we get the real word.
function cleanName(name) {
  return name.replace(/^[A-Z]\s·\s/i, '');
}

export function generate(options) {
  const { theme, age, seed } = options;
  const cfg = AGE_CONFIG[age.id] || AGE_CONFIG['5-6'];
  const rng = createRng(seed);

  const items = shuffle(theme.items, rng)
    .map((it) => ({ emoji: it.emoji, name: cleanName(it.name) }))
    .filter((it) => /^[A-Z]/i.test(it.name))
    .slice(0, cfg.itemCount);

  const rect = getActivityRect();
  let body = '';

  const cols = 2;
  const rowsCount = Math.ceil(items.length / cols);
  const cellW = rect.width / cols;
  const cellH = (rect.height - 4) / rowsCount;

  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellX = rect.x + col * cellW;
    const cellY = rect.y + 4 + row * cellH;
    const padding = 5;
    const innerH = cellH - padding * 2;
    const midY = cellY + cellH / 2;

    // Emoji on the left.
    const emojiSize = Math.min(innerH * 0.6, 12);
    body += `<text x="${cellX + padding + emojiSize / 2}" y="${midY + emojiSize * 0.32}" font-size="${emojiSize}" text-anchor="middle">${item.emoji}</text>`;

    // Letter box.
    const boxSize = Math.min(innerH * 0.7, 13);
    const boxX = cellX + padding + emojiSize + 4;
    const boxY = midY - boxSize / 2;
    body += `<rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" rx="2" fill="white" stroke="${theme.palette[0]}" stroke-width="0.6"/>`;
    body += `<line x1="${boxX + 2}" y1="${boxY + boxSize - 2}" x2="${boxX + boxSize - 2}" y2="${boxY + boxSize - 2}" stroke="${theme.palette[0]}" stroke-width="0.3" stroke-dasharray="0.8 0.8"/>`;

    // Hint word "_PPLE".
    if (cfg.showHint) {
      const word = item.name.toUpperCase();
      const rest = word.slice(1);
      const hintX = boxX + boxSize + 4;
      body += `<text x="${hintX}" y="${midY + 1.5}" font-size="4.2" font-weight="600" fill="#1b1f3a" letter-spacing="0.5">__${escapeXml(rest)}</text>`;
    }
  });

  return {
    title: `${theme.label} First Letter`,
    instructions: cfg.showHint
      ? 'Look at each picture. Write the missing first letter in the box.'
      : 'Look at each picture. Write the first letter of its name in the box.',
    body,
    accent: theme.palette[0],
  };
}
