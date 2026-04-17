/**
 * Синтез моно WAV (44.1 kHz, 16-bit PCM) для витрины пар — без зависимостей.
 * Запуск: node scripts/generate-pair-audio.mjs
 * Выход: public/content/pair-audio/pair-{NN}-{ambient|hover}.wav
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/content/pair-audio');
const SR = 44100;
/** Ровно 2 с → целое число периодов для любой целой частоты в Гц (бесшовный loop). */
const AMBIENT_N = 88200;

function clamp16(v) {
  const x = Math.round(v);
  if (x < -32768) return -32768;
  if (x > 32767) return 32767;
  return x;
}

function writeWavMono16(filePath, floats) {
  const n = floats.length;
  const dataSize = n * 2;
  const buf = Buffer.alloc(44 + dataSize);
  let o = 0;
  const w32 = (v) => {
    buf.writeUInt32LE(v & 0xffffffff, o);
    o += 4;
  };
  const w16 = (v) => {
    buf.writeUInt16LE(v & 0xffff, o);
    o += 2;
  };
  buf.write('RIFF', o);
  o += 4;
  w32(36 + dataSize);
  buf.write('WAVE', o);
  o += 4;
  buf.write('fmt ', o);
  o += 4;
  w32(16);
  w16(1);
  w16(1);
  w32(SR);
  w32(SR * 2);
  w16(2);
  w16(16);
  buf.write('data', o);
  o += 4;
  w32(dataSize);
  for (let i = 0; i < n; i += 1) {
    buf.writeInt16LE(clamp16(floats[i] * 32767), o);
    o += 2;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buf);
}

/** Синус с целой частотой f Гц — бесшовный цикл за AMBIENT_N / SR секунд при f * duration ∈ ℤ */
function tone(i, hz, phase = 0) {
  return Math.sin((2 * Math.PI * hz * i) / SR + phase);
}

/** Нормализовать массив к пику peak */
function normalize(arr, peak = 0.92) {
  let m = 0;
  for (let i = 0; i < arr.length; i += 1) m = Math.max(m, Math.abs(arr[i]));
  if (m < 1e-8) return arr;
  const g = peak / m;
  return arr.map((x) => x * g);
}

function zeros(n) {
  return new Float32Array(n);
}

/** --- 10 амбиентов (зацикленные, без клика на стыке) --- */
function ambientAdelaidaGrace() {
  const a = zeros(AMBIENT_N);
  const f0 = 98;
  for (let i = 0; i < AMBIENT_N; i += 1) {
    a[i] =
      0.35 * tone(i, f0) +
      0.22 * tone(i, f0 * 2) +
      0.14 * tone(i, f0 * 3) +
      0.08 * tone(i, f0 * 4) +
      0.05 * tone(i, f0 * 5);
  }
  return normalize(a, 0.85);
}

function ambientEnergySebastian() {
  const a = zeros(AMBIENT_N);
  for (let i = 0; i < AMBIENT_N; i += 1) {
    const hum = 0.45 * tone(i, 58) + 0.35 * tone(i, 116) + 0.12 * tone(i, 174);
    const buzz = 0.08 * Math.sign(tone(i, 420)) * Math.abs(tone(i, 420));
    a[i] = hum + buzz;
  }
  return normalize(a, 0.88);
}

function ambientLisaMechta() {
  const a = zeros(AMBIENT_N);
  for (let i = 0; i < AMBIENT_N; i += 1) {
    const rustle = 0.12 * tone(i, 73) * tone(i, 3) + 0.1 * tone(i, 97) * tone(i, 4);
    const night = 0.35 * tone(i, 55) + 0.2 * tone(i, 82);
    a[i] = night + rustle;
  }
  return normalize(a, 0.86);
}

function ambientHexeLelia() {
  const a = zeros(AMBIENT_N);
  for (let i = 0; i < AMBIENT_N; i += 1) {
    const stone = 0.42 * tone(i, 62) + 0.28 * tone(i, 93);
    const wave = 0.18 * tone(i, 124) * (0.85 + 0.15 * tone(i, 5));
    a[i] = stone + wave;
  }
  return normalize(a, 0.87);
}

