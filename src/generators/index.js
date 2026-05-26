import { renderWorksheet } from '../templates/worksheet.js';
import { getTheme } from '../data/themes.js';
import { getAgeRange } from '../data/ageRanges.js';
import { getActivityType } from '../data/activityTypes.js';
import { randomSeed } from '../utils/random.js';

import * as maze from './maze.js';
import * as tracing from './tracing.js';
import * as coloring from './coloring.js';
import * as matching from './matching.js';
import * as puzzle from './puzzle.js';
import * as wordsearch from './wordsearch.js';
import * as counting from './counting.js';
import * as pattern from './pattern.js';
import * as dotToDot from './dotToDot.js';
import * as firstLetter from './firstLetter.js';
import * as traceLines from './traceLines.js';

const GENERATORS = {
  maze: maze.generate,
  tracing: tracing.generate,
  coloring: coloring.generate,
  matching: matching.generate,
  puzzle: puzzle.generate,
  wordsearch: wordsearch.generate,
  counting: counting.generate,
  pattern: pattern.generate,
  dotToDot: dotToDot.generate,
  firstLetter: firstLetter.generate,
  traceLines: traceLines.generate,
};

// Returns a worksheet object: { id, title, themeLabel, ageLabel, activityType, svg }
export function generateWorksheet({ themeId, ageId, activityTypeId, seed }) {
  const theme = getTheme(themeId);
  const age = getAgeRange(ageId);
  const activity = getActivityType(activityTypeId);
  const finalSeed = seed ?? randomSeed();

  const gen = GENERATORS[activity.id];
  if (!gen) throw new Error(`Unknown activity type: ${activity.id}`);

  const result = gen({ theme, age, seed: finalSeed });
  const svg = renderWorksheet({
    title: result.title,
    instructions: result.instructions,
    themeLabel: theme.label,
    accent: result.accent || theme.palette[0],
    body: result.body,
  });

  return {
    id: `${theme.id}-${age.id}-${activity.id}-${finalSeed}`,
    seed: finalSeed,
    title: result.title,
    themeId: theme.id,
    themeLabel: theme.label,
    ageId: age.id,
    ageLabel: age.label,
    activityTypeId: activity.id,
    activityTypeLabel: activity.label,
    activityTypeIcon: activity.icon,
    svg,
  };
}

// Generate a "pack" with one worksheet per requested activity type.
export function generatePack({ themeId, ageId, activityTypeIds }) {
  return activityTypeIds.map((aid) =>
    generateWorksheet({ themeId, ageId, activityTypeId: aid, seed: randomSeed() }),
  );
}
