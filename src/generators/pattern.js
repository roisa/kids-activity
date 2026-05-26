// Pattern worksheet: a sequence of theme emojis with the last item hidden in
// a dashed box. Child draws the missing item to complete the pattern.
// 3-4: AB (two items alternating)
// 5-6: AB or ABC
// 7-8: adds ABBA / ABCABC for trickier sequences

import { getActivityRect } from '../templates/worksheet.js';
import { createRng, shuffle, pick } from '../utils/random.js';

const AGE_CONFIG = {
  '3-4': { problems: 3, patternTypes: ['AB'] },
  '5-6': { problems: 4, patternTypes: ['AB', 'ABC'] },
  '7-8': { problems: 5, patternTypes: ['AB', 'ABC', 'ABBA', 'ABCABC'] },
};

function buildSequence(type, items) {
  const A = items[0];
  const B = items[1] || items[0];
  const C = items[2] || items[0];
  switch (type) {
    case 'AB':     return [A, B, A, B, A, B];
    case 'ABC':    return [A, B, C, A, B, C];
    case 'ABBA':   return [A, B, B, A, A, B, B, A];
    case 'ABCABC': return [A, B, C, A, B, C, A, B, C];
    default:       return [A, B, A, B];
  }
}

export function generate(options) {
  const { theme, age, seed } = options;
  const cfg = AGE_CONFIG[age.id] || AGE_CONFIG['5-6'];
  const rng = createRng(seed);

  const rect = getActivityRect();
  let body = '';
  const rowH = (rect.height - 4) / cfg.problems;

  for (let i = 0; i < cfg.problems; i++) {
    const y = rect.y + 4 + i * rowH;
    const items = shuffle(theme.items, rng).slice(0, 3);
    const type = pick(cfg.patternTypes, rng);
    const sequence = buildSequence(type, items);
    const hideIndex = sequence.length - 1;

    body += `<text x="${rect.x}" y="${y + rowH / 2 + 1}" font-size="4" fill="#5b6079" font-weight="700">${i + 1}.</text>`;

    const startX = rect.x + 8;
    const usableW = rect.width - 10;
    const cellW = Math.min(usableW / sequence.length, rowH * 0.85);
    const cellH = Math.min(rowH - 6, cellW);
    const eSize = cellH * 0.65;
    const totalRowW = cellW * sequence.length + (sequence.length - 1) * 1;
    const baseX = startX + (usableW - totalRowW) / 2;

    sequence.forEach((item, k) => {
      const cx = baseX + k * (cellW + 1);
      const isHidden = k === hideIndex;
      const fill = isHidden ? theme.palette[0] + '22' : 'white';
      body += `<rect x="${cx}" y="${y + 2}" width="${cellW}" height="${cellH}" rx="2" fill="${fill}" stroke="${theme.palette[0]}" stroke-width="${isHidden ? 0.7 : 0.4}" ${isHidden ? 'stroke-dasharray="2 1.5"' : ''}/>`;
      const tx = cx + cellW / 2;
      const ty = y + 2 + cellH / 2 + eSize * 0.32;
      if (!isHidden) {
        body += `<text x="${tx}" y="${ty}" font-size="${eSize}" text-anchor="middle">${item.emoji}</text>`;
      } else {
        body += `<text x="${tx}" y="${ty}" font-size="${eSize * 0.7}" fill="${theme.palette[0]}" font-weight="700" text-anchor="middle">?</text>`;
      }
    });
  }

  return {
    title: `${theme.label} Patterns`,
    instructions: 'Look at the pattern in each row. Draw the missing picture in the dashed box.',
    body,
    accent: theme.palette[0],
  };
}
