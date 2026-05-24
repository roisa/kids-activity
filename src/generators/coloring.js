// Coloring Prompt worksheet: presents a creative prompt + a large empty frame
// the child can draw in, plus a small color-swatch palette suggestion.

import { getActivityRect, escapeXml } from '../templates/worksheet.js';
import { createRng, pick } from '../utils/random.js';

export function generate(options) {
  const { theme, seed } = options;
  const rng = createRng(seed);
  const prompt = pick(theme.coloringPrompts, rng);

  const rect = getActivityRect();
  let body = '';

  // Prompt card
  const promptH = 26;
  body += `<rect x="${rect.x}" y="${rect.y + 2}" width="${rect.width}" height="${promptH}" rx="3" fill="${theme.palette[0]}" opacity="0.12"/>`;
  body += `<text x="${rect.x + 4}" y="${rect.y + 10}" font-size="4" font-weight="700" fill="${theme.palette[0]}">DRAW &amp; COLOR</text>`;

  // Wrap prompt to multiple lines (very rough, ~70 chars/line at this font).
  const lines = wrapText(prompt, 80);
  lines.slice(0, 3).forEach((line, i) => {
    body += `<text x="${rect.x + 4}" y="${rect.y + 16 + i * 5}" font-size="4" fill="#1b1f3a">${escapeXml(line)}</text>`;
  });

  // Color palette suggestion
  const swatchY = rect.y + promptH + 6;
  body += `<text x="${rect.x}" y="${swatchY + 3}" font-size="3.4" fill="#5b6079" font-weight="600">Suggested colors:</text>`;
  const swatchSize = 5;
  theme.palette.forEach((c, i) => {
    const x = rect.x + 32 + i * (swatchSize + 2);
    body += `<rect x="${x}" y="${swatchY - 1}" width="${swatchSize}" height="${swatchSize}" rx="1" fill="${c}" stroke="#1b1f3a" stroke-width="0.2"/>`;
  });

  // Drawing frame
  const frameY = swatchY + 10;
  const frameH = rect.height - (frameY - rect.y) - 4;
  body += `<rect x="${rect.x}" y="${frameY}" width="${rect.width}" height="${frameH}" rx="4" fill="white" stroke="${theme.palette[0]}" stroke-width="0.7" stroke-dasharray="2 2"/>`;

  // Decorative theme icons in the corners as gentle starting points
  const corners = [
    { x: rect.x + 6, y: frameY + 8 },
    { x: rect.x + rect.width - 6, y: frameY + 8 },
    { x: rect.x + 6, y: frameY + frameH - 4 },
    { x: rect.x + rect.width - 6, y: frameY + frameH - 4 },
  ];
  theme.items.slice(0, 4).forEach((item, i) => {
    body += `<text x="${corners[i].x}" y="${corners[i].y}" font-size="6" text-anchor="middle" opacity="0.55">${item.emoji}</text>`;
  });

  return {
    title: `${theme.label} Coloring`,
    instructions: 'Read the prompt, then draw and color your picture in the frame.',
    body,
    accent: theme.palette[0],
  };
}

function wrapText(text, maxLen) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxLen) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}
