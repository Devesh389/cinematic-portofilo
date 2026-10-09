// Timeline scene on portrait screens: his own video, full-bleed. Landscape
// screens keep the landscape frame; the video file is only fetched on portrait.
const v = document.getElementById('chronoVid');
if (v) {
  const mq = matchMedia('(max-aspect-ratio: 1/1)');
  const sync = () => {
    if (mq.matches) {
      if (!v.src) { v.src = v.dataset.src; v.load(); }
      v.play().catch(() => {});
    } else if (v.src) {
      v.pause();
    }
  };
  mq.addEventListener('change', sync);
  sync();
}
