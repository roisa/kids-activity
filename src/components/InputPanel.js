// Sidebar panel: theme picker, age range, activity type, count, and CTA.
// Pure DOM component. Emits state changes via onChange / onGenerate callbacks.

import { THEMES } from '../data/themes.js';
import { AGE_RANGES } from '../data/ageRanges.js';
import { ACTIVITY_TYPES } from '../data/activityTypes.js';

export function renderInputPanel({ state, onChange, onGenerate }) {
  const root = document.createElement('aside');
  root.className = 'panel';

  root.appendChild(headerEl());
  root.appendChild(themeField(state, onChange));
  root.appendChild(ageField(state, onChange));
  root.appendChild(activityField(state, onChange));
  root.appendChild(countField(state, onChange));
  root.appendChild(generateButton(state, onGenerate));

  return root;
}

function headerEl() {
  const wrap = document.createElement('div');
  const title = document.createElement('h2');
  title.className = 'panel__title';
  title.textContent = 'Build a worksheet pack';
  const hint = document.createElement('p');
  hint.className = 'panel__hint';
  hint.textContent =
    'Pick a theme, choose an age, then select one or more activities.';
  wrap.appendChild(title);
  wrap.appendChild(hint);
  return wrap;
}

function field(labelText) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  const label = document.createElement('label');
  label.className = 'field__label';
  label.textContent = labelText;
  wrap.appendChild(label);
  return wrap;
}

function chipGroup({ options, selected, multi, onSelect }) {
  const group = document.createElement('div');
  group.className = 'chips';
  group.setAttribute('role', multi ? 'group' : 'radiogroup');

  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.setAttribute('role', multi ? 'checkbox' : 'radio');
    const isSelected = multi ? selected.includes(opt.id) : selected === opt.id;
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    if (opt.icon) {
      const i = document.createElement('span');
      i.className = 'chip__icon';
      i.textContent = opt.icon;
      btn.appendChild(i);
    }
    const label = document.createElement('span');
    label.textContent = opt.label;
    btn.appendChild(label);
    btn.addEventListener('click', () => onSelect(opt.id));
    group.appendChild(btn);
  });

  return group;
}

function themeField(state, onChange) {
  const wrap = field('Theme');
  wrap.appendChild(
    chipGroup({
      options: THEMES,
      selected: state.themeId,
      multi: false,
      onSelect: (id) => onChange({ themeId: id }),
    }),
  );
  return wrap;
}

function ageField(state, onChange) {
  const wrap = field('Age range');
  wrap.appendChild(
    chipGroup({
      options: AGE_RANGES,
      selected: state.ageId,
      multi: false,
      onSelect: (id) => onChange({ ageId: id }),
    }),
  );
  return wrap;
}

function activityField(state, onChange) {
  const wrap = field('Activities (select one or more)');
  wrap.appendChild(
    chipGroup({
      options: ACTIVITY_TYPES,
      selected: state.activityTypeIds,
      multi: true,
      onSelect: (id) => {
        const set = new Set(state.activityTypeIds);
        if (set.has(id)) {
          // Don't allow empty selection.
          if (set.size === 1) return;
          set.delete(id);
        } else {
          set.add(id);
        }
        onChange({ activityTypeIds: Array.from(set) });
      },
    }),
  );
  return wrap;
}

function countField(state, onChange) {
  const wrap = field('Sheets per activity');
  const row = document.createElement('div');
  row.className = 'number-row';
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '1';
  input.max = '10';
  input.value = String(state.count);
  input.className = 'number-input';
  input.setAttribute('aria-label', 'Number of sheets per activity');
  input.addEventListener('change', () => {
    const v = Math.min(10, Math.max(1, parseInt(input.value || '1', 10)));
    input.value = String(v);
    onChange({ count: v });
  });
  row.appendChild(input);
  const hint = document.createElement('span');
  hint.style.fontSize = '13px';
  hint.style.color = 'var(--color-text-soft)';
  hint.textContent = '(1 – 10 each)';
  row.appendChild(hint);
  wrap.appendChild(row);
  return wrap;
}

function generateButton(state, onGenerate) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary btn--block';
  btn.innerHTML = '<span>✨</span><span>Generate worksheets</span>';
  btn.addEventListener('click', () => onGenerate());
  return btn;
}
