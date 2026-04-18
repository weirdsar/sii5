import { assetUrl } from './baseUrl';

/** Ключ hover-витрины (см. `pairHoverFx.ts` + `styles.css`). */
export type PairShowcaseEffect =
  | 'judges'
  | 'earth-water'
  | 'instinct-code'
  | 'math-charm'
  | 'flash-grid'
  | 'predator-target'
  | 'fortress-chaos'
  | 'wind-strings'
  | 'mind-jester'
  | 'death-gold';

export type PairEntry = {
  n: number;
  a: string;
  b: string;
  /** Публичное название команды (как в списке игроков). */
  teamName: string;
  effectType: PairShowcaseEffect;
  /** Пары 2–10: один файл в `public/content/`. */
  videoSrc?: string;
  /** Только пара 1: два ролика подряд. */
  videoPart1Src?: string;
  videoPart2Src?: string;
};

/** Пары 1–5 + видео. Пара 1 — два файла; 2–5 — по одному. */
export const pairsBlock1: PairEntry[] = [
  {
    n: 1,
    a: 'Аделаида',
    b: 'Грейс',
    teamName: 'Очевидно преКрасные',
    effectType: 'judges',
    videoPart1Src: assetUrl('content/para1-Adelaida-Grace.mp4'),
    videoPart2Src: assetUrl('content/para1-Adelaida-Grace-part2.mp4'),
  },
  {
    n: 2,
    a: 'Энергия',
    b: 'Себастьян',
    teamName: 'Бешеный краб',
    effectType: 'flash-grid',
    videoSrc: assetUrl('content/Para2-Energia-Sebastian.mp4'),
  },
  {
    n: 3,
    a: 'Черная лиса',
    b: 'Мечта',
    teamName: 'Мы вообще из другой галактики',
    effectType: 'instinct-code',
    videoSrc: assetUrl('content/Para3-Lisa-Mechta.mp4'),
  },
  {
    n: 4,
    a: 'Hexe',
    b: 'Лелия',
    teamName: 'Авантюристки',
    effectType: 'earth-water',
    videoSrc: assetUrl('content/Para4-Hexe-Lelia.mp4'),
  },
  {
    n: 5,
    a: 'Математик',
    b: 'Нафаня',
    teamName: 'Мафмультсчёт',
    effectType: 'math-charm',
    videoSrc: assetUrl('content/Para5-Matematik-Nafanya.mp4'),
  },
];

/** Пары 6–10: по одному видео. */
export const pairsBlock2: PairEntry[] = [
  {
    n: 6,
    a: 'Дичь',
    b: 'Блекджек',
    teamName: 'Милый лжец',
    effectType: 'predator-target',
    videoSrc: assetUrl('content/Para6-Dich-BlackJack.mp4'),
  },
  {
    n: 7,
    a: 'Колючка',
    b: 'Harley Queen',
    teamName: 'Две Полины',
    effectType: 'fortress-chaos',
    videoSrc: assetUrl('content/Para7-koluchka-harley.mp4'),
  },
  {
    n: 8,
    a: 'Sky Lasso',
    b: 'Кот',
    teamName: 'Острые козырьки',
    effectType: 'wind-strings',
    videoSrc: assetUrl('content/Para8-Sky-KOT.mp4'),
  },
  {
    n: 9,
    a: 'Сексолог',
    b: 'Микки',
    teamName: 'Тайные мастера',
    effectType: 'mind-jester',
    videoSrc: assetUrl('content/Para9-Sexolog-Mikky.mp4'),
  },
  {
    n: 10,
    a: 'Дарксайдер',
    b: 'GOLD',
    teamName: 'Массаж',
    effectType: 'death-gold',
    videoSrc: assetUrl('content/para10-Darksider-Gold.mp4'),
  },
];
