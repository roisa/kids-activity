export const ACTIVITY_TYPES = [
  { id: 'maze', label: 'Maze', icon: '🌀' },
  { id: 'tracing', label: 'Tracing', icon: '✏️' },
  { id: 'coloring', label: 'Coloring Prompt', icon: '🎨' },
  { id: 'matching', label: 'Matching', icon: '🔗' },
  { id: 'puzzle', label: 'Simple Puzzle', icon: '🧩' },
];

export function getActivityType(id) {
  return ACTIVITY_TYPES.find((a) => a.id === id) || ACTIVITY_TYPES[0];
}
