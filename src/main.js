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
