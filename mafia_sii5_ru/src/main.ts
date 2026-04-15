import '@fontsource-variable/montserrat/wght.css';
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';

import {
  initAtmosphereUi,
  setAtmosphereToggleUi,
  startAtmosphereFromUserGesture,
  syncShowcaseVideoVolumesForAtmosphere,
  isAtmospherePlaying,
} from './atmosphere';
import { SHOWCASE_AUDIO_STORAGE_KEY } from './audioConstants';
import { galleryItems, type GalleryItem } from './gallery';
import { marathonPairIntro, pairStoryByNumber, type PairStoryContent } from './pairStories';
import { pairsBlock1, pairsBlock2, type PairEntry } from './pairs';
import './styles.css';

/** 25 апреля 2026, 12:00 по Europe/Saratov (UTC+4, без DST). */
const MARATHON_END_MS = Date.parse('2026-04-25T12:00:00+04:00');

const viewportCtl = new WeakMap<
  HTMLElement,
  { playVisible: () => void; pauseAll: () => void }
>();

/** Секция «Трибунал» в зоне видимости — можно включать звук у судей (если пользователь разрешил). */
let judgesTribunalInView = false;

const showcaseClipSilentLocked = new WeakSet<HTMLVideoElement>();

/** Витрины и пары: только картинка, звук дорожки всегда выключен. */
function enforceShowcaseClipSilent(v: HTMLVideoElement): void {
  v.muted = true;
  v.defaultMuted = true;
  v.volume = 0;
  v.setAttribute('muted', '');
  if (showcaseClipSilentLocked.has(v)) return;
  showcaseClipSilentLocked.add(v);
  const lock = (): void => {
    v.muted = true;
    v.volume = 0;
  };
  v.addEventListener('volumechange', lock);
  v.addEventListener('playing', lock);
}

function initJudgesTribunalViewport(): void {
  const sec = document.getElementById('judges');
  if (!sec) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        judgesTribunalInView = e.isIntersecting && e.intersectionRatio > 0.12;
      }
      syncAllPageVideoMuteFromStorage();
    },
    { threshold: [0, 0.08, 0.12, 0.2, 0.35] },
  );
  io.observe(sec);
}

/** Фон hero: порядок роликов, без звука, слегка замедленное воспроизведение (0.8×). */
const HERO_BG_SEQUENCE = [
  '/content/1-5-part1.mp4',
  '/content/6-10-part1.mp4',
  '/content/1-5-part2.mp4',
  '/content/6-10-part2.mp4',
] as const;

const HERO_PLAYBACK_RATE = 0.8;

/** Длина одного «кадра» текста под видео (~2–3 строки крупного шрифта). */
const STORY_PANEL_SLIDE_CHAR = 106;

/** Интервал смены слайдов под видео (мс). */
const STORY_PANEL_ROTATE_MS = 6300;

/** Задержка смены текста после fade-out (мс). */
const STORY_PANEL_FADE_MS = 450;

function getShowcaseAudioPreference(): 'sound' | 'muted' | 'unknown' {
  const v = sessionStorage.getItem(SHOWCASE_AUDIO_STORAGE_KEY);
  if (v === 'sound') return 'sound';
  if (v === 'muted') return 'muted';
  return 'unknown';
}

/** Витрины — всегда без звука; трибунал — звук только при видимой секции и согласии пользователя. */
function syncAllPageVideoMuteFromStorage(): void {
  document.querySelectorAll<HTMLVideoElement>('.js-video-block video').forEach((v) => {
    enforceShowcaseClipSilent(v);
  });
  const jv = document.querySelector<HTMLVideoElement>('.js-judges-video');
  if (jv) {
    const userWantsJudgesSound = sessionStorage.getItem(SHOWCASE_AUDIO_STORAGE_KEY) === 'sound';
    const allowJudgesSound = userWantsJudgesSound && judgesTribunalInView;
    jv.muted = !allowJudgesSound;
    if (!allowJudgesSound) {
      jv.volume = 0;
    }
  }
  syncShowcaseVideoVolumesForAtmosphere(isAtmospherePlaying());
}

function retryShowcasePlaybackForVisible(): void {
  document.querySelectorAll<HTMLElement>('.js-video-block').forEach((block) => {
    viewportCtl.get(block)?.playVisible();
  });
}

