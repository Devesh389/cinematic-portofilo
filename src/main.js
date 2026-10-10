// The hologram is the opening. Retired canvas scenes have no canvas in this
// page, so do not download their shader/texture modules during first paint.
import { initUniverse } from './scene2/boot2.js?v=2';
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const boot = document.getElementById('boot');
if (boot) boot.classList.add('is-done');
document.documentElement.classList.remove('is-booting');
const retired = document.querySelector('.stage-wrap');
if (retired) retired.style.display = 'none';
initUniverse().catch((e) => console.warn('[devesh] universe unavailable:', e.message));

const root = document.documentElement;
// mobile menu
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
menu?.querySelectorAll('a').forEach((a, i) => a.style.setProperty('--i', i));
function setMenu(open) {
  burger.setAttribute('aria-expanded', String(open));
  root.classList.toggle('is-menu', open);
  if (open) menu.hidden = false;
  else setTimeout(() => { if (!root.classList.contains('is-menu')) menu.hidden = true; }, 500);
}
burger?.addEventListener('click', () =>
  setMenu(burger.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && root.classList.contains('is-menu')) setMenu(false);
});
