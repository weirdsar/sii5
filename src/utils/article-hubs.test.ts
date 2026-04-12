import { describe, expect, it } from 'vitest';
import {
  ARTICLE_HUB_ORDER,
  groupArticlesByHub,
  type ArticleHub,
} from './article-hubs';

describe('groupArticlesByHub', () => {
  it('раскладывает записи по хабам и сортирует по дате внутри группы', () => {
    const mk = (id: string, hub: ArticleHub, day: number) => ({
      id,
      data: {
        hub,
        date: new Date(2026, 0, day),
      },
    });
    const entries = [
      mk('a', 'strategy', 1),
      mk('b', 'strategy', 15),
      mk('c', 'tech', 3),
    ];
    const grouped = groupArticlesByHub(entries);
    expect(grouped.strategy.map((e) => e.id)).toEqual(['b', 'a']);
    expect(grouped.tech.map((e) => e.id)).toEqual(['c']);
    expect(grouped.marketing).toEqual([]);
  });

  it('порядок ключей ARTICLE_HUB_ORDER стабилен', () => {
    expect(ARTICLE_HUB_ORDER).toEqual(['strategy', 'tech', 'marketing']);
  });
});
