# Cinematic auto-scroll website

A hands-free, self-playing cinematic website: WebGL scenes, a hologram intro with voice, project videos, a timeline, a finale and a contact page. It scrolls itself, plays music once, and restarts from the top when it ends. No framework, no build step.

Live example: https://devesh.propvanceitsolutions.com/

## Run it

```bash
python tools/serve.py 5173
```

Open http://localhost:5173. Any static host works (Nginx, Netlify, GitHub Pages). To deploy, copy the folder to the server.

## Make it yours

Everything personal lives in a few places. Replace these and the site is yours.

| What | Where |
|---|---|
| Name, role, tagline, contact links | `index.html`, `founder.html`, `src/scene6/` |
| Hologram intro video (with voice) | `public/media/` (`holohero.mp4`, poster `holohero.jpg`) |
| Project and company cards | `src/scene4/`, `public/projects/` |
| Finale videos | `public/fin/` |
| Founder photo and logos | `assets/`, `public/years/` |
| Music | `public/` audio file referenced in `src/lib/sound.js` |
| Colors | `src/styles/*.css` (cyan/black scenes, red/black finale and contact) |

The photos, videos and logos in this repo are Devesh Sarkaar's personal assets. Treat them as placeholders and replace them with your own before publishing.

## How it behaves

- Auto-scroll: scenes advance on their own timeline (about 5 s each, the hologram 10 s). The visitor can scroll at any time to take over.
- Sound: browsers only unlock audio after a real tap, so a "Sound off - tap to turn on" button shows on load. Once on, the music plays once and the hologram voice plays over it.
- Restart: after 5 s at the end, the site jumps to the top and plays again.
- Devices: phones in portrait use portrait videos; laptops, tablets and desktops use landscape videos (`data-land` attributes).

## Video tools

`tools/` has Python helpers to cut a subject out of a plain backdrop and pack videos for the site (`matte.py`, `build_media.py`). Put source clips in `assets_src/` and run `python tools/build_media.py`.
