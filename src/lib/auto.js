// Hands-free flow: the hero walk plays through, then the page glides scene to
// scene by itself. Any wheel, touch, key or drag hands control back; after a
// quiet spell the flow carries on from wherever he stopped.
const ids = ['hero', 'universe', 'chrono', 'gallery', 'fin', 'contact'];
const top = (id) => {
  if (id === 'hero') return 0;
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect().top + scrollY : null;
};
const dwell = (id) => {
  if (id === 'hero') return 10500;
  if (id === 'universe') return 9000;
  if (id === 'fin') return ((window.__finCount ? window.__finCount() : 2) * 10000) + 1200;
  return 8500;
};
const near = () => {
  let best = 0, d = 1e9;
  ids.forEach((id, k) => { const t = top(id); if (t == null) return; const x = Math.abs(t - scrollY); if (x < d) { d = x; best = k; } });
  return best;
};
let timer = 0, running = false, mine = false;
const go = (k) => {
  const t = top(ids[k]);
  if (t == null) return;
  mine = true;
  scrollTo({ top: t, behavior: 'smooth' });
  setTimeout(() => { mine = false; }, 1600);
};
const plan = (k, wait) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (k >= ids.length - 1) return;
    go(k + 1);
    plan(k + 1, dwell(ids[k + 1]) + 1200);
  }, wait);
};
const interrupt = () => {
  if (!running) return;
  clearTimeout(timer);
  timer = setTimeout(() => { const k = near(); plan(k, 6000); }, 14000);
};
['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((n) => addEventListener(n, () => { if (!mine) interrupt(); }, { passive: true }));
const boot = document.getElementById('boot');
const iv = setInterval(() => {
  if (boot && boot.classList.contains('is-done')) {
    clearInterval(iv);
    running = true;
    plan(0, dwell('hero'));
  }
}, 300);
