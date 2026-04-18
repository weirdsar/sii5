/**
 * Подписи команд для PDF (без Vite). Порядок в массиве — пары 1…10 по `n`, как `lineupTeams` на сайте;
 * порядок **строк на каждом листе** `igra.pdf` — сортировка по месту за столом для **соответствующей игры** (см. `docs/LINEUP.md`).
 * При смене пар в `pairs.ts` обновите этот список.
 */
export type LineupPdfTeamRow = {
  n: number;
  teamName: string;
  a: string;
  b: string;
};

export const LINEUP_PDF_TEAMS: LineupPdfTeamRow[] = [
  { n: 1, teamName: 'Очевидно преКрасные', a: 'Аделаида', b: 'Грейс' },
  { n: 2, teamName: 'Бешеный краб', a: 'Энергия', b: 'Себастьян' },
  { n: 3, teamName: 'Мы вообще из другой галактики', a: 'Черная лиса', b: 'Мечта' },
  { n: 4, teamName: 'Авантюристки', a: 'Hexe', b: 'Лелия' },
  { n: 5, teamName: 'Мафмультсчёт', a: 'Математик', b: 'Нафаня' },
  { n: 6, teamName: 'Милый лжец', a: 'Дичь', b: 'Блекджек' },
  { n: 7, teamName: 'Две Полины', a: 'Колючка', b: 'Harley Queen' },
  { n: 8, teamName: 'Острые козырьки', a: 'Sky Lasso', b: 'Кот' },
  { n: 9, teamName: 'Тайные мастера', a: 'Сексолог', b: 'Микки' },
  { n: 10, teamName: 'Массаж', a: 'Дарксайдер', b: 'GOLD' },
];