function getShowcaseActiveVideo(block: HTMLElement): HTMLVideoElement | null {
  if (block.classList.contains('js-video-dual')) {
    return block.querySelector<HTMLVideoElement>('.video-stack__track.video-stack--top');
  }
  return block.querySelector<HTMLVideoElement>('.js-single-player');
}

function initShowcaseTapPlayPause(): void {
  document.querySelectorAll<HTMLElement>('.js-video-block').forEach((block) => {
    const frame = block.querySelector<HTMLElement>('.video-frame');
    if (!frame) return;
    frame.setAttribute('role', 'button');
    frame.setAttribute('tabindex', '0');
    frame.setAttribute(
      'aria-label',
      'Воспроизвести или приостановить видео: нажмите по кадру',
    );
    const toggle = (): void => {
      const v = getShowcaseActiveVideo(block);
      if (!v) return;
      if (v.paused) void v.play().catch(() => {});
      else v.pause();
    };
    frame.addEventListener('click', toggle);
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

function initJudgesChromelessVideo(): void {
  const frame = document.querySelector<HTMLElement>('.js-judges-video-frame');
  const video = document.querySelector<HTMLVideoElement>('.js-judges-video');
  if (!frame || !video) return;
  video.controls = false;
  video.disablePictureInPicture = true;
  const toggle = (): void => {
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  };
  frame.addEventListener('click', toggle);
  frame.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
}

/** Первый заход во вкладке: диалог согласия на звук; Esc/фон — как «без звука». */
function initShowcaseAudioConsentDialog(): void {
  const dlg = document.getElementById('showcase-audio-consent') as HTMLDialogElement | null;
  const agree = document.getElementById('showcase-audio-consent-agree');
  const mutedBtn = document.getElementById('showcase-audio-consent-muted');
  if (!dlg || !agree || !mutedBtn) return;

  agree.addEventListener('click', () => {
    sessionStorage.setItem(SHOWCASE_AUDIO_STORAGE_KEY, 'sound');
    syncAllPageVideoMuteFromStorage();
    dlg.close();
    /** Тот же пользовательский жест — сразу запускаем фоновый трек; кнопка остаётся выключателем. */
    void startAtmosphereFromUserGesture().then((started) => {
      setAtmosphereToggleUi(started);
    });
  });

  mutedBtn.addEventListener('click', () => {
    sessionStorage.setItem(SHOWCASE_AUDIO_STORAGE_KEY, 'muted');
    syncAllPageVideoMuteFromStorage();
    dlg.close();
  });

  dlg.addEventListener('close', () => {
    if (!sessionStorage.getItem(SHOWCASE_AUDIO_STORAGE_KEY)) {
      sessionStorage.setItem(SHOWCASE_AUDIO_STORAGE_KEY, 'muted');
      syncAllPageVideoMuteFromStorage();
    }
    queueMicrotask(() => retryShowcasePlaybackForVisible());
  });

  if (getShowcaseAudioPreference() === 'unknown') {
    dlg.showModal();
  }
}

function splitIntoSentences(text: string): string[] {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return [];
  return t
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function packSentencesIntoSlides(sentences: string[], maxLen: number): string[] {
  const slides: string[] = [];
  let buf = '';
  for (const sent of sentences) {
    const piece = sent.trim();
    if (!piece) continue;
    const candidate = buf ? `${buf} ${piece}` : piece;
    if (candidate.length <= maxLen) {
      buf = candidate;
    } else {
      if (buf) slides.push(buf);
      if (piece.length <= maxLen) {
        buf = piece;
      } else {
        buf = '';
        let rest = piece;
        while (rest.length > maxLen) {
          const space = rest.lastIndexOf(' ', maxLen);
          const at = space > Math.floor(maxLen * 0.55) ? space : maxLen;
          slides.push(rest.slice(0, at).trim());
          rest = rest.slice(at).trim();
        }
        buf = rest;
      }
    }
  }
  if (buf) slides.push(buf);
  return slides;
}

function buildSectionSlides(title: string, body: string, maxLen: number): string[] {
  const packed = packSentencesIntoSlides(splitIntoSentences(body), maxLen);
  if (packed.length === 0) {
    return title ? [`${title}`] : [];
  }
  return packed.map((chunk, i) => (i === 0 ? `${title}\n${chunk}` : chunk));
}

function slidesForPairStory(story: PairStoryContent, maxLen: number = STORY_PANEL_SLIDE_CHAR): string[] {
  const out: string[] = [];
  out.push(...buildSectionSlides(story.charATitle, story.charAText, maxLen));
  out.push(...buildSectionSlides(story.charBTitle, story.charBText, maxLen));
  out.push(...buildSectionSlides('Симбиоз (Итог)', story.synergy, maxLen));
  return out.length ? out : [''];
}

/** Панель с «огненным» текстом под роликом (читаемее, чем поверх кадра). */
function appendVideoStoryBelow(wrap: HTMLElement): void {
  const panel = document.createElement('div');
  panel.className = 'video-story-below';
  panel.setAttribute('aria-live', 'polite');
  panel.setAttribute('aria-atomic', 'true');
  const textEl = document.createElement('p');
  textEl.className = 'video-story-below__text video-story-fire-text js-video-story-text';
  panel.append(textEl);
  wrap.append(panel);
}

/** Циклическая смена фрагментов в панели под видео; таймер только в зоне видимости блока. */
function initVideoStoryBelowPanels(): void {
  document.querySelectorAll<HTMLElement>('.js-video-block[data-pair-n]').forEach((block) => {
    const n = Number(block.dataset.pairN);
    const story = pairStoryByNumber[n];
    const textEl = block.querySelector<HTMLElement>('.js-video-story-text');
    if (!story || !textEl) return;

    const slides = slidesForPairStory(story);
    let idx = 0;
    textEl.textContent = slides[0] ?? '';

    let timerId: number | null = null;

    const advance = (): void => {
      if (slides.length < 2) return;
      textEl.classList.add('video-story-fire-text--out');
      window.setTimeout(() => {
        idx = (idx + 1) % slides.length;
        textEl.textContent = slides[idx] ?? '';
        textEl.classList.remove('video-story-fire-text--out');
      }, STORY_PANEL_FADE_MS);
    };

    const start = (): void => {
      if (timerId != null || slides.length < 2) return;
      timerId = window.setInterval(advance, STORY_PANEL_ROTATE_MS);
    };

    const stop = (): void => {
      if (timerId != null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(block);
  });
}

function enforceHeroPlaybackRate(v: HTMLVideoElement): void {
  try {
    if (Math.abs(v.playbackRate - HERO_PLAYBACK_RATE) > 0.02) {
      v.playbackRate = HERO_PLAYBACK_RATE;
    }
  } catch {
    /* редкий отказ движка */
  }
}

/** Фоновые ролики hero — только картинка: без звука даже после жеста «со звуком» на странице. */
function enforceHeroVideosSilent(v: HTMLVideoElement): void {
  v.muted = true;
  v.defaultMuted = true;
  v.volume = 0;
  v.setAttribute('muted', '');
}

function lockHeroVideoSilent(v: HTMLVideoElement): void {
  const fix = (): void => {
    enforceHeroVideosSilent(v);
    enforceHeroPlaybackRate(v);
  };
  v.addEventListener('volumechange', fix);
  v.addEventListener('playing', fix);
  v.addEventListener('loadeddata', fix);
  fix();
}

/** Два слоя video: кроссфейд и цикл из четырёх клипов. */
function initHeroBackgroundCycler(): void {
  const hero = document.getElementById('hero');
  const v0 = document.querySelector<HTMLVideoElement>('.js-hero-bg-0');
  const v1 = document.querySelector<HTMLVideoElement>('.js-hero-bg-1');
  if (!hero || !v0 || !v1) return;

  const heroMobile = window.matchMedia('(max-width: 639px)').matches;
  for (const v of [v0, v1]) {
    /* На мобильных не тянем сразу весь mp4 — меньше конкурирует с текстом и LCP. */
    v.preload = heroMobile ? 'metadata' : 'auto';
    lockHeroVideoSilent(v);
    v.defaultPlaybackRate = HERO_PLAYBACK_RATE;
    v.playbackRate = HERO_PLAYBACK_RATE;
    v.addEventListener('loadedmetadata', () => enforceHeroPlaybackRate(v));
    v.addEventListener('playing', () => enforceHeroPlaybackRate(v));
    v.addEventListener('ratechange', () => enforceHeroPlaybackRate(v));
  }

  let clipOnTopIndex = 0;
  let topIs0 = true;

  const setTopLayer = (zeroOnTop: boolean): void => {
    topIs0 = zeroOnTop;
    if (zeroOnTop) {
      v0.classList.add('hero-bg-layer--top');
      v1.classList.remove('hero-bg-layer--top');
    } else {
      v1.classList.add('hero-bg-layer--top');
      v0.classList.remove('hero-bg-layer--top');
    }
  };

  const nextClipIndex = (i: number): number => (i + 1) % HERO_BG_SEQUENCE.length;

  const playTop = (): void => {
    const top = topIs0 ? v0 : v1;
    const bottom = topIs0 ? v1 : v0;
    bottom.pause();
    enforceHeroVideosSilent(top);
    enforceHeroVideosSilent(bottom);
    enforceHeroPlaybackRate(top);
    void top.play().catch(() => {});
  };

  const pauseAll = (): void => {
    v0.pause();
    v1.pause();
  };

  v0.src = HERO_BG_SEQUENCE[0];
  v0.load();
  setTopLayer(true);
  clipOnTopIndex = 0;

  v0.addEventListener('ended', () => {
    if (!topIs0) return;
    const next = nextClipIndex(clipOnTopIndex);
    v1.src = HERO_BG_SEQUENCE[next];
    v1.load();
    const onPlaying = (): void => {
      v1.removeEventListener('playing', onPlaying);
      clipOnTopIndex = next;
      setTopLayer(false);
      enforceHeroPlaybackRate(v1);
    };
    v1.addEventListener('playing', onPlaying);
    void v1.play().catch(() => {
      v1.removeEventListener('playing', onPlaying);
      clipOnTopIndex = next;
      setTopLayer(false);
    });
  });

  v1.addEventListener('ended', () => {
    if (topIs0) return;
    const next = nextClipIndex(clipOnTopIndex);
    v0.src = HERO_BG_SEQUENCE[next];
    v0.load();
    const onPlaying = (): void => {
      v0.removeEventListener('playing', onPlaying);
      clipOnTopIndex = next;
      setTopLayer(true);
      enforceHeroPlaybackRate(v0);
    };
    v0.addEventListener('playing', onPlaying);
    void v0.play().catch(() => {
      v0.removeEventListener('playing', onPlaying);
      clipOnTopIndex = next;
      setTopLayer(true);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          playTop();
        } else {
          pauseAll();
        }
      }
    },
    { threshold: 0.1 },
  );
  io.observe(hero);
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function initCountdown(): void {
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');
  if (!elDays || !elHours || !elMins || !elSecs) return;

  const tick = (): void => {
    const now = Date.now();
    let diff = Math.floor((MARATHON_END_MS - now) / 1000);
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / 86400);
    diff %= 86400;
    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    elDays.textContent = pad2(days);
    elHours.textContent = pad2(hours);
    elMins.textContent = pad2(mins);
    elSecs.textContent = pad2(secs);
  };

  tick();
  window.setInterval(tick, 1000);
}

function createDualVideoBlock(p: PairEntry): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'js-video-block js-video-dual video-showcase-bleed mb-10 w-full';
  wrap.setAttribute('aria-label', `Видео: пара ${p.n}, ${p.a} и ${p.b}`);
  wrap.dataset.pairN = String(p.n);
  const p1 = p.videoPart1Src!;
  const p2 = p.videoPart2Src!;
  wrap.dataset.part1 = p1;
  wrap.dataset.part2 = p2;

  const frame = document.createElement('div');
  frame.className =
    'video-frame video-frame--full video-chromeless-frame aspect-video max-h-[85vh] w-full cursor-pointer bg-black outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50';
  const inner = document.createElement('div');
  inner.className = 'video-stack-inner';

  const v0 = document.createElement('video');
  v0.className = 'js-stack-v0 video-stack__track video-stack--top video-chromeless';
  v0.muted = true;
  v0.playsInline = true;
  v0.disablePictureInPicture = true;
  v0.preload = 'auto';
  v0.setAttribute('aria-label', 'Часть 1');

  const v1 = document.createElement('video');
  v1.className = 'js-stack-v1 video-stack__track video-chromeless';
  v1.muted = true;
  v1.playsInline = true;
  v1.disablePictureInPicture = true;
  v1.preload = 'auto';
  v1.setAttribute('aria-hidden', 'true');
  v1.setAttribute('aria-label', 'Часть 2');

  inner.append(v0, v1);
  frame.append(inner);
  wrap.append(frame);
  appendVideoStoryBelow(wrap);
  return wrap;
}

function createSingleVideoBlock(p: PairEntry): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'js-video-block js-video-single video-showcase-bleed mb-10 w-full';
  wrap.setAttribute('aria-label', `Видео: пара ${p.n}, ${p.a} и ${p.b}`);
  wrap.dataset.pairN = String(p.n);
  wrap.dataset.src = p.videoSrc!;

  const frame = document.createElement('div');
  frame.className =
    'video-frame video-frame--full video-chromeless-frame aspect-video max-h-[85vh] w-full cursor-pointer bg-black outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50';

  const video = document.createElement('video');
  video.className = 'js-single-player video-chromeless h-full w-full bg-black object-contain';
  video.muted = true;
  video.playsInline = true;
  video.disablePictureInPicture = true;
  video.loop = true;
  video.preload = 'auto';

  frame.append(video);
  wrap.append(frame);
  appendVideoStoryBelow(wrap);
  return wrap;
}

/** Рендер цепочки роликов по данным пар (пара 1 — два файла; остальные — по одному). */
function renderVideoSlots(container: HTMLElement | null, pairs: PairEntry[]): void {
  if (!container) return;
  container.replaceChildren();
  for (const p of pairs) {
    if (p.videoPart1Src && p.videoPart2Src) {
      container.append(createDualVideoBlock(p));
    } else if (p.videoSrc) {
      container.append(createSingleVideoBlock(p));
    }
  }
}

function renderPairGrid(container: HTMLElement, pairs: PairEntry[], groupId: string): void {
  container.replaceChildren();
  for (const p of pairs) {
    const article = document.createElement('article');
    article.className = 'pair-card reveal';
    article.setAttribute('data-pair', String(p.n));
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'listitem');
    article.setAttribute('aria-label', `Пара ${p.n}: ${p.a} и ${p.b}`);

    const num = document.createElement('span');
    num.className =
      'font-display mb-2 inline-block text-xs font-bold tracking-widest text-cyan-400/90';
    num.textContent = `ПАРА ${p.n}`;

    const names = document.createElement('div');
    names.className = 'space-y-1 text-sm font-medium text-[var(--color-text-main)] md:text-base';
    const row1 = document.createElement('div');
    row1.textContent = p.a;
    const mid = document.createElement('div');
    mid.className = 'text-[var(--color-text-muted)]';
    mid.textContent = 'и';
    const row2 = document.createElement('div');
    row2.textContent = p.b;
    names.append(row1, mid, row2);

    article.append(num, names);
    container.append(article);
  }

  const cards = container.querySelectorAll<HTMLElement>('.pair-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => setActivePair(groupId, card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActivePair(groupId, card);
      }
    });
  });
}

