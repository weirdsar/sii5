
Архитектура и промты для Cursor: сайт-портфолио SII5
Часть 0. Файл .cursorrules
Этот файл размещается в корне проекта и задаёт контекст для каждого промта.

text

# .cursorrules

## Проект
Одностраничный/многостраничный сайт-портфолио веб-разработчика.
Репозиторий: https://github.com/weirdsar/sii5
Деплой: Netlify (авто-деплой из main-ветки).

## Стек
- Astro v4+ (SSG, output: "static")
- Tailwind CSS v3 через @astrojs/tailwind
- TypeScript (strict: true в tsconfig)
- Форма заявки: Netlify Forms (атрибут data-netlify) + клиентский fetch-перехват
- Дополнительно: @astrojs/sitemap для sitemap.xml

## Языковые и региональные настройки
- Весь контент на русском языке (lang="ru")
- Целевая аудитория: малый бизнес в РФ
- Валюта: рубли (₽)
- Телефонный формат: +7 (XXX) XXX-XX-XX

## Архитектурные принципы
1. Zero JavaScript по умолчанию. Клиентский JS только для:
   - бургер-меню (client:load)
   - перехват формы (is:inline скрипт)
   - анимация появления (Intersection Observer, is:inline)
2. Данные кейсов хранятся в src/data/cases.ts (типизированный массив).
3. Все компоненты — .astro файлы (не React, не Vue).
4. Изображения: Astro <Image /> компонент, формат WebP, lazy loading.
5. Mobile-first подход во всех стилях.
6. Семантическая HTML5 разметка (header, nav, main, section, article, footer).

## Стиль кода
- Отступы: 2 пробела
- Кавычки: двойные в HTML/Astro, одинарные в TS/JS
- Tailwind: утилитарные классы напрямую, без @apply (кроме globals.css)
- Именование файлов компонентов: PascalCase (Hero.astro, CaseCard.astro)
- Именование страниц: kebab-case или стандартное Astro (index.astro, [slug].astro)
- CSS-переменные для брендовых цветов определяются в tailwind.config.mjs

## Цветовая палитра (расширять по необходимости)
- primary: #2563EB (синий)
- primary-dark: #1E40AF
- accent: #F59E0B (янтарный)
- bg-light: #F8FAFC
- bg-dark: #0F172A
- text-main: #1E293B
- text-muted: #64748B

## Типографика
- Шрифты: Inter (основной), JetBrains Mono (для технических деталей) — Google Fonts
- Базовый размер: 16px
- Заголовки: жирные, с отрицательным letter-spacing

## SEO-требования
- Уникальный <title> и <meta description> на каждой странице
- Open Graph теги (og:title, og:description, og:image)
- JSON-LD микроразметка для WebSite и LocalBusiness
- Файл robots.txt в public/
- Sitemap через @astrojs/sitemap

## Производительность
- Lighthouse mobile ≥ 90
- Все изображения оптимизированы и в WebP
- Никаких внешних CSS-фреймворков кроме Tailwind
- Preload для критических шрифтов

## Структура файлов (целевая)
src/
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro
│   ├── cases/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── services.astro
│   ├── articles/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── contact.astro
├── components/
│   ├── Header.astro
│   ├── MobileMenu.astro
│   ├── Footer.astro
│   ├── Hero.astro
│   ├── ProjectsGrid.astro
│   ├── CaseCard.astro
│   ├── ServiceCard.astro
│   ├── ServicesList.astro
│   ├── ArticleCard.astro
│   ├── ArticlesPreview.astro
│   ├── ContactForm.astro
│   ├── CTA.astro
│   ├── ScrollReveal.astro
│   └── JsonLd.astro
├── data/
│   ├── cases.ts
│   ├── services.ts
│   └── articles.ts
├── types/
│   └── index.ts
├── styles/
│   └── globals.css
└── utils/
    └── helpers.ts
public/
├── images/
│   ├── cases/
│   ├── hero/
│   └── og/
├── robots.txt
└── favicon.svg

## Обработка форм — MAX Bot
Заявки из формы должны отправляться в мессенджер MAX.
Подробные инструкции — в файле max_bot_instrukt.md в корне проекта.
При генерации ContactForm.astro учитывай:
- Основной канал: fetch POST на endpoint MAX-бота
- Fallback: Netlify Forms (data-netlify="true")
- Оба канала работают параллельно

## Правила для Cursor
- Не используй React, Vue, Svelte или любой UI-фреймворк
- Не добавляй зависимости без явного указания в промте
- Каждый файл должен быть самодостаточным (все импорты явные)
- Комментируй сложную логику на русском
- При создании нового файла показывай полный путь от корня проекта
- Если промт просит изменить существующий файл — показывай полный файл после изменений
Часть 1. Анализ подхода и стратегия работы с Cursor
Как будем работать
Принцип: промты подаются последовательно, каждый создаёт 1–3 связанных файла. После каждого промта — проверка (npm run dev, визуальный осмотр). Cursor в режиме Composer (Agent) получает промт, видит .cursorrules, и генерирует код в контексте всего проекта.

Порядок сборки:

Инициализация проекта и конфиги (промты 1–2)
Типы и данные (промт 3)
Layout и общие компоненты — Header, Footer (промты 4–6)
Главная страница и её компоненты (промты 7–9)
Страницы кейсов (промты 10–11)
Услуги (промт 12)
Статьи (промт 13)
Контакты и форма (промты 14–15)
SEO, sitemap, финал (промты 16–17)
Анимации и полировка (промт 18)
Часть 2. Промты для Cursor
ПРОМТ 1: Инициализация проекта
text

Инициализируй проект Astro в текущей директории. Выполни команды:

1. npm create astro@latest . -- --template minimal --typescript strict --install --git
2. npx astro add tailwind --yes
3. npx astro add sitemap --yes

После этого:

А) Замени содержимое файла astro.config.mjs на:

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sii5.netlify.app',
  integrations: [
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: 'ru',
        locales: { ru: 'ru-RU' },
      },
    }),
  ],
  output: 'static',
});

Б) Замени содержимое tsconfig.json на:

