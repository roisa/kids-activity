let toastEl = null;
let timer = null;

export function showToast(message) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('toast--visible');
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    toastEl.classList.remove('toast--visible');
  }, 2400);
}
