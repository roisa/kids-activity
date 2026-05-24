export function renderHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';

  const brand = document.createElement('div');
  brand.className = 'app-header__brand';
  brand.innerHTML = `
    <div class="app-header__logo">K</div>
    <div>
      <div class="app-header__title">Kids Activity Generator</div>
      <div class="app-header__subtitle">Printable worksheets for parents, teachers & homeschoolers</div>
    </div>
  `;
  header.appendChild(brand);

  const actions = document.createElement('div');
  actions.className = 'app-header__actions';
  const tip = document.createElement('span');
  tip.style.fontSize = '12px';
  tip.style.color = 'var(--color-text-muted)';
  tip.textContent = 'Free · No sign-up · Runs in your browser';
  actions.appendChild(tip);
  header.appendChild(actions);

  return header;
}

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `Made with ❤ for little learners. PDFs generated locally — your inputs never leave your device.`;
  return footer;
}
