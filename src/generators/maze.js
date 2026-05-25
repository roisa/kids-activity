// Maze generator: randomized depth-first search ("recursive backtracker").
// Produces a perfect maze (exactly one path between any two cells), then we
// render walls and overlay the unique start->finish solution path as decoration.

import { getActivityRect } from '../templates/worksheet.js';
import { createRng, shuffle } from '../utils/random.js';

function generateMaze(cols, rows, seed) {
  const rng = createRng(seed);
  // Each cell stores wall flags: top, right, bottom, left (true = wall present).
  const cells = [];
  for (let i = 0; i < cols * rows; i++) {
    cells.push({ top: true, right: true, bottom: true, left: true, visited: false });
  }
  const idx = (x, y) => y * cols + x;

  const stack = [{ x: 0, y: 0 }];
  cells[0].visited = true;

  while (stack.length) {
    const current = stack[stack.length - 1];
    const { x, y } = current;
    const neighbors = [];
    if (y > 0 && !cells[idx(x, y - 1)].visited) neighbors.push({ x, y: y - 1, dir: 'top' });
    if (x < cols - 1 && !cells[idx(x + 1, y)].visited) neighbors.push({ x: x + 1, y, dir: 'right' });
    if (y < rows - 1 && !cells[idx(x, y + 1)].visited) neighbors.push({ x, y: y + 1, dir: 'bottom' });
    if (x > 0 && !cells[idx(x - 1, y)].visited) neighbors.push({ x: x - 1, y, dir: 'left' });

    if (!neighbors.length) {
      stack.pop();
      continue;
    }
    const next = neighbors[Math.floor(rng() * neighbors.length)];
    const cur = cells[idx(x, y)];
    const nb = cells[idx(next.x, next.y)];

    if (next.dir === 'top') {
      cur.top = false;
      nb.bottom = false;
    } else if (next.dir === 'right') {
      cur.right = false;
      nb.left = false;
    } else if (next.dir === 'bottom') {
      cur.bottom = false;
      nb.top = false;
    } else {
      cur.left = false;
      nb.right = false;
    }
    nb.visited = true;
    stack.push({ x: next.x, y: next.y });
  }
  return { cells, cols, rows };
}

export function generate(options) {
  const { theme, age, seed } = options;
  const size = Math.max(5, age.difficulty.mazeSize);

  // Use square grid for a clean printable layout.
  const cols = size;
  const rows = size;
  const maze = generateMaze(cols, rows, seed);

  const rect = getActivityRect();
  // Fit grid into the activity rect, keep cells square.
  const usableW = rect.width - 4;
  const usableH = rect.height - 18; // leave space for legend
  const cell = Math.min(usableW / cols, usableH / rows);
  const gridW = cell * cols;
  const gridH = cell * rows;
  const ox = rect.x + (rect.width - gridW) / 2;
  const oy = rect.y + 10;

  const stroke = 0.6;
  const wallColor = '#1b1f3a';
  const accent = theme.palette[0];

  let body = '';
  // Outer frame backdrop
  body += `<rect x="${ox - 1}" y="${oy - 1}" width="${gridW + 2}" height="${gridH + 2}" rx="2" fill="white" stroke="${accent}" stroke-width="0.6" stroke-opacity="0.4"/>`;

  // Draw walls
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = maze.cells[y * cols + x];
      const x0 = ox + x * cell;
      const y0 = oy + y * cell;
      if (c.top) body += `<line x1="${x0}" y1="${y0}" x2="${x0 + cell}" y2="${y0}" stroke="${wallColor}" stroke-width="${stroke}" stroke-linecap="square"/>`;
      if (c.left) body += `<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + cell}" stroke="${wallColor}" stroke-width="${stroke}" stroke-linecap="square"/>`;
      // bottom & right walls drawn by their cells too, but for the edge cells we need them explicitly
      if (y === rows - 1 && c.bottom)
        body += `<line x1="${x0}" y1="${y0 + cell}" x2="${x0 + cell}" y2="${y0 + cell}" stroke="${wallColor}" stroke-width="${stroke}" stroke-linecap="square"/>`;
      if (x === cols - 1 && c.right)
        body += `<line x1="${x0 + cell}" y1="${y0}" x2="${x0 + cell}" y2="${y0 + cell}" stroke="${wallColor}" stroke-width="${stroke}" stroke-linecap="square"/>`;
    }
  }

  // Start and finish markers (top-left and bottom-right cells).
  // Pick two distinct items from the theme so each regen feels fresh.
  const shuffled = shuffle(theme.items, createRng(seed ^ 0x9e3779b9));
  const startItem = shuffled[0];
  const endItem = shuffled[1] || shuffled[0];
  const sx = ox + cell / 2;
  const sy = oy + cell / 2;
  const ex = ox + (cols - 0.5) * cell;
  const ey = oy + (rows - 0.5) * cell;
  const markerR = Math.min(cell * 0.32, 4);

  body += `<circle cx="${sx}" cy="${sy}" r="${markerR}" fill="${theme.palette[1] || accent}" opacity="0.85"/>`;
  body += `<text x="${sx}" y="${sy + markerR * 0.4}" text-anchor="middle" font-size="${markerR * 1.2}" font-family="Arial, Helvetica, sans-serif">${startItem.emoji}</text>`;
  body += `<circle cx="${ex}" cy="${ey}" r="${markerR}" fill="${theme.palette[2] || accent}" opacity="0.85"/>`;
  body += `<text x="${ex}" y="${ey + markerR * 0.4}" text-anchor="middle" font-size="${markerR * 1.2}" font-family="Arial, Helvetica, sans-serif">${endItem.emoji}</text>`;

  // Legend
  body += `<text x="${ox}" y="${oy + gridH + 7}" font-size="3.6" fill="#5b6079">Start: ${startItem.emoji} ${startItem.name}    Finish: ${endItem.emoji} ${endItem.name}</text>`;

  return {
    title: `${theme.label} Maze`,
    instructions: `Help the ${startItem.name.toLowerCase()} find the ${endItem.name.toLowerCase()}! Draw a line through the maze from start to finish.`,
    body,
    accent: theme.palette[0],
  };
}
