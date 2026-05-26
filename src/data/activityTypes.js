export const ACTIVITY_TYPES = [
  { id: 'maze', label: 'Maze', icon: '🌀' },
  { id: 'tracing', label: 'Tracing', icon: '✏️' },
  { id: 'coloring', label: 'Coloring', icon: '🎨' },
  { id: 'matching', label: 'Matching', icon: '🔗' },
  { id: 'puzzle', label: 'Puzzle', icon: '🧩' },
  { id: 'wordsearch', label: 'Word Search', icon: '🔍' },
  { id: 'counting', label: 'Counting', icon: '🧮' },
  { id: 'pattern', label: 'Patterns', icon: '🧠' },
  { id: 'dotToDot', label: 'Dot-to-Dot', icon: '📍' },
  { id: 'firstLetter', label: 'First Letter', icon: '🔤' },
  { id: 'traceLines', label: 'Trace Lines', icon: '〰️' },
];

export function getActivityType(id) {
  return ACTIVITY_TYPES.find((a) => a.id === id) || ACTIVITY_TYPES[0];
}
