// Dot-to-Dot worksheet: numbered dots forming a kid-friendly closed shape.
// Connect 1→2→3→…→N to reveal a hidden picture, then color it.
//
// Shapes are generated parametrically so we don't need hand-authored point
// arrays per theme — any theme can use any shape.

import { getActivityRect } from '../templates/worksheet.js';
import { createRng, pick, shuffle } from '../utils/random.js';

const AGE_CONFIG = {
  '3-4': { densityScale: 0.6, allowed: ['circle', 'heart'] },
  '5-6': { densityScale: 0.9, allowed: ['circle', 'heart', 'star', 'house'] },
  '7-8': { densityScale: 1.2, allowed: ['heart', 'star', 'house', 'cloud'] },
};

const SHAPES = {
  circle(n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = -Math.PI / 2 + (i / n) * Math.PI * 2;
      pts.push([10 * Math.cos(t), 10 * Math.sin(t)]);
    }
    return pts;
  },
  heart(n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = -Math.PI / 2 + (i / n) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([x, y]);
    }
    return pts;
  },
  star(n) {
    const pts = [];
    const verts = 10; // 5-point star = 10 alternating vertices
    for (let i = 0; i < n; i++) {
      const segPos = (i / n) * verts;
      const i0 = Math.floor(segPos);
      const t = segPos - i0;
      const r0 = i0 % 2 === 0 ? 14 : 6;
      const r1 = (i0 + 1) % 2 === 0 ? 14 : 6;
      const r = r0 * (1 - t) + r1 * t;
      const ang = -Math.PI / 2 + (segPos / verts) * Math.PI * 2;
      pts.push([r * Math.cos(ang), r * Math.sin(ang)]);
    }
    return pts;
  },
  house(n) {
    // Pentagon house outline: peak, right roof, right wall, ground, left wall.
    const corners = [
      [0, -10],
      [10, -2],
      [10, 10],
      [-10, 10],
      [-10, -2],
    ];
    return walkPerimeter(corners, n);
  },
  cloud(n) {
    // Bumpy lobed cloud (three half-circle scallops on top).
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = -Math.PI + (i / n) * Math.PI * 2;
      const x = 13 * Math.cos(t);
      const lumps = Math.sin(t) > 0 ? 3 * Math.abs(Math.sin(t * 3)) : 0;
      const y = 6 * Math.sin(t) - lumps;
      pts.push([x, y]);
    }
    return pts;
  },
};

function walkPerimeter(corners, n) {
  const segs = [];
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    segs.push({ a, b, len: Math.sqrt(dx * dx + dy * dy) });
  }
  const totalLen = segs.reduce((s, x) => s + x.len, 0);
  const step = totalLen / n;
  const pts = [];
  for (let i = 0; i < n; i++) {
    let target = i * step;
    for (const seg of segs) {
      if (target <= seg.len) {
        const t = target / seg.len;
        pts.push([seg.a[0] + t * (seg.b[0] - seg.a[0]), seg.a[1] + t * (seg.b[1] - seg.a[1])]);
        break;
      }
      target -= seg.len;
    }
  }
  return pts;
}

export function generate(options) {
  const { theme, age, seed } = options;
  const cfg = AGE_CONFIG[age.id] || AGE_CONFIG['5-6'];
  const rng = createRng(seed);

  const shapeName = pick(cfg.allowed, rng);
  const baseCount = 12 + Math.floor(rng() * 6);
  const numDots = Math.max(8, Math.round(baseCount * cfg.densityScale));
  const points = SHAPES[shapeName](numDots);

  const rect = getActivityRect();
  let body = '';

  // Fit shape into the activity rect.
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const shapeW = maxX - minX || 1;
  const shapeH = maxY - minY || 1;

  const drawY = rect.y + 12;
  const drawH = rect.height - 14;
  const scale = Math.min((rect.width - 12) / shapeW, (drawH - 8) / shapeH) * 0.78;
  const cx = rect.x + rect.width / 2;
  const cy = drawY + drawH / 2;
  const shapeCX = (minX + maxX) / 2;
  const shapeCY = (minY + maxY) / 2;

  // Subtle theme decorations in the four corners.
  const corners = [
    [rect.x + 6, drawY + 6],
    [rect.x + rect.width - 6, drawY + 6],
    [rect.x + 6, drawY + drawH - 4],
    [rect.x + rect.width - 6, drawY + drawH - 4],
  ];
  shuffle(theme.items, rng)
    .slice(0, 4)
    .forEach((item, i) => {
      body += `<text x="${corners[i][0]}" y="${corners[i][1]}" font-size="7" text-anchor="middle" opacity="0.35">${item.emoji}</text>`;
    });

  // Dots + numbers.
  const dotR = 1.4;
  points.forEach((p, i) => {
    const x = cx + (p[0] - shapeCX) * scale;
    const y = cy + (p[1] - shapeCY) * scale;
    body += `<circle cx="${x}" cy="${y}" r="${dotR}" fill="${theme.palette[0]}"/>`;
    body += `<text x="${x + dotR + 0.6}" y="${y - dotR + 0.4}" font-size="3.4" font-weight="700" fill="#1b1f3a">${i + 1}</text>`;
  });

  // Hint line right below the title area.
  body += `<text x="${rect.x + rect.width / 2}" y="${rect.y + 7}" font-size="3.6" fill="#5b6079" text-anchor="middle" font-style="italic">Connect 1 → ${numDots} to reveal the picture</text>`;

  return {
    title: `${theme.label} Dot-to-Dot`,
    instructions: `Connect the dots from 1 to ${numDots} in order. Then color in the picture you reveal!`,
    body,
    accent: theme.palette[0],
  };
}
