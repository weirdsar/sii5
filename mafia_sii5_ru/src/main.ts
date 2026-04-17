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
import { assetUrl } from './baseUrl';
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

/** Порог видимости только кадра с Judes (не всей секции #judges — иначе ролик крутится, пока на экране текст ниже). */
const JUDGES_VIDEO_VISIBLE_RATIO = 0.18;
const JUDGES_DEFAULT_VIDEO_SRC = assetUrl('content/Judes.mp4');

let judgesDefaultLoopEnabled = true;

function swapJudgesVideoSource(video: HTMLVideoElement, src: string, loop: boolean): void {
  const normalizedCurrent = new URL(video.currentSrc || video.src, window.location.href).pathname;
  const normalizedNext = new URL(src, window.location.href).pathname;
  video.loop = loop;
  if (normalizedCurrent !== normalizedNext) {
    video.src = src;
    video.load();
  } else {
    video.currentTime = 0;
  }
}

function restoreJudgesDefaultVideo(video: HTMLVideoElement): void {
  judgesDefaultLoopEnabled = true;
  swapJudgesVideoSource(video, JUDGES_DEFAULT_VIDEO_SRC, true);
  syncAllPageVideoMuteFromStorage();
  if (judgesTribunalInView) {
    void video.play().catch(() => {});
  }
}

function playJudgeSpotlight(video: HTMLVideoElement, src: string): void {
  judgesDefaultLoopEnabled = false;
  swapJudgesVideoSource(video, src, false);
  syncAllPageVideoMuteFromStorage();
  void video.play().catch(() => {});
}

function initJudgesTribunalViewport(): void {
  const shell = document.querySelector<HTMLElement>('.judges-video-shell');
  const video = document.querySelector<HTMLVideoElement>('.js-judges-video');
  if (!shell || !video) return;

  const io = new IntersectionObserver(
    (entries) => {
      const e = entries[entries.length - 1];
      if (!e) return;

      const visible =
        e.isIntersecting && e.intersectionRatio >= JUDGES_VIDEO_VISIBLE_RATIO;
      judgesTribunalInView = visible;

      syncAllPageVideoMuteFromStorage();

      if (visible) {
        if (judgesDefaultLoopEnabled || !video.paused) {
          void video.play().catch(() => {});
        }
      } else {
        video.pause();
      }
    },
    {
      /* Чуть «урезаем» viewport — пауза раньше, когда кадр уезжает к краю экрана. */
      rootMargin: '-6% 0px -10% 0px',
      threshold: [0, 0.06, 0.12, 0.18, 0.25, 0.35, 0.5, 0.75, 1],
    },
  );
  io.observe(shell);
}

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
  video.src = JUDGES_DEFAULT_VIDEO_SRC;
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

  video.addEventListener('ended', () => {
    if (!judgesDefaultLoopEnabled) {
      restoreJudgesDefaultVideo(video);
    }
  });
}

function initJudgesSpotlightSwitch(): void {
  const video = document.querySelector<HTMLVideoElement>('.js-judges-video');
  if (!video) return;
  const triggers = document.querySelectorAll<HTMLButtonElement>('.js-judge-trigger[data-judge-video]');
  if (!triggers.length) return;

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const rel = btn.dataset.judgeVideo;
      if (!rel) return;
      const targetSrc = assetUrl(rel);
      playJudgeSpotlight(video, targetSrc);
    });
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
function appendVideoStoryBelow(wrap: HTMLElement, embedInAccordion = false): void {
  const panel = document.createElement('div');
  panel.className = embedInAccordion
    ? 'video-story-below video-story-below--embed'
    : 'video-story-below';
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
  wrap.className = 'pair-story-media js-video-block js-video-dual w-full';
  wrap.setAttribute('aria-label', `Видео: пара ${p.n}, ${p.a} и ${p.b}`);
  wrap.dataset.pairN = String(p.n);
  const p1 = p.videoPart1Src!;
  const p2 = p.videoPart2Src!;
  wrap.dataset.part1 = p1;
  wrap.dataset.part2 = p2;

  const frame = document.createElement('div');
  frame.className =
    'video-frame video-chromeless-frame aspect-video max-h-[min(72vh,92vw)] w-full cursor-pointer rounded-xl bg-black outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50';
  const inner = document.createElement('div');
  inner.className = 'video-stack-inner';

  const v0 = document.createElement('video');
  v0.className = 'js-stack-v0 video-stack__track video-stack--top video-chromeless';
  v0.muted = true;
  v0.playsInline = true;
  v0.disablePictureInPicture = true;
  /* src выставляет очередь `preloadShowcaseVideosSequentially` — не конкурируем десятью mp4 сразу. */
  v0.preload = 'none';
  v0.setAttribute('aria-label', 'Часть 1');

  const v1 = document.createElement('video');
  v1.className = 'js-stack-v1 video-stack__track video-chromeless';
  v1.muted = true;
  v1.playsInline = true;
  v1.disablePictureInPicture = true;
  v1.preload = 'none';
  v1.setAttribute('aria-hidden', 'true');
  v1.setAttribute('aria-label', 'Часть 2');

  inner.append(v0, v1);
  frame.append(inner);
  wrap.append(frame);
  appendVideoStoryBelow(wrap, true);
  return wrap;
}

