// Unlock the hero's own voice in the SAME gesture as the background music.
// Waiting for the music's play() promise loses mobile autoplay permission.
const sec = document.getElementById('holo');
const v = document.getElementById('holoVid');
if (sec && v) {
  const mobile = matchMedia("(max-width:700px) and (max-aspect-ratio:1/1)").matches;
  const source = mobile && matchMedia("(pointer:coarse)").matches && v.dataset.mobileSrc ? v.dataset.mobileSrc : v.dataset.src;
  let prepared = !v.dataset.trial, preparing = false;
  let status;
  if (v.dataset.loading) {
    status = document.createElement('div');
    status.setAttribute('role', 'status');
    status.style.cssText = 'position:absolute;z-index:20;top:2%;left:50%;transform:translateX(-50%);padding:8px 13px;border:1px solid #19e6ff66;border-radius:20px;background:#020a0edb;color:#d5faff;font:500 12px/1.4 sans-serif;letter-spacing:.04em;white-space:nowrap;pointer-events:none';
    status.textContent = 'Loading video...';
    sec.appendChild(status);
    v.addEventListener('playing', () => { status.hidden = true; });
    v.addEventListener('error', () => { status.hidden = false; status.textContent = 'Video could not load. Refresh to retry.'; });
  }
  // Download this short trial completely before decoding it, avoiding network
  // stalls halfway through on mobile data. The poster stays up while it loads.
  const prepare = async () => {
    if (prepared || preparing) return;
    preparing = true;
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error("hero download failed");
      let blob;
      if (status && response.body) {
        const total = Number(response.headers.get('content-length'));
        const reader = response.body.getReader(), parts = [];
        let loaded = 0;
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          parts.push(value); loaded += value.length;
          status.textContent = total ? 'Loading video ' + Math.min(100, Math.round(loaded / total * 100)) + '%' : 'Loading video ' + (loaded / 1000000).toFixed(1) + ' MB';
        }
        blob = new Blob(parts, {type: 'video/mp4'});
        status.textContent = 'Starting video...';
      } else blob = await response.blob();
      v.src = URL.createObjectURL(blob);
    } catch { v.src = source; }
    prepared = true;
    v.load();
    apply();
  };
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
    if (!prepared) { prepare(); return; }
    if (!vis || over) { v.pause(); voice(); return; }
    // Never call play on an ended hero: browsers would start it a second time.
    v.play().then(() => { if (ticket === attempt) voice(); }).catch(() => {
      if (ticket !== attempt) return;
      v.muted = true;
      voice();
      // Keep the picture moving; the next real gesture retries the voice.
      if (vis && !over) v.play().catch(() => {
        if (status) { status.hidden = false; status.textContent = 'Tap to start video'; }
      });
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
