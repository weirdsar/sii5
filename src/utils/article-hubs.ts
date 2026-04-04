/**
 * Хабы списка статей: перелинковка и навигация по смыслу, не только по дате.
 * Значения совпадают с полем `hub` в frontmatter коллекции `articles`.
 */
export const ARTICLE_HUB_ORDER = ['strategy', 'tech', 'marketing'] as const;

export type ArticleHub = (typeof ARTICLE_HUB_ORDER)[number];

export const ARTICLE_HUB_LABELS: Record<
  ArticleHub,
  { title: string; description: string }
> = {
  strategy: {
    title: 'Стратегия и цены',
    description:
      'Зачем сайт бизнесу, какой формат выбрать и сколько это стоит в 2026 году.',
  },
  tech: {
    title: 'Технологии и SEO',
    description:
      'Скорость, разметка, безопасность после запуска, интеграции с CRM и оплатой.',
  },
  marketing: {
    title: 'Маркетинг и тексты',
    description:
      'Копирайтинг без воды, дизайн и доверие, сильные кейсы в портфолио.',
  },
};

type EntryWithHub = {
  data: { hub: ArticleHub; date: Date };
};

/** Группировка записей по хабу; внутри каждой группы — по убыванию даты. */
export function groupArticlesByHub<T extends EntryWithHub>(entries: T[]): Record<ArticleHub, T[]> {
  const grouped: Record<ArticleHub, T[]> = {
    strategy: [],
    tech: [],
    marketing: [],
  };
  for (const e of entries) {
    grouped[e.data.hub].push(e);
  }
  for (const key of ARTICLE_HUB_ORDER) {
    grouped[key].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  }
  return grouped;
}
