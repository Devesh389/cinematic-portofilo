// Unlock the hero's own voice in the SAME gesture as the background music.
// Waiting for the music's play() promise loses mobile autoplay permission.
const sec = document.getElementById('holo');
const v = document.getElementById('holoVid');
if (sec && v) {
  let vis = true, over = false, wanted = !!window.__soundOn, attempt = 0;
  v.loop = false;
  v.removeAttribute('loop');
  const voice = () => dispatchEvent(new CustomEvent('voice', {
    detail: wanted && vis && !over && !v.muted && !v.paused
  }));
  const apply = () => {
    const ticket = ++attempt;
    const audible = wanted && vis && !over;
    v.muted = !audible;
    v.volume = 1;
    if (!vis || over) { v.pause(); voice(); return; }
    // Never call play on an ended hero: browsers would start it a second time.
    v.play().then(() => { if (ticket === attempt) voice(); }).catch(() => {
      if (ticket !== attempt) return;
      v.muted = true;
      voice();
      // Keep the picture moving; the next real gesture retries the voice.
      if (vis && !over) v.play().catch(() => {});
    });
    voice();
  };
  addEventListener('site-sound-unlock', (e) => { wanted = !!e.detail; apply(); });
  addEventListener('site-sound', (e) => { wanted = !!e.detail; apply(); });
  v.addEventListener('playing', voice);
  v.addEventListener('pause', voice);
  v.addEventListener('ended', () => { over = true; voice(); });
  addEventListener('site-restart', () => {
    over = false;
    v.currentTime = 0;
    // restart scrolls to the hero synchronously, before the observer fires
    const r = sec.getBoundingClientRect();
    vis = r.bottom > innerHeight * 0.4 && r.top < innerHeight * 0.6;
    wanted = !!window.__soundOn;
    apply();
  });
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; apply(); },
    { threshold: 0.4 }).observe(sec);
  const nudge = () => { if (vis && !over) apply(); };
  ['touchend', 'pointerup', 'click', 'keydown'].forEach((n) =>
    addEventListener(n, nudge, { passive: true }));
  apply();
  setInterval(() => { if (vis && v.paused && !over) apply(); }, 1500);
}
