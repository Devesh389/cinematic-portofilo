// Portrait screens: his own videos, full-bleed. Landscape screens keep the
// landscape frames; a video file is only fetched on portrait.
const mq = matchMedia('(max-aspect-ratio: 1/1)');
const vids = ['chronoVid', 'galleryVid'].map((id) => document.getElementById(id)).filter(Boolean);
const sync = () => {
  for (const v of vids) {
    if (mq.matches) {
      if (!v.src) { v.src = v.dataset.src; v.load(); }
      v.play().catch(() => {});
    } else if (v.src) {
      v.pause();
    }
  }
};
mq.addEventListener('change', sync);
sync();