function createSingleVideoBlock(p: PairEntry): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'pair-story-media js-video-block js-video-single w-full';
  wrap.setAttribute('aria-label', `Видео: пара ${p.n}, ${p.a} и ${p.b}`);
  wrap.dataset.pairN = String(p.n);
  wrap.dataset.src = p.videoSrc!;

  const frame = document.createElement('div');
  frame.className =
    'video-frame video-chromeless-frame aspect-video max-h-[min(72vh,92vw)] w-full cursor-pointer rounded-xl bg-black outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50';

  const video = document.createElement('video');
  video.className = 'js-single-player video-chromeless h-full w-full bg-black object-contain';
  video.muted = true;
  video.playsInline = true;
  video.disablePictureInPicture = true;
  video.loop = true;
  video.preload = 'none';

  frame.append(video);
  wrap.append(frame);
  appendVideoStoryBelow(wrap, true);
  return wrap;
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

/** Аккордеон пары: видео + «огненный» текст под роликом + роли и симбиоз. */
function renderPairStoriesList(rootId: string, pairs: PairEntry[]): void {
  const root = document.getElementById(rootId);
  if (!root) return;
  root.replaceChildren();

  for (const p of pairs) {
    const story = pairStoryByNumber[p.n];
    if (!story) continue;

    const details = document.createElement('details');
    details.className = 'pair-story-details reveal';
    details.setAttribute(
      'aria-label',
      `Пара ${p.n}: ${p.a} и ${p.b} — видео и описание ролей`,
    );

    const summary = document.createElement('summary');
    summary.className = 'pair-story-summary';
    const inner = document.createElement('span');
    inner.className = 'pair-story-summary__inner';
    const nEl = document.createElement('span');
    nEl.className = 'pair-story-summary__n';
    /* Без второй строки с именами — они дублировали витрину и старые карточки «ПАРА N». */
    nEl.textContent = `Пара ${p.n}`;
    const a11y = document.createElement('span');
    a11y.className = 'pair-story-summary__sr';
    a11y.textContent = `${p.a} и ${p.b}`;
    inner.append(nEl, a11y);
    summary.append(inner);

    const body = document.createElement('div');
    body.className = 'pair-story-body';

    if (p.videoPart1Src && p.videoPart2Src) {
      body.append(createDualVideoBlock(p));
    } else if (p.videoSrc) {
      body.append(createSingleVideoBlock(p));
    }

    appendPairStoryChar(body, story.charATitle, story.charAText);
    appendPairStoryChar(body, story.charBTitle, story.charBText);
    appendPairStorySynergy(body, story.synergy);

    details.append(summary, body);
    root.append(details);
  }
}

/** Нормализованный путь — не сбрасываем буфер, если тот же файл уже в `<video>`. */
function canonicalMediaPath(src: string): string {
  try {
    return new URL(src, window.location.href).pathname;
  } catch {
    return src;
  }
}

/** Меняем `src` только при другом URL; `load()` не вызываем — не выкидываем уже загруженное. */
function setShowcaseVideoSrcIfChanged(video: HTMLVideoElement, src: string): void {
  const next = canonicalMediaPath(src);
  const cur = video.src ? canonicalMediaPath(video.currentSrc || video.src) : '';
  if (cur === next) return;
  video.preload = 'auto';
  video.src = src;
}

/** Дождаться данных по текущему `src` (или ошибки/таймаут) — затем следующий клип в очереди. */
function waitShowcaseVideoHasData(video: HTMLVideoElement): Promise<void> {
  if (video.error) return Promise.resolve();
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();
  if (!video.src) return Promise.resolve();

  return new Promise((resolve) => {
    const done = (): void => {
      video.removeEventListener('loadeddata', done);
      video.removeEventListener('canplay', done);
      video.removeEventListener('error', done);
      window.clearTimeout(timeoutId);
      resolve();
    };
    const timeoutId = window.setTimeout(done, 90_000);
    video.addEventListener('loadeddata', done, { once: true });
    video.addEventListener('canplay', done, { once: true });
    video.addEventListener('error', done, { once: true });
  });
}

type ShowcasePreloadClip = { video: HTMLVideoElement; src: string };

