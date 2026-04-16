/**
 * Публичные файлы (`public/`) с учётом `base` из Vite.
 * Нужно для зеркала на GitHub Pages: `https://user.github.io/repo/`.
 */
export function assetUrl(path: string): string {
  const trimmed = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL;
  return `${base}${trimmed}`;
}