function setActivePair(groupId: string, el: HTMLElement): void {
  const root = document.getElementById(groupId);
  if (!root) return;
  root.querySelectorAll('.pair-card').forEach((c) => c.classList.remove('is-active'));
  el.classList.add('is-active');
}

function renderMarathonIntro(): void {
  const el = document.getElementById('pair-intro-root');
  if (el) {
    el.textContent = marathonPairIntro;
  }
}

function appendPairStoryChar(parent: HTMLElement, title: string, text: string): void {
  const block = document.createElement('div');
  block.className = 'pair-story-char';
  const h = document.createElement('h4');
  h.className = 'pair-story-char__title';
  h.textContent = title;
  const p = document.createElement('p');
  p.className = 'pair-story-char__text';
  p.textContent = text;
  block.append(h, p);
  parent.append(block);
}

function appendPairStorySynergy(parent: HTMLElement, text: string): void {
  const wrap = document.createElement('div');
  wrap.className = 'pair-story-synergy';
  const label = document.createElement('p');
  label.className = 'pair-story-synergy__label';
  label.textContent = 'Симбиоз (Итог)';
  const p = document.createElement('p');
  p.className = 'pair-story-synergy__text';
  p.textContent = text;
  wrap.append(label, p);
  parent.append(wrap);
}

