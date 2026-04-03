# SII5 — подробный снимок состояния проекта (для ИИ-агента)

Документ описывает **текущее состояние кодовой базы**: стек, файлы, данные, поведение, ограничения. **Хронология работ и итерации не воспроизводятся** — для этого используется отдельный файл `log.md`.

При противоречии между этим файлом и репозиторием приоритет у **фактических файлов в проекте**.

---

## 1. Идентификация проекта

| Поле | Значение |
|------|----------|
| Назначение | Сайт-портфолио веб-разработчика, лидогенерация для услуг (лендинги, корпоративные сайты и т.д.) |
| Бренд в интерфейсе | **SII5 — Веб-разработка** (`src/data/site.ts` → `name`) |
| Публичный URL | **`https://sii5.ru`** (`astro.config.mjs` → `site`, `siteConfig.url`) |
| Язык контента | Русский (`<html lang="ru">` в `BaseLayout.astro`) |
| Аудитория (контент) | Малый бизнес в РФ |
| Валюта в текстах | Рубли (₽) |
| Репозиторий (по `.cursorrules`) | `https://github.com/weirdsar/sii5` |
| Деплой | **Netlify** (сборка `npm run build`, публикация каталога `dist/`) |

**Имя npm-пакета** в `package.json`: `grubby-gravity` — артефакт шаблона Astro, на работу сайта не влияет.

---

## 2. Стек технологий (фактические версии)

