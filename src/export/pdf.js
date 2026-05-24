// PDF export: rasterize each worksheet SVG into a canvas image, then place it
// onto an A4 page in jsPDF. Rasterizing keeps emoji glyphs and gradients
// looking exactly like the on-screen preview without depending on jsPDF's
// limited native SVG support.

import { jsPDF } from 'jspdf';

const A4 = { width: 210, height: 297 }; // mm
// Render at high DPI for crisp printing (300dpi-ish).
const RENDER_SCALE = 3.5; // ~ 280dpi for an A4 at 96dpi base

function svgToImage(svgString, pixelWidth, pixelHeight) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pixelWidth, pixelHeight);
      ctx.drawImage(img, 0, 0, pixelWidth, pixelHeight);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

async function addWorksheetToPdf(pdf, worksheet, addPage) {
  const pxW = Math.round(A4.width * RENDER_SCALE);
  const pxH = Math.round(A4.height * RENDER_SCALE);
  // Ensure the SVG has explicit pixel dimensions so the image loads cleanly.
  const sized = worksheet.svg.replace(
    /<svg([^>]*?)width="[^"]*"\s*height="[^"]*"/,
    `<svg$1width="${pxW}" height="${pxH}"`,
  );
  const dataUrl = await svgToImage(sized, pxW, pxH);
  if (addPage) pdf.addPage('a4', 'portrait');
  pdf.addImage(dataUrl, 'JPEG', 0, 0, A4.width, A4.height, undefined, 'FAST');
}

export async function downloadWorksheetPdf(worksheet) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  await addWorksheetToPdf(pdf, worksheet, false);
  const filename = sanitizeFilename(`${worksheet.themeLabel}-${worksheet.activityTypeLabel}-${worksheet.ageLabel}`);
  pdf.save(`${filename}.pdf`);
}

export async function downloadPackPdf(worksheets, packName) {
  if (!worksheets.length) return;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  for (let i = 0; i < worksheets.length; i++) {
    await addWorksheetToPdf(pdf, worksheets[i], i > 0);
  }
  const filename = sanitizeFilename(packName || 'activity-pack');
  pdf.save(`${filename}.pdf`);
}

export function downloadSvg(worksheet) {
  const blob = new Blob([worksheet.svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = sanitizeFilename(`${worksheet.themeLabel}-${worksheet.activityTypeLabel}-${worksheet.ageLabel}`);
  a.download = `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