/** Аккордеон с ролями и симбиозом под сеткой пар. */
function renderPairStoriesList(rootId: string, pairs: PairEntry[]): void {
  const root = document.getElementById(rootId);
  if (!root) return;
  root.replaceChildren();

  for (const p of pairs) {
    const story = pairStoryByNumber[p.n];
    if (!story) continue;

    const details = document.createElement('details');
    details.className = 'pair-story-details reveal';
    details.setAttribute('aria-label', `Описание пары ${p.n}: ${p.a} и ${p.b}`);

    const summary = document.createElement('summary');
    summary.className = 'pair-story-summary';
    const inner = document.createElement('span');
    inner.className = 'pair-story-summary__inner';
    const nEl = document.createElement('span');
    nEl.className = 'pair-story-summary__n';
    nEl.textContent = `ПАРА ${p.n}`;
    const namesEl = document.createElement('span');
    namesEl.className = 'pair-story-summary__names';
    namesEl.textContent = `${p.a} и ${p.b}`;
    inner.append(nEl, namesEl);
    summary.append(inner);

    const body = document.createElement('div');
    body.className = 'pair-story-body';
    appendPairStoryChar(body, story.charATitle, story.charAText);
    appendPairStoryChar(body, story.charBTitle, story.charBText);
    appendPairStorySynergy(body, story.synergy);

    details.append(summary, body);
    root.append(details);
  }
}

