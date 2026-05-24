// Runtime loader for theme-keyed coloring page SVGs.
// SVGs live at src/assets/coloring/<themeId>/<NN>.svg and are produced by
// scripts/generate-coloring.mjs. Vite inlines them as raw strings at build
// time; if no SVGs have been generated yet, this map is empty and the
// coloring generator falls back to the prompt-only worksheet.

const modules = import.meta.glob('../assets/coloring/*/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const byTheme = {};
for (const [filePath, content] of Object.entries(modules)) {
  const m = filePath.match(/\/coloring\/([^/]+)\/[^/]+\.svg$/);
  if (!m) continue;
  const themeId = m[1];
  (byTheme[themeId] ||= []).push(content);
}

export function getColoringPages(themeId) {
  return byTheme[themeId] || [];
}

export function hasColoringPages(themeId) {
  return (byTheme[themeId]?.length || 0) > 0;
}
