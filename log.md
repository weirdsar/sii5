# Отчет по ведению проекта

**Постоянная память проекта.** Файл `log.md` фиксирует решения, затронутые пути и проверки между сессиями и для внешнего контроля архитектора. **После каждого существенного изменения** (код, конфиги, данные, поведение сайта) добавляй новую секцию вида `## ГГГГ-ММ-ДД — краткий заголовок`: что сделано, какие файлы затронуты, итоги `npm run build` / `npx astro check` при необходимости. Длинные фрагменты кода в лог не копировать — достаточно путей к файлам.

## 2026-04-02 — Инициализация Astro и базовой структуры

- Прочитан и учтен файл `.cursorrules`.
- Инициализирован Astro-проект из шаблона `minimal` с `TypeScript strict`.
- Выполнено подключение Tailwind и sitemap (с учетом совместимости версий).
- Проект перенесен в корень текущей директории (инициализатор создал временную подпапку из-за непустой директории).
- Заменены/созданы конфиги и служебные файлы:
  - `astro.config.mjs`
  - `tsconfig.json`
  - `tailwind.config.mjs`
  - `src/styles/globals.css`
  - `public/robots.txt`
  - `public/favicon.svg`
  - `netlify.toml`
- Созданы целевые директории с `.gitkeep`:
  - `src/components/`, `src/layouts/`, `src/data/`, `src/types/`, `src/utils/`
  - `public/images/cases/`, `public/images/hero/`, `public/images/og/`
- Проверка выполнена: `npm run build` проходит успешно, `sitemap-index.xml` генерируется.

## 2026-04-02 — Переход на Astro 6.x

- Принято решение использовать последнюю ветку `Astro 6.x`.
- Выполнена миграция конфигурации Tailwind для совместимости с Astro 6:
  - удален `@astrojs/tailwind`;
  - в `astro.config.mjs` подключен `@tailwindcss/vite` через `vite.plugins`.
- Обновлены зависимости:
  - `astro` -> `^6.1.3`
  - `tailwindcss` -> `^4.2.2`
  - `@tailwindcss/vite` -> `^4.2.2`
  - сохранен `@astrojs/sitemap`.
- Проверка после миграции: `npm run build` проходит успешно.

## 2026-04-02 — Tailwind v4 CSS-конфигурация

- Удален файл `tailwind.config.mjs` как неиспользуемый в текущей схеме Tailwind v4.
- Полностью обновлен `src/styles/globals.css` на синтаксис Tailwind v4:
  - `@import "tailwindcss";`
  - токены темы перенесены в блок `@theme`;
  - сохранены базовые и утилитарные стили кнопок/контейнера.
- В `src/pages/index.astro` добавлен импорт `import "../styles/globals.css";` во frontmatter.
- Проверена конфигурация `astro.config.mjs`: `tailwind()` в `integrations` отсутствует, используется только `@tailwindcss/vite` в `vite.plugins`.
- Проверка работоспособности:
  - `npm run build` — успешно;
  - `npm run dev -- --host 127.0.0.1 --port 4321` — сервер успешно стартует.

## 2026-04-02 — Placeholder SVG-изображения

- Созданы 7 placeholder SVG-файлов:
  - `public/images/cases/uzelok64-preview.svg`
  - `public/images/cases/gidravlika64-preview.svg`
  - `public/images/cases/volgawhisper-preview.svg`
  - `public/images/cases/razumnyeokna-preview.svg`
  - `public/images/hero/hero-bg.svg`
  - `public/images/og/og-default.svg`
  - `public/images/placeholder.svg`
- Удалены `.gitkeep` в каталогах `public/images/cases/`, `public/images/hero/`, `public/images/og/` (каталоги больше не пустые).

## 2026-04-02 — Типы, данные и исправление владельца

- Обновлены данные владельца:
  - в `public/images/og/og-default.svg` имя изменено на `Игорь`;
  - в `.cursorrules` обновлен формат телефона на `+7 (927) 226-80-33`.
- Созданы типы и структуры данных:
  - `src/types/index.ts` (интерфейсы `CaseStudy`, `Service`, `AdditionalService`, `Article`, `NavItem`, `SiteConfig`);
  - `src/data/site.ts` (конфигурация сайта и контакты Игоря);
  - `src/data/cases.ts` (кейсы + функции `getCaseBySlug`, `getAllCases`, `getAllSlugs`);
  - `src/data/services.ts` (пакеты услуг и дополнительные услуги);
  - `src/data/articles.ts` (статьи + функции `getArticleBySlug`, `getAllArticles`);
  - `src/data/navigation.ts` (пункты навигации);
  - `src/utils/helpers.ts` (`formatDate` для `ru-RU`).
- Для запуска проверки типов добавлены dev-зависимости: `@astrojs/check`, `typescript`.
- Проверки:
  - `npx astro check` — 0 ошибок;
  - `npm run build` — успешно.

## 2026-04-02 — Домен sii5.ru и BaseLayout

- Брендинг и URL:
  - в `src/data/site.ts`: `name` → `SII5 — Веб-разработка`, `url` → `https://sii5.ru` (email без изменений);
  - в `astro.config.mjs`: `site` → `https://sii5.ru`;
  - в `public/robots.txt`: Sitemap → `https://sii5.ru/sitemap-index.xml`;
  - в `.cursorrules` строк `sii5.netlify.app` не найдено — правки не требовались.
- Добавлен `src/layouts/BaseLayout.astro` (SEO, OG/Twitter, шрифты, placeholder header/footer, inline scroll-reveal).
- `src/pages/index.astro` переведён на `BaseLayout` с заглушкой контента.
- Проверки:
  - `npm run dev` — dev-сервер стартует;
  - `npm run build` — успешно;
  - в `dist/index.html`: ожидаемый `<title>`, `og:title`, ссылка Google Fonts, скрипт reveal присутствуют.

## 2026-04-02 — Header с адаптивной навигацией

- Создан `src/components/Header.astro`:
  - логотип с `siteConfig.name`;
  - десктоп-меню по `navItems`;
  - CTA-кнопка `Обсудить проект`;
  - бургер-кнопка и полноэкранное мобильное меню;
  - анимация бургер → крестик;
  - inline-скрипт открытия/закрытия меню, закрытия по клику на ссылку и на resize.
