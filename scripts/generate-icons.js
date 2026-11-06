import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writePNG(width, height, getPixel, isMaskable = false) {
  // Scanlines with filter byte 0 (None)
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (1 + rowBytes));

  const safeMargin = isMaskable ? 0.15 : 0.04;
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (0.5 - safeMargin);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height, cx, cy, radius, isMaskable);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function hospitalPixel(x, y, w, h, cx, cy, r, isMaskable) {
  // Teal background: #0f766e (15, 118, 110)
  // Cross: #ffffff
  // Heartbeat / Accent: #facc15 (250, 204, 21)
  const bgR = 17, bgG = 94, bgB = 89; // #115e59
  const darkR = 4, darkG = 47, darkB = 46; // #042f2e

  // Gradient background
  const t = (x + y) / (w + h);
  const currentBgR = Math.round(bgR * (1 - t) + darkR * t);
  const currentBgG = Math.round(bgG * (1 - t) + darkG * t);
  const currentBgB = Math.round(bgB * (1 - t) + darkB * t);

  // If not maskable, rounded squircle corner
  if (!isMaskable) {
    const cornerR = w * 0.22;
    const nx = Math.max(0, Math.abs(x - cx) - (w / 2 - cornerR));
    const ny = Math.max(0, Math.abs(y - cy) - (h / 2 - cornerR));
    if (nx * nx + ny * ny > cornerR * cornerR) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  // Cross dimensions inside safe zone
  const crossWidth = w * (isMaskable ? 0.12 : 0.14);
  const crossLength = w * (isMaskable ? 0.44 : 0.52);

  const inVBar = Math.abs(x - cx) <= crossWidth / 2 && Math.abs(y - cy) <= crossLength / 2;
  const inHBar = Math.abs(x - cx) <= crossLength / 2 && Math.abs(y - cy) <= crossWidth / 2;

  // Center circle
  const distCenter = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
  const centerRadius = w * (isMaskable ? 0.07 : 0.08);

  if (distCenter <= centerRadius) {
    // Inner emblem
    return [15, 118, 110, 255]; // Teal center
  }

  if (inVBar || inHBar) {
    return [255, 255, 255, 255]; // White cross
  }

  return [currentBgR, currentBgG, currentBgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), writePNG(192, 192, hospitalPixel, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), writePNG(512, 512, hospitalPixel, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), writePNG(512, 512, hospitalPixel, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), writePNG(180, 180, hospitalPixel, false));

console.log('Successfully generated PWA and Android PNG icons!');
