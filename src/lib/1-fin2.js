// Finale: the desk frame and the car frame take turns, about 5 s each, with a
// soft crossfade and a slow push-in. On portrait phones his desk clip joins
// the loop as a third beat.
const sec = document.getElementById('fin');
if (sec) {
  const mq = matchMedia('(max-aspect-ratio: 1/1) and (max-width: 700px)');
  const all = ['finStage1', 'finFrame2', 'finVidL', 'finVidN'].map((id) => document.getElementById(id)).filter(Boolean);
  const vid = document.getElementById('finVid');
  const nv = document.getElementById('finVidN');
  const nvv = document.getElementById('finVidNv');
  let i = 0, timer = 0, inView = false;
  const ready = (el) => { const im = el.querySelector('img'); return !im || (im.complete && im.naturalWidth > 0); };
  const list = () => {
    const vok = vid && vid.dataset.ok === '1';
    const nok = nv && nv.dataset.ok === '1' && mq.matches;
    const l = all.filter((el) => (el.id === 'finVidN' ? nok : el.id === 'finVidL' ? vok : el.id === 'finStage1' ? (!vok && ready(el)) : ready(el)));
    return l.length ? l : [all[0]];
  };
  const show = (idx) => {
    const L = list();
    const cur = mq.matches ? L[Math.min(idx, L.length - 1)] : L[idx % L.length];
    curEl = cur;
    for (const el of all) {
      if (el === cur) { el.classList.remove('is-off'); void el.offsetWidth; el.classList.add('is-on'); }
      else if (el.classList.contains('is-on')) { el.classList.remove('is-on'); el.classList.add('is-off'); }
    }
    carSync();
    if (nvv) { if (cur === nv) { nvv.currentTime = 0; nvv.play().catch(() => {}); } else if (nv.dataset.ok === '1') setTimeout(() => { if (!nv.classList.contains('is-on')) nvv.pause(); }, 2200); }
    if (vid) {
      if (cur.id === 'finVidL') {
        vid.currentTime = 0; vid.play().catch(() => {});
      } else if (vid.dataset.ok === '1') setTimeout(() => { if (!document.getElementById('finVidL').classList.contains('is-on')) vid.pause(); }, 2200);
    }
  };
  const cv = document.getElementById('finCarVid');
  const carSync = () => { if (cv && cv.paused) cv.play().catch(() => {}); };
  const dur = (el) => {
    const v = el && (el.id === 'finVidL' ? vid : el.id === 'finVidN' ? nvv : null);
    return v && v.duration > 0 && isFinite(v.duration) ? Math.min(12000, Math.round(v.duration * 1000) + 400) : (v ? 8400 : 5000);
  };
  let curEl = null;
  const tick = () => { i += 1; show(i); start(); };
  const start = () => {
    clearTimeout(timer);
    const L = list();
    if (mq.matches && i >= L.length - 1) return;      // phones: last beat holds, no loop-back
    timer = setTimeout(tick, dur(curEl || L[0]));
  };
  window.__finDwell = () => list().reduce((n, el) => n + dur(el), 0);
  mq.addEventListener('change', () => { i = 0; show(0); });
  document.addEventListener('visibilitychange', () => (document.hidden ? clearTimeout(timer) : start()));
  if (vid) {
    // the clip only joins the loop once it has really started playing, so a
    // phone that cannot decode it never shows a black beat
    vid.addEventListener('playing', () => { if (vid.dataset.ok !== '1') { vid.dataset.ok = '1'; const on = all.find((el) => el.classList.contains('is-on')); if (!on || on.id === 'finStage1') { i = 0; show(0); } } if (!list().includes(document.getElementById('finVidL')) ) return; });
    const warm = () => { if (vid.src) return; vid.src = vid.dataset.src; vid.load(); vid.play().catch(() => {}); };
    setTimeout(warm, 800);
    mq.addEventListener('change', warm);
  }
  if (cv) {
    // the car clip is part of the page itself and keeps playing; any touch or
    // tick retries play() in case a phone refused the first autoplay
    cv.addEventListener('playing', () => { cv.dataset.ok = '1'; cv.classList.add('is-ok'); });
    cv.addEventListener('error', () => { cv.style.display = 'none'; });
    ['touchend', 'pointerup', 'click', 'keydown'].forEach((n) => addEventListener(n, carSync, { passive: true }));
    cv.play().catch(() => {});
    setInterval(carSync, 1500);
  }
  if (nvv) {
    nvv.addEventListener('playing', () => { if (nv.dataset.ok !== '1') { nv.dataset.ok = '1'; if (!nv.classList.contains('is-on')) nvv.pause(); } });
    setTimeout(() => { if (nvv.src || !mq.matches) return; nvv.src = nvv.dataset.src; nvv.load(); nvv.play().catch(() => {}); }, 1200);
    mq.addEventListener('change', () => { if (mq.matches && !nvv.src) { nvv.src = nvv.dataset.src; nvv.load(); nvv.play().catch(() => {}); } });
  }
  window.__finCount = () => list().length;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!inView) { inView = true; i = 0; show(0); } start(); } else { inView = false; clearTimeout(timer); }
  }, { threshold: 0.2 }).observe(sec);
  show(0);
}