function ambientMatematikNafanya() {
  const a = zeros(AMBIENT_N);
  for (let i = 0; i < AMBIENT_N; i += 1) {
    const fm = Math.sin((2 * Math.PI * 220 * i) / SR + 2.4 * Math.sin((2 * Math.PI * 7 * i) / SR));
    const bell = 0.15 * tone(i, 880) * (0.55 + 0.45 * tone(i, 11));
    a[i] = 0.35 * fm + 0.25 * tone(i, 132) + bell;
  }
  return normalize(a, 0.84);
}

function ambientDichBlackjack() {
  const a = zeros(AMBIENT_N);
  for (let i = 0; i < AMBIENT_N; i += 1) {
    const wind = 0.25 * tone(i, 90) * (0.55 + 0.45 * tone(i, 3));
    const breath = 0.32 * tone(i, 118) * (0.5 + 0.5 * tone(i, 2));
    a[i] = wind + breath;
  }
  return normalize(a, 0.88);
}

function ambientKoluchkaHarley() {
  const a = zeros(AMBIENT_N);
  for (let i = 0; i < AMBIENT_N; i += 1) {
    const grind = 0.22 * tone(i, 185) * tone(i, 196);
    const ring = 0.35 * tone(i, 210) + 0.2 * tone(i, 315);
    a[i] = grind + ring;
  }
  return normalize(a, 0.82);
}

function ambientSkyKot() {
  const a = zeros(AMBIENT_N);
  for (let i = 0; i < AMBIENT_N; i += 1) {
    const w = 0.4 * tone(i, 200) * (0.75 + 0.25 * tone(i, 5));
    const h = 0.25 * tone(i, 340) * (0.6 + 0.4 * tone(i, 4));
    a[i] = w + h;
  }
  return normalize(a, 0.86);
}

function ambientSexologMikky() {
  const a = zeros(AMBIENT_N);
  /* 88200 / 22050 = 4 удара за 2 с (~120 уд/мин), бесшовный цикл */
  const period = 22050;
  for (let i = 0; i < AMBIENT_N; i += 1) {
    const phase = (i % period) / period;
    const thump = Math.exp(-phase * 14) * Math.sin(phase * Math.PI * 2 * 2.2);
    a[i] = 0.55 * thump + 0.12 * tone(i, 72);
  }
  return normalize(a, 0.9);
}

function ambientDarksiderGold() {
  const a = zeros(AMBIENT_N);
  for (let i = 0; i < AMBIENT_N; i += 1) {
    const sub = 0.55 * tone(i, 41) + 0.3 * tone(i, 61);
    const dark = 0.12 * Math.tanh(3.2 * tone(i, 103));
    a[i] = sub + dark;
  }
  return normalize(a, 0.88);
}

/** --- One-shot hover (~0.2–0.45 с) --- */
function writeHover(filePath, genFn) {
  const samples = genFn();
  writeWavMono16(filePath, samples);
}

function hoverAdelaidaGrace() {
  const dur = Math.floor(SR * 0.38);
  const a = new Float32Array(dur);
  for (let i = 0; i < dur; i += 1) {
    const e = Math.exp(-i / (SR * 0.08));
    a[i] = e * (0.55 * tone(i, 1200 + i * 2) + 0.35 * tone(i, 2400));
  }
  return normalize(a, 0.88);
}

function hoverEnergySebastian() {
  const dur = Math.floor(SR * 0.32);
  const a = new Float32Array(dur);
  for (let i = 0; i < dur; i += 1) {
    const e = Math.exp(-i / (SR * 0.045));
    const zap = Math.sin((2 * Math.PI * (800 + (i * 900) / dur) * i) / SR);
    a[i] = e * (0.7 * zap + 0.2 * tone(i, 2400));
  }
  return normalize(a, 0.9);
}

function hoverLisaMechta() {
  const dur = Math.floor(SR * 0.12);
  const a = new Float32Array(dur);
  for (let i = 0; i < dur; i += 1) {
    const e = Math.exp(-i / (SR * 0.025));
    a[i] = e * tone(i, 2800);
  }
  return normalize(a, 0.85);
}

function hoverHexeLelia() {
  const dur = Math.floor(SR * 0.45);
  const a = new Float32Array(dur);
  for (let i = 0; i < dur; i += 1) {
    const f = 400 - (i / dur) * 220;
    const e = Math.exp(-i / (SR * 0.2));
    a[i] = e * 0.65 * Math.sin((2 * Math.PI * f * i) / SR);
  }
  return normalize(a, 0.88);
}

