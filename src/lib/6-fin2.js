// Finale second frame: the founder's car frame slides in from the left as the
// footer scrolls, then the contact bar stays on top.
const sec = document.getElementById('fin');
const f2 = document.getElementById('finFrame2');
if (sec && f2) {
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (t) => t * t * (3 - 2 * t);
  const update = () => {
    const r = sec.getBoundingClientRect();
    const travel = Math.max(1, r.height - innerHeight);
    const p = clamp(-r.top / travel);
    const k = ease(clamp((p - 0.3) / 0.5));
    f2.style.transform = `translate3d(${(-104 * (1 - k)).toFixed(2)}%,0,0)`;
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}
