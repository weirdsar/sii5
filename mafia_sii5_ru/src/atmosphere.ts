/**
 * Фоновая атмосфера: Web Audio (кроссфейд-петля), бас → canvas-пульсация,
 * low-pass при чтении регламента/текстов; микширование с видео (50%).
 */

import { SHOWCASE_AUDIO_STORAGE_KEY } from './audioConstants';

const TRACK_URL = '/content/broken-king.mp3';
const LOOP_OVERLAP_SEC = 0.45;
const SCHEDULE_LOOKAHEAD_SEC = 40;
const RESCHEDULE_INTERVAL_MS = 6000;

const BASS_BIN_START = 1;
const BASS_BIN_END = 10;

/** Декодированный буфер переживает закрытие AudioContext (переиспользуем при повторном «вкл»). */
let sharedBuffer: AudioBuffer | null = null;

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let lowpass: BiquadFilterNode | null = null;
let analyser: AnalyserNode | null = null;
let fft: Uint8Array<ArrayBuffer> | null = null;

let loopTimerId: number | null = null;
let nextLoopIndex = 0;
let loopAnchor = 0;
let playing = false;

let rafId = 0;

/** Синхронизация кнопки «Атмосфера» извне (например после выбора в диалоге звука). */
let applyAtmosphereToggleUi: ((on: boolean) => void) | null = null;

const readZoneVisible = new WeakMap<Element, boolean>();

const canvas = document.createElement('canvas');
const c2d = canvas.getContext('2d');

