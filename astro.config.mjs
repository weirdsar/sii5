import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/**
 * Читает `.yandex.metrika.env`: строка `PUBLIC_METRIKA_ID=…` или вставка кода счётчика с Яндекса (ym(…), watch/…, id= в URL).
 * Задаёт `process.env.PUBLIC_METRIKA_ID` до инициализации Vite — попадает в `import.meta.env` в разметке.
 */
function applyPublicMetrikaIdFromYandexFile() {
  const filePath = path.resolve(process.cwd(), '.yandex.metrika.env');
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, 'utf8');
  const fromEnvLine = raw.match(/^\s*PUBLIC_METRIKA_ID\s*=\s*(\d+)\s*$/m);
  const fromYm = raw.match(/ym\(\s*(\d+)\s*,/);
  const fromWatch = raw.match(/mc\.yandex\.ru\/watch\/(\d+)/);
  const fromQueryId = raw.match(/[?&]id=(\d+)/);

  const id =
    (fromEnvLine && fromEnvLine[1]) ||
    (fromYm && fromYm[1]) ||
    (fromWatch && fromWatch[1]) ||
    (fromQueryId && fromQueryId[1]);

  if (id) {
    process.env.PUBLIC_METRIKA_ID = id;
  }
}

applyPublicMetrikaIdFromYandexFile();

export default defineConfig({
  site: 'https://sii5.ru',
  integrations: [
    partytown({
      config: {
        forward: ['ym'],
        debug: false,
      },
    }),
    sitemap({
      i18n: {
        defaultLocale: 'ru',
        locales: { ru: 'ru-RU' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  // Превью и контент — только локальные импорты из src/assets; удалённые URL не оптимизируем.
  image: {
    domains: [],
    remotePatterns: [],
  },
});