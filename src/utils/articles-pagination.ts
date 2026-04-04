/**
 * Ранее использовалось для `/articles/page/N/`. Сейчас список статей — одна страница с хабами
 * (`src/utils/article-hubs.ts`). Константы оставлены на случай возврата пагинации.
 */
export const ARTICLES_PER_PAGE = 6;

export function getTotalArticlePages(count: number): number {
  if (count <= 0) return 0;
  return Math.ceil(count / ARTICLES_PER_PAGE);
}

/** Срез для страницы списка: page 1 = индекс 0, page 2 = второй блок и т.д. */
export function sliceArticlesForListPage<T>(items: T[], page: number): T[] {
  const p = Math.max(1, page);
  const start = (p - 1) * ARTICLES_PER_PAGE;
  return items.slice(start, start + ARTICLES_PER_PAGE);
}
