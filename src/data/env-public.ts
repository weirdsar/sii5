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
 * Запасной ID Метрики, если не заданы проп страницы и `PUBLIC_METRIKA_ID`
 * (локальная разработка без `.env`). В продакшене задайте реальный ID в Netlify.
 */
export const PUBLIC_METRIKA_ID_DEV_PLACEHOLDER = '99999999';

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