/** Два фиксированных video: part1 / part2, кроссфейд. */
function initVideoStacks(): void {
  document.querySelectorAll<HTMLElement>('.js-video-dual').forEach((block) => {
    const p1 = block.dataset.part1;
    const p2 = block.dataset.part2;
    if (!p1 || !p2) return;

    const v0 = block.querySelector<HTMLVideoElement>('.js-stack-v0');
    const v1 = block.querySelector<HTMLVideoElement>('.js-stack-v1');
    if (!v0 || !v1) return;

    v0.src = p1;
    v1.src = p2;
    v0.load();
    v1.load();

    let topIs0 = true;

    const setTopLayer = (zeroOnTop: boolean): void => {
      topIs0 = zeroOnTop;
      if (zeroOnTop) {
        v0.classList.add('video-stack--top');
        v1.classList.remove('video-stack--top');
        v0.setAttribute('aria-hidden', 'false');
        v1.setAttribute('aria-hidden', 'true');
      } else {
        v1.classList.add('video-stack--top');
        v0.classList.remove('video-stack--top');
        v1.setAttribute('aria-hidden', 'false');
        v0.setAttribute('aria-hidden', 'true');
      }
    };

    const playTop = (): void => {
      const top = topIs0 ? v0 : v1;
      const bottom = topIs0 ? v1 : v0;
      bottom.pause();
      enforceShowcaseClipSilent(top);
      enforceShowcaseClipSilent(bottom);
      void top.play().catch(() => {});
    };

    const pauseAll = (): void => {
      v0.pause();
      v1.pause();
    };

    v0.addEventListener('ended', () => {
      if (!topIs0) return;
      v1.currentTime = 0;
      const onPlaying = (): void => {
        v1.removeEventListener('playing', onPlaying);
        setTopLayer(false);
      };
      v1.addEventListener('playing', onPlaying);
      void v1.play().catch(() => {
        v1.removeEventListener('playing', onPlaying);
        setTopLayer(false);
      });
    });

    v1.addEventListener('ended', () => {
      if (topIs0) return;
      v0.currentTime = 0;
      const onPlaying = (): void => {
        v0.removeEventListener('playing', onPlaying);
        setTopLayer(true);
      };
      v0.addEventListener('playing', onPlaying);
      void v0.play().catch(() => {
        v0.removeEventListener('playing', onPlaying);
        setTopLayer(true);
      });
    });

    setTopLayer(true);

    viewportCtl.set(block, {
      playVisible: playTop,
      pauseAll,
    });
  });
}

