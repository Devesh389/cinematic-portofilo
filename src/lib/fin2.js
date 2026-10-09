// Finale: the desk frame and the car frame take turns, about 10 s each, with a
// soft crossfade and a slow push-in. On portrait phones his desk clip joins
// the loop as a third beat.
const sec = document.getElementById('fin');
if (sec) {
  const mq = matchMedia('(max-aspect-ratio: 1/1)');
  const all = ['finStage1', 'finFrame2', 'finVidL'].map((id) => document.getElementById(id)).filter(Boolean);
  const vid = document.getElementById('finVid');
  let i = 0, timer = 0;
  const list = () => all.filter((el) => el.id !== 'finVidL' || (mq.matches && vid));
  const show = (idx) => {
    const L = list();
    const cur = L[idx % L.length];
    for (const el of all) {
      if (el === cur) { el.classList.remove('is-off'); void el.offsetWidth; el.classList.add('is-on'); }
      else if (el.classList.contains('is-on')) { el.classList.remove('is-on'); el.classList.add('is-off'); }
    }
    if (vid) {
      if (cur.id === 'finVidL') {
        if (!vid.src) { vid.src = vid.dataset.src; vid.load(); }
        vid.currentTime = 0; vid.play().catch(() => {});
      } else setTimeout(() => vid.pause(), 2000);
    }
  };
  const tick = () => { i += 1; show(i); };
  const start = () => { clearInterval(timer); timer = setInterval(tick, 10000); };
  mq.addEventListener('change', () => { i = 0; show(0); });
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : start()));
  show(0); start();
}
