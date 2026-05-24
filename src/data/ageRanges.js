// Age ranges drive difficulty parameters for each generator.

export const AGE_RANGES = [
  {
    id: '3-4',
    label: '3 – 4',
    description: 'Big strokes, very simple',
    difficulty: {
      mazeSize: 6,
      mazeBranchiness: 0.15,
      tracingWordCount: 1,
      tracingRepeats: 3,
      matchingPairs: 3,
      puzzlePieces: 4,
    },
  },
  {
    id: '5-6',
    label: '5 – 6',
    description: 'Beginner reading and drawing',
    difficulty: {
      mazeSize: 9,
      mazeBranchiness: 0.35,
      tracingWordCount: 2,
      tracingRepeats: 3,
      matchingPairs: 4,
      puzzlePieces: 6,
    },
  },
  {
    id: '7-8',
    label: '7 – 8',
    description: 'More detail and challenge',
    difficulty: {
      mazeSize: 13,
      mazeBranchiness: 0.55,
      tracingWordCount: 3,
      tracingRepeats: 4,
      matchingPairs: 5,
      puzzlePieces: 9,
    },
  },
];

export function getAgeRange(id) {
  return AGE_RANGES.find((a) => a.id === id) || AGE_RANGES[1];
}
