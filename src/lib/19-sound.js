// One sound for the whole site: a single looping track, off until the visitor
// turns it on (browsers block autoplay with sound). The choice is remembered
// for the session so it carries across the portfolio and the founder page.
const SRC = 'public/media/1-track.mp3';
const KEY = 'site-sound';
const a = new Audio(SRC);
a.loop = false;   // plays through once, then stops
a.preload = 'auto';
a.volume = 0;

const btn = document.createElement('button');
btn.type = 'button';
btn.className = 'snd';
btn.setAttribute('aria-pressed', 'false');
btn.innerHTML = '<i></i><i></i><i></i><i></i><span>Sound off</span>';
document.body.appendChild(btn);

const css = document.createElement('style');
css.textContent = `
.snd{position:fixed;left:clamp(14px,2vw,28px);bottom:clamp(14px,2.4vh,28px);z-index:99999;display:flex;align-items:flex-end;gap:3px;padding:10px 14px;border:1px solid rgba(25,230,255,.5);border-radius:999px;background:rgba(2,10,14,.72);color:#bff9ff;font:500 11px/1 Oswald,'Arial Narrow',sans-serif;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(6px);transition:box-shadow .25s,border-color .25s}
.snd:hover{box-shadow:0 0 22px rgba(25,230,255,.45);border-color:#19e6ff}
.snd i{display:block;width:3px;height:5px;background:#19e6ff;border-radius:2px;align-self:center}
.snd span{margin-left:8px;align-self:center}
.snd.on i{animation:sndbar .9s ease-in-out infinite}
.snd.on i:nth-child(2){animation-delay:.15s}.snd.on i:nth-child(3){animation-delay:.3s}.snd.on i:nth-child(4){animation-delay:.45s}
@keyframes sndbar{0%,100%{height:5px}50%{height:15px}}`;
document.head.appendChild(css);

let fade = 0;
function ramp(to, done) {
  clearInterval(fade);
  fade = setInterval(() => {
    const d = to - a.volume;
    if (Math.abs(d) < 0.04) { a.volume = to; clearInterval(fade); done && done(); return; }
    a.volume = Math.min(1, Math.max(0, a.volume + Math.sign(d) * 0.04));
  }, 40);
}
function set(on) {
  btn.classList.toggle('on', on);
  btn.setAttribute('aria-pressed', String(on));
  btn.querySelector('span').textContent = on ? 'Sound on' : 'Sound off';
  try { sessionStorage.setItem(KEY, on ? '1' : '0'); } catch {}
  if (on) { a.play().then(() => ramp(0.85)).catch(() => set(false)); }
  else ramp(0, () => a.pause());
}
// Sound should just be on. Browsers only allow audio after a real gesture
// (touchend / click / key / mouseup count; touchstart, pointerdown and scroll
// do not), so we try on load, and then on EVERY gesture until playback really
// starts. The pill always shows the true state and stays as the off switch.
let userOff = false, live = false, done = false;
try { userOff = localStorage.getItem('site-sound-off') === '1'; } catch {}
const rem = (off) => { try { localStorage.setItem('site-sound-off', off ? '1' : '0'); } catch {} };
const show = (on) => {
  window.__soundOn = on; dispatchEvent(new CustomEvent('site-sound', { detail: on }));
  btn.classList.toggle('on', on);
  btn.setAttribute('aria-pressed', String(on));
  btn.querySelector('span').textContent = on ? 'Sound on' : (userOff ? 'Sound off' : 'Touch for sound');
};
const tryOn = () => {
  if (userOff || live) return;
  a.muted = false;
  a.play().then(() => { live = true; show(true); ramp(window.__voice ? 0.3 : 0.85); drop(); }).catch(() => { show(false); a.muted = true; a.volume = 0.85; a.play().catch(() => {}); });
};
btn.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  if (live && !a.paused) { userOff = true; rem(true); live = false; show(false); ramp(0, () => a.pause()); }
  else { userOff = false; rem(false); if (done) { done = false; a.currentTime = 0; } tryOn(); }
}, true);
const evs = ['touchstart', 'pointerdown', 'touchend', 'pointerup', 'mouseup', 'click', 'keydown'];
const onGesture = (e) => { if (!btn.contains(e.target)) tryOn(); };
evs.forEach((n) => addEventListener(n, onGesture, { capture: true, passive: true }));
const drop = () => evs.forEach((n) => removeEventListener(n, onGesture, true));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) a.pause();
  else if (live && !userOff) a.play().catch(() => { live = false; show(false); });
});
tryOn();
setTimeout(tryOn, 1500);

// the hologram voice and the music play together; the music sits lower under the voice
addEventListener('voice', (e) => { window.__voice = e.detail; if (live && !userOff) ramp(e.detail ? 0.3 : 0.85); });

// once through, then silence; and silence at the very end of the page too
const finish = () => { if (done) return; done = true; userOff = true; live = false; show(false); ramp(0, () => a.pause()); };
a.addEventListener('ended', () => { done = true; userOff = true; live = false; show(false); });
const atEnd = () => document.documentElement.scrollHeight - (window.scrollY + window.innerHeight) < 6;
addEventListener('scroll', () => { if (!done && !a.paused && atEnd() && document.documentElement.scrollHeight > window.innerHeight * 2) finish(); }, { passive: true });
