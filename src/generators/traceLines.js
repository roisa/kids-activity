// Trace Lines worksheet: pre-writing stroke practice. Rows of dotted patterns
// — straight, wavy, zigzag, bumpy, spiraling — that the child traces across
// the page with their pencil. Each row has a theme emoji at start and end.

import { getActivityRect, escapeXml } from '../templates/worksheet.js';
import { createRng, shuffle } from '../utils/random.js';

const AGE_CONFIG = {
  '3-4': { count: 3, patterns: ['straight', 'wave'] },
  '5-6': { count: 4, patterns: ['straight', 'wave', 'zigzag'] },
  '7-8': { count: 5, patterns: ['wave', 'zigzag', 'bump', 'spiral', 'wave'] },
};

const PATTERN_LABELS = {
  straight: 'Straight line',
  wave: 'Wavy line',
  zigzag: 'Zigzag line',
  bump: 'Bumpy line',
  spiral: 'Spiraly line',
};

function buildPathD(type, startX, midY, length, amplitude, period) {
  const steps = 96;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = startX + length * t;
    let y;
    switch (type) {
      case 'straight':
        y = midY;
        break;
      case 'wave':
        y = midY + Math.sin(t * Math.PI * 2 * period) * amplitude;
        break;
      case 'zigzag': {
        const phase = (t * period * 2) % 2;
        y = midY + (Math.abs(phase - 1) - 0.5) * 2 * amplitude;
        break;
      }
      case 'bump':
        y = midY - Math.abs(Math.sin(t * Math.PI * period)) * amplitude;
        break;
      case 'spiral':
        y = midY + Math.sin(t * Math.PI * 2 * period) * amplitude * (0.5 + 0.5 * Math.sin(t * Math.PI));
        break;
      default:
        y = midY;
    }
    d += (i === 0 ? 'M ' : ' L ') + x.toFixed(2) + ' ' + y.toFixed(2);
  }
  return d;
}

export function generate(options) {
  const { theme, age, seed } = options;
  const cfg = AGE_CONFIG[age.id] || AGE_CONFIG['5-6'];
  const rng = createRng(seed);

  // Take cfg.count patterns (cycle through the allowed list if fewer than count).
  const types = [];
  const shuffled = shuffle(cfg.patterns, rng);
  for (let i = 0; i < cfg.count; i++) types.push(shuffled[i % shuffled.length]);

  const rect = getActivityRect();
  const items = shuffle(theme.items, rng);
  let body = '';
  const rowH = (rect.height - 4) / cfg.count;

  types.forEach((type, i) => {
    const y = rect.y + 4 + i * rowH;
    const midY = y + rowH / 2 + 2;

    body += `<text x="${rect.x}" y="${y + 5}" font-size="3.4" font-weight="700" fill="${theme.palette[0]}">${PATTERN_LABELS[type]}</text>`;

    const eSize = Math.min(rowH * 0.5, 7);
    const startItem = items[i % items.length];
    const endItem = items[(i + items.length - 1) % items.length];
    const pathPad = 12;
    const pathStartX = rect.x + pathPad;
    const pathEndX = rect.x + rect.width - pathPad;
    const pathLen = pathEndX - pathStartX;
    const amp = Math.min(rowH * 0.28, 4.5);
    const period = type === 'bump' ? 5 : type === 'zigzag' ? 6 : 4;

    // Start emoji
    body += `<text x="${rect.x + 3}" y="${midY + eSize * 0.35}" font-size="${eSize}">${startItem.emoji}</text>`;
    // End emoji
    body += `<text x="${rect.x + rect.width - 3}" y="${midY + eSize * 0.35}" font-size="${eSize}" text-anchor="end">${endItem.emoji}</text>`;
    // Dotted trace path
    const d = buildPathD(type, pathStartX, midY, pathLen, amp, period);
    body += `<path d="${d}" fill="none" stroke="#a8aebf" stroke-width="0.6" stroke-dasharray="1.1 1.2" stroke-linecap="round"/>`;
    // Start dot to emphasize beginning
    body += `<circle cx="${pathStartX}" cy="${midY}" r="0.8" fill="${theme.palette[0]}"/>`;
  });

  return {
    title: `${theme.label} Trace Lines`,
    instructions: 'Trace over each dotted line with your pencil from left to right. Try to stay on the line!',
    body,
    accent: theme.palette[0],
  };
}