function initSingleVideoPlayers(): void {
  document.querySelectorAll<HTMLElement>('.js-video-single').forEach((block) => {
    const src = block.dataset.src;
    const video = block.querySelector<HTMLVideoElement>('.js-single-player');
    if (!src || !video) return;

    video.src = src;
    video.load();

    viewportCtl.set(block, {
      playVisible: () => {
        enforceShowcaseClipSilent(video);
        void video.play().catch(() => {});
      },
      pauseAll: () => {
        video.pause();
      },
    });
  });
}

function initVideoViewport(): void {
  const blocks = document.querySelectorAll<HTMLElement>('.js-video-block');
  if (!blocks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const ctl = viewportCtl.get(entry.target as HTMLElement);
        if (!ctl) continue;
        if (entry.isIntersecting) {
          ctl.playVisible();
        } else {
          ctl.pauseAll();
        }
      }
    },
    { root: null, threshold: 0.15 },
  );

  blocks.forEach((b) => observer.observe(b));
}

function initParallaxStarfield(): void {
  const layer = document.getElementById('starfield-parallax');
  if (!layer) return;
  let ticking = false;
  const onScroll = (): void => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const shift = y * 0.12;
      layer.style.transform = `translate3d(0, ${shift}px, 0)`;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initReveal(): void {
  const els = document.querySelectorAll<HTMLElement>('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
  );
  els.forEach((el) => io.observe(el));
}

function renderGallery(): void {
  const root = document.getElementById('gallery-root');
  if (!root) return;
  root.replaceChildren();

  if (galleryItems.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'gallery-empty reveal';
    const p = document.createElement('p');
    p.className = 'text-[var(--color-text-muted)]';
    p.textContent =
      'Пока фото нет — мы добавим кадры с площадки во время марафона и после него. Следите за обновлениями.';
    empty.append(p);
    root.append(empty);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'gallery-grid';
  grid.setAttribute('role', 'list');

  for (const item of galleryItems) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-tile reveal';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', `Открыть фото: ${item.alt}`);

    const img = document.createElement('img');
    img.className = 'gallery-tile__img';
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';
    img.decoding = 'async';

    btn.append(img);

    if (item.caption) {
      const cap = document.createElement('span');
      cap.className = 'gallery-tile__cap';
      cap.textContent = item.caption;
      btn.append(cap);
    }

    btn.addEventListener('click', () => openGalleryLightbox(item));
    grid.append(btn);
  }

  root.append(grid);
}

