// Finale: the desk frame and the car frame take turns, about 5 s each, with a
// soft crossfade and a slow push-in. On portrait phones his desk clip joins
// the loop as a third beat.
const sec = document.getElementById('fin');
if (sec) {
  const mq = matchMedia('(max-aspect-ratio: 1/1)');
  const all = ['finStage1', 'finFrame2', 'finVidL'].map((id) => document.getElementById(id)).filter(Boolean);
  const vid = document.getElementById('finVid');
  let i = 0, timer = 0;
  const ready = (el) => { const im = el.querySelector('img'); return !im || (im.complete && im.naturalWidth > 0); };
  const list = () => {
    const vok = vid && vid.dataset.ok === '1';
    const l = all.filter((el) => (el.id === 'finVidL' ? vok : el.id === 'finStage1' ? (!vok && ready(el)) : ready(el)));
    return l.length ? l : [all[0]];
  };
  const show = (idx) => {
    const L = list();
    const cur = L[idx % L.length];
    for (const el of all) {
      if (el === cur) { el.classList.remove('is-off'); void el.offsetWidth; el.classList.add('is-on'); }
      else if (el.classList.contains('is-on')) { el.classList.remove('is-on'); el.classList.add('is-off'); }
    }
    carSync();
    if (vid) {
      if (cur.id === 'finVidL') {
        vid.currentTime = 0; vid.play().catch(() => {});
      } else if (vid.dataset.ok === '1') setTimeout(() => { if (!document.getElementById('finVidL').classList.contains('is-on')) vid.pause(); }, 2200);
    }
  };
  const cv = document.getElementById('finCarVid');
  const carSync = () => {
    if (!cv || cv.dataset.ok !== '1') return;
    if (document.getElementById('finFrame2').classList.contains('is-on')) cv.play().catch(() => {});
    else setTimeout(() => { if (!document.getElementById('finFrame2').classList.contains('is-on')) cv.pause(); }, 2200);
  };
  const tick = () => { i += 1; show(i); };
  const start = () => { clearInterval(timer); timer = setInterval(tick, 5000); };
  mq.addEventListener('change', () => { i = 0; show(0); });
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : start()));
  if (vid) {
    // the clip only joins the loop once it has really started playing, so a
    // phone that cannot decode it never shows a black beat
    vid.addEventListener('playing', () => { if (vid.dataset.ok !== '1') { vid.dataset.ok = '1'; const on = all.find((el) => el.classList.contains('is-on')); if (!on || on.id === 'finStage1') { i = 0; show(0); } } if (!list().includes(document.getElementById('finVidL')) ) return; });
    const warm = () => { if (vid.src) return; vid.src = vid.dataset.src; vid.load(); vid.play().catch(() => {}); };
    setTimeout(warm, 800);
    mq.addEventListener('change', warm);
  }
  if (cv) {
    cv.addEventListener('playing', () => { if (cv.dataset.ok !== '1') { cv.dataset.ok = '1'; cv.classList.add('is-ok'); carSync(); } });
    setTimeout(() => { cv.src = cv.dataset.src; cv.load(); cv.play().then(() => { if (!document.getElementById('finFrame2').classList.contains('is-on')) cv.pause(); }).catch(() => {}); }, 1500);
  }
  window.__finCount = () => list().length;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { start(); } else { clearInterval(timer); }
  }, { threshold: 0.2 }).observe(sec);
  show(0);
}
