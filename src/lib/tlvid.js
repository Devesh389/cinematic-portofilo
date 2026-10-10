// Fetch later films only as their scenes approach, not during hero loading.
const mq = matchMedia('(max-aspect-ratio: 1/1) and (max-width: 700px)');
for (const id of ['chronoVid', 'galleryVid']) {
  const v = document.getElementById(id);
  if (!v) continue;
  let near = false, visible = false;
  const sync = () => {
    if (!(mq.matches || v.dataset.land) || !near) { v.pause(); return; }
    if (!v.getAttribute('src')) { v.src = v.dataset.src; v.preload = 'auto'; v.load(); }
    if (visible) v.play().catch(() => {}); else v.pause();
  };
  mq.addEventListener('change', sync);
  const section = v.closest('section');
  new IntersectionObserver(([e]) => { near = e.isIntersecting; sync(); },
    { rootMargin: '500px 0px', threshold: 0 }).observe(section);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); },
    { threshold: 0.15 }).observe(section);
}