{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@data/*": ["src/data/*"],
      "@types/*": ["src/types/*"]
    }
  }
}

В) Создай файл tailwind.config.mjs:

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1E40AF',
          light: '#3B82F6',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        surface: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        text: {
          main: '#1E293B',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

Г) Создай файл src/styles/globals.css:

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-white text-text-main font-sans;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold tracking-tight;
  }
}

@layer components {
  .container-custom {
    @apply max-w-6xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  .btn-primary {
    @apply inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
  }

  .btn-accent {
    @apply inline-flex items-center justify-center px-6 py-3 bg-accent text-surface-dark font-semibold rounded-lg hover:bg-accent-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2;
  }

  .btn-outline {
    @apply inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
  }
}

Д) Создай файл public/robots.txt:

User-agent: *
Allow: /
Sitemap: https://sii5.netlify.app/sitemap-index.xml

Е) Создай файл public/favicon.svg — простой SVG-иконка с буквами "SI" на синем круге.

Ж) Создай файл netlify.toml в корне проекта:

[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

Создай все необходимые директории из структуры проекта (пустые папки с .gitkeep):
src/components/, src/layouts/, src/data/, src/types/, src/utils/,
public/images/cases/, public/images/hero/, public/images/og/
ПРОМТ 2: Placeholder-изображения
text

Создай скрипт scripts/generate-placeholders.ts, который при запуске через npx ts-node создаёт placeholder-изображения. Но поскольку мы не можем генерировать реальные изображения из Cursor, вместо этого:

1. Создай файл public/images/placeholder.svg — серый прямоугольник 1200x800 с текстом "Screenshot" по центру, шрифт Arial, цвет текста #94A3B8, фон #E2E8F0.

2. Скопируй этот файл (создай идентичные) для:
   - public/images/cases/uzelok64-preview.svg
   - public/images/cases/gidravlika64-preview.svg
   - public/images/cases/volgawhisper-preview.svg
   - public/images/cases/razumnyeokna-preview.svg
   - public/images/hero/hero-bg.svg (1920x1080, текст "Hero Background")
   - public/images/og/og-default.svg (1200x630, текст "OG Image")

Каждый SVG должен содержать в тексте название проекта вместо "Screenshot".

Примечание: позже мы заменим SVG на реальные WebP-скриншоты. Структура данных уже будет ссылаться на эти пути.
ПРОМТ 3: Типы TypeScript и данные
text

Создай три файла:

### Файл 1: src/types/index.ts

Определи и экспортируй следующие TypeScript-интерфейсы:

interface CaseStudy {
  slug: string;              // URL-совместимый идентификатор (только латиница, дефисы)
  title: string;             // Название проекта
  client: string;            // Имя клиента или название бизнеса
  shortDesc: string;         // Краткое описание (60-100 символов) для карточки
  challenge: string;         // Блок "До" / "Проблема" — что было у клиента
  solution: string;          // Блок "Что сделал" — перечень работ
  result: string;            // Блок "Результат" — что получилось
  tags: string[];            // Теги: "Лендинг", "Корпоративный сайт", "Интернет-магазин" и т.п.
  image: string;             // Путь к превью-изображению
  gallery: string[];         // Пути к дополнительным скриншотам
  liveUrl: string;           // URL живого сайта
  year: number;              // Год выполнения
  metaTitle: string;         // SEO title
  metaDescription: string;   // SEO description
}

interface Service {
  id: string;
  name: string;              // "Старт", "Бизнес", "ВИП"
  subtitle: string;          // Краткое пояснение
  price: string;             // "от 15 000 ₽" или "договорная"
  features: string[];        // Список включённых работ
  highlighted: boolean;      // Выделенный тариф (рекомендуемый)
  cta: string;               // Текст кнопки
}

interface Article {
  slug: string;
  title: string;
  excerpt: string;           // Краткое описание (120-160 символов)
  content: string;           // Полный текст в HTML (или Markdown-строка)
  date: string;              // ISO дата "2024-01-15"
  readTime: number;          // Минут на чтение
  tags: string[];
  image: string;             // Превью
  metaTitle: string;
  metaDescription: string;
}

interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: string;
  email: string;
  phone: string;
  city: string;
  socials: {
    telegram: string;
    vk: string;
    github: string;
  };
}

### Файл 2: src/data/cases.ts

Импортируй тип CaseStudy и экспортируй массив cases: CaseStudy[] с четырьмя кейсами:

1. slug: "uzelok64"
   title: "Uzelok64.ru — Студия вязания на заказ"
   client: "Студия вязания «Узелок»"
   shortDesc: "Лендинг с калькулятором стоимости вязаных изделий и галереей работ"
   challenge: "У клиента был устаревший сайт на конструкторе: не адаптивный, без возможности расчёта стоимости онлайн. Клиенты звонили, чтобы узнать цену — это отнимало время. Конверсия в заявки была низкой, сайт выглядел непрофессионально."
   solution: "Разработал современный адаптивный лендинг с нуля. Создал интерактивный калькулятор стоимости вязаных изделий (выбор типа изделия, пряжи, размера). Добавил галерею готовых работ с фильтрацией. Настроил форму заявки с уведомлениями. Оптимизировал скорость загрузки."
   result: "Количество онлайн-заявок выросло на 40% за первый месяц. Клиенты самостоятельно рассчитывают стоимость — нагрузка на телефон снизилась. Сайт получил оценку 95+ по Lighthouse."
   tags: ["Лендинг", "Калькулятор", "Галерея"]
   image: "/images/cases/uzelok64-preview.svg"
   gallery: []
   liveUrl: "https://uzelok64.ru"
   year: 2024
   metaTitle: "Кейс Uzelok64 — лендинг для студии вязания | Портфолио"
   metaDescription: "Разработка лендинга с калькулятором стоимости для студии вязания в Саратове. Рост заявок на 40%."

2. slug: "gidravlika64"
   title: "Gidravlika64.ru — Гидравлическое оборудование"
   client: "Компания «Гидравлика64»"
   shortDesc: "Корпоративный сайт-каталог гидравлического оборудования с фильтрацией"
   challenge: "Компания работала без сайта, заказы приходили только по сарафанному радио и через Авито. Не было онлайн-каталога продукции, клиенты не могли быстро найти нужное оборудование и узнать характеристики."
   solution: "Создал многостраничный корпоративный сайт с каталогом продукции. Реализовал систему фильтрации по категориям и характеристикам. Добавил подробные карточки товаров с техническими характеристиками. Настроил SEO-оптимизацию для продвижения в поисковых системах. Интегрировал формы заявок на каждой странице."
   result: "Сайт стал основным каналом привлечения новых клиентов. Органический трафик вырос с нуля до 200+ посетителей в месяц за 3 месяца. Клиенты находят нужное оборудование самостоятельно."
   tags: ["Корпоративный сайт", "Каталог", "SEO"]
   image: "/images/cases/gidravlika64-preview.svg"
   gallery: []
   liveUrl: "https://gidravlika64.ru"
   year: 2024
   metaTitle: "Кейс Gidravlika64 — корпоративный сайт-каталог | Портфолио"
   metaDescription: "Разработка корпоративного сайта с каталогом гидравлического оборудования. SEO-оптимизация и рост трафика."

3. slug: "volgawhisper"
   title: "VolgaWhisper.ru — Аренда куполов для глэмпинга"
   client: "Проект VolgaWhisper — аренда домиков для глэмпинга"
   shortDesc: "Сайт аренды уютных домиков и куполов для отдыха на природе с онлайн-бронированием"
   challenge: "Бронирования шли в основном через звонки и личные сообщения: не было единого каталога объектов с ценами, фотографиями и удобной записью на даты."
   solution: "Сайт с фотогалереями домиков, карточками объектов, онлайн-бронированием и заявками с выбором дат; адаптив для мобильных гостей."
   result: "Существенная часть заявок через сайт; меньше пустых звонков; рост среднего чека за счёт видимости опций на сайте."
   tags: ["Лендинг", "Бронирование", "Глэмпинг"]
   image: "/images/cases/volgawhisper-preview.jpg"
   gallery: []
   liveUrl: "https://volgawhisper.ru"
   year: 2024
   metaTitle: "Кейс VolgaWhisper — сайт аренды куполов для глэмпинга | Портфолио"
   metaDescription: "Разработка сайта аренды домиков и куполов для глэмпинга с онлайн-бронированием и галереей объектов."

4. slug: "razumnyeokna"
   title: "РазумныеОкна.РФ — Пластиковые окна"
   client: "Компания «Разумные Окна»"
   shortDesc: "Лендинг оконной компании с калькулятором остекления и квиз-формой"
   challenge: "Старый сайт на конструкторе не вызывал доверия: устаревший дизайн, нет мобильной версии, формы не работали. Конкуренты с современными сайтами забирали клиентов. Нужен был сайт, который вызывает доверие и собирает заявки."
   solution: "Создал современный продающий лендинг. Разработал калькулятор остекления (тип окна, размеры, дополнительные опции). Добавил квиз-форму «Рассчитать стоимость за 30 секунд» — пошаговый опрос, который вовлекает и снижает порог входа. Разместил блоки социального доказательства: отзывы, сертификаты, фото выполненных работ."
   result: "Конверсия сайта — 4.2% (среднеотраслевая ~1.5%). Калькулятор и квиз генерируют 70% заявок. Клиент отмечает, что качество заявок выросло — люди приходят уже с пониманием того, что хотят."
   tags: ["Лендинг", "Калькулятор", "Квиз"]
   image: "/images/cases/razumnyeokna-preview.svg"
   gallery: []
   liveUrl: "https://разумныеокна.рф"
   year: 2024
   metaTitle: "Кейс РазумныеОкна — продающий лендинг с калькулятором | Портфолио"
   metaDescription: "Разработка лендинга для оконной компании с калькулятором остекления. Конверсия 4.2% при среднеотраслевой 1.5%."

Также экспортируй вспомогательные функции:
- getCaseBySlug(slug: string): CaseStudy | undefined
- getAllCases(): CaseStudy[]
- getAllSlugs(): string[]

### Файл 3: src/data/services.ts

Импортируй тип Service и экспортируй массив services: Service[] с тремя тарифами:

1. id: "start"
   name: "Старт"
   subtitle: "Лендинг для быстрого запуска"
   price: "от 25 000 ₽"
   features: [
     "Одностраничный лендинг (до 7 блоков)",
     "Адаптивный дизайн (мобильные + десктоп)",
     "Форма заявки с уведомлениями",
     "Базовая SEO-настройка",
     "Подключение Яндекс.Метрики",
     "Размещение на хостинге",
     "1 месяц поддержки бесплатно"
   ]
   highlighted: false
   cta: "Заказать лендинг"

2. id: "business"
   name: "Бизнес"
   subtitle: "Полноценный сайт для роста"
   price: "от 50 000 ₽"
   features: [
     "Многостраничный сайт (до 15 страниц)",
     "Уникальный дизайн под бренд",
     "Каталог товаров / услуг с фильтрацией",
     "Калькулятор или квиз-форма",
     "Расширенная SEO-оптимизация",
     "Интеграция с CRM или мессенджерами",
     "Яндекс.Метрика + Google Analytics",
     "3 месяца поддержки бесплатно"
   ]
   highlighted: true
   cta: "Заказать сайт"

3. id: "vip"
   name: "Под ключ"
   subtitle: "Индивидуальная разработка"
   price: "договорная"
   features: [
     "Полностью индивидуальный проект",
     "Сложная функциональность (личный кабинет, интернет-магазин)",
     "Анимации и интерактивные элементы",
     "Интеграция с любыми сервисами",
     "Копирайтинг и подготовка контента",
     "Настройка рекламных кампаний",
     "6 месяцев поддержки бесплатно",
     "Приоритетная связь"
   ]
   highlighted: false
   cta: "Обсудить проект"

Также экспортируй массив additionalServices:

[
  { name: "Доработка существующего сайта", price: "от 5 000 ₽", description: "Правки дизайна, добавление блоков, исправление ошибок" },
  { name: "Редизайн сайта", price: "от 20 000 ₽", description: "Полное обновление внешнего вида с сохранением контента" },
  { name: "Техническая поддержка", price: "от 3 000 ₽/мес", description: "Обновления, резервные копии, мелкие правки" },
  { name: "SEO-продвижение", price: "от 10 000 ₽/мес", description: "Аудит, оптимизация, наращивание позиций в поиске" }
]

### Файл 4: src/data/articles.ts

Импортируй тип Article и экспортируй массив articles: Article[] с двумя начальными статьями:

1. slug: "zachem-malomu-biznesu-sajt"
   title: "Зачем малому бизнесу сайт в 2024 году?"
   excerpt: "Разбираемся, почему страницы в соцсетях недостаточно и как сайт помогает увеличить продажи даже маленькому бизнесу."
   content: (напиши 3-4 абзаца полноценного текста на эту тему, в формате HTML с тегами <p>, <h2>, <ul>, <li>. Текст должен быть полезным, без воды, с конкретными аргументами: контроль над контентом, SEO-трафик, доверие клиентов, независимость от алгоритмов соцсетей.)
   date: "2024-11-15"
   readTime: 5
   tags: ["Бизнес", "Продвижение"]
   image: "/images/placeholder.svg"
   metaTitle: "Зачем малому бизнесу сайт в 2024 году — блог веб-разработчика"
   metaDescription: "Почему страницы в соцсетях недостаточно для бизнеса. 5 причин создать собственный сайт."

2. slug: "skolko-stoit-sajt-2024"
   title: "Сколько стоит сайт в 2024 году: честный разбор"
   excerpt: "Объясняю, из чего складывается цена сайта, почему «сайт за 5000» — это ловушка, и как выбрать подрядчика."
   content: (напиши 3-4 абзаца на эту тему в HTML: конструкторы vs. индивидуальная разработка, что входит в стоимость, скрытые расходы, как оценивать предложения.)
   date: "2024-12-01"
   readTime: 7
   tags: ["Цены", "Советы"]
   image: "/images/placeholder.svg"
   metaTitle: "Сколько стоит сайт в 2024 — разбор цен на разработку"
   metaDescription: "Из чего складывается цена сайта. Сравнение конструкторов и индивидуальной разработки. Как не переплатить."

Экспортируй вспомогательные функции:
- getArticleBySlug(slug: string): Article | undefined
- getAllArticles(): Article[] (отсортированные по дате, новые первые)

### Файл 5: src/data/site.ts

Экспортируй объект siteConfig: SiteConfig:

{
  name: "Сергей — Веб-разработчик",
  description: "Создаю продающие сайты для малого бизнеса в РФ. Лендинги, корпоративные сайты, интернет-магазины.",
  url: "https://sii5.netlify.app",
  author: "Сергей",
  email: "contact@sii5.ru",
  phone: "+7 (999) 123-45-67",
  city: "Саратов",
  socials: {
    telegram: "https://t.me/weirdsar",
    vk: "https://vk.com/weirdsar",
    github: "https://github.com/weirdsar"
  }
}
ПРОМТ 4: BaseLayout
text

Создай файл src/layouts/BaseLayout.astro.

Это главный layout, который используют все страницы. Он принимает props:
- title: string (обязательный)
- description: string (обязательный)
- ogImage?: string (по умолчанию "/images/og/og-default.svg")
- canonicalUrl?: string

Содержимое файла:

1. Frontmatter:
   - Импортируй Header из '@components/Header.astro'
   - Импортируй Footer из '@components/Footer.astro'
   - Импортируй siteConfig из '@data/site'
   - Определи interface Props с полями выше
   - Деструктурируй props с дефолтными значениями

2. HTML:
   - <!DOCTYPE html>, <html lang="ru" class="scroll-smooth">
   - <head>:
     - <meta charset="UTF-8">
     - <meta name="viewport" content="width=device-width, initial-scale=1.0">
     - <title>{title} | {siteConfig.name}</title>
     - <meta name="description" content={description}>
     - <meta name="author" content={siteConfig.author}>
     - Open Graph теги: og:title, og:description, og:image (абсолютный URL), og:url, og:type="website", og:locale="ru_RU"
     - <link rel="canonical" href={canonicalUrl || Astro.url.href}>
     - <link rel="icon" type="image/svg+xml" href="/favicon.svg">
     - Google Fonts preconnect и подключение Inter (400;500;600;700) и JetBrains Mono (400;700)
     - Импорт '../styles/globals.css'
   - <body class="min-h-screen flex flex-col">
     - <Header />
     - <main class="flex-grow">
       - <slot />
     - </main>
     - <Footer />
     - Inline-скрипт для Intersection Observer анимации (scroll-reveal):
       Найди все элементы с data-reveal, добавь им класс opacity-0 translate-y-4.
       При пересечении viewport (threshold: 0.1) — убери эти классы, добавь opacity-100 translate-y-0 transition duration-700.
       Используй once: true чтобы анимация не повторялась.

Убедись, что все пути импорта используют алиасы из tsconfig (@components/, @data/ и т.д.).
ПРОМТ 5: Header и мобильное меню
text

Создай два файла:

### Файл 1: src/components/Header.astro

Шапка сайта. Фиксированная вверху (sticky top-0), с размытым фоном (backdrop-blur-md bg-white/80), z-50.

Содержимое:
1. Frontmatter:
   - Импортируй siteConfig из '@data/site'
   - Определи массив navItems типа NavItem[]:
     [
       { label: "Главная", href: "/" },
       { label: "Кейсы", href: "/cases" },
       { label: "Услуги", href: "/services" },
       { label: "Статьи", href: "/articles" },
       { label: "Контакты", href: "/contact" }
     ]
   - Получи текущий pathname через Astro.url.pathname

2. HTML-структура:
   <header> — sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100
     <nav class="container-custom"> — flex items-center justify-between h-16 md:h-20
       
       А) Логотип (левая часть):
          <a href="/"> с текстом siteConfig.name
          Стили: font-bold text-xl text-primary hover:text-primary-dark transition
       
       Б) Десктоп-навигация (центр, видна на md+ скрытая на мобильных):
          <ul class="hidden md:flex items-center gap-8">
            Для каждого navItem — <li><a href={item.href} class="...">
            Стили ссылок: text-text-muted hover:text-primary transition font-medium text-sm uppercase tracking-wide
            Активная ссылка (pathname совпадает или начинается с href, кроме "/"): text-primary border-b-2 border-primary pb-1
       
       В) Кнопка CTA (правая часть, видна на md+):
          <a href="/contact" class="btn-primary text-sm hidden md:inline-flex">Обсудить проект</a>
       
       Г) Кнопка бургера (видна на <md):
          <button id="burger-btn" type="button" aria-label="Открыть меню" class="md:hidden ...">
            SVG-иконка гамбургера (3 полоски), 24x24. При открытии меню — меняется на крестик.
            Используй два span-элемента с data-атрибутами для анимации.

3. Мобильное меню (сразу после </nav>, внутри <header>):
   <div id="mobile-menu" class="md:hidden hidden"> — полноэкранное меню на мобильных
     Фон: bg-white, фиксированное позиционирование от header вниз (inset-x-0 top-16 bottom-0)
     Внутри: <ul class="flex flex-col items-center justify-center gap-6 h-full">
       Для каждого navItem — большая ссылка (text-2xl font-bold)
     После списка — кнопка "Обсудить проект" (btn-primary, text-lg)

4. Inline-скрипт (<script is:inline>):
   - Получи burger-btn и mobile-menu по id
   - По клику на бургер: toggle класс 'hidden' на mobile-menu
   - При открытии: добавь overflow-hidden на body, смени иконку на крестик
   - При закрытии: убери overflow-hidden, верни гамбургер
   - При клике на любую ссылку внутри mobile-menu — закрой меню
   - При resize окна на md+ — закрой меню

### Файл 2: Не нужен — мобильное меню реализовано внутри Header.astro через is:inline скрипт.

Важно: бургер-иконка должна анимированно превращаться в крестик. Используй CSS transition на transform трёх span-элементов (верхняя полоска поворачивается на 45°, средняя исчезает, нижняя на -45°). Управляй через toggle CSS-класса 'open' на кнопке.
ПРОМТ 6: Footer
text

Создай файл src/components/Footer.astro.

Футер сайта. Тёмный фон (bg-surface-dark), светлый текст.

Frontmatter:
- Импортируй siteConfig из '@data/site'
- Импортируй navItems (те же, что в Header — вынеси их в отдельный файл src/data/navigation.ts, экспортируй массив navItems. Создай этот файл тоже.)
- Текущий год: new Date().getFullYear()

HTML-структура:
<footer class="bg-surface-dark text-gray-300 py-12 md:py-16">
  <div class="container-custom">
    Три колонки на десктопе (grid md:grid-cols-3 gap-8), одна — на мобильных:

    Колонка 1: О себе
    - Имя/логотип: text-white font-bold text-xl mb-4
    - Краткий текст: "Веб-разработчик из Саратова. Создаю сайты, которые приносят клиентов." (text-gray-400, text-sm)
    - Соцсети: иконки (SVG inline) — Telegram, VK, GitHub. Каждая — круглая кнопка с hover-эффектом (hover:text-white hover:bg-primary transition). Ссылки из siteConfig.socials. target="_blank" rel="noopener noreferrer".

    Колонка 2: Навигация
    - Заголовок: "Навигация" (text-white font-semibold mb-4)
    - Список ссылок из navItems, text-gray-400 hover:text-white transition

    Колонка 3: Контакты
    - Заголовок: "Контакты" (text-white font-semibold mb-4)
    - Email: siteConfig.email с иконкой конверта
    - Телефон: siteConfig.phone с иконкой телефона  
    - Город: siteConfig.city с иконкой метки
    - Кнопка "Обсудить проект" (btn-accent, mt-4)

    Нижняя полоса (border-t border-gray-700 mt-8 pt-8):
    - Слева: © {year} {siteConfig.name}. Все права защищены.
    - Справа: "Сделано на Astro" (text-gray-500 text-sm)

SVG-иконки для соцсетей:
- Telegram: стандартная иконка бумажного самолёта (24x24, currentColor)
- VK: стилизованная "VK" (24x24, currentColor)  
- GitHub: стандартная иконка octocat (24x24, currentColor)

Все SVG рисуй inline (не внешние файлы) для контроля цвета через currentColor.
ПРОМТ 7: Hero-компонент
text

Создай файл src/components/Hero.astro.

Полноэкранный hero-блок для главной страницы. 

Props:
- title: string (по умолчанию: "Создаю продающие сайты для малого бизнеса в РФ")
- subtitle: string (по умолчанию: "Лендинги, корпоративные сайты и интернет-магазины, которые приносят заявки и клиентов")
- ctaText: string (по умолчанию: "Смотреть кейсы")
- ctaHref: string (по умолчанию: "/cases")
- secondaryCtaText: string (по умолчанию: "Обсудить проект")
- secondaryCtaHref: string (по умолчанию: "/contact")

HTML-структура:
<section class="relative min-h-[90vh] flex items-center overflow-hidden">

  Фон:
  - Абсолютно позиционированный gradient overlay: bg-gradient-to-br from-surface-dark via-primary-dark/90 to-surface-dark
  - Декоративные элементы поверх (opacity-10):
    - Большой круг (w-96 h-96 rounded-full bg-primary blur-3xl) в правом верхнем углу, анимация pulse (animate-pulse, но медленнее — используй custom animation в style теге: animation: float 6s ease-in-out infinite)
    - Маленький круг (w-64 h-64 rounded-full bg-accent blur-3xl) в левом нижнем углу, с другой задержкой анимации
  - Сетка точек для текстуры: SVG-паттерн с мелкими точками (opacity-5)

  Контент (relative z-10):
  <div class="container-custom py-20 md:py-32">
    На десктопе: две колонки (grid md:grid-cols-2 gap-12 items-center)
    
    Левая колонка (текст):
    - Бейдж сверху: <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent mb-6">
      Иконка ракеты (emoji или SVG) + "Веб-разработчик из Саратова"
    - <h1> с title: text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6
      Ключевые слова в title оберни в <span class="text-accent"> (например, "продающие" и "малого бизнеса")
    - <p> с subtitle: text-lg md:text-xl text-gray-300 mb-8 max-w-lg
    - Кнопки:
      <div class="flex flex-col sm:flex-row gap-4">
        <a href={ctaHref} class="btn-accent text-lg px-8 py-4">{ctaText}</a>
        <a href={secondaryCtaHref} class="btn-outline border-white text-white hover:bg-white hover:text-surface-dark text-lg px-8 py-4">{secondaryCtaText}</a>
      </div>
    - Под кнопками (mt-8): мини-статистика в строку
      <div class="flex gap-8 text-gray-400">
        <div><span class="text-2xl font-bold text-white">4+</span><br><span class="text-sm">проекта</span></div>
        <div><span class="text-2xl font-bold text-white">2+</span><br><span class="text-sm">года опыта</span></div>
        <div><span class="text-2xl font-bold text-white">100%</span><br><span class="text-sm">довольных клиентов</span></div>
      </div>

    Правая колонка (визуал, скрыта на мобильных — hidden md:block):
    - Стилизованное окно браузера:
      <div class="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        Полоска с тремя точками (красная, жёлтая, зелёная) — имитация toolbar браузера
        <div class="bg-gray-900 p-1">
          <div class="flex gap-2 px-4 py-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        Содержимое: картинка-placeholder или стилизованный код:
        <div class="p-6 font-mono text-sm text-green-400">
          Несколько строк "кода" (декоративные):
          <span class="text-purple-400">const</span> <span class="text-blue-400">сайт</span> = создатьПродающийСайт({
            клиент: <span class="text-accent">'Ваш бизнес'</span>,
            результат: <span class="text-green-400">'Рост заявок'</span>
          });
        </div>
      </div>

  Добавь <style> тег с keyframes для float-анимации:
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
ПРОМТ 8: Компоненты для секций главной страницы
text

Создай четыре компонента:

### Файл 1: src/components/CaseCard.astro

Карточка кейса для сетки.

Props:
- slug: string
- title: string
- shortDesc: string
- image: string
- tags: string[]

HTML:
<article class="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100" data-reveal>
  
  Изображение (верхняя часть, aspect-video):
  <div class="aspect-video overflow-hidden bg-gray-100">
    <img src={image} alt={title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
  </div>
  
  Контент (нижняя часть):
  <div class="p-6">
    Теги:
    <div class="flex flex-wrap gap-2 mb-3">
      {tags.map(tag => <span class="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">{tag}</span>)}
    </div>
    
    <h3 class="text-lg font-bold text-text-main mb-2 group-hover:text-primary transition-colors">{title}</h3>
    <p class="text-text-muted text-sm mb-4">{shortDesc}</p>
    
    <a href={`/cases/${slug}`} class="inline-flex items-center text-primary font-semibold text-sm hover:gap-3 gap-2 transition-all">
      Подробнее
      <svg>→ стрелка вправо (w-4 h-4)</svg>
    </a>
  </div>
</article>

### Файл 2: src/components/ProjectsGrid.astro

Секция "Мои проекты" для главной.

Props:
- title: string (по умолчанию: "Мои проекты")
- subtitle: string (по умолчанию: "Каждый сайт — решение конкретной бизнес-задачи")

Frontmatter:
- Импортируй cases из '@data/cases'
- Импортируй CaseCard из './CaseCard.astro'

HTML:
<section class="py-16 md:py-24 bg-surface-light" id="projects">
  <div class="container-custom">
    Заголовок секции (по центру):
    <div class="text-center mb-12" data-reveal>
      <h2 class="text-3xl md:text-4xl font-bold text-text-main mb-4">{title}</h2>
      <p class="text-text-muted text-lg max-w-2xl mx-auto">{subtitle}</p>
    </div>

    Сетка карточек:
    <div class="grid md:grid-cols-2 gap-8">
      {cases.map(c => <CaseCard slug={c.slug} title={c.title} shortDesc={c.shortDesc} image={c.image} tags={c.tags} />)}
    </div>

    Кнопка "Все проекты" (по центру, mt-10):
    <div class="text-center mt-10" data-reveal>
      <a href="/cases" class="btn-outline">Все проекты →</a>
    </div>
  </div>
</section>

### Файл 3: src/components/ServicesList.astro

Краткий блок услуг для главной (не тарифная сетка — та на отдельной странице).

HTML:
<section class="py-16 md:py-24" id="services">
  <div class="container-custom">
    Заголовок секции по центру:
    <div class="text-center mb-12" data-reveal>
      <h2 class="text-3xl md:text-4xl font-bold text-text-main mb-4">Что я делаю</h2>
      <p class="text-text-muted text-lg max-w-2xl mx-auto">Полный цикл создания сайта: от идеи до работающего продукта</p>
    </div>

    Три карточки в ряд (grid md:grid-cols-3 gap-8):

    Карточка 1: "Разработка с нуля"
    - Иконка: SVG монитор с кодом (48x48, text-primary)
    - Описание: "Создаю сайты на современных технологиях. Быстрые, адаптивные, оптимизированные для поисковиков."

    Карточка 2: "Доработка и редизайн"
    - Иконка: SVG кисть/палитра (48x48, text-primary)
    - Описание: "Обновляю устаревшие сайты: новый дизайн, мобильная версия, улучшение скорости и конверсии."

    Карточка 3: "Поддержка"
    - Иконка: SVG щит с галочкой (48x48, text-primary)
    - Описание: "Техническое обслуживание, обновления, резервные копии. Ваш сайт всегда работает стабильно."

    Каждая карточка:
    <div class="text-center p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300" data-reveal>
      <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-primary/10">
        SVG-иконка
      </div>
      <h3 class="text-xl font-bold text-text-main mb-3">{название}</h3>
      <p class="text-text-muted">{описание}</p>
    </div>

    Кнопка:
    <div class="text-center mt-10" data-reveal>
      <a href="/services" class="btn-primary">Подробнее об услугах</a>
    </div>
  </div>
</section>

### Файл 4: src/components/ArticlesPreview.astro

Блок "Статьи" для главной — показывает 2 последние статьи.

Frontmatter:
- Импортируй getAllArticles из '@data/articles'
- const latestArticles = getAllArticles().slice(0, 2)
- Импортируй ArticleCard из './ArticleCard.astro'

HTML:
<section class="py-16 md:py-24 bg-surface-light" id="articles">
  <div class="container-custom">
    <div class="text-center mb-12" data-reveal>
      <h2 class="text-3xl md:text-4xl font-bold text-text-main mb-4">Полезные статьи</h2>
      <p class="text-text-muted text-lg max-w-2xl mx-auto">Делюсь знаниями о веб-разработке и продвижении бизнеса в интернете</p>
    </div>
    <div class="grid md:grid-cols-2 gap-8">
      {latestArticles.map(article => <ArticleCard {...article} />)}
    </div>
    <div class="text-center mt-10" data-reveal>
      <a href="/articles" class="btn-outline">Все статьи →</a>
    </div>
  </div>
</section>

Также создай src/components/ArticleCard.astro:

Props: все поля Article (или slug, title, excerpt, date, readTime, tags, image)

HTML:
<article class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100" data-reveal>
  <div class="aspect-video overflow-hidden bg-gray-100">
    <img src={image} alt={title} class="w-full h-full object-cover" loading="lazy">
  </div>
  <div class="p-6">
    <div class="flex items-center gap-4 text-sm text-text-muted mb-3">
      <time datetime={date}>{форматированная дата на русском, например "15 ноября 2024"}</time>
      <span>·</span>
      <span>{readTime} мин чтения</span>
    </div>
    <h3 class="text-lg font-bold text-text-main mb-2">{title}</h3>
    <p class="text-text-muted text-sm mb-4">{excerpt}</p>
    <a href={`/articles/${slug}`} class="inline-flex items-center text-primary font-semibold text-sm">
      Читать далее →
    </a>
  </div>
</article>

Для форматирования даты создай утилиту в src/utils/helpers.ts:
export function formatDate(dateStr: string): string — принимает ISO-дату, возвращает "15 ноября 2024" на русском.
Используй Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).
ПРОМТ 9: CTA-компонент и главная страница
text

Создай два файла:

### Файл 1: src/components/CTA.astro

Секция призыва к действию. Яркий блок с градиентным фоном.

Props:
- title: string (по умолчанию: "Готовы обсудить ваш проект?")
- subtitle: string (по умолчанию: "Оставьте заявку — отвечу в течение 2 часов в рабочее время")
- ctaText: string (по умолчанию: "Оставить заявку")
- ctaHref: string (по умолчанию: "/contact")

HTML:
<section class="py-16 md:py-24">
  <div class="container-custom">
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-8 md:p-16 text-center" data-reveal>
      
      Декоративные круги (абсолютные, opacity-10):
      - Круг слева (w-64 h-64 rounded-full bg-white/10 -left-16 -top-16)
      - Круг справа (w-48 h-48 rounded-full bg-white/10 -right-8 -bottom-8)

      <h2 class="relative z-10 text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
      <p class="relative z-10 text-lg text-blue-100 mb-8 max-w-xl mx-auto">{subtitle}</p>
      <a href={ctaHref} class="relative z-10 btn-accent text-lg px-10 py-4">{ctaText}</a>
    </div>
  </div>
</section>

### Файл 2: src/pages/index.astro

Главная страница.

Frontmatter:
- Импортируй BaseLayout из '@layouts/BaseLayout.astro'
- Импортируй Hero из '@components/Hero.astro'
- Импортируй ProjectsGrid из '@components/ProjectsGrid.astro'
- Импортируй ServicesList из '@components/ServicesList.astro'
- Импортируй ArticlesPreview из '@components/ArticlesPreview.astro'
- Импортируй CTA из '@components/CTA.astro'

HTML:
<BaseLayout 
  title="Создаю продающие сайты для малого бизнеса" 
  description="Веб-разработчик из Саратова. Лендинги, корпоративные сайты и интернет-магазины, которые приносят заявки и клиентов. Смотрите портфолио."
>
  <Hero />
  <ProjectsGrid />
  <ServicesList />
  <ArticlesPreview />
  <CTA />
</BaseLayout>

Страница не содержит никакой дополнительной разметки — всё делегировано компонентам.
ПРОМТ 10: Страница списка кейсов
text

Создай файл src/pages/cases/index.astro.

Страница со всеми кейсами в виде сетки.

Frontmatter:
- Импортируй BaseLayout
- Импортируй CaseCard из '@components/CaseCard.astro'
- Импортируй { getAllCases } из '@data/cases'
- Импортируй CTA
- const cases = getAllCases()

HTML:
<BaseLayout 
  title="Кейсы — Портфолио проектов" 
  description="Мои работы: лендинги, корпоративные сайты, интернет-магазины для малого бизнеса. Реальные результаты для реальных клиентов."
>

  Шапка страницы:
  <section class="bg-surface-dark py-16 md:py-24">
    <div class="container-custom text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Мои проекты</h1>
      <p class="text-lg text-gray-300 max-w-2xl mx-auto">
        Каждый проект — это решение конкретной бизнес-задачи. 
        Нажмите на проект, чтобы узнать подробности.
      </p>
    </div>
  </section>

  Сетка кейсов:
  <section class="py-16 md:py-24">
    <div class="container-custom">
      <div class="grid md:grid-cols-2 gap-8">
        {cases.map(c => (
          <CaseCard 
            slug={c.slug} 
            title={c.title} 
            shortDesc={c.shortDesc} 
            image={c.image} 
            tags={c.tags} 
          />
        ))}
      </div>
    </div>
  </section>

  <CTA 
    title="Хотите такой же результат?" 
    subtitle="Расскажите о вашем проекте — подберу оптимальное решение" 
  />
</BaseLayout>
ПРОМТ 11: Детальная страница кейса
text

Создай файл src/pages/cases/[slug].astro.

Динамическая страница кейса.

Frontmatter:
- Импортируй BaseLayout
- Импортируй ContactForm из '@components/ContactForm.astro' (компонент ещё не создан — пока используй заглушку <div>Форма</div>, мы заменим в промте 14)
- Импортируй { getAllSlugs, getCaseBySlug } из '@data/cases'
- Импортируй type CaseStudy из '@types/index'

Функция getStaticPaths:
export function getStaticPaths() {
  const slugs = getAllSlugs();
  return slugs.map(slug => ({ params: { slug } }));
}

Основная логика:
- const { slug } = Astro.params;
- const caseData = getCaseBySlug(slug as string);
- if (!caseData) return Astro.redirect('/404');

HTML:
<BaseLayout title={caseData.metaTitle} description={caseData.metaDescription}>

  Шапка с названием проекта:
  <section class="bg-surface-dark py-16 md:py-20">
    <div class="container-custom">
      Хлебные крошки:
      <nav class="mb-6 text-sm">
        <a href="/" class="text-gray-400 hover:text-white">Главная</a>
        <span class="text-gray-600 mx-2">/</span>
        <a href="/cases" class="text-gray-400 hover:text-white">Кейсы</a>
        <span class="text-gray-600 mx-2">/</span>
        <span class="text-gray-300">{caseData.title}</span>
      </nav>
      
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div class="flex flex-wrap gap-2 mb-4">
            {caseData.tags.map(tag => <span class="text-xs font-medium px-3 py-1 bg-primary/20 text-blue-300 rounded-full">{tag}</span>)}
          </div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{caseData.title}</h1>
          <p class="text-gray-300 mt-2">Клиент: {caseData.client} · {caseData.year} год</p>
        </div>
        <a href={caseData.liveUrl} target="_blank" rel="noopener noreferrer" class="btn-accent shrink-0">
          Посмотреть сайт ↗
        </a>
      </div>
    </div>
  </section>

  Основное изображение:
  <section class="py-8">
    <div class="container-custom">
      <div class="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        <img src={caseData.image} alt={caseData.title} class="w-full" loading="eager">
      </div>
    </div>
  </section>

  Три блока в сетке (grid md:grid-cols-3 gap-8):
  <section class="py-12 md:py-16">
    <div class="container-custom">
      <div class="grid md:grid-cols-3 gap-8">

        Блок "Задача" (challenge):
        <div class="bg-red-50 rounded-2xl p-6 md:p-8" data-reveal>
          <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
            SVG иконка проблемы/вопроса (text-red-500)
          </div>
          <h2 class="text-xl font-bold text-text-main mb-3">Задача</h2>
          <p class="text-text-muted leading-relaxed">{caseData.challenge}</p>
        </div>

        Блок "Решение" (solution):
        <div class="bg-blue-50 rounded-2xl p-6 md:p-8" data-reveal>
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
            SVG иконка инструмента/шестерёнки (text-primary)
          </div>
          <h2 class="text-xl font-bold text-text-main mb-3">Решение</h2>
          <p class="text-text-muted leading-relaxed">{caseData.solution}</p>
        </div>

        Блок "Результат" (result):
        <div class="bg-green-50 rounded-2xl p-6 md:p-8" data-reveal>
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
            SVG иконка графика роста (text-green-500)
          </div>
          <h2 class="text-xl font-bold text-text-main mb-3">Результат</h2>
          <p class="text-text-muted leading-relaxed">{caseData.result}</p>
        </div>

      </div>
    </div>
  </section>

  Галерея (если есть скриншоты):
  {caseData.gallery.length > 0 && (
    <section class="py-8">
      <div class="container-custom">
        <h2 class="text-2xl font-bold mb-6">Скриншоты</h2>
        <div class="grid md:grid-cols-2 gap-4">
          {caseData.gallery.map(img => (
            <div class="rounded-xl overflow-hidden border border-gray-200">
              <img src={img} alt="Скриншот проекта" class="w-full" loading="lazy">
            </div>
          ))}
        </div>
      </div>
    </section>
  )}

  Форма "Хочу такой же":
  <section class="py-12 md:py-16 bg-surface-light">
    <div class="container-custom max-w-2xl">
      <div class="text-center mb-8" data-reveal>
        <h2 class="text-2xl md:text-3xl font-bold text-text-main mb-3">Хотите похожий проект?</h2>
        <p class="text-text-muted">Оставьте заявку — обсудим вашу задачу и подберу решение</p>
      </div>
      <!-- Заглушка для формы, заменим в промте 14 -->
      <div id="contact-form-placeholder" class="bg-white rounded-2xl p-8 shadow-lg" data-reveal>
        <p class="text-center text-text-muted">Форма заявки (будет добавлена)</p>
      </div>
    </div>
  </section>

  Навигация между кейсами (предыдущий/следующий):
  Внизу — ссылка "← Все проекты" по центру.
  <div class="container-custom py-8 text-center">
    <a href="/cases" class="btn-outline">← Все проекты</a>
  </div>

</BaseLayout>
ПРОМТ 12: Страница услуг
text

Создай два файла:

### Файл 1: src/components/ServiceCard.astro

Карточка тарифа.

Props (все поля из типа Service):
- name, subtitle, price, features, highlighted, cta, id

HTML:
<div class:list={[
  "relative rounded-2xl p-8 border-2 transition-all duration-300",
  highlighted 
    ? "border-primary bg-white shadow-xl scale-105 z-10" 
    : "border-gray-200 bg-white hover:border-primary/30 hover:shadow-lg"
]} data-reveal>

  Если highlighted — бейдж "Популярный":
  {highlighted && (
    <div class="absolute -top-4 left-1/2 -translate-x-1/2">
      <span class="bg-primary text-white text-sm font-bold px-4 py-1 rounded-full">Популярный</span>
    </div>
  )}

  <div class="text-center mb-6">
    <h3 class="text-2xl font-bold text-text-main mb-1">{name}</h3>
    <p class="text-text-muted text-sm">{subtitle}</p>
  </div>

  Цена:
  <div class="text-center mb-6">
    <span class="text-4xl font-bold text-text-main">{price}</span>
  </div>

  Разделитель:
  <hr class="border-gray-200 mb-6">

  Список фич:
  <ul class="space-y-3 mb-8">
    {features.map(f => (
      <li class="flex items-start gap-3">
        <svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5">✓ галочка</svg>
        <span class="text-text-muted text-sm">{f}</span>
      </li>
    ))}
  </ul>

  Кнопка:
  <a href={`/contact?service=${id}`} class:list={[
    "w-full text-center py-3 rounded-lg font-semibold transition-colors",
    highlighted ? "btn-primary" : "btn-outline"
  ]}>
    {cta}
  </a>
</div>

### Файл 2: src/pages/services.astro

Frontmatter:
- Импортируй BaseLayout
- Импортируй ServiceCard
- Импортируй services и additionalServices из '@data/services'
- Импортируй CTA

HTML:
<BaseLayout 
  title="Услуги и цены" 
  description="Разработка сайтов для малого бизнеса: лендинги от 25 000 ₽, корпоративные сайты от 50 000 ₽. Полный цикл от дизайна до запуска."
>

  Шапка:
  <section class="bg-surface-dark py-16 md:py-24">
    <div class="container-custom text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Услуги и цены</h1>
      <p class="text-lg text-gray-300 max-w-2xl mx-auto">
        Прозрачные цены, понятные условия. Выберите подходящий формат или обсудим индивидуальный проект.
      </p>
    </div>
  </section>

  Тарифные карточки:
  <section class="py-16 md:py-24">
    <div class="container-custom">
      <div class="grid md:grid-cols-3 gap-8 items-start">
        {services.map(service => <ServiceCard {...service} />)}
      </div>
    </div>
  </section>

  Дополнительные услуги:
  <section class="py-16 md:py-24 bg-surface-light">
    <div class="container-custom">
      <h2 class="text-3xl font-bold text-text-main text-center mb-12" data-reveal>Дополнительные услуги</h2>
      <div class="grid md:grid-cols-2 gap-6">
        {additionalServices.map(s => (
          <div class="bg-white rounded-xl p-6 border border-gray-100 flex justify-between items-start" data-reveal>
            <div>
              <h3 class="font-bold text-text-main mb-1">{s.name}</h3>
              <p class="text-text-muted text-sm">{s.description}</p>
            </div>
            <span class="text-primary font-bold whitespace-nowrap ml-4">{s.price}</span>
          </div>
        ))}
      </div>
    </div>
  </section>

  Блок "Как я работаю" — 4 шага:
  <section class="py-16 md:py-24">
    <div class="container-custom">
      <h2 class="text-3xl font-bold text-text-main text-center mb-12" data-reveal>Как я работаю</h2>
      <div class="grid md:grid-cols-4 gap-8">
        
        Шаг 1: "Знакомство" — иконка чата. "Обсуждаем задачу, цели, бюджет. Бесплатная консультация."
        Шаг 2: "Проектирование" — иконка макета. "Создаю прототип и дизайн. Утверждаем до начала разработки."
        Шаг 3: "Разработка" — иконка кода. "Верстаю и программирую. Показываю промежуточные результаты."
        Шаг 4: "Запуск" — иконка ракеты. "Тестирую, размещаю на хостинге, настраиваю аналитику."

        Каждый шаг:
        <div class="text-center" data-reveal>
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {номер шага}
          </div>
          <h3 class="font-bold text-text-main mb-2">{название}</h3>
          <p class="text-text-muted text-sm">{описание}</p>
        </div>

      </div>
    </div>
  </section>

  <CTA />
</BaseLayout>
ПРОМТ 13: Страницы статей
text

Создай три файла:

### Файл 1: src/pages/articles/index.astro

Страница со списком всех статей.

Frontmatter:
- Импортируй BaseLayout
- Импортируй ArticleCard из '@components/ArticleCard.astro'
- Импортируй { getAllArticles } из '@data/articles'
- Импортируй CTA
- const articles = getAllArticles()

HTML:
<BaseLayout 
  title="Статьи о веб-разработке" 
  description="Полезные статьи о создании сайтов, продвижении и развитии бизнеса в интернете."
>

  Шапка:
  <section class="bg-surface-dark py-16 md:py-24">
    <div class="container-custom text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Статьи</h1>
      <p class="text-lg text-gray-300 max-w-2xl mx-auto">
        Делюсь опытом и полезными знаниями о веб-разработке, 
        продвижении бизнеса в интернете и цифровых инструментах.
      </p>
    </div>
  </section>

  Сетка статей:
  <section class="py-16 md:py-24">
    <div class="container-custom">
      {articles.length > 0 ? (
        <div class="grid md:grid-cols-2 gap-8">
          {articles.map(article => <ArticleCard {...article} />)}
        </div>
      ) : (
        <p class="text-center text-text-muted text-lg">Статьи скоро появятся. Следите за обновлениями!</p>
      )}
    </div>
  </section>

  <CTA 
    title="Есть вопросы по разработке?" 
    subtitle="Напишите — помогу разобраться и подскажу лучшее решение"
  />
</BaseLayout>

### Файл 2: src/pages/articles/[slug].astro

Динамическая страница статьи.

Frontmatter:
- Импортируй BaseLayout
- Импортируй { getAllArticles, getArticleBySlug } из '@data/articles'
- Импортируй { formatDate } из '@utils/helpers'
- Импортируй CTA

getStaticPaths:
export function getStaticPaths() {
  const articles = getAllArticles();
  return articles.map(a => ({ params: { slug: a.slug } }));
}

Логика:
- const { slug } = Astro.params;
- const article = getArticleBySlug(slug as string);
- if (!article) return Astro.redirect('/404');

HTML:
<BaseLayout title={article.metaTitle} description={article.metaDescription}>

  <article class="py-16 md:py-24">
    <div class="container-custom max-w-3xl">
      
      Хлебные крошки:
      <nav class="mb-8 text-sm text-text-muted">
        <a href="/" class="hover:text-primary">Главная</a> / 
        <a href="/articles" class="hover:text-primary">Статьи</a> / 
        <span class="text-text-main">{article.title}</span>
      </nav>

      Метаданные:
      <div class="flex items-center gap-4 text-sm text-text-muted mb-6">
        <time datetime={article.date}>{formatDate(article.date)}</time>
        <span>·</span>
        <span>{article.readTime} мин чтения</span>
      </div>

      Теги:
      <div class="flex flex-wrap gap-2 mb-6">
        {article.tags.map(tag => <span class="text-xs font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">{tag}</span>)}
      </div>

      Заголовок:
      <h1 class="text-3xl md:text-4xl font-bold text-text-main mb-8">{article.title}</h1>

      Изображение:
      {article.image && (
        <div class="rounded-2xl overflow-hidden mb-8">
          <img src={article.image} alt={article.title} class="w-full">
        </div>
      )}

      Контент статьи:
      <div class="prose prose-lg max-w-none" set:html={article.content} />

      Нижняя навигация:
      <div class="mt-12 pt-8 border-t border-gray-200 text-center">
        <a href="/articles" class="btn-outline">← Все статьи</a>
      </div>

    </div>
  </article>

  <CTA />
</BaseLayout>

### Файл 3: Обнови src/styles/globals.css

Добавь в @layer base стили для prose (типографика статей):

.prose h2 {
  @apply text-2xl font-bold text-text-main mt-8 mb-4;
}
.prose h3 {
  @apply text-xl font-bold text-text-main mt-6 mb-3;
}
.prose p {
  @apply text-text-muted leading-relaxed mb-4;
}
.prose ul {
  @apply list-disc list-inside space-y-2 mb-4 text-text-muted;
}
.prose li {
  @apply leading-relaxed;
}
.prose a {
  @apply text-primary underline hover:text-primary-dark;
}
.prose strong {
  @apply text-text-main font-semibold;
}
ПРОМТ 14: Форма заявки (ContactForm)
text

Создай файл src/components/ContactForm.astro.

Форма заявки с двойной отправкой: Netlify Forms (основная) + MAX-бот (дополнительная, если endpoint указан).

Прочитай файл max_bot_instrukt.md из корня проекта, если он существует, для получения endpoint'а MAX-бота. Если файла нет — используй только Netlify Forms.

Props:
- formName: string (по умолчанию: "contact")
- prefilledService: string (по умолчанию: "")
- showServiceSelect: boolean (по умолчанию: true)

HTML:
<form 
  id="contact-form"
  name={formName}
  method="POST"
  data-netlify="true"
  netlify-honeypot="bot-field"
  class="space-y-6"
>
  Honeypot (скрытое поле от спама):
  <p class="hidden">
    <label>Не заполняйте: <input name="bot-field"></label>
  </p>
  <input type="hidden" name="form-name" value={formName}>

  Поле "Имя":
  <div>
    <label for="name" class="block text-sm font-medium text-text-main mb-2">Ваше имя *</label>
    <input 
      type="text" 
      id="name" 
      name="name" 
      required
      placeholder="Как к вам обращаться"
      class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-text-main placeholder-gray-400"
    >
  </div>

  Поле "Телефон или Email":
  <div>
    <label for="contact-info" class="block text-sm font-medium text-text-main mb-2">Телефон или Email *</label>
    <input 
      type="text" 
      id="contact-info" 
      name="contact" 
      required
      placeholder="+7 (999) 123-45-67 или email@example.ru"
      class="... (те же стили)"
    >
  </div>

  Выбор услуги (если showServiceSelect):
  {showServiceSelect && (
    <div>
      <label for="service" class="block text-sm font-medium text-text-main mb-2">Что вас интересует</label>
      <select 
        id="service" 
        name="service" 
        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-text-main bg-white"
      >
        <option value="">Выберите услугу</option>
        <option value="landing" selected={prefilledService === 'start'}>Лендинг (от 25 000 ₽)</option>
        <option value="corporate" selected={prefilledService === 'business'}>Корпоративный сайт (от 50 000 ₽)</option>
        <option value="custom" selected={prefilledService === 'vip'}>Индивидуальный проект</option>
        <option value="redesign">Редизайн сайта</option>
        <option value="support">Техподдержка</option>
        <option value="other">Другое</option>
      </select>
    </div>
  )}

  Поле "Сообщение":
  <div>
    <label for="message" class="block text-sm font-medium text-text-main mb-2">Расскажите о проекте</label>
    <textarea 
      id="message" 
      name="message" 
      rows="4"
      placeholder="Опишите вашу задачу: какой сайт нужен, для какого бизнеса, есть ли дедлайн"
      class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-text-main placeholder-gray-400 resize-vertical"
    ></textarea>
  </div>

  Кнопка отправки:
  <button 
    type="submit" 
    id="submit-btn"
    class="btn-primary w-full py-4 text-lg"
  >
    <span id="btn-text">Отправить заявку</span>
    <span id="btn-spinner" class="hidden">
      SVG спиннер (animate-spin, w-5 h-5) + "Отправляю..."
    </span>
  </button>

  Согласие:
  <p class="text-xs text-text-muted text-center">
    Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
  </p>
</form>

Блок результата (скрытый):
<div id="form-success" class="hidden text-center py-8">
  <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
    SVG галочка (text-green-500, w-8 h-8)
  </div>
  <h3 class="text-xl font-bold text-text-main mb-2">Спасибо за заявку!</h3>
  <p class="text-text-muted">Я свяжусь с вами в течение 2 часов в рабочее время.</p>
</div>

<div id="form-error" class="hidden text-center py-4">
  <p class="text-red-500">Произошла ошибка. Попробуйте позже или напишите мне напрямую в 
    <a href="https://t.me/weirdsar" class="underline">Telegram</a>.
  </p>
</div>

Inline-скрипт (<script is:inline>):

const form = document.getElementById('contact-form');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const submitBtn = document.getElementById('submit-btn');
const formSuccess = document.getElementById('form-success');
const formError = document.getElementById('form-error');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Валидация
    const name = form.querySelector('[name="name"]').value.trim();
    const contact = form.querySelector('[name="contact"]').value.trim();
    
    if (!name || name.length < 2) {
      alert('Пожалуйста, укажите ваше имя');
      return;
    }
    
    if (!contact || contact.length < 5) {
      alert('Пожалуйста, укажите телефон или email');
      return;
    }
    
    // UI: показываем спиннер
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    const formData = new FormData(form);
    
    try {
      // Отправка на Netlify Forms
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      
      if (response.ok) {
        form.classList.add('hidden');
        formSuccess.classList.remove('hidden');
      } else {
        throw new Error('Ошибка отправки');
      }
      
      // Параллельная отправка на MAX-бот (если endpoint задан)
      // TODO: добавить endpoint из max_bot_instrukt.md
      
    } catch (err) {
      console.error(err);
      formError.classList.remove('hidden');
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      submitBtn.disabled = false;
    }
  });
}
ПРОМТ 15: Страница контактов
text

Создай файл src/pages/contact.astro.

Frontmatter:
- Импортируй BaseLayout
- Импортируй ContactForm из '@components/ContactForm.astro'
- Импортируй siteConfig из '@data/site'

Получи query-параметр service:
const serviceParam = Astro.url.searchParams.get('service') || '';

HTML:
<BaseLayout 
  title="Контакты — Обсудить проект" 
  description="Свяжитесь со мной для обсуждения вашего проекта. Бесплатная консультация, ответ в течение 2 часов."
>

  Шапка:
  <section class="bg-surface-dark py-16 md:py-24">
    <div class="container-custom text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Давайте обсудим ваш проект</h1>
      <p class="text-lg text-gray-300 max-w-2xl mx-auto">
        Заполните форму или напишите мне напрямую. Первая консультация — бесплатно.
      </p>
    </div>
  </section>

  Контент:
  <section class="py-16 md:py-24">
    <div class="container-custom">
      <div class="grid md:grid-cols-5 gap-12">

        Левая колонка (md:col-span-3) — форма:
        <div class="md:col-span-3">
          <div class="bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
            <h2 class="text-2xl font-bold text-text-main mb-6">Оставить заявку</h2>
            <ContactForm prefilledService={serviceParam} />
          </div>
        </div>

        Правая колонка (md:col-span-2) — контактная информация:
        <div class="md:col-span-2 space-y-8">

          Блок "Быстрый контакт":
          <div>
            <h2 class="text-xl font-bold text-text-main mb-4">Быстрый контакт</h2>
            <div class="space-y-4">

              Email:
              <a href={`mailto:${siteConfig.email}`} class="flex items-center gap-3 text-text-muted hover:text-primary transition group">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                  SVG конверт (w-5 h-5 text-primary)
                </div>
                <span>{siteConfig.email}</span>
              </a>

              Телефон:
              <a href={`tel:${siteConfig.phone.replace(/[\s()-]/g, '')}`} class="flex items-center gap-3 text-text-muted hover:text-primary transition group">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                  SVG телефон (w-5 h-5 text-primary)
                </div>
                <span>{siteConfig.phone}</span>
              </a>

              Telegram:
              <a href={siteConfig.socials.telegram} target="_blank" class="flex items-center gap-3 text-text-muted hover:text-primary transition group">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                  SVG telegram (w-5 h-5 text-primary)
                </div>
                <span>Написать в Telegram</span>
              </a>

            </div>
          </div>

          Блок "Город":
          <div>
            <h2 class="text-xl font-bold text-text-main mb-4">Где я нахожусь</h2>
            <p class="text-text-muted mb-4">📍 {siteConfig.city}, Россия</p>
            <p class="text-text-muted text-sm">Работаю удалённо с клиентами по всей России. Встречи — по договорённости в Саратове.</p>
          </div>

          Блок "Что будет после заявки":
          <div class="bg-surface-light rounded-xl p-6">
            <h3 class="font-bold text-text-main mb-3">Что будет дальше?</h3>
            <ol class="space-y-3 text-sm text-text-muted">
              <li class="flex gap-3">
                <span class="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0">1</span>
                Получу вашу заявку и отвечу в течение 2 часов
              </li>
              <li class="flex gap-3">
                <span class="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0">2</span>
                Обсудим задачу по телефону или в мессенджере
              </li>
              <li class="flex gap-3">
                <span class="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0">3</span>
                Подготовлю предложение с ценой и сроками
              </li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  </section>

  Карта (embed Яндекс.Карты):
  <section class="pb-16">
    <div class="container-custom">
      <div class="rounded-2xl overflow-hidden h-64 md:h-96 border border-gray-200">
        <iframe 
          src="https://yandex.ru/map-widget/v1/?um=constructor%3Axxxxxxxxx&amp;source=constructor" 
          width="100%" 
          height="100%" 
          frameborder="0"
          title="Карта — Саратов"
          loading="lazy"
        ></iframe>
        <!-- Замените src на реальный embed-код Яндекс.Карт с меткой на Саратов -->
      </div>
    </div>
  </section>

</BaseLayout>
ПРОМТ 16: JSON-LD микроразметка
text

Создай файл src/components/JsonLd.astro.

Компонент для вставки JSON-LD микроразметки.

Props:
- type: 'website' | 'localBusiness' | 'article' | 'service'
- data: Record<string, any> (дополнительные данные)

Frontmatter:
- Импортируй siteConfig из '@data/site'
- В зависимости от type, сформируй объект jsonLd:

Для type === 'website':
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": siteConfig.name,
  "url": siteConfig.url,
  "description": siteConfig.description,
  "author": {
    "@type": "Person",
    "name": siteConfig.author,
    "url": siteConfig.url
  }
}

Для type === 'localBusiness':
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": siteConfig.name,
  "url": siteConfig.url,
  "description": siteConfig.description,
  "telephone": siteConfig.phone,
  "email": siteConfig.email,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": siteConfig.city,
    "addressCountry": "RU"
  },
  "priceRange": "₽₽"
}

Для type === 'article':
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": data.title,
  "description": data.description,
  "datePublished": data.date,
  "author": { "@type": "Person", "name": siteConfig.author }
}

HTML:
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />

Теперь обнови BaseLayout.astro:
1. Добавь импорт JsonLd
2. В <head> после мета-тегов вставь:
   <JsonLd type="website" data={{}} />
   <JsonLd type="localBusiness" data={{}} />

Обнови src/pages/articles/[slug].astro:
1. Добавь <JsonLd type="article" data={{ title: article.title, description: article.metaDescription, date: article.date }} /> внутри BaseLayout (через slot="head" или просто в начале контента — выбери подходящий способ для Astro).
ПРОМТ 17: Обновление страницы кейса — вставка реальной формы
text

Обнови файл src/pages/cases/[slug].astro:

Замени заглушку формы на реальный компонент ContactForm.

Найди блок с id="contact-form-placeholder" и замени его на:

<ContactForm formName="case-inquiry" showServiceSelect={false} />

Также добавь скрытое поле с названием кейса, чтобы в заявке было понятно, откуда пришёл клиент. Для этого:

1. В компоненте ContactForm.astro добавь опциональный prop:
   - sourcePage?: string (по умолчанию: "")

2. Если sourcePage не пустой, добавь в форму:
   <input type="hidden" name="source" value={sourcePage}>

3. В [slug].astro передай:
   <ContactForm formName="case-inquiry" showServiceSelect={false} sourcePage={`Кейс: ${caseData.title}`} />

Не забудь добавить sourcePage в interface Props компонента ContactForm.
ПРОМТ 18: Финальная полировка и анимации
text

Выполни финальные доработки:

### 1. Компонент ScrollReveal — проверь и улучши

Убедись, что в BaseLayout.astro inline-скрипт для scroll-reveal работает корректно:

- Находит все элементы с атрибутом data-reveal
- Изначально задаёт им стили: opacity: 0, transform: translateY(20px)
- При пересечении с viewport (threshold: 0.15) — плавно показывает: opacity: 1, transform: translateY(0), transition: all 0.6s ease-out
- Поддерживает data-reveal-delay="100" для задержки (в мс)
- Использует once: true (анимация не повторяется)

Обнови скрипт если нужно, чтобы:
- Задержка работала через transition-delay
- На мобильных threshold был 0.05 (элементы появляются раньше)

### 2. Плавная прокрутка

В globals.css уже есть scroll-behavior: smooth. Убедись, что все якорные ссылки (#projects, #services, #articles) работают с плавной прокруткой.

### 3. Hover-эффекты

Проверь, что все интерактивные элементы имеют:
- cursor-pointer
- transition-* классы
- focus:ring для доступности (keyboard navigation)

### 4. 404-страница

Создай файл src/pages/404.astro:

<BaseLayout title="Страница не найдена" description="Запрашиваемая страница не существует">
  <section class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-8xl font-bold text-primary mb-4">404</h1>
      <p class="text-2xl text-text-main mb-2">Страница не найдена</p>
      <p class="text-text-muted mb-8">Возможно, она была перемещена или удалена</p>
      <a href="/" class="btn-primary">Вернуться на главную</a>
    </div>
  </section>
</BaseLayout>

### 5. Мета-теги для соцсетей

Проверь, что в BaseLayout.astro в <head> присутствуют:
- <meta property="og:title" content={title}>
- <meta property="og:description" content={description}>
- <meta property="og:image" content={new URL(ogImage, siteConfig.url).href}>
- <meta property="og:url" content={Astro.url.href}>
- <meta property="og:type" content="website">
- <meta property="og:locale" content="ru_RU">
- <meta name="twitter:card" content="summary_large_image">

### 6. Проверь все импорты

Пройди по каждому файлу и убедись:
- Все пути импортов используют алиасы (@components/, @data/, @layouts/, @types/, @utils/)
- Нет неиспользуемых импортов
- Нет циклических зависимостей
- Все компоненты, используемые в страницах, реально существуют

### 7. Доступность (a11y)

- Все img имеют alt
- Все кнопки имеют type="button" или type="submit"
- Бургер-кнопка имеет aria-label и aria-expanded
- Формы имеют связанные label
- Контрастность текста соответствует WCAG AA
Часть 3. Чеклист проверки после выполнения всех промтов
Этот чеклист передаётся Cursor после генерации всего кода для самопроверки.

text

Проведи полную проверку проекта по следующему чеклисту. Для каждого пункта напиши ✅ или ❌ и если ❌ — исправь.

### Структура и сборка
- [ ] npm run dev запускается без ошибок
- [ ] npm run build завершается успешно
- [ ] В dist/ генерируются все HTML-страницы: index.html, cases/index.html, cases/uzelok64/index.html, cases/gidravlika64/index.html, cases/volgawhisper/index.html, cases/razumnyeokna/index.html, services/index.html, articles/index.html, articles/zachem-malomu-biznesu-sajt/index.html, articles/skolko-stoit-sajt-2024/index.html, contact/index.html, 404.html
- [ ] sitemap-index.xml генерируется в dist/
- [ ] robots.txt присутствует в dist/

### Навигация
- [ ] Все ссылки в Header работают (переход на нужные страницы)
- [ ] Все ссылки в Footer работают
- [ ] Бургер-меню открывается/закрывается на мобильных
- [ ] При клике на ссылку в мобильном меню — меню закрывается
- [ ] Хлебные крошки на страницах кейсов и статей ведут на правильные страницы
- [ ] Активная ссылка в навигации выделена визуально

### Страницы
- [ ] Главная: Hero, ProjectsGrid, ServicesList, ArticlesPreview, CTA — все блоки отображаются
- [ ] Кейсы: 4 карточки отображаются в сетке
- [ ] Каждый кейс открывается по /cases/{slug}
- [ ] На странице кейса: заголовок, изображение, блоки Задача/Решение/Результат, кнопка "Посмотреть сайт", форма
- [ ] Услуги: 3 тарифные карточки + доп. услуги + шаги работы
- [ ] Статьи: 2 карточки статей
- [ ] Каждая статья открывается по /articles/{slug}
- [ ] Контакты: форма + контактная информация + карта
- [ ] 404-страница отображается для несуществующих URL

### Форма
- [ ] Форма на странице контактов имеет все поля: имя, контакт, услуга, сообщение
- [ ] Форма на странице кейса имеет поля: имя, контакт, сообщение (без выбора услуги)
- [ ] data-netlify="true" присутствует
- [ ] Honeypot поле скрыто
- [ ] Клиентская валидация работает (пустое имя, короткий контакт)
- [ ] После успешной отправки показывается сообщение "Спасибо"
- [ ] При ошибке показывается сообщение об ошибке

### Адаптивность
- [ ] На 375px (iPhone SE): все блоки в одну колонку, текст читаемый, ничего не обрезано
- [ ] На 768px (iPad): сетки переходят на 2 колонки
- [ ] На 1024px+: полный десктопный вид, 3 колонки где нужно
- [ ] Изображения не выходят за границы контейнера на мобильных

### SEO
- [ ] Каждая страница имеет уникальный <title>
- [ ] Каждая страница имеет <meta name="description">
- [ ] Open Graph теги присутствуют
- [ ] JSON-LD микроразметка присутствует (WebSite, LocalBusiness)
- [ ] lang="ru" на тег <html>
- [ ] Семантические теги: <header>, <main>, <section>, <article>, <footer>

### Доступность
- [ ] Все img имеют атрибут alt
- [ ] Бургер-кнопка имеет aria-label
- [ ] Поля форм имеют связанные <label>
- [ ] Клавиатурная навигация работает (Tab по ссылкам и кнопкам)

### Производительность
- [ ] Нет внешних CSS-файлов кроме Google Fonts
- [ ] Изображения имеют loading="lazy" (кроме hero)
- [ ] Нет неиспользуемого JavaScript
- [ ] Шрифты подключены с preconnect

Если есть ошибки — исправь их и покажи изменённые файлы.
Часть 4. Инструкция по запуску и деплою
text

### Локальная разработка

1. Клонируй репозиторий:
   git clone https://github.com/weirdsar/sii5.git
   cd sii5

2. Установи зависимости:
   npm install

3. Запусти dev-сервер:
   npm run dev

4. Открой http://localhost:4321

### Деплой на Netlify

1. Подключи репозиторий https://github.com/weirdsar/sii5 к https://app.netlify.com/start/repos/weirdsar
2. Настройки сборки (уже в netlify.toml):
   - Build command: npm run build
   - Publish directory: dist
3. Включи Netlify Forms в настройках сайта (Forms → Enable form detection)
4. При каждом push в main — авто-деплой

### Замена placeholder-изображений

1. Сделай скриншоты сайтов: uzelok64.ru, gidravlika64.ru, volgawhisper.ru, разумныеокна.рф
2. Конвертируй в WebP (можно через squoosh.app), размер ~1200x800
3. Замени файлы в public/images/cases/ (uzelok64-preview.webp и т.д.)
4. Обнови расширения в src/data/cases.ts (.svg → .webp)
5. Добавь реальный OG-image в public/images/og/og-default.webp
Часть 5. Порядок подачи промтов в Cursor
#	Промт	Что создаётся	Проверка
0	Поместить .cursorrules в корень	Контекст проекта	Файл существует
1	Промт 1	Инициализация, конфиги, структура	npm run dev стартует
2	Промт 2	Placeholder-изображения	Файлы в public/images/
3	Промт 3	Типы, данные кейсов, услуг, статей	TypeScript компилируется
4	Промт 4	BaseLayout	Пустая страница рендерится
5	Промт 5	Header + мобильное меню	Навигация, бургер
6	Промт 6	Footer + navigation.ts	Футер отображается
7	Промт 7	Hero	Hero на главной
8	Промт 8	CaseCard, ProjectsGrid, ServicesList, ArticlesPreview, ArticleCard, helpers.ts	Секции главной
9	Промт 9	CTA + index.astro	Главная полностью
10	Промт 10	cases/index.astro	Страница кейсов
11	Промт 11	cases/[slug].astro	Детальные кейсы
12	Промт 12	ServiceCard + services.astro	Страница услуг
13	Промт 13	articles/index + [slug] + prose стили	Страницы статей
14	Промт 14	ContactForm.astro	Форма работает
15	Промт 15	contact.astro	Страница контактов
16	Промт 16	JsonLd.astro + обновления	Микроразметка
17	Промт 17	Обновление [slug].astro	Форма в кейсах
18	Промт 18	404, scroll-reveal, a11y, финал	Полировка
✓	Чеклист	Самопроверка	Всё работает
Примечания по анализу работы Cursor
На что обращать внимание после каждого промта:

Cursor не создал файл → повторить промт с уточнением «Создай файл [путь]»
Импорты не работают → проверить tsconfig.json, алиасы, перезапустить dev-сервер
Tailwind-классы не применяются → проверить content в tailwind.config.mjs
Компонент не рендерится → проверить регистр имени файла (PascalCase)
Форма не отправляется на Netlify → проверить data-netlify="true", hidden input form-name, деплой на Netlify (локально Netlify Forms не работают — нужен netlify dev)
Бургер-меню не работает → проверить id элементов в скрипте, is:inline директиву
Cursor добавил React/Vue → напомнить про .cursorrules — только .astro компоненты
Cursor генерирует не весь файл → попросить «Покажи полный файл от начала до конца»