/** Порядок 1…10: как карточки в `#pair-stories-*`; у пары 1 — два файла подряд. */
function collectShowcaseVideoPreloadTasks(): ShowcasePreloadClip[] {
  const out: ShowcasePreloadClip[] = [];
  for (const id of ['pair-stories-1', 'pair-stories-2'] as const) {
    const root = document.getElementById(id);
    if (!root) continue;

    root.querySelectorAll<HTMLElement>('.js-video-block').forEach((block) => {
      if (block.classList.contains('js-video-dual')) {
        const p1 = block.dataset.part1;
        const p2 = block.dataset.part2;
        const v0 = block.querySelector<HTMLVideoElement>('.js-stack-v0');
        const v1 = block.querySelector<HTMLVideoElement>('.js-stack-v1');
        if (p1 && p2 && v0 && v1) {
          out.push({ video: v0, src: p1 }, { video: v1, src: p2 });
        }
      } else if (block.classList.contains('js-video-single')) {
        const src = block.dataset.src;
        const v = block.querySelector<HTMLVideoElement>('.js-single-player');
        if (src && v) out.push({ video: v, src });
      }
    });
  }
  return out;
}

/** Последовательная фоновая подгрузка всех роликов героев — один «тяжёлый» клип за раз. */
async function preloadShowcaseVideosSequentially(): Promise<void> {
  const clips = collectShowcaseVideoPreloadTasks();
  for (const { video, src } of clips) {
    setShowcaseVideoSrcIfChanged(video, src);
    await waitShowcaseVideoHasData(video);
  }
  queueMicrotask(() => {
    syncAllPageVideoMuteFromStorage();
    retryShowcasePlaybackForVisible();
  });
}

/** Два фиксированных video: part1 / part2, кроссфейд (`src` подставляет очередь предзагрузки). */
function initVideoStacks(): void {
  document.querySelectorAll<HTMLElement>('.js-video-dual').forEach((block) => {
    const p1 = block.dataset.part1;
    const p2 = block.dataset.part2;
    if (!p1 || !p2) return;

    const v0 = block.querySelector<HTMLVideoElement>('.js-stack-v0');
    const v1 = block.querySelector<HTMLVideoElement>('.js-stack-v1');
    if (!v0 || !v1) return;

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
      if (!top.src) return;
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

/** Один mp4 на карточку (`src` подставляет очередь предзагрузки). */
function initSingleVideoPlayers(): void {
  document.querySelectorAll<HTMLElement>('.js-video-single').forEach((block) => {
    const src = block.dataset.src;
    const video = block.querySelector<HTMLVideoElement>('.js-single-player');
    if (!src || !video) return;

    viewportCtl.set(block, {
      playVisible: () => {
        if (!video.src) return;
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

/** Раскрытие `<details>` вынимает контент из «схлопнутого» слота — даём плееру шанс стартовать до срабатывания IO. */
function initPairStoryDetailsOpenVideoKick(): void {
  document.querySelectorAll<HTMLDetailsElement>('.pair-story-details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      requestAnimationFrame(() => {
        details.querySelectorAll<HTMLElement>('.js-video-block').forEach((block) => {
          const ctl = viewportCtl.get(block);
          if (!ctl) return;
          const r = block.getBoundingClientRect();
          const vw = window.innerWidth || document.documentElement.clientWidth;
          const vh = window.innerHeight || document.documentElement.clientHeight;
          const visible = r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
          if (visible) ctl.playVisible();
        });
      });
    });
  });
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
  /* Hero: без отложенного появления — на мобильных WebKit IO внутри overflow:hidden
   * часто не даёт isIntersecting, блоки остаются opacity:0 («чёрный экран»). */
  document.querySelectorAll<HTMLElement>('#hero .reveal').forEach((el) => {
    el.classList.add('is-visible');
  });

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
  document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)').forEach((el) => {
    io.observe(el);
  });
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
  /* 1 — глобальные обработчики: атмосфера, таймер, параллакс (фон hero — статичное WebP в HTML) */
  initAtmosphereUi();
  initJudgesTribunalViewport();
  initCountdown();
  initParallaxStarfield();

  /* 2 — витрины: ролики и «огненный» текст внутри раскрывающихся карточек пар */
  renderPairStoriesList('pair-stories-1', pairsBlock1);
  renderPairStoriesList('pair-stories-2', pairsBlock2);

  initVideoStacks();
  initSingleVideoPlayers();
  void preloadShowcaseVideosSequentially();
  syncAllPageVideoMuteFromStorage();
  initShowcaseTapPlayPause();
  initVideoViewport();
  initPairStoryDetailsOpenVideoKick();
  initVideoStoryBelowPanels();
  initJudgesChromelessVideo();
  initJudgesSpotlightSwitch();
  initShowcaseAudioConsentDialog();
  initSmoothAnchors();

  renderGallery();
  initGalleryLightbox();

  /* 3 — вступление о дуэтах */
  renderMarathonIntro();

  /* 4 — появление секций при скролле */
  initReveal();
}

boot();
