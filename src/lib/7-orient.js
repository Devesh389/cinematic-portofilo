// Device-based video sources. Today every film is portrait. When a landscape
// version exists, add it to the <video> as data-land="public/media/xyz.mp4"
// (optionally data-land-poster="...") and laptops/desktops will play it while
// phones keep the portrait file. Nothing else needs to change.
const mq = matchMedia('(min-aspect-ratio: 1/1)');
const cur = (v) => v.getAttribute('src') || (v.querySelector('source') || {}).src || v.dataset.src || '';
const apply = () => {
  document.querySelectorAll('video[data-land]').forEach((v) => {
    if (!v.dataset.port) v.dataset.port = v.getAttribute('src') || ((v.querySelector('source') || {}).getAttribute && v.querySelector('source').getAttribute('src')) || v.dataset.src || '';
    const land = mq.matches;
    const url = land ? v.dataset.land : v.dataset.port;
    const poster = land ? v.dataset.landPoster : v.dataset.portPoster;
    if (poster) v.poster = poster;
    v.classList.toggle('is-land', land);
    if (!url) return;
    if (v.dataset.src !== undefined) {
      v.dataset.src = url;
      if (!v.getAttribute('src')) return;      // not started yet: the lazy loader reads data-src
    }
    if (cur(v).endsWith(url)) return;
    const was = !v.paused;
    v.querySelectorAll('source').forEach((s) => s.remove());
    v.src = url;
    v.load();
    if (was || v.autoplay) v.play().catch(() => {});
  });
};
apply();
mq.addEventListener('change', apply);
