/** Пути к сгенерированным OG (PNG), см. `src/pages/open-graph/[...route].ts`. */
export function ogImagePathForCase(caseId: string): string {
  return `/open-graph/cases/${caseId}.png`;
}

export function ogImagePathForArticle(articleId: string): string {
  return `/open-graph/articles/${articleId}.png`;
}
