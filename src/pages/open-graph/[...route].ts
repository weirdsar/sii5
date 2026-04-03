/**
 * Генерация Open Graph (1200×630 PNG) на этапе сборки через astro-og-canvas.
 * Кэш: `node_modules/.astro-og-canvas` (хэш от текста и стилей).
 */
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const caseEntries = await getCollection('cases');
const articleEntries = await getCollection('articles');

type OgPage =
  | { kind: 'case'; title: string; category: string }
  | { kind: 'article'; title: string; category: string };

const pages: Record<string, OgPage> = {
  ...Object.fromEntries(
    caseEntries.map((e) => [
      `cases/${e.id}`,
      {
        kind: 'case' as const,
        title: e.data.metaTitle,
        category: 'Кейс',
      },
    ])
  ),
  ...Object.fromEntries(
    articleEntries.map((e) => [
      `articles/${e.id}`,
      {
        kind: 'article' as const,
        title: e.data.metaTitle,
        category: 'Статья',
      },
    ])
  ),
};

/** Короткое имя бренда в подписи OG-карточки */
const SITE_OG_LINE = 'SII5';

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_routeKey, page) => {
    const titleLen = page.title.length;
    const titleSize = titleLen > 70 ? 42 : titleLen > 52 ? 48 : 56;

    return {
      title: page.title,
      description: `${SITE_OG_LINE}\n${page.category}`,
      bgGradient:
        page.kind === 'case'
          ? [
              [15, 23, 42],
              [30, 64, 175],
            ]
          : [
              [15, 23, 42],
              [51, 65, 85],
            ],
      border: {
        color: page.kind === 'case' ? [37, 99, 235] : [245, 158, 11],
        width: 8,
        side: 'inline-start',
      },
      padding: 72,
      font: {
        title: {
          size: titleSize,
          weight: 'Bold',
          color: [248, 250, 252],
          lineHeight: 1.12,
          families: ['Noto Sans'],
        },
        description: {
          size: 36,
          weight: 'Normal',
          color: [148, 163, 184],
          lineHeight: 1.3,
          families: ['Noto Sans'],
        },
      },
      fonts: [
        'https://api.fontsource.org/v1/fonts/noto-sans/cyrillic-700-normal.ttf',
        'https://api.fontsource.org/v1/fonts/noto-sans/cyrillic-400-normal.ttf',
      ],
      format: 'PNG',
      quality: 90,
    };
  },
});
