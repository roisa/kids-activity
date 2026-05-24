// Shared SVG worksheet template. Generators return the *inner* SVG body for
// their activity area; this template wraps it with a printable letter-size page
// (titled header, instructions, and footer).

// Letter size at 72dpi-ish coordinates, but we render in mm for predictable PDFs.
// Page: 210 x 297 (A4) in user units (1 unit = 1 mm), with 14mm margins.
export const PAGE = {
  width: 210,
  height: 297,
  marginX: 16,
  marginTop: 18,
  marginBottom: 16,
  headerHeight: 26,
  footerHeight: 10,
};

export function getActivityRect() {
  const x = PAGE.marginX;
  const y = PAGE.marginTop + PAGE.headerHeight + 4;
  const width = PAGE.width - PAGE.marginX * 2;
  const height =
    PAGE.height - y - PAGE.marginBottom - PAGE.footerHeight;
  return { x, y, width, height };
}

export function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Render a full worksheet as an SVG string.
// `body` is raw SVG markup positioned to fit inside getActivityRect().
export function renderWorksheet({ title, instructions, themeLabel, accent, body }) {
  const { width: pw, height: ph, marginX, marginTop } = PAGE;
  const accentColor = accent || '#7c5cff';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pw} ${ph}" width="100%" height="100%" font-family="Quicksand, Inter, Arial, sans-serif">
  <rect x="0" y="0" width="${pw}" height="${ph}" fill="#ffffff"/>
  <!-- Header -->
  <rect x="${marginX}" y="${marginTop}" width="${pw - marginX * 2}" height="22" rx="4" fill="${accentColor}" opacity="0.12"/>
  <text x="${marginX + 5}" y="${marginTop + 9}" font-size="4" font-weight="600" fill="${accentColor}" letter-spacing="0.5">${escapeXml(themeLabel.toUpperCase())} · KIDS WORKSHEET</text>
  <text x="${marginX + 5}" y="${marginTop + 17}" font-size="7" font-weight="700" fill="#1b1f3a">${escapeXml(title)}</text>
  <text x="${pw - marginX - 5}" y="${marginTop + 17}" font-size="3.6" fill="#5b6079" text-anchor="end">Name: _____________________   Date: ___________</text>

  <!-- Instructions -->
  <text x="${marginX}" y="${marginTop + 26}" font-size="3.6" fill="#5b6079">${escapeXml(instructions)}</text>

  <!-- Body -->
  ${body}

  <!-- Footer -->
  <text x="${pw / 2}" y="${ph - 6}" font-size="3" fill="#8a90a8" text-anchor="middle">Made with Kids Activity Generator</text>
</svg>`;
}
