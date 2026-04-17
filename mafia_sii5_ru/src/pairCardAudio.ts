/**
 * Амбиент + one-shot при hover на витрине пары.
 * — Если файлов в `public/content/pair-audio/` ещё нет (404), включается Web Audio «заглушка» (слышно на тесте).
 * — После первого жеста пользователя: HTMLAudio + WebAudio context resume (autoplay policy).
 */

import { assetUrl } from './baseUrl';

const TARGET_VOL = 0.4;
const FADE_MS = 300;
const HOVER_VOL = 0.45;
/** Громкость синтетического ambient (RMS ниже, чем у медиа 0.4). */
const SYNTH_AMBIENT_GAIN = 0.055;

export type PairAudioUrls = { ambient: string; hover?: string };

export const PAIR_AUDIO_BY_N: Record<number, PairAudioUrls> = {
  1: {
    ambient: assetUrl('content/pair-audio/pair-01-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-01-hover.wav'),
  },
  2: {
    ambient: assetUrl('content/pair-audio/pair-02-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-02-hover.wav'),
  },
  3: {
    ambient: assetUrl('content/pair-audio/pair-03-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-03-hover.wav'),
  },
  4: {
    ambient: assetUrl('content/pair-audio/pair-04-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-04-hover.wav'),
  },
  5: {
    ambient: assetUrl('content/pair-audio/pair-05-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-05-hover.wav'),
  },
  6: {
    ambient: assetUrl('content/pair-audio/pair-06-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-06-hover.wav'),
  },
  7: {
    ambient: assetUrl('content/pair-audio/pair-07-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-07-hover.wav'),
  },
  8: {
    ambient: assetUrl('content/pair-audio/pair-08-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-08-hover.wav'),
  },
  9: {
    ambient: assetUrl('content/pair-audio/pair-09-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-09-hover.wav'),
  },
  10: {
    ambient: assetUrl('content/pair-audio/pair-10-ambient.wav'),
    hover: assetUrl('content/pair-audio/pair-10-hover.wav'),
  },
};

type SynthAmbient = { osc: OscillatorNode; gain: GainNode };

type ShellState = {
  pairN: number;
  ambient: HTMLAudioElement | null;
  hover: HTMLAudioElement | null;
  synth: SynthAmbient | null;
  fadeToken: number;
  /** Инкремент при уходе — отменяет «хвост» async после leave. */
  enterGeneration: number;
};

const shellState = new WeakMap<HTMLElement, ShellState>();

let userActivatedAudio = false;
let loadUnlocked = false;
let activeShell: HTMLElement | null = null;
let gestureListenerAttached = false;

/** Общий контекст для синтеза после жеста пользователя. */
let sharedCtx: AudioContext | null = null;

function markUserActivated(): void {
  userActivatedAudio = true;
}

function markLoadUnlocked(): void {
  loadUnlocked = true;
}

async function ensureSharedCtx(): Promise<AudioContext | null> {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) sharedCtx = new AC();
  try {
    await sharedCtx.resume();
  } catch {
    /* empty */
  }
  return sharedCtx;
}

/** Первый клик/тап/клавиша — разрешаем `play()` и поднимаем AudioContext. */
export function initPairCardAudioUserActivation(): void {
  if (gestureListenerAttached) return;
  gestureListenerAttached = true;
  const once = (): void => {
    markUserActivated();
    void ensureSharedCtx();
    window.removeEventListener('pointerdown', once, true);
    window.removeEventListener('keydown', once, true);
  };
  window.addEventListener('pointerdown', once, { capture: true, passive: true });
  window.addEventListener('keydown', once, { capture: true, passive: true });
}

export function initPairCardAudioWarmupNearGrid(): void {
  const roots = (['pair-stories-1', 'pair-stories-2'] as const)
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => Boolean(el));
  if (!roots.length) return;

  const padPx = 140;
  const isNear = (cx: number, cy: number): boolean => {
    for (const el of roots) {
      const r = el.getBoundingClientRect();
      if (
        cx >= r.left - padPx &&
        cx <= r.right + padPx &&
        cy >= r.top - padPx &&
        cy <= r.bottom + padPx
      ) {
        return true;
      }
    }
    return false;
  };

  let done = false;
  const onMove = (e: PointerEvent): void => {
    if (done || loadUnlocked) return;
    if (!isNear(e.clientX, e.clientY)) return;
    done = true;
    document.removeEventListener('pointermove', onMove, true);
    markLoadUnlocked();
  };
  document.addEventListener('pointermove', onMove, { capture: true, passive: true });
}

function cancelFade(st: ShellState): void {
  st.fadeToken += 1;
}

