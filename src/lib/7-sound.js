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
btn.innerHTML = '<svg class="snd__x" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg><i></i><i></i><i></i><i></i><span>Sound off</span>';
document.body.appendChild(btn);

const css = document.createElement('style');
css.textContent = `
.snd{position:fixed;left:clamp(14px,2vw,28px);bottom:clamp(14px,2.4vh,28px);z-index:99999;display:flex;align-items:flex-end;gap:3px;padding:13px 20px;border:1px solid rgba(25,230,255,.5);border-radius:999px;background:rgba(2,10,14,.72);color:#bff9ff;font:600 13px/1 Oswald,'Arial Narrow',sans-serif;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(6px);transition:box-shadow .25s,border-color .25s}
.snd:hover{box-shadow:0 0 22px rgba(25,230,255,.45);border-color:#19e6ff}
.snd i{display:block;width:3px;height:5px;background:#19e6ff;border-radius:2px;align-self:center}
.snd span{margin-left:8px;align-self:center}
.snd.on i{animation:sndbar .9s ease-in-out infinite}
.snd.on i:nth-child(2){animation-delay:.15s}.snd.on i:nth-child(3){animation-delay:.3s}.snd.on i:nth-child(4){animation-delay:.45s}
@keyframes sndbar{0%,100%{height:5px}50%{height:15px}}
.snd .snd__x{display:block;flex:none;color:#ff6b78;align-self:center;margin-right:6px}
.snd i{display:none}
.snd.on i{display:block}
.snd.on .snd__x{display:none}
.snd:not(.on){box-shadow:0 0 28px rgba(255,60,80,.35);border-color:rgba(255,107,120,.85);background:rgba(20,3,8,.88);animation:sndpulse 1.8s ease-in-out infinite}
.snd:not(.on) span{color:#fff}
.snd{border:1px solid rgba(255,255,255,.85);background:linear-gradient(180deg,#ff3b4a,#d9101f);color:#fff;box-shadow:0 6px 22px rgba(255,35,55,.45)}
.snd:hover{box-shadow:0 6px 28px rgba(255,35,55,.7);border-color:#fff}
.snd i{background:#fff}
.snd .snd__x{color:#fff}
.snd:not(.on){background:linear-gradient(180deg,#ff3b4a,#d9101f);border-color:#fff;animation:sndpulse 1.8s ease-in-out infinite}
.snd:not(.on) span{color:#fff}
.snd.on{background:rgba(20,4,8,.88);border-color:rgba(255,255,255,.8);box-shadow:0 0 0 1px rgba(255,42,58,.6),0 4px 20px rgba(255,35,55,.35);animation:none}
@keyframes sndpulse{0%,100%{box-shadow:0 0 0 0 rgba(255,80,95,.55)}50%{box-shadow:0 0 0 12px rgba(255,80,95,0)}}`;
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
  btn.querySelector('span').textContent = on ? 'Sound on' : 'Sound off \u00b7 tap to turn on';
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
  btn.querySelector('span').textContent = on ? 'Sound on' : 'Sound off \u00b7 tap to turn on';
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

// the song plays once through, then stops. When the whole experience restarts
// from the top (site-restart) it starts again from the beginning, with no tap needed
// because the browser already unlocked audio for this page.
a.addEventListener('ended', () => { done = true; live = false; show(false); });
addEventListener('site-restart', () => {
  if (userOff) return;                       // he switched sound off himself: respect it
  done = false;
  clearInterval(fade);
  a.currentTime = 0; a.muted = false; a.volume = 0;
  a.play().then(() => { live = true; show(true); ramp(window.__voice ? 0.3 : 0.85); }).catch(() => { live = false; show(false); });
});
