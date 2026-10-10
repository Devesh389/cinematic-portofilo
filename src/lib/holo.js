// The hologram opening. It starts muted (browsers insist), and once the sound
// pill is on and the opening is on screen its own voice plays too, with the
// music lowered underneath so both are heard.
const sec = document.getElementById('holo');
const v = document.getElementById('holoVid');
if (sec && v) {
  let vis = true, over = false;
  v.loop = false; v.removeAttribute('loop');
  v.addEventListener('ended', () => { over = true; });
  const apply = () => {
    const voice = !!window.__soundOn && vis;
    if (!voice && !v.muted) v.muted = true;
    if (voice && v.muted) { v.muted = false; v.volume = 1; v.play().catch(() => { v.muted = true; }); }
    dispatchEvent(new CustomEvent('voice', { detail: voice && !v.muted }));
  };
  addEventListener('site-sound', apply);
  addEventListener('site-restart', () => { over = false; v.currentTime = 0; v.play().catch(() => {}); apply(); });
  new IntersectionObserver(([e]) => {
    vis = e.isIntersecting;
    if (vis) { if (!over) v.play().catch(() => {}); } else { v.pause(); }
    apply();
  }, { threshold: 0.4 }).observe(sec);
  const nudge = () => { if (v.paused && vis && !over) v.play().catch(() => {}); apply(); };
  ['touchend', 'pointerup', 'click', 'keydown'].forEach((n) => addEventListener(n, nudge, { passive: true }));
  v.play().catch(() => {});
  setInterval(() => { if (vis && v.paused && !over) v.play().catch(() => {}); }, 1500);
}
