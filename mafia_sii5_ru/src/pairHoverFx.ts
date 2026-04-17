/**
 * Витрина пар: уникальные hover-эффекты по `data-effect` (аналог PairCard из ТЗ, без Astro).
 * Слой оверлеев — только визуал (`pointer-events: none`); клики идут на `.video-frame`.
 */

import type { PairShowcaseEffect } from './pairs';

const SHELL_BASE =
  'pair-showcase-fx group relative w-full overflow-hidden rounded-xl';

function div(className: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

/** Дочерние оверлеи под конкретный `effect` (разметка + классы для `styles.css`). */
function appendEffectLayers(shell: HTMLElement, effect: PairShowcaseEffect): void {
  switch (effect) {
    case 'judges': {
      shell.append(
        div('pair-fx-layer pair-fx-judges-grad'),
        div('pair-fx-layer pair-fx-judges-left'),
        div('pair-fx-layer pair-fx-judges-center'),
      );
      break;
    }
    case 'earth-water': {
      const wrap = div('pair-fx-layer pair-fx-earth-ripple-wrap');
      /* Статичный блик + «волна» — на тёмном mp4 overlay почти не виден, нужен нормальный слой. */
      wrap.append(div('pair-fx-earth-shine'), div('pair-fx-earth-ripple'));
      shell.append(wrap);
      break;
    }
    case 'instinct-code': {
      const root = div('pair-fx-layer pair-fx-instinct-root');
      root.append(
        div('pair-fx-ember pair-fx-ember--1'),
        div('pair-fx-ember pair-fx-ember--2'),
        div('pair-fx-ember pair-fx-ember--3'),
        div('pair-fx-ember pair-fx-ember--4'),
      );
      /** Полноэкранная «матрица»: несколько колонок с разным темпом и фазой. */
      const ROW_TEMPLATES = [
        '0 1 0 1 1 0 1 0 1 1 0 1',
        '1 0 1 0 0 1 0 1 0 0 1 0',
        '0 1 1 0 1 0 0 1 1 0 1 0',
        '1 1 0 0 1 1 0 0 1 0 1 1',
        '0 0 1 1 0 1 1 0 0 1 0 1',
      ];
      const grid = div('pair-fx-matrix-grid');
      const COLS = 10;
      const ROWS = 16;
      for (let c = 0; c < COLS; c += 1) {
        const col = div(`pair-fx-matrix-col pair-fx-matrix-col--c${c}`);
        const strip = div('pair-fx-matrix-strip');
        for (let r = 0; r < ROWS; r += 1) {
          const line = document.createElement('span');
          line.className = 'pair-fx-matrix-line';
          line.textContent = ROW_TEMPLATES[(c + r) % ROW_TEMPLATES.length];
          strip.append(line);
        }
        /* Дубликат блока строк — бесшовный цикл translate в CSS. */
        for (let r = 0; r < ROWS; r += 1) {
          const line = document.createElement('span');
          line.className = 'pair-fx-matrix-line';
          line.textContent = ROW_TEMPLATES[(c + r + 2) % ROW_TEMPLATES.length];
          strip.append(line);
        }
        col.append(strip);
        grid.append(col);
      }
      root.append(grid);
      shell.append(root);
      break;
    }
    case 'math-charm': {
      const root = div('pair-fx-layer pair-fx-math-root');
      root.append(div('pair-fx-math-glow'));
      const s1 = document.createElement('span');
      s1.className = 'pair-fx-math-sym pair-fx-math-sym--pct';
      s1.textContent = '%';
      const s2 = document.createElement('span');
      s2.className = 'pair-fx-math-sym pair-fx-math-sym--sigma';
      s2.textContent = 'Σ';
      const s3 = document.createElement('span');
      s3.className = 'pair-fx-math-sym pair-fx-math-sym--dollar';
      s3.textContent = '$';
      root.append(s1, s2, s3);
      shell.append(root);
      break;
    }
    case 'flash-grid': {
      shell.append(
        div('pair-fx-flash-layer'),
        div('pair-fx-layer pair-fx-flash-grid'),
      );
      break;
    }
    case 'predator-target': {
      const reticle = div('pair-fx-predator-reticle');
      reticle.append(div('pair-fx-predator-ring'));
      shell.append(div('pair-fx-layer pair-fx-predator-vignette'), reticle);
      break;
    }
    case 'fortress-chaos': {
      shell.append(div('pair-fx-layer pair-fx-chaos-ring'));
      break;
    }
    case 'wind-strings': {
      const root = div('pair-fx-layer pair-fx-wind-root');
      root.append(div('pair-fx-wind-noise'));
      const row = div('pair-fx-wind-strings');
      for (let i = 0; i < 6; i += 1) {
        const cell = div('pair-fx-wind-string-cell');
        cell.append(div('pair-fx-wind-string'));
        row.append(cell);
      }
      root.append(row);
      shell.append(root);
      break;
    }
    case 'mind-jester': {
      const wrap = div('pair-fx-layer pair-fx-jester-wrap');
      wrap.append(div('pair-fx-jester-spin'));
      shell.append(wrap);
      break;
    }
    case 'death-gold': {
      shell.append(div('pair-fx-layer pair-fx-death-vignette'));
      break;
    }
  }
}

/** Оболочка вокруг `.video-frame`: оверлеи + контекст для `group-hover`. */
export function createPairShowcaseShell(effect: PairShowcaseEffect): HTMLElement {
  const shell = document.createElement('div');
  shell.className = SHELL_BASE;
  shell.dataset.effect = effect;
  appendEffectLayers(shell, effect);
  return shell;
}

/** Вспышка 100 ms и прицел с rAF — только для нужных `data-effect`. */
export function initPairShowcaseHoverJs(): void {
  document.querySelectorAll<HTMLElement>('.pair-showcase-fx[data-effect="flash-grid"]').forEach((shell) => {
    shell.addEventListener(
      'mouseenter',
      () => {
        shell.classList.add('pair-showcase-fx--flash');
        window.setTimeout(() => shell.classList.remove('pair-showcase-fx--flash'), 100);
      },
      { passive: true },
    );
  });

  document.querySelectorAll<HTMLElement>('.pair-showcase-fx[data-effect="predator-target"]').forEach((shell) => {
    const reticle = shell.querySelector<HTMLElement>('.pair-fx-predator-reticle');
    if (!reticle) return;

    let raf = 0;
    let active = false;
    let lastX = 0;
    let lastY = 0;

    const apply = (): void => {
      const rect = shell.getBoundingClientRect();
      const x = lastX - rect.left;
      const y = lastY - rect.top;
      reticle.style.left = `${x}px`;
      reticle.style.top = `${y}px`;
    };

    const paint = (): void => {
      raf = 0;
      if (!active) return;
      apply();
    };

    const schedule = (): void => {
      if (raf) return;
      raf = requestAnimationFrame(paint);
    };

    shell.addEventListener(
      'mouseenter',
      (e: MouseEvent) => {
        active = true;
        lastX = e.clientX;
        lastY = e.clientY;
        apply();
      },
      { passive: true },
    );

    shell.addEventListener(
      'mouseleave',
      () => {
        active = false;
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { passive: true },
    );

    shell.addEventListener(
      'mousemove',
      (e: MouseEvent) => {
        lastX = e.clientX;
        lastY = e.clientY;
        schedule();
      },
      { passive: true },
    );
  });
}
