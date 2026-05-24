import './styles/global.css';

import { renderHeader, renderFooter } from './components/Header.js';
import { renderInputPanel } from './components/InputPanel.js';
import { renderPreviewArea } from './components/PreviewArea.js';
import { showToast } from './components/Toast.js';
import { generateWorksheet } from './generators/index.js';
import { downloadPackPdf, downloadWorksheetPdf, downloadSvg } from './export/pdf.js';
import { getTheme } from './data/themes.js';
import { getAgeRange } from './data/ageRanges.js';
import { randomSeed } from './utils/random.js';

const state = {
  themeId: 'dinosaurs',
  ageId: '5-6',
  activityTypeIds: ['maze', 'tracing', 'coloring'],
  count: 1,
  worksheets: [],
};

const appEl = document.getElementById('app');
let mainEl;

function render() {
  // Wipe everything and re-render.
  appEl.innerHTML = '';
  appEl.appendChild(renderHeader());

  mainEl = document.createElement('main');
  mainEl.className = 'app-main';

  const panel = renderInputPanel({
    state,
    onChange: handleChange,
    onGenerate: handleGenerate,
  });

  const preview = renderPreviewArea({
    worksheets: state.worksheets,
    packName: buildPackName(),
    onDownloadAll: handleDownloadAll,
    onClearAll: handleClearAll,
    onPrintAll: handlePrintAll,
    onDownloadPdf: handleDownloadSingle,
    onDownloadSvg: handleDownloadSvg,
    onRegenerate: handleRegenerate,
    onRemove: handleRemove,
  });

  mainEl.appendChild(panel);
  mainEl.appendChild(preview);
  appEl.appendChild(mainEl);
  appEl.appendChild(renderFooter());
}

function handleChange(patch) {
  Object.assign(state, patch);
  render();
}

function handleGenerate() {
  const sheets = [];
  for (let i = 0; i < state.count; i++) {
    for (const activityTypeId of state.activityTypeIds) {
      sheets.push(
        generateWorksheet({
          themeId: state.themeId,
          ageId: state.ageId,
          activityTypeId,
          seed: randomSeed(),
        }),
      );
    }
  }
  state.worksheets = sheets;
  render();
  // Scroll preview into view on small screens.
  if (window.matchMedia('(max-width: 960px)').matches) {
    mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  showToast(`Generated ${sheets.length} worksheet${sheets.length === 1 ? '' : 's'}`);
}

function handleClearAll() {
  state.worksheets = [];
  render();
}

async function handleDownloadAll() {
  if (!state.worksheets.length) return;
  showToast('Building PDF…');
  try {
    await downloadPackPdf(state.worksheets, buildPackName());
    showToast('PDF downloaded');
  } catch (err) {
    console.error(err);
    showToast('Could not build PDF');
  }
}

async function handleDownloadSingle(worksheet) {
  showToast('Building PDF…');
  try {
    await downloadWorksheetPdf(worksheet);
    showToast('Downloaded');
  } catch (err) {
    console.error(err);
    showToast('Could not build PDF');
  }
}

function handleDownloadSvg(worksheet) {
  downloadSvg(worksheet);
  showToast('SVG downloaded');
}

function handleRegenerate(worksheet) {
  const fresh = generateWorksheet({
    themeId: worksheet.themeId,
    ageId: worksheet.ageId,
    activityTypeId: worksheet.activityTypeId,
    seed: randomSeed(),
  });
  state.worksheets = state.worksheets.map((w) => (w.id === worksheet.id ? fresh : w));
  render();
}

function handleRemove(worksheet) {
  state.worksheets = state.worksheets.filter((w) => w.id !== worksheet.id);
  render();
}

function handlePrintAll() {
  window.print();
}

function buildPackName() {
  const theme = getTheme(state.themeId);
  const age = getAgeRange(state.ageId);
  return `${theme.label} pack · Ages ${age.label}`;
}

render();
