// Hands-free flow. A single watchdog loop drives everything so it cannot get
// stuck: hero beat, then each scene ~5 s, gliding on its own. Real scrolling
// (wheel / finger drag / keys) takes over; after a quiet spell it carries on
// from wherever the visitor stopped. Taps alone never interrupt.
const ids = ['holo', 'universe', 'chrono', 'gallery', 'fin', 'contact', 'end'];
const GLIDE = 1900;
const top = (id) => {
  if (id === 'holo') return 0;
  if (id === 'hero') { const sp = document.querySelector('.hero-spacer'); return sp ? Math.round(sp.getBoundingClientRect().top + window.scrollY) : null; }
  if (id === 'end') return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const el = document.getElementById(id);
  return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
};
const dwell = (id) => {
  if (id === 'holo') return 10000;
  if (id === 'hero') return 6500;
  if (id === 'fin') return (window.__finDwell ? window.__finDwell() : 10000) + 2600;
  return 5000;
};
const near = () => {
  let best = 0, d = 1e9;
  ids.forEach((id, k) => { const t = top(id); if (t == null) return; const x = Math.abs(t - window.scrollY); if (x < d) { d = x; best = k; } });
  return best;
};
const setY = (y) => {
  window.scrollTo({ top: y, left: 0, behavior: 'instant' });
  const se = document.scrollingElement;
  if (se && Math.abs(se.scrollTop - y) > 2) se.scrollTop = y;
};
const wipe = document.createElement('div');
wipe.style.cssText = 'position:fixed;inset:0;z-index:99990;pointer-events:none;background:linear-gradient(100deg,transparent 38%,rgba(25,230,255,.2) 50%,transparent 62%);transform:translateX(-100%)';
document.body.appendChild(wipe);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let gliding = false, anim = 0, idx = 0, arrived = 0, pausedUntil = 0, started = 0;
const snap = (on) => { document.documentElement.style.scrollSnapType = on ? '' : 'none'; };
const glide = (k) => {
  const t = top(ids[k]);
  if (t == null) return;
  gliding = true; snap(false);
  const from = window.scrollY, t0 = performance.now();
  try { wipe.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }], { duration: GLIDE, easing: 'cubic-bezier(.4,0,.2,1)' }); } catch {}
  const f = (n) => {
    if (!gliding) return;
    const p = Math.min(1, (n - t0) / GLIDE);
    setY(from + (t - from) * ease(p));
    if (p < 1) anim = requestAnimationFrame(f);
    else { gliding = false; idx = k; arrived = performance.now(); snap(true); }
  };
  anim = requestAnimationFrame(f);
};
const stop = () => {
  if (gliding) { gliding = false; cancelAnimationFrame(anim); snap(true); }
  pausedUntil = performance.now() + 6000;
  arrived = 0;
};
['wheel', 'touchmove', 'keydown'].forEach((n) => addEventListener(n, stop, { passive: true }));

const boot = document.getElementById('boot');
const ready = () => !boot || boot.classList.contains('is-done') || getComputedStyle(boot).visibility === 'hidden';
setInterval(() => {
  const now = performance.now();
  if (!ready()) return;
  if (!started) { started = now; arrived = now; idx = near(); }
  if (gliding || now < pausedUntil) return;
  if (!arrived) { idx = near(); arrived = now; }
  if (idx >= ids.length - 1) return;
  if (now - arrived >= dwell(ids[idx])) glide(idx + 1);
}, 250);