function hoverMatematikNafanya() {
  const dur = Math.floor(SR * 0.28);
  const a = new Float32Array(dur);
  for (let i = 0; i < dur; i += 1) {
    const e = Math.exp(-i / (SR * 0.06));
    a[i] = e * 0.5 * (tone(i, 2093) + tone(i, 2637));
  }
  return normalize(a, 0.86);
}

function hoverDichBlackjack() {
  const dur = Math.floor(SR * 0.08);
  const a = new Float32Array(dur);
  for (let i = 0; i < dur; i += 1) {
    a[i] = Math.exp(-i / 120) * Math.sin((2 * Math.PI * 1800 * i) / SR);
  }
  return normalize(a, 0.88);
}

function hoverKoluchkaHarley() {
  const dur = Math.floor(SR * 0.35);
  const a = new Float32Array(dur);
  let seed = 90210;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < dur; i += 1) {
    const n = (rnd() * 2 - 1) * (1 - i / dur) ** 0.5;
    const e = Math.exp(-i / (SR * 0.11));
    a[i] = e * (0.35 * n + 0.45 * tone(i, 450 + i * 3));
  }
  return normalize(a, 0.82);
}

function hoverSkyKot() {
  const dur = Math.floor(SR * 0.4);
  const a = new Float32Array(dur);
  for (let i = 0; i < dur; i += 1) {
    const e = Math.exp(-i / (SR * 0.12));
    const spoon = tone(i, 1661) * tone(i, 1993);
    const boom = i > dur * 0.55 ? 0.4 * Math.exp(-(i - dur * 0.55) / 800) * tone(i, 95) : 0;
    a[i] = e * (0.4 * spoon + boom);
  }
  return normalize(a, 0.88);
}

function hoverSexologMikky() {
  const dur = Math.floor(SR * 0.22);
  const a = new Float32Array(dur);
  for (let i = 0; i < dur; i += 1) {
    const e = Math.exp(-i / (SR * 0.05));
    const horn = Math.sin((2 * Math.PI * (380 + i * 6) * i) / SR);
    a[i] = e * (0.5 * horn + 0.25 * tone(i, 180));
  }
  return normalize(a, 0.87);
}

function hoverDarksiderGold() {
  const dur = Math.floor(SR * 0.55);
  const a = new Float32Array(dur);
  for (let i = 0; i < dur; i += 1) {
    const e = Math.exp(-i / (SR * 0.18));
    const gong =
      0.45 * tone(i, 62) +
      0.35 * tone(i, 124) +
      0.2 * tone(i, 186) +
      0.12 * Math.sin((2 * Math.PI * 31 * i) / SR + i * 0.001);
    a[i] = e * gong;
  }
  return normalize(a, 0.9);
}

const AMBIENTS = [
  ambientAdelaidaGrace,
  ambientEnergySebastian,
  ambientLisaMechta,
  ambientHexeLelia,
  ambientMatematikNafanya,
  ambientDichBlackjack,
  ambientKoluchkaHarley,
  ambientSkyKot,
  ambientSexologMikky,
  ambientDarksiderGold,
];

const HOVERS = [
  hoverAdelaidaGrace,
  hoverEnergySebastian,
  hoverLisaMechta,
  hoverHexeLelia,
  hoverMatematikNafanya,
  hoverDichBlackjack,
  hoverKoluchkaHarley,
  hoverSkyKot,
  hoverSexologMikky,
  hoverDarksiderGold,
];

console.log('Writing WAV to', OUT_DIR);
for (let p = 0; p < 10; p += 1) {
  const nn = String(p + 1).padStart(2, '0');
  const ambPath = path.join(OUT_DIR, `pair-${nn}-ambient.wav`);
  const hovPath = path.join(OUT_DIR, `pair-${nn}-hover.wav`);
  writeWavMono16(ambPath, AMBIENTS[p]());
  writeHover(hovPath, HOVERS[p]);
  console.log('  pair-' + nn + '-{ambient,hover}.wav');
}
console.log('Done. Пути в коде: `src/pairCardAudio.ts` → `*.wav`.');