- Обновлен `src/layouts/BaseLayout.astro`:
  - добавлен импорт `Header`;
  - placeholder-хедер заменен на `<Header />`.
- Проверки:
  - `npm run dev` — сервер стартует (локально на `http://127.0.0.1:4323/`, так как `4321/4322` заняты);
  - через браузерную проверку подтверждены: наличие десктопной навигации и CTA, кнопки-бургера, открытие меню по клику, смена aria-label на `Закрыть меню`, закрытие меню при клике на ссылку;
  - `npm run build` — успешно.

## 2026-04-02 — Footer с контактами и соцсетями

- Создан `src/components/Footer.astro`:
  - темный фон, 3 колонки (`О себе`, `Навигация`, `Контакты`);
  - SVG-иконки и ссылки на Telegram/VK/GitHub;
  - кликабельные `mailto:` и `tel:` ссылки;
  - CTA-кнопка `Обсудить проект`;
  - нижняя полоса с копирайтом и текущим годом.
- Обновлен `src/layouts/BaseLayout.astro`:
  - добавлен импорт `Footer`;
  - placeholder-футер заменен на `<Footer />`.
- Проверки:
  - `npm run dev` — сервер стартует (локально на `http://127.0.0.1:4324/`, так как соседние порты заняты);
  - в браузере подтверждены: отображение футера, наличие всех ссылок и колонок на десктопе, корректная мобильная версия (одна колонка по классу `md:grid-cols-3`), контакты и соцсети кликабельны, копирайт с текущим годом присутствует;
  - `npm run build` — успешно.

## 2026-04-02 — Hero-блок главной страницы

- Создан `src/components/Hero.astro`:
  - полноэкранный hero (`min-h-[90vh]`) с темным градиентом;
  - декоративные анимированные круги и SVG-сетка точек;
  - слева: бейдж, заголовок с accent-выделением через `set:html`, подзаголовок, две CTA-кнопки;
  - справа (только `md+`): декоративное окно браузера с псевдокодом.
- Обновлен `src/pages/index.astro`:
  - добавлен импорт `Hero`;
  - секция hero подключена через `<Hero />`;
  - добавлена текстовая заглушка для следующих секций.
- Проверки:
  - `npm run dev` — сервер стартует (локально на `http://127.0.0.1:4325/`, т.к. соседние порты заняты);
  - в браузере подтверждены текстовые элементы Hero, наличие кнопок `Смотреть кейсы` и `Обсудить проект`, код-блок в правой колонке на десктопе, адаптивное поведение на мобильной ширине;
  - в `dist/index.html` подтверждены ссылки `href="/cases"` и `href="/contact"` у hero-кнопок;
  - `npm run build` — успешно.

## 2026-04-02 — Реквизиты в футере и правки Hero

- `src/components/Footer.astro`: добавлена колонка «Реквизиты» (ООО «Новые решения», ИНН, КПП, ОГРН, юридический адрес); сетка футера: `md:grid-cols-2 lg:grid-cols-4`.
- `src/components/Hero.astro`: удалён блок мини-статистики (4+ проекта, 2+ года опыта, 100% довольных клиентов).
- Проверка: `npm run build` — успешно.

## 2026-04-02 — Компоненты секций главной страницы

- Добавлены компоненты (пока без подключения на страницах):
  - `src/components/CaseCard.astro` — карточка кейса;
  - `src/components/ProjectsGrid.astro` — сетка проектов из `getAllCases()`;
  - `src/components/ServicesList.astro` — три направления услуг с иконками;
  - `src/components/ArticleCard.astro` — карточка статьи с `formatDate` из `helpers`;
  - `src/components/ArticlesPreview.astro` — превью двух последних статей из `getAllArticles()`.
- `src/utils/helpers.ts`: функция `formatDate` уже присутствует, изменений не потребовалось.
- Проверки: `npm run build` — успешно; `npx astro check` — 0 ошибок.

## 2026-04-02 — Полная главная страница и CTA

- Создан `src/components/CTA.astro` — финальный призыв к действию с градиентом и кнопкой на `/contact`.
- Обновлён `src/pages/index.astro`: последовательность секций — `Hero`, `ProjectsGrid`, `ServicesList`, `ArticlesPreview`, `CTA`; обновлено `meta description` (добавлено «Смотрите портфолио.»).
- Проверки:
  - `npm run build` — успешно; `npx astro check` — 0 ошибок;
  - `npm run dev` — страница открывается (локально порт смещался из-за занятых `4321–4325`, проверено на `http://127.0.0.1:4326/`): видны все секции, футер, CTA;
  - ссылки в `dist/index.html`: Hero `/cases`, `/contact`; карточки кейсов `/cases/[slug]`; «Все проекты» → `/cases`; «Подробнее об услугах» → `/services`; статьи → `/articles/[slug]`; «Все статьи» → `/articles`; CTA → `/contact`;
  - адаптивность: проверены ширины ~375px, ~768px, ~1280px (сетки и читаемость);
  - `data-reveal`: элементы с атрибутом обрабатываются скриптом в `BaseLayout` при скролле.

## 2026-04-02 — Страница списка кейсов `/cases`

- Добавлен `src/pages/cases/index.astro`: тёмная шапка «Мои проекты», сетка из `CaseCard` (данные `getAllCases()`), CTA с кастомным заголовком и подзаголовком.
- Проверки:
  - `npm run build` — успешно; в `dist/cases/index.html` страница сгенерирована;
  - `npx astro check` — без ошибок;
  - `npm run dev` на `http://127.0.0.1:4330/cases`: отображаются шапка, 4 карточки, футер, CTA с текстом «Хотите такой же результат?»; в собранном HTML у пункта «Кейсы» активные классы (`text-primary border-b-2`).

## 2026-04-02 — Динамическая страница кейса `/cases/[slug]`

