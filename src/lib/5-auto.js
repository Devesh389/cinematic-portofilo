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
  if (id === 'fin') return ((window.__finCount ? window.__finCount() : 2) * 5000) + 1200;
  return 8500;
};
const near = () => {
  let best = 0, d = 1e9;
  ids.forEach((id, k) => { const t = top(id); if (t == null) return; const x = Math.abs(t - scrollY); if (x < d) { d = x; best = k; } });
  return best;
};
let timer = 0, running = false, mine = false;
const wipe = document.createElement('div');
wipe.style.cssText = 'position:fixed;inset:0;z-index:99990;pointer-events:none;background:linear-gradient(100deg,transparent 38%,rgba(25,230,255,.2) 50%,transparent 62%);transform:translateX(-100%)';
document.body.appendChild(wipe);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
let anim = 0;
const go = (k) => {
  const t = top(ids[k]);
  if (t == null) return;
  mine = true;
  cancelAnimationFrame(anim);
  const from = scrollY, t0 = performance.now(), ms = 2600;
  document.documentElement.style.scrollSnapType = 'none';
  wipe.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }], { duration: ms, easing: 'cubic-bezier(.4,0,.2,1)' });
  const f = (n) => {
    const p = Math.min(1, (n - t0) / ms);
    scrollTo(0, from + (t - from) * ease(p));
    if (p < 1) anim = requestAnimationFrame(f);
    else { mine = false; document.documentElement.style.scrollSnapType = ''; }
  };
  anim = requestAnimationFrame(f);
};
const plan = (k, wait) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (k >= ids.length - 1) return;
    go(k + 1);
    plan(k + 1, dwell(ids[k + 1]) + 2600);
  }, wait);
};
const interrupt = () => {
  if (!running) return;
  clearTimeout(timer);
  timer = setTimeout(() => { const k = near(); plan(k, 6000); }, 14000);
};
['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((n) => addEventListener(n, () => { if (mine) { cancelAnimationFrame(anim); mine = false; document.documentElement.style.scrollSnapType = ''; } interrupt(); }, { passive: true }));
const boot = document.getElementById('boot');
const iv = setInterval(() => {
  if (boot && boot.classList.contains('is-done')) {
    clearInterval(iv);
    running = true;
    plan(0, dwell('hero'));
  }
}, 300);