function openGalleryLightbox(item: GalleryItem): void {
  const dlg = document.getElementById('gallery-lightbox') as HTMLDialogElement | null;
  const imgEl = document.getElementById('gallery-lightbox-img') as HTMLImageElement | null;
  const capEl = document.getElementById('gallery-lightbox-caption');
  if (!dlg || !imgEl) return;

  imgEl.src = item.src;
  imgEl.alt = item.alt;
  if (capEl) {
    if (item.caption) {
      capEl.textContent = item.caption;
      capEl.hidden = false;
    } else {
      capEl.textContent = '';
      capEl.hidden = true;
    }
  }
  dlg.showModal();
}

function initGalleryLightbox(): void {
  const dlg = document.getElementById('gallery-lightbox') as HTMLDialogElement | null;
  const closeBtn = document.getElementById('gallery-lightbox-close');
  if (!dlg) return;

  closeBtn?.addEventListener('click', () => dlg.close());

  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) {
      dlg.close();
    }
  });

  dlg.addEventListener('close', () => {
    const imgEl = document.getElementById('gallery-lightbox-img') as HTMLImageElement | null;
    if (imgEl) {
      imgEl.removeAttribute('src');
    }
  });
}

function initSmoothAnchors(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') {
        e.preventDefault();
        return;
      }
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function boot(): void {
  initAtmosphereUi();
  initJudgesTribunalViewport();
  initCountdown();
  initParallaxStarfield();
  initHeroBackgroundCycler();

  renderVideoSlots(document.getElementById('videos-showcase-1'), pairsBlock1);
  renderVideoSlots(document.getElementById('videos-showcase-2'), pairsBlock2);

  initVideoStacks();
  initSingleVideoPlayers();
  syncAllPageVideoMuteFromStorage();
  initShowcaseTapPlayPause();
  initVideoViewport();
  initVideoStoryBelowPanels();
  initJudgesChromelessVideo();
  initShowcaseAudioConsentDialog();
  initSmoothAnchors();

  renderGallery();
  initGalleryLightbox();

  renderMarathonIntro();

  const g1 = document.getElementById('pair-grid-1');
  const g2 = document.getElementById('pair-grid-2');
  if (g1) renderPairGrid(g1, pairsBlock1, 'showcase-1');
  if (g2) renderPairGrid(g2, pairsBlock2, 'showcase-2');

  renderPairStoriesList('pair-stories-1', pairsBlock1);
  renderPairStoriesList('pair-stories-2', pairsBlock2);

  initReveal();
}

boot();
