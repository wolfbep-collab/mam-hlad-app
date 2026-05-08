/* eslint-disable */
// Generates the "Mám hlad" app icons: a friendly noodle bowl seen from the
// front, with two chopsticks leaning out to the upper right and a small noodle
// curl peeking from the rim. Pure Node, no external deps.
//
// Run: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ASSETS = path.join(__dirname, '..', 'assets');

// ---------- PNG encoder ----------
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}
function writePng(filePath, width, height, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[(stride + 1) * y] = 0;
    pixels.copy(raw, (stride + 1) * y + 1, stride * y, stride * (y + 1));
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  fs.writeFileSync(filePath, Buffer.concat([
    sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0)),
  ]));
}

// ---------- color helpers ----------
function rgba(hex, a = 255) {
  const v = hex.replace('#', '');
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
    a,
  ];
}
// Warm-only palette: launcher-icon background uses primarySoft (#FFEDD5) — the
// same colour as the round bowl badge on the home screen — so the app icon and
// the in-app brand mark read as one. Bowl interior stays a deeper beige so the
// rim still pops on the slightly more orange-cream backdrop. No near-black
// tones — chopsticks are warm amber, never read as a black detail at small
// launcher sizes.
const PALETTE = {
  CREAM_BG: rgba('#FFEDD5'),
  RIM_INSIDE: rgba('#FFE4C4'),
  ORANGE: rgba('#F97316'),
  ORANGE_DARK: rgba('#C2410C'),
  WOOD: rgba('#B45309'),
  NOODLE: rgba('#FBBF24'),
  TRANSPARENT: [0, 0, 0, 0],
};

// Premultiplied "source over" blend, src has scalar alpha multiplier `a`.
function blendInto(dst, off, src, a) {
  if (a <= 0) return;
  const sa = (src[3] / 255) * a;
  if (sa >= 1) {
    dst[off] = src[0]; dst[off + 1] = src[1]; dst[off + 2] = src[2]; dst[off + 3] = 255;
    return;
  }
  const da = dst[off + 3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa <= 0) { dst[off + 3] = 0; return; }
  dst[off]     = Math.round((src[0] * sa + dst[off]     * da * (1 - sa)) / oa);
  dst[off + 1] = Math.round((src[1] * sa + dst[off + 1] * da * (1 - sa)) / oa);
  dst[off + 2] = Math.round((src[2] * sa + dst[off + 2] * da * (1 - sa)) / oa);
  dst[off + 3] = Math.round(oa * 255);
}

// ---------- signed-distance helpers ----------
function sdCircle(x, y, cx, cy, r) {
  const dx = x - cx, dy = y - cy;
  return Math.sqrt(dx * dx + dy * dy) - r;
}
function sdEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx, dy = (y - cy) / ry;
  const k = Math.sqrt(dx * dx + dy * dy);
  return (k - 1) * Math.min(rx, ry);
}
function sdSegment(x, y, ax, ay, bx, by) {
  const pax = x - ax, pay = y - ay;
  const bax = bx - ax, bay = by - ay;
  const denom = bax * bax + bay * bay || 1;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / denom));
  const dx = pax - bax * h, dy = pay - bay * h;
  return Math.sqrt(dx * dx + dy * dy);
}
// 1-px feather: sd <= -0.5 → fully inside (1.0), sd >= 0.5 → outside (0.0)
function cov(sd) {
  if (sd <= -0.5) return 1;
  if (sd >= 0.5) return 0;
  return 0.5 - sd;
}

