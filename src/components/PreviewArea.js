// Right-hand preview area: title bar with pack actions + grid of WorksheetCards.
// Empty state shown until first generation.

import { renderWorksheetCard } from './WorksheetCard.js';

export function renderPreviewArea({
  worksheets,
  packName,
  onDownloadAll,
  onClearAll,
  onPrintAll,
  onDownloadPdf,
  onDownloadSvg,
  onRegenerate,
  onRemove,
}) {
  const root = document.createElement('section');
  root.className = 'preview';

  const header = document.createElement('div');
  header.className = 'preview__header';
  const titleBlock = document.createElement('div');
  titleBlock.className = 'preview__title-block';
  const h2 = document.createElement('h2');
  h2.textContent = worksheets.length
    ? `${worksheets.length} worksheet${worksheets.length === 1 ? '' : 's'} ready`
    : 'Preview';
  const sub = document.createElement('p');
  sub.textContent = worksheets.length
    ? packName
    : 'Pick your options on the left and hit Generate.';
  titleBlock.appendChild(h2);
  titleBlock.appendChild(sub);
  header.appendChild(titleBlock);

  const actions = document.createElement('div');
  actions.className = 'preview__actions';

  if (worksheets.length) {
    const dlAll = document.createElement('button');
    dlAll.type = 'button';
    dlAll.className = 'btn btn--primary';
    dlAll.innerHTML = '<span>⬇</span><span>Download pack (PDF)</span>';
    dlAll.addEventListener('click', () => onDownloadAll());
    actions.appendChild(dlAll);

    const print = document.createElement('button');
    print.type = 'button';
    print.className = 'btn btn--secondary';
    print.innerHTML = '<span>🖨</span><span>Print</span>';
    print.addEventListener('click', () => onPrintAll());
    actions.appendChild(print);

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'btn btn--ghost';
    clear.textContent = 'Clear';
    clear.addEventListener('click', () => onClearAll());
    actions.appendChild(clear);
  }

  header.appendChild(actions);
  root.appendChild(header);

  if (!worksheets.length) {
    const empty = document.createElement('div');
    empty.className = 'preview__empty';
    empty.innerHTML = `
      <div class="preview__empty-emoji">📚</div>
      <div class="preview__empty-title">No worksheets yet</div>
      <div>Choose a theme, age, and one or more activities — then click <strong>Generate worksheets</strong>.</div>
    `;
    root.appendChild(empty);
    return root;
  }

  const grid = document.createElement('div');
  grid.className = 'preview__grid';
  worksheets.forEach((w) => {
    grid.appendChild(
      renderWorksheetCard({
        worksheet: w,
        onDownloadPdf,
        onDownloadSvg,
        onRegenerate,
        onRemove,
      }),
    );
  });
  root.appendChild(grid);
  return root;
}
