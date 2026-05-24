// Worksheet preview card. Shows the SVG preview, a header with title/badge,
// and footer actions for downloading PDF/SVG or removing/regenerating the sheet.

export function renderWorksheetCard({ worksheet, onDownloadPdf, onDownloadSvg, onRegenerate, onRemove }) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.worksheetId = worksheet.id;

  // Header
  const header = document.createElement('div');
  header.className = 'card__header';
  const title = document.createElement('div');
  title.className = 'card__title';
  title.innerHTML = `<span>${worksheet.activityTypeIcon}</span><span>${escapeHtml(worksheet.title)}</span>`;
  const badge = document.createElement('span');
  badge.className = 'card__badge';
  badge.textContent = `Ages ${worksheet.ageLabel}`;
  header.appendChild(title);
  header.appendChild(badge);
  card.appendChild(header);

  // Preview
  const preview = document.createElement('div');
  preview.className = 'card__preview';
  preview.innerHTML = worksheet.svg;
  card.appendChild(preview);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'card__footer';

  const pdfBtn = document.createElement('button');
  pdfBtn.type = 'button';
  pdfBtn.className = 'btn btn--primary btn--sm';
  pdfBtn.innerHTML = '<span>⬇</span><span>PDF</span>';
  pdfBtn.addEventListener('click', () => onDownloadPdf(worksheet));
  footer.appendChild(pdfBtn);

  const svgBtn = document.createElement('button');
  svgBtn.type = 'button';
  svgBtn.className = 'btn btn--secondary btn--sm';
  svgBtn.textContent = 'SVG';
  svgBtn.title = 'Download as SVG';
  svgBtn.addEventListener('click', () => onDownloadSvg(worksheet));
  footer.appendChild(svgBtn);

  const regenBtn = document.createElement('button');
  regenBtn.type = 'button';
  regenBtn.className = 'btn btn--ghost btn--sm';
  regenBtn.innerHTML = '↻';
  regenBtn.title = 'Regenerate this sheet';
  regenBtn.addEventListener('click', () => onRegenerate(worksheet));
  footer.appendChild(regenBtn);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn--ghost btn--sm';
  removeBtn.innerHTML = '✕';
  removeBtn.title = 'Remove this sheet';
  removeBtn.addEventListener('click', () => onRemove(worksheet));
  footer.appendChild(removeBtn);

  card.appendChild(footer);
  return card;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
