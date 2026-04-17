/**
 * Рассадка за столом: 10 команд × 18 игр, в ячейке — номер места 1…10.
 * В каждом столбце — перестановка мест (каждое место занято ровно одной командой).
 * Подбор случайный (фиксированный seed), с минимизацией повторов одного и того же места у команды
 * и без повторяющихся целых столбцов; см. `buildRandomizedSeatsGrid` в `lineupGridCore.ts`.
 *
 * Принцип **первой игры** (столбец с индексом 0) как основы для протокола и PDF — в `docs/LINEUP.md`.
 */

import { buildRandomizedSeatsGrid } from './lineupGridCore';
import { pairsBlock1, pairsBlock2, type PairEntry } from './pairs';

/** Команды в порядке пар 1…10 (как на сайте). */
export const lineupTeams: PairEntry[] = [...pairsBlock1, ...pairsBlock2].sort((a, b) => a.n - b.n);

/** Матрица мест: `LINEUP_SEATS[teamIndex][gameIndex]` ∈ 1…10. */
export const LINEUP_SEATS: number[][] = buildRandomizedSeatsGrid();

/**
 * Показ чисел в таблице рассадки по URL.
 * — Без параметра или с `lineup=0` / `hide` / `false` — ячейки скрыты (плейсхолдер «—»).
 * — Если задан `VITE_LINEUP_REVEAL_KEY` в сборке: только `?lineup=<точное значение ключа>` (или то же в `showLineup`) для показа рассадки.
 * — Иначе (ключ не задан): `?lineup=1`, `true`, `yes`, `show`.
 */
export function isLineupRevealedFromUrl(search: string = typeof window !== 'undefined' ? window.location.search : ''): boolean {
  const p = new URLSearchParams(search);
  const raw = (p.get('lineup') ?? p.get('showLineup'))?.trim();
  if (!raw) return false;
  const lo = raw.toLowerCase();
  if (raw === '0' || lo === 'false' || lo === 'hide' || lo === 'off') return false;
  const key = (import.meta.env.VITE_LINEUP_REVEAL_KEY as string | undefined)?.trim();
  if (key) return raw === key;
  return lo === '1' || lo === 'true' || lo === 'yes' || lo === 'show';
}
