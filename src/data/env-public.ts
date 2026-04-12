/**
 * Публичные переменные окружения и связанные константы (только `PUBLIC_*` и несекретные URL).
 * Секреты в клиент не передавать.
 */

/** URL загрузки тега Яндекс.Метрики (Partytown / счётчик). */
export const YANDEX_METRIKA_TAG_SCRIPT_URL = 'https://mc.yandex.ru/metrika/tag.js';

/** Шаблон пикселя noscript: подставляется ID счётчика. */
export function yandexMetrikaWatchPixelUrl(counterId: string): string {
  return `https://mc.yandex.ru/watch/${counterId}`;
}

/**
 * ID счётчика по умолчанию (см. `.yandex.metrika.env` / конструктор Метрики).
 * Проп страницы и `PUBLIC_METRIKA_ID` в окружении билда переопределяют это значение.
 */
export const PUBLIC_METRIKA_ID_DEV_PLACEHOLDER = '108384118';

/**
 * Эффективный ID Яндекс.Метрики: проп страницы → `PUBLIC_METRIKA_ID` → запасной плейсхолдер.
 */
export function getPublicMetrikaId(pageProp?: string | undefined): string {
  const fromProp = String(pageProp ?? '').trim();
  if (fromProp) return fromProp;
  const fromEnv = String(import.meta.env.PUBLIC_METRIKA_ID ?? '').trim();
  if (fromEnv) return fromEnv;
  return PUBLIC_METRIKA_ID_DEV_PLACEHOLDER;
}

/**
 * URL вебхука MAX-бота из `PUBLIC_MAX_BOT_URL`. Пустая строка — зеркалирование в MAX отключено.
 */
export function getPublicMaxBotUrl(): string {
  return String(import.meta.env.PUBLIC_MAX_BOT_URL ?? '').trim();
}

/**
 * Путь POST для зеркала заявок в MAX (same-origin на проде).
 * Netlify: `/.netlify/functions/max-lead-mirror`
 * Cloudflare Pages: задайте в билде `PUBLIC_MAX_LEAD_MIRROR_PATH=/api/max-lead-mirror`
 */
export function getMaxLeadMirrorPath(): string {
  const fromEnv = String(import.meta.env.PUBLIC_MAX_LEAD_MIRROR_PATH ?? '').trim();
  if (fromEnv) return fromEnv;
  return '/.netlify/functions/max-lead-mirror';
}
