import { assetUrl } from './baseUrl';

export type PairEntry = {
  n: number;
  a: string;
  b: string;
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
    videoPart1Src: assetUrl('content/para1-Adelaida-Grace.mp4'),
    videoPart2Src: assetUrl('content/para1-Adelaida-Grace-part2.mp4'),
  },
  { n: 2, a: 'Энергия', b: 'Себастьян', videoSrc: assetUrl('content/Para2-Energia-Sebastian.mp4') },
  { n: 3, a: 'Черная лиса', b: 'Мечта', videoSrc: assetUrl('content/Para3-Lisa-Mechta.mp4') },
  { n: 4, a: 'Hexe', b: 'Лелия', videoSrc: assetUrl('content/Para4-Hexe-Lelia.mp4') },
  { n: 5, a: 'Математик', b: 'Нафаня', videoSrc: assetUrl('content/Para5-Matematik-Nafanya.mp4') },
];

/** Пары 6–10: по одному видео. */
export const pairsBlock2: PairEntry[] = [
  { n: 6, a: 'Дичь', b: 'Блекджек', videoSrc: assetUrl('content/Para6-Dich-BlackJack.mp4') },
  { n: 7, a: 'Колючка', b: 'Harley Queen', videoSrc: assetUrl('content/Para7-koluchka-harley.mp4') },
  { n: 8, a: 'Sky Lasso', b: 'Кот', videoSrc: assetUrl('content/Para8-Sky-KOT.mp4') },
  { n: 9, a: 'Сексолог', b: 'Микки', videoSrc: assetUrl('content/Para9-Sexolog-Mikky.mp4') },
  { n: 10, a: 'Дарксайдер', b: 'GOLD', videoSrc: assetUrl('content/para10-Darksider-Gold.mp4') },
];