- Добавлен `src/pages/cases/[slug].astro`: `getStaticPaths()` из `getAllSlugs()`, данные через `getCaseBySlug`, при отсутствии кейса — `Astro.redirect('/404')` (теоретический кейс; в статической сборке пути совпадают с данными).
- Разметка: хлебные крошки (Главная / Кейсы / название), теги, заголовок, клиент и год, кнопка «Посмотреть сайт» (`liveUrl`, `target="_blank"`), основное изображение, три блока Задача / Решение / Результат (`data-reveal`), опциональная галерея, ссылка «← Все проекты» на `/cases`, блок `CTA` с кастомным текстом.
- Проверки:
  - `npm run build` — успешно; в `dist/cases/` сгенерированы `uzelok64/index.html`, `gidravlika64/index.html`, `volgawhisper/index.html`, `razumnyeokna/index.html`;
  - в собранном HTML для кнопки «Посмотреть сайт» проверены `href`: `https://uzelok64.ru`, `https://gidravlika64.ru`, `https://volgawhisper.ru`, `https://разумныеокна.рф` (соответствуют `src/data/cases.ts`);
  - `npx astro check` — 0 ошибок;
  - `npm run dev` на `http://127.0.0.1:4399`: для всех четырёх маршрутов HTTP 200; в HTML присутствуют хлебные крошки, блоки «Задача» / «Решение» / «Результат», «← Все проекты», CTA «Хотите похожий проект?»; ссылки «Посмотреть сайт» совпадают с `liveUrl` (проверено через `curl`).

## 2026-04-02 — Страница услуг `/services`

- Добавлен `src/components/ServiceCard.astro`: тарифная карточка из `Service` (цена, фичи с галочками, CTA на `/contact?service={id}`; для `highlighted` — бейдж «Популярный», `btn-primary`, `scale-105`).
- Добавлен `src/pages/services.astro`: тёмная шапка «Услуги и цены», сетка из `services` (`ServiceCard`), секция «Дополнительные услуги» (`additionalServices`, 4 карточки), блок «Как я работаю» (4 шага с номерами и иконками), финальный `CTA` (дефолтный текст из компонента).
- Проверки:
  - `npm run build` — успешно; создан `dist/services/index.html`;
  - `npx astro check` — 0 ошибок;
  - в собранном и dev HTML: тариф «Бизнес» с бейджем «Популярный», кнопка «Заказать сайт» → `href="/contact?service=business"`; остальные кнопки → `/contact?service=start`, `/contact?service=vip`;
  - `npm run dev` + `curl http://127.0.0.1:4398/services` — HTTP 200, на странице присутствуют секции «Дополнительные услуги», «Как я работаю», блок CTA.

## 2026-04-02 — Список статей и страница статьи `/articles`, типографика `.prose`

- Добавлен `src/pages/articles/index.astro`: шапка «Статьи», сетка из `ArticleCard` по `getAllArticles()` (пустой список — заглушка), CTA «Есть вопросы по разработке?».
- Добавлен `src/pages/articles/[slug].astro`: `getStaticPaths` из всех статей, хлебные крошки, дата и время чтения, теги, заголовок, изображение, контент через `set:html` в обёртке `class="prose"`, ссылка «← Все статьи», нижний `CTA`.
- В `src/styles/globals.css` после `.btn-outline` добавлены правила `.prose` для `h2`, `h3`, `p`, `ul`/`ol`/`li`, `a`, `strong`, `blockquote`.
- Проверки:
  - `npm run build` — успешно; в `dist/articles/` есть `index.html`, `zachem-malomu-biznesu-sajt/index.html`, `skolko-stoit-sajt-2026/index.html`;
  - `npx astro check` — 0 ошибок;
  - `npm run dev` + `curl`: `/articles` — 200, две карточки, кастомный CTA; страницы статей — крошки, мета, теги, контент с `<h2>` внутри `.prose`, «← Все статьи», дефолтный CTA; стили `.prose` попадают в собранный CSS-бандл.

## 2026-04-02 — Компонент `ContactForm` (Netlify Forms)

- Добавлен `src/components/ContactForm.astro`: Netlify (`data-netlify="true"`, `netlify-honeypot="bot-field"`), скрытое `form-name`, опционально `source`; поля имя, контакт, услуга (select), сообщение; кнопка с текстом/спиннером; блоки успеха и ошибки; `is:inline` скрипт — валидация (имя ≥2 символов, контакт ≥5), `fetch` POST на `/` с `application/x-www-form-urlencoded`.
- Для проверки разметки форма временно вставлялась на главную перед `CTA`, выполнен `npm run build` — в `dist/index.html` подтверждены `data-netlify="true"`, `name="contact"`, `<input type="hidden" name="form-name" value="contact">`, honeypot `bot-field`; временная секция с главной удалена (подключение на `/contact` — отдельный шаг).
- Проверки: `npm run build`, `npx astro check` — успешно; реальная отправка Netlify Forms только на деплое, локально `fetch` к `/` не обрабатывается как Netlify.

## 2026-04-02 — Страница `/contact`

- Добавлен `src/pages/contact.astro`: шапка, сетка `md:grid-cols-5` — форма `ContactForm` с `prefilledService` из query `service`, колонка с email/телефоном/Telegram (`siteConfig`), блок «Где я нахожусь», шаги «Что будет дальше?», iframe Яндекс.Карт (placeholder `YOUR_YANDEX_MAP_ID` в `src`, подмена после создания карты в конструкторе).
- Проверки: `npm run build` — успешно, сгенерирован `dist/contact/index.html`; `npx astro check` — без ошибок (hint: атрибут `frameborder` у iframe помечен как устаревший в TS).

## 2026-04-02 — JSON-LD (`JsonLd`)