function fadeHtmlVolume(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  ms: number,
  tokenStart: number,
  st: ShellState,
  onDone?: () => void,
): void {
  const t0 = performance.now();
  const step = (now: number): void => {
    if (st.fadeToken !== tokenStart) return;
    const u = Math.min(1, (now - t0) / ms);
    audio.volume = from + (to - from) * u;
    if (u < 1) {
      requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  };
  requestAnimationFrame(step);
}

function stopSynthAmbient(st: ShellState): void {
  if (!st.synth) return;
  try {
    const { osc, gain } = st.synth;
    const ctx = gain.context;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    const cur = Math.min(gain.gain.value, 0.2);
    gain.gain.setValueAtTime(cur, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
    osc.stop(now + 0.22);
  } catch {
    /* empty */
  }
  st.synth = null;
}

function stopOtherShells(current: HTMLElement): void {
  if (activeShell && activeShell !== current) {
    const prev = shellState.get(activeShell);
    if (prev) {
      prev.enterGeneration += 1;
      stopSynthAmbient(prev);
      if (prev.ambient) {
        cancelFade(prev);
        const tok = prev.fadeToken;
        fadeHtmlVolume(prev.ambient, prev.ambient.volume, 0, FADE_MS, tok, prev, () => {
          prev.ambient?.pause();
          if (prev.ambient) prev.ambient.volume = 0;
        });
      }
    }
  }
  activeShell = current;
}

/** Пытаемся зацикленный файл; при ошибке — мягкий дрон по номеру пары. */
async function startAmbientForShell(st: ShellState, generation: number): Promise<void> {
  const urls = PAIR_AUDIO_BY_N[st.pairN];
  if (!urls) return;

  if (st.ambient && !st.ambient.error && !st.synth) {
    try {
      st.ambient.volume = 0;
      await st.ambient.play();
      if (st.enterGeneration !== generation) return;
      cancelFade(st);
      const tok = st.fadeToken;
      fadeHtmlVolume(st.ambient, 0, TARGET_VOL, FADE_MS, tok, st);
      return;
    } catch {
      st.ambient = null;
    }
  }

  const html = new Audio();
  html.preload = 'none';
  html.loop = true;
  html.volume = 0;
  html.src = urls.ambient;

  const fileOk = await new Promise<boolean>((resolve) => {
    const ok = (): void => resolve(true);
    const bad = (): void => resolve(false);
    const t = window.setTimeout(() => bad(), 2500);
    html.addEventListener(
      'canplaythrough',
      () => {
        window.clearTimeout(t);
        ok();
      },
      { once: true },
    );
    html.addEventListener(
      'error',
      () => {
        window.clearTimeout(t);
        bad();
      },
      { once: true },
    );
    html.load();
  });

  if (st.enterGeneration !== generation) return;

  if (fileOk) {
    try {
      await html.play();
      if (st.enterGeneration !== generation) return;
      st.ambient = html;
      cancelFade(st);
      const tok = st.fadeToken;
      fadeHtmlVolume(html, 0, TARGET_VOL, FADE_MS, tok, st);
      return;
    } catch {
      st.ambient = null;
    }
  }

  if (st.enterGeneration !== generation) return;

  /* Fallback: Web Audio (файлов нет или play() запрещён) */
  const ctx = await ensureSharedCtx();
  if (!ctx || st.enterGeneration !== generation) return;

  stopSynthAmbient(st);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 72 + st.pairN * 16;

  const g = ctx.createGain();
  g.gain.value = 0;
  osc.connect(g).connect(ctx.destination);
  osc.start();

  st.synth = { osc, gain: g };
  const now = ctx.currentTime;
  g.gain.linearRampToValueAtTime(SYNTH_AMBIENT_GAIN, now + FADE_MS / 1000);
}

/** One-shot файл или короткий синт-пинг. */
async function playHoverAccent(st: ShellState, generation: number): Promise<void> {
  const urls = PAIR_AUDIO_BY_N[st.pairN];
  if (!urls?.hover) {
    if (st.enterGeneration === generation) playSynthHoverPing(st);
    return;
  }

  const h = new Audio();
  h.preload = 'none';
  h.volume = HOVER_VOL;
  h.src = urls.hover;

  const ok = await new Promise<boolean>((resolve) => {
    const t = window.setTimeout(() => resolve(false), 2000);
    h.addEventListener(
      'canplaythrough',
      () => {
        window.clearTimeout(t);
        resolve(true);
      },
      { once: true },
    );
    h.addEventListener(
      'error',
      () => {
        window.clearTimeout(t);
        resolve(false);
      },
      { once: true },
    );
    h.load();
  });

  if (st.enterGeneration !== generation) return;

  if (ok) {
    try {
      await h.play();
      if (st.enterGeneration !== generation) return;
      st.hover = h;
      return;
    } catch {
      /* fallthrough */
    }
  }
  if (st.enterGeneration === generation) playSynthHoverPing(st);
}

function playSynthHoverPing(st: ShellState): void {
  void (async (): Promise<void> => {
    const ctx = await ensureSharedCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const base = 380 + st.pairN * 55;
    osc.frequency.setValueAtTime(base, t0);
    osc.frequency.exponentialRampToValueAtTime(base * 1.65, t0 + 0.07);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.11, t0 + 0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);

    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.12);
  })();
}

function onShellEnter(shell: HTMLElement): void {
  const st = shellState.get(shell);
  if (!st) return;

  if (!userActivatedAudio) return;

  if (!loadUnlocked) {
    markLoadUnlocked();
  }

  stopOtherShells(shell);

  st.enterGeneration += 1;
  const generation = st.enterGeneration;

  void (async (): Promise<void> => {
    await startAmbientForShell(st, generation);
    if (st.enterGeneration !== generation) return;
    await playHoverAccent(st, generation);
  })();
}

function onShellLeave(shell: HTMLElement): void {
  const st = shellState.get(shell);
  if (!st) return;

  st.enterGeneration += 1;

  stopSynthAmbient(st);

  if (st.ambient) {
    cancelFade(st);
    const tok = st.fadeToken;
    const a = st.ambient;
    fadeHtmlVolume(a, a.volume, 0, FADE_MS, tok, st, () => {
      a.pause();
      a.volume = 0;
    });
  }

  if (activeShell === shell) activeShell = null;
}

export function bindPairShowcaseAudio(shell: HTMLElement, pairN: number): void {
  if (!PAIR_AUDIO_BY_N[pairN]) return;

  shellState.set(shell, {
    pairN,
    ambient: null,
    hover: null,
    synth: null,
    fadeToken: 0,
    enterGeneration: 0,
  });

  /* Только pointer*, иначе mouseenter + pointerenter дублируют звук */
  shell.addEventListener('pointerenter', () => onShellEnter(shell), { passive: true });
  shell.addEventListener('pointerleave', () => onShellLeave(shell), { passive: true });
}
