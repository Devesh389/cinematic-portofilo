// Renders DEVESH into a single coverage texture and reports the ink rectangle
// of every individual letter.
//
// Why a texture and not DOM text: the two people who live inside the G and the H
// have to be clipped by the real letterforms. Sharing one atlas means the clip
// mask and the visible letter are the same pixels, so they can never drift apart
// by even a subpixel, at any size or device pixel ratio.
//
// The reference artwork is set in a compressed heavy grotesque. Anton is the
// closest widely available face but is naturally wider, so a single horizontal
// scale is solved for at runtime to hit the reference's measured
// word-width : cap-height ratio. One uniform scale keeps the letterforms
// consistent with each other; per-letter fitting would distort the I into a slab
// while squeezing the E, which is what makes lettering look counterfeit.

const LINES = ['DEVESH', 'SARKAAR'];
const GAP = 0.07; // gap between the two lines, as a fraction of the block height

// measured from the supplied hero artwork: ink width / cap height
export const TARGET_RATIO = 3.121;

function ctx2d(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c.getContext('2d', { willReadFrequently: false });
}

function metricsFor(ctx, ch) {
  const m = ctx.measureText(ch);
  return {
    advance: m.width,
    left: m.actualBoundingBoxLeft,
    right: m.actualBoundingBoxRight,
    ascent: m.actualBoundingBoxAscent,
    descent: m.actualBoundingBoxDescent,
  };
}

/**
 * Two stacked lines (DEVESH over SARKAAR), each stretched to the same width so
 * the block keeps the original word's footprint: width = TARGET_RATIO x height.
 * @param {number} capHeightPx height of the whole block in device pixels
 * @param {number} maxTexture  gl.MAX_TEXTURE_SIZE
 */
export function buildWord(capHeightPx, maxTexture = 4096) {
  const probe = 400;
  const FONT = (px) => `${px}px Anton, "Arial Narrow", Impact, sans-serif`;
  const c = ctx2d(8, 8);
  c.font = FONT(probe);
  c.textBaseline = 'alphabetic';
  const capAt = metricsFor(c, 'H').ascent || probe * 0.72;

  const lineCap = capHeightPx * (1 - GAP) / LINES.length;
  const lineStep = lineCap + capHeightPx * GAP;
  const size0 = (lineCap / capAt) * probe;
  c.font = FONT(size0);
  const tracking = -0.012 * lineCap;
  const targetInk = TARGET_RATIO * capHeightPx;
  const pad = Math.ceil(capHeightPx * 0.06);

  // walk every line with the pen and fix its horizontal stretch
  const rows = LINES.map((text) => {
    let pen = 0;
    let natL = Infinity;
    let natR = -Infinity;
    const walk = [...text].map((ch) => {
      const m = metricsFor(c, ch);
      const at = pen;
      natL = Math.min(natL, at - m.left);
      natR = Math.max(natR, at + m.right);
      pen += m.advance + tracking;
      return { char: ch, pen: at, m };
    });
    return { walk, natL, scaleX: targetInk / (natR - natL) };
  });

  let W = Math.ceil(targetInk) + pad * 2;
  let H = Math.ceil(capHeightPx) + pad * 2;
  let fit = 1;
  if (W > maxTexture) fit = maxTexture / W;
  if (H * fit > maxTexture) fit = maxTexture / H;
  if (fit < 1) { W = Math.floor(W * fit); H = Math.floor(H * fit); }

  const g = ctx2d(W, H);
  g.font = FONT(size0 * fit);
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#fff';

  const letters = [];
  rows.forEach((row, li) => {
    const top = li * lineStep;
    g.setTransform(row.scaleX * fit, 0, 0, fit, (-row.natL * row.scaleX * fit) + pad, (top + lineCap) * fit + pad);
    row.walk.forEach((r) => {
      g.fillText(r.char, r.pen, 0);
      const x0 = (r.pen - r.m.left) * row.scaleX;
      const x1 = (r.pen + r.m.right) * row.scaleX;
      const x = (x0 - row.natL * row.scaleX) * fit + pad;
      const w = (x1 - x0) * fit;
      const y = (top + lineCap - r.m.ascent) * fit + pad;
      const h = r.m.ascent * fit;
      letters.push({ char: r.char, x, y, w, h, u0: x / W, v0: y / H, u1: (x + w) / W, v1: (y + h) / H });
    });
  });
  g.setTransform(1, 0, 0, 1, 0, 0);

  return {
    canvas: g.canvas,
    width: W,
    height: H,
    pad,
    fit,
    ink: { x: pad, y: pad, w: targetInk * fit, h: capHeightPx * fit },
    letters,
  };
}

export async function fontsReady() {
  if (!document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load('400 200px Anton'),
      document.fonts.load('700 40px Oswald'),
      document.fonts.load('400 40px Oswald'),
    ]);
    await document.fonts.ready;
  } catch { /* fall back to the stack in the font shorthand */ }
}