- Добавлен `src/components/JsonLd.astro`: типы `website` (WebSite + Person author), `localBusiness` (ProfessionalService + адрес, контакты), `article` (Article при переданных `data.title`, `description`, `date`); вывод `<script type="application/ld+json" is:inline set:html={...}>`.
- `src/layouts/BaseLayout.astro`: в `<head>` после шрифтов — `<JsonLd type="website" />`, `<JsonLd type="localBusiness" />`.
- `src/pages/articles/[slug].astro`: сразу после открытия `<BaseLayout>` — `<JsonLd type="article" data={{ title, description: metaDescription, date }} />`.
- Проверки: `npm run build`, `npx astro check` — успешно; в `dist/index.html` два блока `application/ld+json` с `@type` WebSite и ProfessionalService; в `dist/articles/zachem-malomu-biznesu-sajt/index.html` — третий блок с `@type` Article (плюс два из layout в `<head>`). Проверку [validator.schema.org](https://validator.schema.org/) рекомендуется выполнить вручную, вставив скопированный JSON из любого из блоков.

## 2026-04-02 — Финальные доработки: форма на кейсах, 404, проверка `dist`

- `src/pages/cases/[slug].astro`: нижний блок `CTA` заменён секцией «Хотите похожий проект?» с `ContactForm` (`formName="case-inquiry"`, `showServiceSelect={false}`, `sourcePage` — «Кейс: …» + заголовок кейса).
- `src/components/ContactForm.astro`: без изменений — уже поддерживает `formName`, `showServiceSelect`, `sourcePage` (скрытое поле `source` при непустом значении).
- Добавлен `src/pages/404.astro` → `dist/404.html` (заголовок «Страница не найдена», кнопки на главную и кейсы).
- Финальная проверка `dist/`: присутствуют `index.html`, все перечисленные в ТЗ страницы кейсов/услуг/статей/контактов, `404.html`, `sitemap-index.xml`, `robots.txt`, `favicon.svg`.
- `npx astro check` — 0 ошибок (hint: `frameborder` в `contact.astro`).
- В `dist/cases/uzelok64/index.html`: форма `name="case-inquiry"`, hidden `source` со значением «Кейс: Uzelok64.ru — Студия вязания на заказ»; в `dist/404.html` — текст «Страница не найдена».
- На Netlify после деплоя зарегистрировать вторую форму `case-inquiry` (или дождаться автообнаружения при наличии формы в HTML).

## 2026-04-02 — Метрика, форма (MAX + query), карта, лайтбокс кейсов, `summary.md`

- **`src/layouts/BaseLayout.astro`**: опциональный проп `metrikaId` (по умолчанию плейсхолдер `99999999`); в `<head>` перед `</head>` — асинхронный счётчик **Яндекс.Метрики** (`tag.js`, `ym(...)`, `define:vars`), `<noscript>` с пикселем `watch/{id}`; реальный ID счётчика задать через проп или вынести в конфиг.
- **`src/pages/contact.astro`**: iframe карты — убран устаревший `frameborder`, класс `border-none`; `src` виджета на область Саратова (`ll=46.0086,51.5406`, `z=12`); удалён комментарий-инструкция про конструктор.
- **`src/components/ContactForm.astro`**: в `DOMContentLoaded` чтение `?service=` из **`window.location.search`** и выставление `<select name="service">` (маппинг `start`→`landing`, `business`→`corporate`, `vip`→`custom`) для обхода ограничения SSG; параллельно с Netlify — **`fetch`** на плейсхолдер `MAX_BOT_URL` (`application/json`, поля `name`, `contact`, `message`, при наличии `service` и `source`) без `await`, ошибки только в `console.warn`, UI успеха завязан на Netlify.
- **`src/pages/cases/[slug].astro`**: у картинок галереи — `data-lightbox`, курсор и hover; оверлей `#lightbox` + `is:inline` скрипт (открытие по клику, закрытие по фону/×/Escape, блокировка скролла `body`).
- **`summary.md`**: расширен подробным снимком состояния проекта для ИИ-агентов (без дублирования хронологии из `log.md`).
- Проверки: `npx astro check` — без ошибок и hints (в т.ч. после снятия `frameborder`).

## 2026-04-02 — Правила ведения `log.md` как постоянной памяти

- В начало `log.md` добавлен блок **«Постоянная память проекта»**: после существенных правок дополнять лог новой датированной секцией; не дублировать длинный код.
- В `.cursorrules` (раздел правил Cursor) уточнено: обновлять `log.md` после изменений, использовать файл как память проекта и для контроля архитектора.

## 2026-04-02 — Оптимизация изображений: `<Image />` из `astro:assets`

- Превью кейсов и placeholder статей перенесены в **`src/assets/images/`** (копии SVG из `public/images/`); сборка кладёт хэшированные файлы в `/_astro/…`.
- Добавлен **`src/utils/imageAssets.ts`**: `casePreviewBySlug`, `getCasePreview(slug)`, экспорт `placeholder`.
- Типы **`CaseStudy`** и **`Article`**: удалено поле **`image`** (строка с путём в `public`); привязка картинок к кейсам — по **`slug`**.
- **`CaseCard`**, **`ArticleCard`**, **`ProjectsGrid`**, **`cases/index`**, **`articles/index`**, **`ArticlesPreview`**, **`cases/[slug]`**, **`articles/[slug]`**: вместо `<img>` — **`<Image />`** с `loading` / `decoding` (eager + async для hero и шапки статьи, lazy + async для карточек).
- Галерея кейсов и лайтбокс: по-прежнему **`<img>`** (динамические URL из `gallery[]`, JS-лайтбокс).
- OG-изображение по умолчанию в **`BaseLayout`**: **`/images/og/og-default.svg`** в `public/` (см. также секцию про OG ниже).
- Проверки: `npm run build`, `npx astro check` — успешно.

## 2026-04-02 — Open Graph и Twitter Card

- **`src/layouts/BaseLayout.astro`**: проп **`type?: 'website' | 'article'`** (по умолчанию `website`) → **`og:type`**; канонический URL через **`Astro.site`** / **`siteConfig.url`** и опциональный **`canonicalUrl`**; абсолютные **`og:image`** и **`twitter:image`** от базы сайта. Уже были: **`og:title`**, **`og:description`**, **`og:url`**, **`og:locale`** (`ru_RU`), **`twitter:card`** (`summary_large_image`), **`twitter:title`**, **`twitter:description`**.
- **`src/pages/cases/[slug].astro`**: **`getImage`** для превью кейса → URL в `/_astro/…` для соцсетей; **`canonicalUrl`**, **`type="website"`**.
- **`src/pages/articles/[slug].astro`**: **`getImage(placeholder)`** для обложки; **`canonicalUrl`**, **`type="article"`**.
- Проверки: `npm run build`, `npx astro check` — успешно.

## 2026-04-02 — Политика конфиденциальности и согласие в форме

- Добавлена страница **`src/pages/privacy.astro`**: `BaseLayout`, черновой текст разделов (заглушка под юридическое оформление), канонический URL.
- **`src/components/ContactForm.astro`**: под кнопкой отправки — обязательный чекбокс `privacy-consent` и текст с ссылкой на `/privacy`; дублирующая проверка в JS перед отправкой.
- Проверки: `npm run build`, `npx astro check`.

## 2026-04-02 — Плавный скролл и появление секций (`data-reveal`)

- **`src/styles/globals.css`**: у `html` зафиксирован **`scroll-behavior: smooth`** (якоря), комментарий в коде.
- **`src/layouts/BaseLayout.astro`**: скрипт **`IntersectionObserver`** для **`[data-reveal]`** — стартовые классы **`opacity-0`**, **`translate-y-4`**, **`transition-all`**, **`duration-500`**, **`ease-out`**; при входе в вьюпорт снятие скрытых и добавление **`opacity-100`**, **`translate-y-0`**; поддержка **`data-reveal-delay`** (мс).
- **`src/pages/index.astro`**: обёртки с **`data-reveal`** и теми же утилитами для блоков **Hero**, **Projects** (`ProjectsGrid`), **Services** (`ServicesList`).
- Проверки: `npm run build`, `npx astro check`.

## 2026-04-02 — View Transitions (`ClientRouter`)

- **`src/layouts/BaseLayout.astro`**: импорт **`ClientRouter`** из **`astro:transitions`**, компонент в **`<head>`** сразу после `charset`; анимация **`data-reveal`** на **`astro:page-load`**.
- **`src/components/ContactForm.astro`**: инициализация форм на **`astro:page-load`**, атрибут **`data-vt-form-bound`** против повторной привязки.
- **`src/components/Header.astro`**: мобильное меню на **`astro:page-load`**; **`onclick`** для идемпотентности; **`resize`** на **`window`** один раз (**`__sii5HeaderResizeBound`**).
- **`src/pages/cases/[slug].astro`**: лайтбокс — **`initCaseLightbox`** на **`astro:page-load`**; Escape — один глобальный слушатель (**`__sii5LightboxEscapeBound`**).
- Проверки: `npm run build`, `npx astro check`.

## 2026-04-03 — View Transitions: shared elements (кейсы)

- **`CaseCard.astro`**: `transition:name` на блоке превью — `case-image-${slug}`, на `<h3>` — `case-title-${slug}`.
- **`src/pages/cases/[slug].astro`**: те же имена на обёртке hero-изображения и на `<h1>` (`entry.id`), согласовано с карточкой.

## 2026-04-03 — Метрика: `.yandex.metrika.env`

- В **`astro.config.mjs`** при старте читается **`.yandex.metrika.env`**: поддерживаются строка **`PUBLIC_METRIKA_ID=…`** и вставка HTML/JS из конструктора Метрики (поиск ID по **`ym(`**, **`watch/`**, **`?id=`**).
- Значение попадает в **`process.env.PUBLIC_METRIKA_ID`**, далее в **`import.meta.env`** в **`BaseLayout`** (как и раньше).

## 2026-04-03 — Переменные окружения и honeypot формы

- **`BaseLayout`**: ID Метрики — **`import.meta.env.PUBLIC_METRIKA_ID`**, иначе проп **`metrikaId`**, иначе плейсхолдер `99999999`.
- **`ContactForm`**: **`PUBLIC_MAX_BOT_URL`** в **`define:vars`** для клиентского скрипта; без URL — предупреждение в консоли, запрос к MAX не выполняется.
- Honeypot: **`bot-field`** (Netlify) + **`_gotcha`**; если любое заполнено — только **`console.log`**, без **`fetch`** к Netlify и MAX.
- Корень репозитория: **`.env.example`** с `PUBLIC_METRIKA_ID` и `PUBLIC_MAX_BOT_URL`.

## 2026-04-03 — Content Collections: кейсы

- В Astro 6 конфиг коллекций — **`src/content.config.ts`** (не `src/content/config.ts`): **`glob()`** из **`astro/loaders`**, схемы **`z`** из **`astro/zod`**.
- Коллекции **`cases`** и **`articles`**; данные кейсов — **`src/content/cases/*.md`** (slug = **`id`** = имя файла без расширения). Файл **`src/data/cases.ts`** удалён.
- **`src/pages/cases/index.astro`**, **`src/pages/cases/[slug].astro`**, **`ProjectsGrid`**: **`getCollection`**, **`getEntry`**; превью — **`getCasePreview(entry.id)`**.
- Статьи по-прежнему из **`src/data/articles.ts`**; папка **`src/content/articles/`** пуста (предупреждение glob до миграции статей).
- Проверки: `npm run build`, `npx astro check`.

## 2026-04-02 — RSS статей и миграция в Content Collection

- **`src/pages/rss.xml.js`**: лента через **`@astrojs/rss`**, **`getCollection('articles')`**, поля **`title`**, **`pubDate`**, **`description`** (excerpt), **`link`** — абсолютный URL через **`String(context.site ?? siteConfig.url)`** и **`/articles/${post.id}/`**.
- Статьи перенесены из удалённого **`src/data/articles.ts`** в **`src/content/articles/*.md`** (тот же slug = имя файла).
- **`src/pages/articles/index.astro`**, **`src/pages/articles/[slug].astro`**, **`ArticlesPreview`**: **`getCollection`**, на странице статьи — **`render(entry)`** из **`astro:content`** (не **`entry.render()`**).
- Тип **`Article`** в **`src/types/index.ts`** удалён как неиспользуемый.
- Проверки: `npm run build`, `npx astro check`; в **`dist/rss.xml`** — 2 записи с корректными ссылками на **`https://sii5.ru/articles/.../`**.

## 2026-04-02 — Content Collections: услуги

- **`src/content.config.ts`**: коллекция **`services`** (`title`, `description`, `price`, `features`, `highlighted` опционально с default `false`, `order`, `cta`) — **`src/content/services/*.md`**; коллекция **`additionalServices`** (`title`, `description`, `price`, `order`) — **`src/content/additional-services/*.md`**.
- Тарифы: **`start.md`**, **`business.md`**, **`vip.md`**; доп. услуги: **`dorabotka.md`**, **`redizajn.md`**, **`podderzhka.md`**, **`seo.md`**.
- **`src/pages/services.astro`**: **`getCollection('services')`** и **`getCollection('additionalServices')`**, сортировка по **`order`**; в **`ServiceCard`** передаются те же пропсы (**`id`** = имя файла), что и раньше.
- Удалены **`src/data/services.ts`**, интерфейс **`AdditionalService`** в **`src/types/index.ts`** (не использовался).
- Проверки: `npm run build`, `npx astro check`.

## 2026-04-02 — Статьи: прогресс чтения и копирование кода

- **`src/pages/articles/[slug].astro`**: фиксированная полоса прогресса (**`h-1`**, **`bg-primary`**, **`data-reading-progress`**), **`data-article-reading`** на **`<article>`**; контент в **`prose article-prose`**.
- Скрипт **`is:inline`**: инициализация на **`document.addEventListener('astro:page-load', …)`** — расчёт ширины полосы по скроллу, обёртка **`pre`** с кнопкой «Копировать» (**`navigator.clipboard`**, состояние «Скопировано!» ~2 с); снятие слушателей через **`dispose`** перед повторным init (View Transitions).
- **`src/styles/globals.css`**: стили **`.article-prose pre` / `pre code`** для моноширинного кода.
- Проверка: `npm run build`.

## 2026-04-02 — BreadcrumbList JSON-LD, skip link, a11y кнопок

- **`JsonLd.astro`**: тип **`breadcrumb`**, **`BreadcrumbList`** из массива **`{ name, item }`**; пустой объект не выводится (**`hasLd`**); экспорт **`BreadcrumbSchemaItem`**.
- **`cases/[slug].astro`**, **`articles/[slug].astro`**: второй блок **`JsonLd`** с крошками (абсолютные URL через **`base`**).
- **`BaseLayout`**: ссылка «Перейти к содержимому» (**`#main-content`**, видна при **`focus`**); **`<main id="main-content" tabindex="-1">`** с **`focus-visible:outline`** для фокуса после перехода по skip link.
- **Доступность**: бургер — **`aria-label`** «Открыть/Закрыть главное меню навигации»; лайтбокс — «Закрыть просмотр увеличенного изображения».
- Проверки: `npx astro check`, `npm run build`.

## 2026-04-02 — Проверка внутренних ссылок, форма без MAX, alt изображений

- **`scripts/check-internal-links.mjs`**: после сборки проверяет **`href="/…"`** в **`dist/**/*.html`** и **`](/path)`** в **`src/content/**/*.md`**; при битых ссылках **exit 1**.
- **`package.json`**: **`npm run build`** = **`astro build`** + проверка ссылок; добавлены **`build:only`** (только Astro) и **`check-links`**.
- **`ContactForm`**: **`PUBLIC_MAX_BOT_URL`** через **`.trim()`**; без URL зеркало в MAX не вызывается, **`fetch('/')`** к Netlify без изменений; убран лишний **`console.warn`** при отсутствии env.
- **`cases/[slug].astro`**: у скриншотов галереи **`alt`** с названием проекта и номером; лайтбокс подставляет **`alt`** с миниатюры.
- Проверка: `npm run build`.

## 2026-04-02 — Динамические OG (astro-og-canvas)

- Зависимость **`astro-og-canvas`**: эндпоинт **`src/pages/open-graph/[...route].ts`** — PNG 1200×630 для всех **`cases`** и **`articles`**; шаблон: крупный **`metaTitle`**, подпись **`SII5`** + тип (**`Кейс`** / **`Статья`**), градиент и акцентная полоса (синий / янтарный).
- Кэш картинок: **`node_modules/.astro-og-canvas`** (повторные сборки: миллисекунды на файл после первой загрузки шрифтов Noto Sans с Fontsource).
- **`src/utils/ogImagePaths.ts`**: **`ogImagePathForCase`**, **`ogImagePathForArticle`**; **`cases/[slug]`** и **`articles/[slug]`** передают путь в **`BaseLayout`** вместо SVG-превью.
- **`BaseLayout`**: комментарий к пропу **`ogImage`** про **`/open-graph/...`**.
- Проверка: `npm run build`, `npx astro check`.

## 2026-04-02 — Partytown (Метрика) и локальные шрифты

- **`@astrojs/partytown`**: в **`astro.config.mjs`** с **`forward: ['ym']`**, **`debug: false`**; счётчик в **`BaseLayout`** — **`type="text/partytown"`** (вынесен из основного потока).
- Шрифты: **`@fontsource-variable/inter`**, **`@fontsource-variable/jetbrains-mono`** — импорт в **`globals.css`** (**`font-display: swap`** в пакетах); **`@theme`**: **`Inter Variable`**, **`JetBrains Mono Variable`**; ссылки на Google Fonts из **`BaseLayout`** удалены.
- Проверка: `npm run build`, `npx astro check`.

## 2026-04-02 — Бриф сайта (PDF / печать) и форма

- Страница **`/brief/`** (**`src/pages/brief.astro`**): печатный шаблон ТЗ (блоки с линиями для заполнения), **`window.print()`** / «Сохранить как PDF»; **`meta robots: noindex, follow`** через проп **`BaseLayout.robots`**.
- **`BriefForm`**: Netlify **`project-brief`**, honeypot, опционально MAX (**`PUBLIC_MAX_BOT_URL`**); инициализация на **`astro:page-load`**.
- Кнопка «Скачать бриф сайта (PDF)» — в шапке **`services`** и **`contact`**, вторичная кнопка в **`CTA`** на **`index`** и **`services`**; пропы **`secondaryCtaText`** / **`secondaryCtaHref`**.
- Стили **`@media print`**: A4, скрыты шапка/футер/панель/форма, чёрный текст и линии для бланка.
- Проверка: `npm run build`.

## 2026-04-02 — CI: Vitest и GitHub Actions

- **`vitest`**: **`vitest.config.ts`**, **`src/utils/helpers.test.ts`** (**`formatDate`**); **`npm run test`**, **`npm run test:watch`**.
- **`.github/workflows/ci.yml`**: **`npm ci`** → **`npx astro check`** → **`npm run build`** (и проверка ссылок) → **`npm run test`**; Node **22**, кэш npm; падение любого шага останавливает job (Netlify не получит зелёный main без успешного CI при включённой защите ветки).

## 2026-04-02 — Оптимизация изображений (AVIF/WebP, SVG)

- **`astro.config.mjs`**: блок **`image`** — **`domains: []`**, **`remotePatterns: []`** (явно: только локальные ассеты, без удалённой оптимизации).
- **`src/components/OptimizedMedia.astro`**: для **`format === 'svg'`** — **`Image`** (SVG остаётся SVG, без растровых `<source>`); для растра — **`Picture`** с **`formats={['avif','webp']}`**, **`quality="mid"`** по умолчанию; в **`<img>`** — исходный формат (поведение встроенного **`Picture`** Astro).
- **`CaseCard`**, **`ArticleCard`**, **`cases/[slug].astro`**, **`articles/[slug].astro`**: вместо прямого **`Image`** — **`OptimizedMedia`** с **`quality="mid"`**.
- Проверка: **`npx astro check`**, **`npm run build`**; в **`dist`** для превью кейсов — **`<img … .svg>`**, без **`<picture>`** (текущие превью — только SVG).

## 2026-04-02 — Светлая / тёмная тема (Tailwind v4, без FOUC, View Transitions)

- **`globals.css`**: **`@custom-variant dark (&:where(.dark, .dark *))`**; в **`@theme`** — семантические токены **`page`**, **`card`**, **`border-subtle`**, **`muted-surface`**, **`input-bg`**; блок **`html.dark`** с **`color-scheme: dark`** и переопределением тех же CSS-переменных; **`body`** — **`bg-page`**; кнопки **`.btn-*`** — **`ring-offset-page`**.
- **`ThemeSwitcher.astro`**: кнопка **`data-theme-toggle`**, иконки через **`dark:`**; **`localStorage`** (**`sii5-theme`**: light/dark), синхронизация **`storage`**, без сохранённого значения — реакция на **`prefers-color-scheme`**; **`astro:page-load`** для повторной привязки после навигации; глобальные слушатели один раз (**`__sii5ThemeBound`**).
- **`BaseLayout.astro`**: **`is:inline`**-скрипт сразу после **`viewport`** (до **`ClientRouter`** и CSS): чтение **`localStorage`** / системной темы, класс **`dark`** и **`documentElement.style.colorScheme`**.
- Обновлены поверхности (**`bg-card`**, **`border-border-subtle`**, формы **`bg-input-bg`**) в карточках, услугах, контактах, брифе, шапке; **`brief`**: печать по-прежнему принудительно светлая (**`@media print`**).
- Проверка: **`npx astro check`**, **`npm run build`**.

## 2026-04-02 — Поддерживаемость: JSDoc, env-public, типы, summary

- **`src/data/env-public.ts`**: **`getPublicMetrikaId`**, **`getPublicMaxBotUrl`**, URL тега Метрики и noscript; плейсхолдер ID вынесен из разметки.
- **`BaseLayout`**, **`ContactForm`**, **`BriefForm`**: Метрика и MAX только через **`env-public`** / проп.
- **`src/types/index.ts`**: удалены **`CaseStudy`** и **`Service`** (заменён на **`ServiceCardProps`** под коллекцию **`services`**); актуальны **`NavItem`**, **`SiteConfig`**, **`ServiceCardProps`**.
- Все **`src/components/*.astro`**: JSDoc у **`Props`** (или блок над компонентом, если пропсов нет).
- **`summary.md`**: актуализированы структура каталогов, коллекции контента, таблица компонентов, данные/`env-public`, стили и чек-лист агента.
- Проверка: **`npx astro check`**, **`npm run build`**.

## 2026-04-02 — Git: коммит под деплой, CI проверен локально

- **`.gitignore`**: добавлен **`.yandex.metrika.env`** (локальный файл с ID Метрики не в репозитории).
- **`origin`**: `https://github.com/weirdsar/sii5.git`; на **`main`**: релизный коммит **`1fa63a3`** и коммит с записью в **`log.md`** о деплое/CI (актуальный хэш — **`git log -1`**).
- **Push** из этой среды не выполнен: GitHub HTTPS запросил учётные данные. Выполните у себя: **`git push -u origin main`** (или remote **`git@github.com:weirdsar/sii5.git`**).
- Локально повторён сценарий CI: **`npm ci`** → **`npx astro check`** → **`npm run build`** → **`npm run test`** — успешно.

## 2026-04-02 — Netlify (sii64): переменные, домены, Forms

1. **Environment variables** (раздел **Project configuration → Environment variables**): в списке подтверждена **`PUBLIC_METRIKA_ID`** (значение счётчика Метрики, все контексты). **`PUBLIC_MAX_BOT_URL`** в панели не задана — при необходимости дублирования заявок в MAX добавить вручную (секретный URL из инструкции бота), см. **`.env.example`**. После изменения env — **Deploy** (при желании **Clear cache and deploy**), чтобы ID попал в клиентский бандл.
2. **Domain management**: **`sii5.ru`** — primary, **`www.sii5.ru`** — редирект на primary; у обоих статус **Pending DNS verification**. Блок **SSL/TLS**: **Waiting on DNS propagation** — сертификат Let’s Encrypt выдастся после корректной привязки DNS к Netlify и распространения записей; доступна кнопка **Verify DNS configuration**.
3. **Forms**: обнаружение форм было выключено — в UI нажато **Enable form detection**, показано **Form detection is enabled** (сканирование деплоев на **`data-netlify`**). Список имён форм в дашборде появится после следующего успешного деплоя. Локальная проверка **`dist`**: в HTML есть **`contact`** (**`/contact/`**), **`case-inquiry`** (страницы кейсов), **`project-brief`** (**`/brief/`**), атрибуты **`data-netlify="true"`** и **`form-name`** на месте.

## 2026-04-03 — Проверка публичного домена sii5.ru (DNS / HTTP / HTTPS)

- **DNS**: **`sii5.ru`** и **`www.sii5.ru`** → **A 87.236.16.177** (хостинг **Beget**). **MX** — **`mx1.beget.com`** / **`mx2.beget.com`**.
- **HTTP** (`http://sii5.ru/`): **200**, сервер **`nginx-reuseport`**, контент — заглушка Beget: «домен не прилинкован к директории на сервере» (не сайт из Netlify).
- **HTTPS** (`https://sii5.ru/`): ошибка проверки сертификата (**CN=`beget.com`**, не совпадает с **`sii5.ru`**); при **`curl -k`** отдаётся тот же HTML Beget.
- **Вывод**: домен **не направлен на Netlify**; статус **Pending DNS verification** в панели Netlify согласуется с текущими записями. Чтобы открывался деплой **sii64**, у регистратора нужно выставить DNS по инструкции Netlify (или перенести DNS на Netlify), для **www** — **CNAME** на **`sii64.netlify.app`** (или как указано в **Domain management**), для apex — **A**-записи Netlify / **ALIAS**. Почту на Beget при смене веб-записей можно сохранить отдельными **MX** (не трогать, если не меняете почтовый хостинг).

## 2026-04-03 — Контакты: замечания по UX / a11y

- **`src/pages/contact.astro`**: у блока «Что будет дальше?» у **`<ol>`** добавлены **`list-none pl-0 m-0`**, **`role="list"`** — без встроенной нумерации браузера при кастомных шагах 1–3; для WebKit сохранена семантика списка.
- Убран эмодзи в строке города; остаётся текст **`{city}, Россия`**.
- Канонический домен в коде по-прежнему **`https://sii5.ru`** (**`astro.config.mjs`**, **`siteConfig.url`**); редирект **www → apex** настраивается в **Netlify → Domain management** (primary domain), дублирующий **`netlify.toml`** не добавлялся.

## 2026-04-04 — MAX: совместимость с Gidra (`.deploy/.max.env`)

- **`netlify/functions/max-lead-mirror.mjs`**: читаются **`MAX_NOTIFY_USER_ID`** и **`MAX_NOTIFY_CHAT_ID`** (как в **Gidra**); приоритет **`user_id`** над **`chat_id`**, как в **`Gidra/public/api/submit-lead.php`**; **`0`** в env трактуется как «не задано».
- **`MAX_LEADS_SETUP.md`**: §12 — перенос переменных из **`Gidra/.deploy/.max.env`** в Netlify без коммита секретов.
- **`max_bot_instrukt.md`**, **`.env.example`**: те же имена и отсылка к Gidra.

## 2026-04-04 — MAX: прямой Platform API из Netlify Function (без своего вебхука)

- **`netlify/functions/max-lead-mirror.mjs`**: при **`MAX_BOT_TOKEN`** (или **`MAX_PLATFORM_ACCESS_TOKEN`**) и **`MAX_CHAT_ID`** или **`MAX_USER_ID`** — **`POST https://platform-api.max.ru/messages`** с **`Authorization: <токен>`** и текстом заявки (до ~3800 символов). Иначе — прежний прокси на **`MAX_LEAD_WEBHOOK_URL`** / **`PUBLIC_MAX_BOT_URL`**; при конфигурации обоих приоритет у прямого MAX.
- **`.env.example`**, **`max_bot_instrukt.md`** (раздел sii5), **`summary.md`**: инструкции под токен + **chat_id** / **user_id**, **`GET /chats`** для поиска id группы.

## 2026-04-03 — MAX: чеклист Netlify в max_bot_instrukt, форма для PHP

- **`max_bot_instrukt.md`**: раздел **sii5** расширен пошаговым чеклистом (env, Clear cache deploy, JSON-тело, проверка Network, 503/502, опционально **CLI** `netlify env:set` / `deploy --prod --build`).
- **`netlify/functions/max-lead-mirror.mjs`**: при **`MAX_LEAD_WEBHOOK_BODY_FORMAT=form`** (или **`urlencoded`**) тело из JSON клиента перекодируется в **`application/x-www-form-urlencoded`** (поля **`name`**, **`contact`**, **`message`**, **`service`**, **`source`**).
- **`.env.example`**: комментарий про **`MAX_LEAD_WEBHOOK_BODY_FORMAT`**.

## 2026-04-03 — MAX: зеркало заявок через Netlify Function (CORS)

- **Проблема**: прямой `fetch` из браузера на внешний вебхук часто блокируется **CORS**; плюс без **`PUBLIC_MAX_BOT_URL`** в env при сборке клиент вообще не вызывал MAX.
- **`netlify/functions/max-lead-mirror.mjs`**: **`export const handler`** — POST тело JSON пересылается на **`process.env.MAX_LEAD_WEBHOOK_URL || process.env.PUBLIC_MAX_BOT_URL`**; OPTIONS для совместимости.
- **`ContactForm.astro`**, **`BriefForm.astro`**: на **проде** запрос на **`/.netlify/functions/max-lead-mirror`**; на **localhost / 127.0.0.1 / ::1** — прямой **`PUBLIC_MAX_BOT_URL`** при наличии.
- **`netlify.toml`**: **`[functions] directory = "netlify/functions"`**; **`.env.example`** — описание **`MAX_LEAD_WEBHOOK_URL`** и **`PUBLIC_MAX_BOT_URL`**.
- **`max_bot_instrukt.md`**, **`summary.md`**: раздел/строки про схему sii5 + Netlify.

## 2026-04-03 — Favicon и превью кейсов (валидный SVG)

- **`public/favicon.svg`**: был **два корневых `<svg>`** в одном файле (невалидный документ) + второй фрагмент от шаблона Astro — браузеры могли **не показывать иконку вкладки**. Оставлен **один** значок SII5 (**SI** на синем круге), шрифт **`system-ui`**.
- **`BaseLayout.astro`**: ссылка на иконку — **`sizes="any"`** для SVG (рекомендация для вкладок).
- Превью кейсов **`src/assets/images/cases/*-preview.svg`** (и зеркала в **`public/images/cases/`**): в тексте попадали **недопустимые для XML 1.0 управляющие символы** и битая кодировка — строгие парсеры отклоняли файл, картинка в блоке «Мои проекты» не отображалась. Файлы пересобраны: валидный UTF-8, нормальные подписи на русском, **`system-ui`** для текста.