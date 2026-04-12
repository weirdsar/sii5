import { describe, expect, it } from 'vitest';
import { ogImagePathForArticle, ogImagePathForCase } from './ogImagePaths';

describe('ogImagePaths', () => {
  it('строит путь к OG кейса', () => {
    expect(ogImagePathForCase('uzelok64')).toBe('/open-graph/cases/uzelok64.png');
  });

  it('строит путь к OG статьи', () => {
    expect(ogImagePathForArticle('dizajn-sajta-2026')).toBe(
      '/open-graph/articles/dizajn-sajta-2026.png'
    );
  });
});