function resizeCanvas(): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  if (c2d) c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawVisualizerFrame(bass01: number): void {
  if (!c2d) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  c2d.clearRect(0, 0, w, h);
  const pulse = 0.04 + bass01 * 0.14;
  const cx = w * 0.5;
  const cy = h * 0.42;
  const r = Math.max(w, h) * (0.38 + bass01 * 0.12);
  const g = c2d.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(34, 211, 238, ${pulse * 0.55})`);
  g.addColorStop(0.35, `rgba(167, 139, 250, ${pulse * 0.35})`);
  g.addColorStop(0.65, `rgba(88, 28, 135, ${pulse * 0.12})`);
  g.addColorStop(1, 'rgba(3, 3, 8, 0)');
  c2d.fillStyle = g;
  c2d.fillRect(0, 0, w, h);

  const ring = 0.06 + bass01 * 0.22;
  c2d.strokeStyle = `rgba(34, 211, 238, ${ring * 0.4})`;
  c2d.lineWidth = 2 + bass01 * 10;
  c2d.beginPath();
  c2d.arc(cx, cy * 1.05, 120 + bass01 * 180, 0, Math.PI * 2);
  c2d.stroke();
}

function visualizerTick(): void {
  if (!playing) {
    rafId = 0;
    return;
  }
  rafId = requestAnimationFrame(visualizerTick);

  if (!analyser || !fft) return;
  analyser.getByteFrequencyData(fft);
  let sum = 0;
  for (let i = BASS_BIN_START; i <= BASS_BIN_END && i < fft.length; i++) {
    sum += fft[i]!;
  }
  const n = BASS_BIN_END - BASS_BIN_START + 1;
  const bass01 = Math.min(1, (sum / n / 255) * 1.35);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    drawVisualizerFrame(bass01);
  } else if (c2d) {
    c2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function applyLowpassForReading(on: boolean): void {
  if (!lowpass || !ctx) return;
  const now = ctx.currentTime;
  const targetHi = 20000;
  const targetLo = 520;
  lowpass.type = 'lowpass';
  try {
    lowpass.Q.cancelScheduledValues(now);
    lowpass.Q.setValueAtTime(lowpass.Q.value, now);
    lowpass.Q.exponentialRampToValueAtTime(on ? 2.2 : 0.7, now + 0.35);
  } catch {
    lowpass.Q.setValueAtTime(on ? 2.2 : 0.7, now);
  }
  try {
    lowpass.frequency.cancelScheduledValues(now);
    lowpass.frequency.setValueAtTime(lowpass.frequency.value, now);
    lowpass.frequency.exponentialRampToValueAtTime(on ? targetLo : targetHi, now + 0.42);
  } catch {
    lowpass.frequency.setValueAtTime(on ? targetLo : targetHi, now);
  }
}

function anyPairStoryOpen(): boolean {
  return document.querySelector('details.pair-story-details[open]') !== null;
}

function computeReadingFocus(): boolean {
  if (anyPairStoryOpen()) return true;
  const rules = document.getElementById('rules');
  const intro = document.getElementById('pair-marathon-intro');
  if (rules && readZoneVisible.get(rules)) return true;
  if (intro && readZoneVisible.get(intro)) return true;
  return false;
}

function refreshReadingFilter(): void {
  applyLowpassForReading(computeReadingFocus());
}

function initReadModeObservers(): void {
  const rules = document.getElementById('rules');
  const intro = document.getElementById('pair-marathon-intro');

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        readZoneVisible.set(e.target, e.isIntersecting && e.intersectionRatio >= 0.32);
      }
      if (playing) refreshReadingFilter();
    },
    { threshold: [0, 0.15, 0.32, 0.5, 0.75] },
  );
  if (rules) io.observe(rules);
  if (intro) io.observe(intro);

  document.addEventListener(
    'toggle',
    (ev) => {
      if (ev.target instanceof HTMLDetailsElement && ev.target.classList.contains('pair-story-details')) {
        if (playing) refreshReadingFilter();
      }
    },
    true,
  );
}

function scheduleLoopLayers(): void {
  if (!ctx || !sharedBuffer || !masterGain || !lowpass) return;
  const D = sharedBuffer.duration;
  if (!Number.isFinite(D) || D < LOOP_OVERLAP_SEC * 2) return;

  const O = Math.min(LOOP_OVERLAP_SEC, D * 0.12);
  const end = ctx.currentTime + SCHEDULE_LOOKAHEAD_SEC;

  while (true) {
    const tWall = loopAnchor + nextLoopIndex * (D - O);
    if (tWall > end) break;

    const src = ctx.createBufferSource();
    src.buffer = sharedBuffer;
    const g = ctx.createGain();
    src.connect(g);
    g.connect(lowpass);

    const isFirst = nextLoopIndex === 0;
    if (isFirst) {
      g.gain.setValueAtTime(1, tWall);
      g.gain.setValueAtTime(1, tWall + Math.max(0.02, D - O));
      g.gain.linearRampToValueAtTime(0, tWall + D);
    } else {
      g.gain.setValueAtTime(0, tWall);
      g.gain.linearRampToValueAtTime(1, tWall + O);
      g.gain.setValueAtTime(1, tWall + Math.max(O + 0.02, D - O));
      g.gain.linearRampToValueAtTime(0, tWall + D);
    }

    try {
      src.start(tWall, 0, D);
    } catch {
      /* старт в прошлом — пропускаем */
    }

    nextLoopIndex += 1;
  }
}

function stopLoopScheduler(): void {
  if (loopTimerId != null) {
    window.clearInterval(loopTimerId);
    loopTimerId = null;
  }
}

function startLoopScheduler(): void {
  stopLoopScheduler();
  scheduleLoopLayers();
  loopTimerId = window.setInterval(scheduleLoopLayers, RESCHEDULE_INTERVAL_MS);
}

/** Громкость только у видео трибунала (витрины всегда без звука). */
export function syncShowcaseVideoVolumesForAtmosphere(musicOn: boolean): void {
  const jv = document.querySelector<HTMLVideoElement>('.js-judges-video');
  if (!jv || jv.muted) return;
  const sound = sessionStorage.getItem(SHOWCASE_AUDIO_STORAGE_KEY) === 'sound';
  jv.volume = musicOn && sound ? 0.5 : 1;
}

export function isAtmospherePlaying(): boolean {
  return playing;
}

async function decodeIfNeeded(): Promise<boolean> {
  if (sharedBuffer) return true;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return false;
  const tmp = new AC();
  try {
    const res = await fetch(TRACK_URL);
    if (!res.ok) return false;
    const arr = await res.arrayBuffer();
    sharedBuffer = await tmp.decodeAudioData(arr);
    return true;
  } catch {
    return false;
  } finally {
    try {
      await tmp.close();
    } catch {
      /* */
    }
  }
}

function buildGraph(): boolean {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC || !sharedBuffer) return false;

  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.52;

  lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 20000;
  lowpass.Q.value = 0.7;

  analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.72;
  fft = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)) as Uint8Array<ArrayBuffer>;

  lowpass.connect(masterGain);
  masterGain.connect(analyser);
  analyser.connect(ctx.destination);
  return true;
}

export async function startAtmosphereFromUserGesture(): Promise<boolean> {
  const decoded = await decodeIfNeeded();
  if (!decoded || !sharedBuffer) return false;

  if (!ctx || ctx.state === 'closed') {
    if (!buildGraph()) return false;
  }

  await ctx!.resume();

  if (playing) return true;

  playing = true;
  nextLoopIndex = 0;
  loopAnchor = ctx!.currentTime + 0.08;
  startLoopScheduler();
  refreshReadingFilter();

  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(visualizerTick);

  syncShowcaseVideoVolumesForAtmosphere(true);
  return true;
}

export function setAtmosphereToggleUi(on: boolean): void {
  applyAtmosphereToggleUi?.(on);
}

export function stopAtmosphere(): void {
  playing = false;
  stopLoopScheduler();
  nextLoopIndex = 0;
  cancelAnimationFrame(rafId);
  rafId = 0;

  if (c2d) {
    c2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  if (ctx && ctx.state !== 'closed') {
    void ctx.close();
  }
  ctx = null;
  masterGain = null;
  lowpass = null;
  analyser = null;
  fft = null;

  syncShowcaseVideoVolumesForAtmosphere(false);
}

function mountVisualizerCanvas(): void {
  canvas.id = 'atmosphere-visualizer';
  canvas.className = 'atmosphere-visualizer';
  canvas.setAttribute('aria-hidden', 'true');
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    if (c2d && !playing) c2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
  });

  const host = document.querySelector('.starfield');
  if (host) host.append(canvas);
  else document.body.prepend(canvas);
}

/** Плавный дрейф кнопки «Атмосфера» при скролле (без рывков — lerp в rAF). */
function initAtmosphereToggleParallax(): void {
  const root = document.getElementById('atmosphere-toggle-root');
  if (!root) return;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let curX = 0;
  let curY = 0;
  let tgtX = 0;
  let tgtY = 0;
  let chaseRaf = 0;

  const apply = (): void => {
    root.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
  };

  const chase = (): void => {
    chaseRaf = 0;
    curX += (tgtX - curX) * 0.12;
    curY += (tgtY - curY) * 0.12;
    apply();
    if (Math.abs(tgtX - curX) > 0.06 || Math.abs(tgtY - curY) > 0.1) {
      chaseRaf = requestAnimationFrame(chase);
    }
  };

  const scheduleChase = (): void => {
    if (mq.matches) {
      curX = tgtX = curY = tgtY = 0;
      apply();
      return;
    }
    if (!chaseRaf) chaseRaf = requestAnimationFrame(chase);
  };

  const onScroll = (): void => {
    if (mq.matches) return;
    const y = window.scrollY;
    tgtY = -Math.min(y * 0.09, 92) + Math.sin(y * 0.00175) * 14;
    tgtX = Math.sin(y * 0.00235) * 24;
    scheduleChase();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  mq.addEventListener('change', () => {
    if (mq.matches) {
      curX = tgtX = curY = tgtY = 0;
      apply();
    } else onScroll();
  });
  onScroll();
}

export function initAtmosphereUi(): void {
  mountVisualizerCanvas();
  initReadModeObservers();
  initAtmosphereToggleParallax();

  const btn = document.getElementById('atmosphere-toggle') as HTMLButtonElement | null;
  if (!btn) return;

  const setBtnState = (on: boolean): void => {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Отключить атмосферу' : 'Включить атмосферу');
    const label = btn.querySelector('.atmosphere-toggle__label');
    if (label) label.textContent = on ? 'Атмосфера' : 'Включить атмосферу';
    btn.classList.toggle('atmosphere-toggle--on', on);
  };

  applyAtmosphereToggleUi = setBtnState;
  setBtnState(false);

  btn.addEventListener('click', async () => {
    if (playing) {
      stopAtmosphere();
      setBtnState(false);
      return;
    }
    const started = await startAtmosphereFromUserGesture();
    setBtnState(started);
  });
}