| Компонент | Версия / способ подключения |
|-----------|-----------------------------|
| **Astro** | `^6.1.3` |
| **Режим вывода** | `output: 'static'` — чистый SSG, HTML в `dist/` |
| **Tailwind CSS** | `^4.2.2` через **`@tailwindcss/vite`** в `vite.plugins` (`astro.config.mjs`) |
| **Интеграция `@astrojs/tailwind`** | **Не используется** (в отличие от устаревшей формулировки в `.cursorrules`, где упоминается v3 и `@astrojs/tailwind`) |
| **TypeScript** | `^5.9.3`, конфиг `extends: astro/tsconfigs/strict` |
| **@astrojs/sitemap** | `^3.7.2` — `sitemap-index.xml` |
| **@astrojs/partytown** | `^2.1.6` — Метрика в воркере (`forward: ['ym']`) |
| **@astrojs/rss** | `^4.0.18` — `src/pages/rss.xml.ts` |
| **@fontsource-variable/** inter, jetbrains-mono | локальные вариативные шрифты в `globals.css` |
| **astro-og-canvas** | `^0.11.0` — PNG OG в `open-graph/[...route].ts` |
| **Vitest** | `^4.1.2` (dev) — `npm run test` |
| **@astrojs/check** | `^0.9.8` (dev) — `npx astro check` |
| **Node** | `engines.node >= 22.12.0` |

**UI-фреймворки** (React, Vue, Svelte) в проекте **отсутствуют** — только компоненты `.astro`, согласно правилам проекта.

---

## 3. Конфигурационные файлы

### `astro.config.mjs`

- `site: 'https://sii5.ru'` — базовый URL для абсолютных ссылок, canonical, sitemap, OG-изображений.
- `integrations`: **`@astrojs/partytown`** (forward `ym` для Метрики), **`@astrojs/sitemap`** (`i18n`: ru / ru-RU).
- `image.domains` / `image.remotePatterns`: пустые массивы — только локальная оптимизация ассетов.
- `vite.plugins: [tailwindcss()]` — Tailwind v4 через Vite.
- Опционально: чтение `.yandex.metrika.env` → `process.env.PUBLIC_METRIKA_ID` до инициализации Vite.

### `tsconfig.json`

- Наследование `astro/tsconfigs/strict`.
- Path aliases: `@/*`, `@components/*`, `@layouts/*`, `@data/*`, `@types/*` (в исходниках нередко используются **относительные** импорты).

### `netlify.toml`

- `command = "npm run build"`, `publish = "dist"`.
- Глобальные заголовки: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

### `package.json` — скрипты

| Скрипт | Назначение |
|--------|------------|
| `npm run dev` | `astro dev` |
| `npm run build` | `astro build` + проверка внутренних ссылок (`scripts/check-internal-links.mjs`) |
| `npm run build:only` | только `astro build` |
| `npm run preview` | `astro preview` — локальный просмотр сборки |
| `npm run test` | Vitest (`src/utils/helpers.test.ts` и др.) |

---

## 4. Структура каталогов (актуальная)

```
sii5/
├── astro.config.mjs
├── netlify.toml
├── package.json
├── tsconfig.json
├── .cursorrules
├── log.md
├── roadmap.md
├── max_bot_instrukt.md
├── summary.md
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/
│       ├── placeholder.svg
│       ├── hero/hero-bg.svg
│       ├── og/og-default.svg
│       └── cases/*.svg (превью кейсов)
└── src/
    ├── layouts/BaseLayout.astro
    ├── content.config.ts   ← коллекции cases, articles, services, additionalServices (Zod)
    ├── content/
    │   ├── cases/*.md
    │   ├── articles/*.md
    │   ├── services/*.md
    │   └── additional-services/*.md
    ├── pages/
    │   ├── index.astro
    │   ├── 404.astro
    │   ├── contact.astro
    │   ├── services.astro
    │   ├── brief.astro
    │   ├── privacy.astro
    │   ├── rss.xml.ts
    │   ├── open-graph/[...route].ts  ← PNG OG (astro-og-canvas)
    │   ├── cases/index.astro
    │   ├── cases/[slug].astro
    │   ├── articles/index.astro
    │   └── articles/[slug].astro
    ├── components/   (см. раздел 7)
    ├── data/         (site.ts, navigation.ts, env-public.ts)
    ├── types/index.ts
    ├── utils/        (helpers, imageAssets, ogImagePaths, …)
    └── styles/
        ├── globals.css   ← @theme, тёмная тема, подключён в BaseLayout
        └── global.css    ← дублирует импорт Tailwind; в layout не используется
```

---

## 5. Макет `layouts/BaseLayout.astro`

### Props

| Prop | Тип | Обязательность | По умолчанию |
|------|-----|----------------|--------------|
| `title` | string | да | — |
| `description` | string | да | — |
| `ogImage` | string | нет | `/images/og/og-default.svg` |
| `canonicalUrl` | string | нет | URL из `Astro.site` + pathname |
| `type` | `'website'` \| `'article'` | нет | `website` |
| `metrikaId` | string | нет | см. `getPublicMetrikaId()` |
| `robots` | string | нет | — (meta не выводится) |

**Заголовок вкладки:** `fullTitle = \`${title} | ${siteConfig.name}\`` (имя сайта из `site.ts`).

### `<head>`

- Сразу после viewport: **inline-скрипт темы** (`localStorage` + `prefers-color-scheme`) — без FOUC тёмной/светлой темы.
- `ClientRouter` (View Transitions).
- Мета: title, description, author; опционально `robots`.
- Open Graph / Twitter Card; `link rel="canonical"`; favicon `/favicon.svg`.
- Шрифты: **Fontsource** (`@fontsource-variable/inter`, jetbrains-mono) в `globals.css`, не Google Fonts CDN.
- **JSON-LD:** два блока `JsonLd` — `website` и `localBusiness`.
- **Яндекс.Метрика:** Partytown + `ym`; ID из `getPublicMetrikaId()` (`src/data/env-public.ts`: проп `metrikaId` → `PUBLIC_METRIKA_ID` → плейсхолдер для dev).

### `<body>`

- `Header`, `<main class="flex-grow"><slot /></main>`, `Footer`.
- **Inline-скрипт** (scroll reveal): выбирает `[data-reveal]`, задаёт начальную прозрачность и сдвиг, `IntersectionObserver` с порогом `0.05` на узких экранах и `0.15` на широких, `rootMargin: 0px 0px -50px 0px`; задержка из `data-reveal-delay` (мс).

### Стили

- Импорт: `../styles/globals.css` (единственный глобальный CSS-вход для страниц с этим layout).

---

## 6. Страницы (`src/pages/`)

Для всех ниже, кроме 404, используется `BaseLayout` (кроме случаев, когда явно указано иное).

| URL (логический) | Файл | Содержание |
|------------------|------|------------|
| `/` | `index.astro` | `title`/`description` про главную; секции: `Hero`, `ProjectsGrid`, `ServicesList`, `ArticlesPreview`, `CTA` (дефолтные тексты CTA) |
| `/cases` | `cases/index.astro` | Список кейсов через `CaseCard`, свой CTA |
| `/cases/:slug` | `cases/[slug].astro` | `getStaticPaths` из коллекции **`cases`** (`getEntry`); не найден → `Astro.redirect('/404')`; шапка, превью, блоки задача/решение/результат, галерея, `ContactForm` (**`case-inquiry`**, без select услуги, `source` с названием кейса) |
| `/services` | `services.astro` | **`getCollection('services')`** + **`additionalServices`**, `ServiceCard`, шаги «Как я работаю» (массив в frontmatter страницы), `CTA` |
| `/articles` | `articles/index.astro` | Список **`ArticleCard`** из **`getCollection('articles')`**, пустой список → заглушка; свой CTA |
| `/articles/:slug` | `articles/[slug].astro` | `getCollection` / `getEntry`; `JsonLd` article + breadcrumb; контент через `render()` и MDX-стиль; прогресс чтения (inline JS) |
| `/contact` | `contact.astro` | Query `service` → `prefilledService`; `ContactForm`; iframe карт (заглушка ID при необходимости) |
| `/brief/` | `brief.astro` | Бланк ТЗ + `BriefForm`; `robots: noindex`; печать/PDF |
| `/privacy` | `privacy.astro` | Политика конфиденциальности |
| `/rss.xml` | `rss.xml.ts` | Лента статей |
| **404** | `404.astro` | `dist/404.html` |

Дополнительно: эндпоинт **`/open-graph/...`** (динамические PNG для кейсов и статей).

**Порядок величины:** десятки статических HTML-страниц (кейсы ×4, статьи ×2, служебные и т.д.); точное число — по выводу `astro build`.

---

## 7. Компоненты (`src/components/`) — архитектура

У всех компонентов с пропсами интерфейс **`Props`** документирован JSDoc в файле (назначение полей, связь с контентом).

| Файл | Роль |
|------|------|
| `Header.astro` | Шапка: логотип, `navItems`, **`ThemeSwitcher`**, CTA, бургер, мобильное меню; inline JS + `astro:page-load` |
| `Footer.astro` | Подвал: соцсети, навигация, контакты, реквизиты |
| `ThemeSwitcher.astro` | Переключение светлой/тёмной темы (`localStorage`, View Transitions) |
| `Hero.astro` | Первый экран главной (градиент, два CTA) |
| `ProjectsGrid.astro` | Сетка кейсов из коллекции **`cases`**, `CaseCard` |
| `CaseCard.astro` | Карточка кейса → `/cases/[slug]`; превью через **`OptimizedMedia`** |
| `OptimizedMedia.astro` | Обёртка `astro:assets`: SVG → `Image`, растр → `Picture` (AVIF/WebP) |
| `ServicesList.astro` | Секция «Что я делаю» на главной (три карточки, контент в компоненте) |
| `ServiceCard.astro` | Тариф; пропсы = **`ServiceCardProps`** (`src/types/index.ts`), данные из коллекции **`services`** |
| `ArticleCard.astro` | Превью статьи → `/articles/[slug]`; `OptimizedMedia` + заглушка |
| `ArticlesPreview.astro` | Две последние статьи по `date` из коллекции **`articles`** |
| `CTA.astro` | Градиентный блок призыва; опциональная вторая ссылка (бриф) |
| `ContactForm.astro` | Заявка: Netlify + опционально MAX (`getPublicMaxBotUrl()`) |
| `BriefForm.astro` | Бриф: отдельное имя формы Netlify + тот же MAX URL |
| `JsonLd.astro` | Один тип схемы за вызов: `website` \| `localBusiness` \| `article` \| `breadcrumb`; экспорт **`BreadcrumbSchemaItem`** |

**`MobileMenu.astro`** в проекте нет — меню в `Header.astro`.

---

## 8. Данные, контент и типы

### `src/data/site.ts` → `siteConfig` (`SiteConfig`)

Глобальные поля сайта: имя, описание, URL, автор, email, телефон, город, соцсети.

### `src/data/navigation.ts` → `navItems` (`NavItem[]`)

Порядок: Главная, Кейсы, Услуги, Статьи, Контакты.

### `src/data/env-public.ts`

- **`getPublicMetrikaId(pageProp?)`** — Яндекс.Метрика: проп страницы → `PUBLIC_METRIKA_ID` → **`PUBLIC_METRIKA_ID_DEV_PLACEHOLDER`**.
- **`YANDEX_METRIKA_TAG_SCRIPT_URL`**, **`yandexMetrikaWatchPixelUrl(id)`** — URL скрипта и noscript-пикселя.
- **`getPublicMaxBotUrl()`** — `PUBLIC_MAX_BOT_URL` для дублирования заявок в MAX (пусто = только Netlify).

### Content Collections (`src/content.config.ts`)

| Коллекция | Папка | Назначение |
|-----------|--------|------------|
| `cases` | `src/content/cases/` | Кейсы: `title`, `description`, `publishDate`, `tags`, `gallery`, `liveUrl`, `meta*` … |
| `articles` | `src/content/articles/` | Статьи: `title`, `excerpt`, `date`, `readTime`, `tags`, `meta*` |
| `services` | `src/content/services/` | Тарифы: `title`, `description`, `price`, `features`, `highlighted`, `order`, `cta` |
| `additionalServices` | `src/content/additional-services/` | Доп. услуги: `title`, `description`, `price`, `order` |

Чтение в страницах: `getCollection`, `getEntry`, `render`.

### `src/utils/imageAssets.ts`

Импорт превью кейсов (SVG) и заглушки статей; карта `casePreviewBySlug`.

### `src/types/index.ts`

Экспорт: **`NavItem`**, **`SiteConfig`**, **`ServiceCardProps`** (плоские пропсы под коллекцию `services` + `id` файла).

Интерфейсы **`CaseStudy`**, **`Service`** (старое дублирование схемы), **`Article`**, **`AdditionalService`** удалены — источник правды в Zod-схемах коллекций.

### `src/utils/helpers.ts`

- **`formatDate(dateStr: string)`** — `Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })`.

---

## 9. Стили (`src/styles/globals.css`)

- **`@import "tailwindcss"`**, **`@custom-variant dark`**, блок **`@theme`**: брендовые цвета + семантика (**`page`**, **`card`**, **`border-subtle`**, **`muted-surface`**, **`input-bg`** и т.д.); тёмная тема через переопределение переменных на **`html.dark`** и **`color-scheme`**.
- Шрифты: переменные Inter / JetBrains Mono из Fontsource в том же файле.
- База: `html` scroll-smooth; `body` **`bg-page`**; заголовки `h1–h6` жирные + `tracking-tight`.
- Утилиты: **`.container-custom`** (`max-w-6xl`, отступы), **`.btn-primary`**, **`.btn-accent`**, **`.btn-outline`**.
- **`.prose`** и вложенные селекторы для контента статей: `h2`, `h3`, `p`, `ul`, `ol`, `li`, `a`, `strong`, `blockquote`.

Файл **`src/styles/global.css`** не подключён в layout — дублирует только импорт Tailwind; фактически **мёртвый** слой, если не используется осознанно.

**Классы Tailwind** используются напрямую в разметке; `@apply` — в основном в `globals.css` для кнопок и контейнера.

---

## 10. Формы (`ContactForm.astro`)

### Netlify

- Атрибуты формы: `method="POST"`, `data-netlify="true"`, `netlify-honeypot="bot-field"`.
- Скрытое поле: `name="form-name"` со значением **`formName`** (должно совпадать с атрибутом `name` формы для Netlify).
- Honeypot: параграф `.hidden` с `input name="bot-field"`.

### Пропсы

| Проп | По умолчанию |
|------|----------------|
| `formName` | `'contact'` |
| `prefilledService` | `''` (сопоставление с опциями select: `start` / `business` / `vip`) |
| `showServiceSelect` | `true` |
| `sourcePage` | `''` — если непусто, ренерится `<input type="hidden" name="source" value={...} />` |

### Поля формы (имена для POST)

- `name` — имя пользователя  
- `contact` — телефон или email  
- `service` — select (если `showServiceSelect`)  
- `message` — textarea  

### Поведение клиента

- Inline-скрипт на `DOMContentLoaded`: для каждой `form[data-netlify="true"]` — валидация (имя ≥ 2 символов, контакт ≥ 5), затем `fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(formData) })`.
- UI: переключение `.btn-text` / `.btn-spinner`, блоки `.form-success` / `.form-error` с `data-form={formName}`.

### Имена форм в проекте

| Контекст | `formName` |
|----------|------------|
| `/contact` | `contact` (дефолт) |
| Страницы кейсов | `case-inquiry` |

На Netlify после деплоя обе формы должны быть обнаружены в HTML; возможно потребуется подтверждение в панели.

### MAX / внешние API

Дублирование заявок в **MAX**: клиентский `fetch` на URL из **`getPublicMaxBotUrl()`** (`PUBLIC_MAX_BOT_URL`). Подробности — `max_bot_instrukt.md`.

---

## 11. JSON-LD (`JsonLd.astro`)

Компонент ренерит один тег `<script is:inline type="application/ld+json">` с `JSON.stringify(jsonLd)`.

| `type` | Schema.org тип | Ключевые поля |
|--------|-----------------|---------------|
| `website` | `WebSite` | `name`, `url`, `description`, `author` → `Person` (`name`, `url`) |
| `localBusiness` | **`ProfessionalService`** (не LocalBusiness в коде) | `name`, `url`, `description`, `telephone`, `email`, `address` → `PostalAddress` (`addressLocality`, `addressCountry: RU`), `areaServed` → `Country` «Россия», `priceRange: ₽₽` |
| `article` | `Article` (если передан `data.title`) | `headline`, `description`, `datePublished`, `author` → Person, `publisher` → Organization |

`data` для статьи передаётся как объект с полями `title`, `description` (обычно `metaDescription`), `date`.

**Размещение:** в layout — только в `<head>`. На странице статьи дополнительный блок Article вставлен **в начале слота** (внутри `<main>`), т.е. третий JSON-LD-скрипт оказывается в теле страницы — для поисковых систем это допустимо.

---

## 12. Публичные файлы (`public/`)

| Путь | Назначение |
|------|------------|
| `robots.txt` | `User-agent: *`, `Allow: /`, `Sitemap: https://sii5.ru/sitemap-index.xml` |
| `favicon.svg` | Иконка сайта |
| `images/og/og-default.svg` | Дефолтное OG-изображение |
| `images/hero/hero-bg.svg` | Фон/декор hero (если используется в компоненте) |
| `images/cases/*-preview.svg` | По одному превью на кейс |
| `images/placeholder.svg` | Заглушка для статей и др. |

---

## 13. Артефакты сборки `dist/`

После `npm run build` ожидаются среди прочего:

- `index.html`, `404.html`
- `cases/index.html`, `cases/{slug}/index.html` для четырёх slug
- `services/index.html`, `contact/index.html`
- `articles/index.html`, `articles/{slug}/index.html` для двух статей
- `sitemap-index.xml` (и при необходимости `sitemap-0.xml`)
- Копии `robots.txt`, `favicon.svg`, дерево `images/`
- CSS-бандлы в `_astro/*.css`

---

## 14. Клиентский JavaScript (инвентаризация)

| Место | Что делает |
|-------|------------|
| `Header.astro` | Мобильное меню, бургер, resize; `astro:page-load` |
| `BaseLayout.astro` | Тема (в `<head>`, FOUC), `IntersectionObserver` для `[data-reveal]`, `astro:page-load` |
| `ThemeSwitcher.astro` | Смена темы, `storage`, `matchMedia`, `astro:page-load` |
| `ContactForm.astro` / `BriefForm.astro` | Submit, валидация, Netlify + условный fetch MAX |

**View Transitions:** `ClientRouter` в layout. Нет `client:*` островков — только inline-скрипты и Partytown для Метрики.

---

## 15. Расхождения с `.cursorrules` (важно агенту)

| В `.cursorrules` | Фактически в проекте |
|------------------|----------------------|
| Tailwind v3 + `@astrojs/tailwind` | Tailwind **v4** + `@tailwindcss/vite` |
| `tailwind.config.mjs` | Нет отдельного конфига; токены в `globals.css` → `@theme` |
| JSON-LD LocalBusiness | Используется тип **`ProfessionalService`** |
| Компонент `MobileMenu.astro` | Нет отдельного файла |
| Astro `<Image />`, WebP везде | Превью в **`src/assets/`** (SVG) через **`OptimizedMedia`** (`Picture` для растра); галереи и пр. — по разметке страниц |

---

## 16. Известные ограничения и заглушки

1. **`/contact` — Яндекс.Карты:** в `contact.astro` iframe с placeholder `YOUR_YANDEX_MAP_ID`; нужна подстановка embed из конструктора карт.
2. **SSG и query-string:** для `/contact?service=business` при статической сборке `Astro.url.searchParams` на билде может быть пустым; предзаполнение select по прямой ссылке с параметром может не работать без клиентского JS.
3. **`frameborder` на iframe** карты — в `astro check` возможен hint (deprecated), не ошибка.
4. **Редирект** `Astro.redirect('/404')` — на статическом хостинге корректная отдача «не найдено» зависит от правил Netlify (`404.html`).

---

## 17. Проверки качества (рекомендуемые команды)

```bash
npm run build
npx astro check
```

Цель по Lighthouse для мобильных указана в `.cursorrules` (≥ 90) — не автоматизирована в репозитории.

---

## 18. Прочие файлы в корне (контекст)

| Файл | Содержание |
|------|------------|
| `log.md` | Журнал итераций разработки (**не дублировать** в summary) |
| `roadmap.md` | Большой документ с дорожной картой/промтами |
| `max_bot_instrukt.md` | Инструкции по MAX-боту и смежной инфраструктуре (частично другие проекты) |

---

## 19. Чек-лист для следующего ИИ-агента

1. Не добавлять React/Vue/Svelte без явного запроса; править только `.astro` / TS / CSS по задаче.
2. Новые кейсы/статьи/тарифы — Markdown в **`src/content/<коллекция>/`** и при необходимости схема в **`content.config.ts`**; типы карточек — **`ServiceCardProps`** / пропсы компонентов, не дублировать поля коллекций в `types/index.ts`.
3. Новые страницы — через `BaseLayout`, уникальные `title` и `description`.
4. Новые формы — учитывать Netlify: уникальный `name` формы, `form-name`, honeypot, появление формы в собранном HTML.
5. После существенных правок — `npm run build` и `npx astro check`.
6. Учитывать расхождения между `.cursorrules` и фактическим стеком (раздел 15).

---

*Документ предназначен для передачи контекста между сессиями и агентами; обновлять при крупных изменениях архитектуры или данных.*
