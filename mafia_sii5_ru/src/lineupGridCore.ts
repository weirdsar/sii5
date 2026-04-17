/**
 * Детерминированная сетка мест без импорта из `pairs` / Vite — для сайта и скрипта PDF.
 *
 * Смысл матрицы и приоритет **первой игры** (индекс столбца `0`) как основы протокола — в `docs/LINEUP.md`
 * («Основа: первая игра»). Смена `LINEUP_RANDOM_SEED` меняет всю матрицу сразу (сайт + PDF).
 */

const TEAMS = 10;
const GAMES = 18;

/** Смените число — получится другая (но стабильная при сборке) рассадка. Должно совпадать с сайтом. */
export const LINEUP_RANDOM_SEED = 0x5eedc0de;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randIntBelow(rnd: () => number, n: number): number {
  return Math.floor(rnd() * n);
}

function randomSeatColumn(rnd: () => number): number[] {
  const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = 9; i > 0; i -= 1) {
    const j = randIntBelow(rnd, i + 1);
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function penaltyForColumn(grid: number[][], g: number, col: number[]): number {
  let p = 0;
  for (let t = 0; t < TEAMS; t += 1) {
    const s = col[t]!;
    for (let pg = 0; pg < g; pg += 1) {
      if (grid[t]![pg] === s) p += 6;
    }
    if (g > 0 && grid[t]![g - 1] === s) p += 14;
  }
  for (let pg = 0; pg < g; pg += 1) {
    let dupCol = true;
    for (let t = 0; t < TEAMS; t += 1) {
      if (col[t] !== grid[t]![pg]) {
        dupCol = false;
        break;
      }
    }
    if (dupCol) p += 80;
  }
  return p;
}

function totalPenaltyGrid(grid: number[][]): number {
  let p = 0;
  for (let t = 0; t < TEAMS; t += 1) {
    for (let g = 0; g < GAMES; g += 1) {
      const s = grid[t]![g]!;
      for (let pg = 0; pg < g; pg += 1) {
        if (grid[t]![pg] === s) p += 6;
      }
      if (g > 0 && grid[t]![g - 1] === s) p += 14;
    }
  }
  for (let g1 = 0; g1 < GAMES; g1 += 1) {
    for (let g2 = g1 + 1; g2 < GAMES; g2 += 1) {
      let dup = true;
      for (let t = 0; t < TEAMS; t += 1) {
        if (grid[t]![g1] !== grid[t]![g2]) {
          dup = false;
          break;
        }
      }
      if (dup) p += 80;
    }
  }
  return p;
}

/** Матрица `LINEUP_SEATS[команда][игра]` — значения 1…10. */
export function buildRandomizedSeatsGrid(): number[][] {
  const rnd = mulberry32(LINEUP_RANDOM_SEED);
  const grid: number[][] = Array.from({ length: TEAMS }, () => Array(GAMES).fill(0));
  const trialsPerColumn = 520;

  for (let g = 0; g < GAMES; g += 1) {
    let best = randomSeatColumn(rnd);
    let bestPen = penaltyForColumn(grid, g, best);
    for (let k = 0; k < trialsPerColumn - 1; k += 1) {
      const cand = randomSeatColumn(rnd);
      const pen = penaltyForColumn(grid, g, cand);
      if (pen < bestPen) {
        bestPen = pen;
        best = cand;
      }
    }
    for (let t = 0; t < TEAMS; t += 1) grid[t]![g] = best[t]!;
  }

  const hillSteps = 9000;
  for (let iter = 0; iter < hillSteps; iter += 1) {
    const g = randIntBelow(rnd, GAMES);
    let i = randIntBelow(rnd, TEAMS);
    let j = randIntBelow(rnd, TEAMS);
    if (j === i) j = (j + 1) % TEAMS;
    const before = totalPenaltyGrid(grid);
    const si = grid[i]![g]!;
    const sj = grid[j]![g]!;
    grid[i]![g] = sj;
    grid[j]![g] = si;
    const after = totalPenaltyGrid(grid);
    if (after > before) {
      grid[i]![g] = si;
      grid[j]![g] = sj;
    }
  }

  return grid;
}