// ---------- one icon ----------
function drawIcon(W, opts) {
  const px = Buffer.alloc(W * W * 4);
  const bg = opts.background || PALETTE.TRANSPARENT;
  for (let i = 0; i < W * W; i++) {
    const o = i * 4;
    px[o] = bg[0]; px[o + 1] = bg[1]; px[o + 2] = bg[2]; px[o + 3] = bg[3];
  }

  // S = portion of canvas the artwork occupies (1.0 fills, ~0.7 fits adaptive safe zone)
  const S = opts.scale ?? 0.92;
  // yOffset shifts the bowl down inside the canvas. Use a larger value when there
  // is "headroom" above (icon.png) and a smaller value when the artwork must be
  // visually centred (adaptive icon, splash).
  const yOffsetFactor = opts.yOffsetFactor ?? 0.05;
  const cx = W / 2;
  const cy = W / 2 + W * S * yOffsetFactor;
  const R  = W * S * 0.32;            // bowl radius

  const RIM_RX = R * 1.02;
  const RIM_RY = R * 0.22;

  // Two parallel chopsticks emerging from inside the rim, leaning up-right.
  // Direction vector (0.55, -1.30); unit normal (1.30, 0.55)/|d|.
  const dirLen = Math.hypot(0.55, 1.30);
  const nX = 1.30 / dirLen;
  const nY = 0.55 / dirLen;
  const sep = R * 0.22; // chopstick centre separation
  const cs1A = { x: cx + R * 0.10,  y: cy - R * 0.05 };
  const cs1B = { x: cx + R * 0.10 + R * 0.55,  y: cy - R * 0.05 - R * 1.30 };
  const cs2A = { x: cs1A.x + nX * sep, y: cs1A.y + nY * sep };
  const cs2B = { x: cs1B.x + nX * sep, y: cs1B.y + nY * sep };
  const CS_THICK = R * 0.085;

  // Noodle curl: a sin wave on the left side of the rim opening
  const NOODLE_X0 = cx - R * 0.65;
  const NOODLE_X1 = cx + R * 0.05;
  const NOODLE_CY = cy - RIM_RY * 0.15;
  const NOODLE_AMP = RIM_RY * 0.55;
  const NOODLE_PERIODS = 1.6;
  const NOODLE_THICK = R * 0.045;

  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const off = (y * W + x) * 4;

      // 1. Bowl body — bottom half-disc in orange.
      const sdBody = Math.max(sdCircle(x, y, cx, cy, R), cy - y);
      const cBody = cov(sdBody);
      if (cBody > 0) blendInto(px, off, PALETTE.ORANGE, cBody);

      // 2. Inner warm shadow near outer bowl edge (lower half), gives depth.
      if (y >= cy - 1) {
        const dCenter = Math.hypot(x - cx, y - cy);
        const ringSd = Math.max(dCenter - R * 0.99, R * 0.86 - dCenter);
        const cRing = cov(ringSd);
        if (cRing > 0) blendInto(px, off, PALETTE.ORANGE_DARK, cRing * 0.45);
      }

      // 3. Rim opening — cream ellipse sitting on top of the bowl body.
      const sdRim = sdEllipse(x, y, cx, cy, RIM_RX, RIM_RY);
      const cRim = cov(sdRim);
      if (cRim > 0) blendInto(px, off, PALETTE.RIM_INSIDE, cRim);

      // 4. Front lip shadow — thin darker arc on the bottom half of the rim.
      if (y >= cy - 1) {
        const ex = (x - cx) / RIM_RX;
        const ey = (y - cy) / RIM_RY;
        const k = Math.sqrt(ex * ex + ey * ey);
        const bandSd = Math.max(k - 1.0, 0.86 - k) * Math.min(RIM_RX, RIM_RY);
        const cBand = cov(bandSd);
        if (cBand > 0) blendInto(px, off, PALETTE.ORANGE_DARK, cBand * 0.85);
      }

      // 5. Noodle curl inside the rim (clipped to rim ellipse so it stays "in" the bowl).
      if (x >= NOODLE_X0 && x <= NOODLE_X1) {
        const phase = ((x - NOODLE_X0) / (NOODLE_X1 - NOODLE_X0)) * NOODLE_PERIODS * Math.PI * 2;
        const ny = NOODLE_CY + Math.sin(phase) * NOODLE_AMP;
        // approximate distance to wave (vertical), correct for slope so thickness reads true.
        const slope = Math.cos(phase) * NOODLE_AMP * (NOODLE_PERIODS * Math.PI * 2) / (NOODLE_X1 - NOODLE_X0);
        const dn = Math.abs(y - ny) / Math.sqrt(1 + slope * slope) - NOODLE_THICK;
        // clip inside rim ellipse
        const ex = (x - cx) / (RIM_RX * 0.92);
        const ey = (y - cy) / (RIM_RY * 0.92);
        const insideRim = ex * ex + ey * ey <= 1;
        if (insideRim) {
          const cN = cov(dn);
          if (cN > 0) blendInto(px, off, PALETTE.NOODLE, cN);
        }
      }

      // 6. Chopsticks — drawn last, on top of everything.
      const sd1 = sdSegment(x, y, cs1A.x, cs1A.y, cs1B.x, cs1B.y) - CS_THICK;
      const c1 = cov(sd1);
      if (c1 > 0) blendInto(px, off, PALETTE.WOOD, c1);
      const sd2 = sdSegment(x, y, cs2A.x, cs2A.y, cs2B.x, cs2B.y) - CS_THICK;
      const c2 = cov(sd2);
      if (c2 > 0) blendInto(px, off, PALETTE.WOOD, c2);
    }
  }
  return px;
}

function generate() {
  const ICON = 1024;
  const FAVICON = 196;

  // iOS / generic app icon: cream square, full-bleed artwork.
  writePng(
    path.join(ASSETS, 'icon.png'),
    ICON, ICON,
    drawIcon(ICON, { background: PALETTE.CREAM_BG, scale: 0.86, yOffsetFactor: 0.10 }),
  );

  // Android adaptive icon foreground: transparent, artwork in the inner safe zone.
  // Android masks down to ~66% of the canvas, so we shrink to fit and visually centre.
  writePng(
    path.join(ASSETS, 'adaptive-icon.png'),
    ICON, ICON,
    drawIcon(ICON, { background: PALETTE.TRANSPARENT, scale: 0.62, yOffsetFactor: 0.0 }),
  );

  // Splash: same artwork, transparent so app.json backgroundColor shows through.
  writePng(
    path.join(ASSETS, 'splash-icon.png'),
    ICON, ICON,
    drawIcon(ICON, { background: PALETTE.TRANSPARENT, scale: 0.50, yOffsetFactor: 0.0 }),
  );

  // Favicon: cream background, slightly tighter padding.
  writePng(
    path.join(ASSETS, 'favicon.png'),
    FAVICON, FAVICON,
    drawIcon(FAVICON, { background: PALETTE.CREAM_BG, scale: 0.88, yOffsetFactor: 0.10 }),
  );

  console.log('Generated icons in', ASSETS);
}

generate();
