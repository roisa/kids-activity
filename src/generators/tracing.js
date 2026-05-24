// Tracing worksheet: dotted/outlined letters for the child to trace over.
// Uses a thick light-gray outlined SVG <text> rendered N times per word so kids
// can practice multiple repetitions with handwriting guide lines.

import { getActivityRect, escapeXml } from '../templates/worksheet.js';
import { createRng, shuffle } from '../utils/random.js';

export function generate(options) {
  const { theme, age, seed } = options;
  const { tracingWordCount, tracingRepeats } = age.difficulty;

  const rng = createRng(seed);
  const words = shuffle(theme.words, rng).slice(0, tracingWordCount);

  const rect = getActivityRect();
  let body = '';

  const rowsCount = tracingWordCount;
  const repeatRows = tracingRepeats;
  const sectionH = (rect.height - 8) / rowsCount;

  words.forEach((word, wi) => {
    const sy = rect.y + 4 + wi * sectionH;
    // Section title
    body += `<text x="${rect.x}" y="${sy + 5}" font-size="4.5" font-weight="700" fill="${theme.palette[0]}">Trace · ${escapeXml(word)}</text>`;

    // Compute a font size that fits the word into the printable width.
    const usableW = rect.width - 4;
    // Approximate char width factor for Quicksand-bold at ~1 unit font-size.
    const approxCharW = 0.62;
    const charCount = word.length;
    let fontSize = Math.min(
      (sectionH - 10) / repeatRows,
      usableW / (charCount * approxCharW),
    );
    fontSize = Math.max(10, Math.min(fontSize, 28));

    const rowH = (sectionH - 10) / repeatRows;
    for (let r = 0; r < repeatRows; r++) {
      const ry = sy + 10 + r * rowH;
      const baseline = ry + rowH * 0.72;
      // Three-line handwriting guide (top, middle dashed, baseline)
      body += `<line x1="${rect.x}" y1="${ry + rowH * 0.18}" x2="${rect.x + rect.width}" y2="${ry + rowH * 0.18}" stroke="#cfd4e6" stroke-width="0.2"/>`;
      body += `<line x1="${rect.x}" y1="${ry + rowH * 0.5}" x2="${rect.x + rect.width}" y2="${ry + rowH * 0.5}" stroke="#cfd4e6" stroke-width="0.2" stroke-dasharray="1.2 1.2"/>`;
      body += `<line x1="${rect.x}" y1="${baseline}" x2="${rect.x + rect.width}" y2="${baseline}" stroke="#9ea4be" stroke-width="0.3"/>`;
      // Outlined (traceable) word
      body += `<text x="${rect.x + 2}" y="${baseline - 0.5}" font-size="${fontSize}" font-weight="800" font-family="Quicksand, Arial, sans-serif" fill="none" stroke="#bfc4dc" stroke-width="0.45" stroke-dasharray="1.2 1.2" letter-spacing="1.2">${escapeXml(word)}</text>`;
    }
  });

  return {
    title: `${theme.label} Tracing`,
    instructions: 'Trace the dotted letters slowly. Try to stay on the line!',
    body,
    accent: theme.palette[0],
  };
}
