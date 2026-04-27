/* eslint-disable */
// Generates placeholder icons for "Mám hlad".
// Pure Node, no external deps. Run: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ASSETS = path.join(__dirname, '..', 'assets');

// CRC32 (PNG)
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
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[(stride + 1) * y] = 0; // filter: None
    pixels.copy(raw, (stride + 1) * y + 1, stride * y, stride * (y + 1));
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  fs.writeFileSync(
    filePath,
    Buffer.concat([
      sig,
      chunk('IHDR', ihdr),
      chunk('IDAT', idat),
      chunk('IEND', Buffer.alloc(0)),
    ])
  );
}

// hex like "#FFF7ED" -> [r,g,b,a]
function color(hex, alpha = 255) {
  const v = hex.replace('#', '');
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
    alpha,
  ];
}

const CREAM = color('#FFF7ED');
const ORANGE = color('#F97316');
const ORANGE_DARK = color('#EA580C');
const CREAM_LIGHT = color('#FFEDD5');
const TRANSPARENT = [0, 0, 0, 0];

// Renders a simple bowl: orange disc with a lighter cream rim/oval at top.
// All coordinates are in pixels with origin at top-left.
function bowlPixel(x, y, size, opts) {
  const cx = size / 2;
  const cy = size / 2 + (opts.yOffset ?? 0);
  const radius = opts.radius;

  const dx = x - cx;
  const dy = y - cy;
  const dist2 = dx * dx + dy * dy;

  // Outer "shadow" ring for definition (slightly darker orange)
  if (dist2 <= radius * radius) {
    // Inside the bowl disc
    // Top ellipse representing bowl opening (cream)
    const ellA = radius * 0.78;
    const ellB = radius * 0.22;
    const ellCY = cy - radius * 0.55;
    const exDist =
      ((x - cx) * (x - cx)) / (ellA * ellA) +
      ((y - ellCY) * (y - ellCY)) / (ellB * ellB);
    if (exDist <= 1) return CREAM_LIGHT;

    // thin darker rim near the outside (1.5% of radius)
    if (dist2 >= (radius - radius * 0.04) * (radius - radius * 0.04)) {
      return ORANGE_DARK;
    }
    return ORANGE;
  }

  return opts.background;
}

function renderBowl({ size, radius, yOffset = 0, background }) {
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = bowlPixel(x, y, size, { radius, yOffset, background });
      const i = (y * size + x) * 4;
      px[i] = c[0];
      px[i + 1] = c[1];
      px[i + 2] = c[2];
      px[i + 3] = c[3];
    }
  }
  return px;
}

function fillSolid(size, c) {
  const px = Buffer.alloc(size * size * 4);
  for (let i = 0; i < px.length; i += 4) {
    px[i] = c[0];
    px[i + 1] = c[1];
    px[i + 2] = c[2];
    px[i + 3] = c[3];
  }
  return px;
}

function generate() {
  const ICON_SIZE = 1024;
  const FAVICON_SIZE = 196;

  // app icon: bowl on cream
  writePng(
    path.join(ASSETS, 'icon.png'),
    ICON_SIZE,
    ICON_SIZE,
    renderBowl({
      size: ICON_SIZE,
      radius: ICON_SIZE * 0.36,
      background: CREAM,
    })
  );

  // adaptive icon foreground: bowl, transparent bg, smaller (safe zone ~66%)
  writePng(
    path.join(ASSETS, 'adaptive-icon.png'),
    ICON_SIZE,
    ICON_SIZE,
    renderBowl({
      size: ICON_SIZE,
      radius: ICON_SIZE * 0.27,
      background: TRANSPARENT,
    })
  );

  // splash: same as icon (Expo scales it)
  writePng(
    path.join(ASSETS, 'splash-icon.png'),
    ICON_SIZE,
    ICON_SIZE,
    renderBowl({
      size: ICON_SIZE,
      radius: ICON_SIZE * 0.32,
      background: CREAM,
    })
  );

  // favicon: small bowl on cream
  writePng(
    path.join(ASSETS, 'favicon.png'),
    FAVICON_SIZE,
    FAVICON_SIZE,
    renderBowl({
      size: FAVICON_SIZE,
      radius: FAVICON_SIZE * 0.36,
      background: CREAM,
    })
  );

  console.log('Generated icons in', ASSETS);
}

generate();
