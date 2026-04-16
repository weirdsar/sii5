# Деплой sii5 на Cloudflare Pages (вариант без Netlify)

Репозиторий: https://github.com/weirdsar/sii5

## Деплой через GitHub (основной сценарий)

Подключение репозитория к Cloudflare делается через **OAuth** приложения **Cloudflare Workers & Pages** на стороне GitHub — это **одноразово в браузере**, полностью из CLI/API без вашего участия не воспроизвести.

### GitHub

1. Убедитесь, что актуальный код в ветке **`main`** (после `git push`).
2. Откройте **https://github.com/settings/installations** (или **Organization settings → GitHub Apps**, если репозиторий под организацией).
3. Найдите **Cloudflare Workers & Pages** в списке установленных приложений.
4. Нажмите **Configure** и выдайте доступ к репозиторию **`weirdsar/sii5`** (или ко всем репозиториям аккаунта, если так удобнее).

Если приложения ещё нет: его предложит мастер Cloudflare при первом **Connect to Git** (см. ниже).

### Cloudflare Dashboard

1. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Выберите **GitHub**, затем репозиторий **`weirdsar/sii5`**, production branch **`main`**.
3. **Build configuration:**
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (пусто)
   - **Deploy command:** пусто или **`true`** (если поле обязательно).
4. **Environment variables (Production и при необходимости Preview):** см. разделы ниже (`NODE_VERSION`, `PUBLIC_*`, секреты MAX).
5. Сохраните и дождитесь первого **Success** в **Deployments**.

### Если уже есть проект только с Direct Upload (например ранее созданный `sii5`)

Проект, созданный через **Upload assets**, **не заменяется** автоматически на Git-деплой. Варианты:

- **A (предпочтительно):** создать **новый** Pages-проект через **Connect to Git** с тем же репо, перенести **Custom domains** на него, старый direct-upload проект удалить или оставить без домена.
- **B:** в настройках существующего проекта посмотреть, есть ли **Connect Git / Repository** (зависит от UI); если есть — подключить `weirdsar/sii5`.

После Git-деплоя проверьте, что **`functions/api/max-lead-mirror.js`** попадает в сборку: в логе билда не должно быть пропуска каталога `functions/`, на сайте должен отвечать маршрут **`/api/max-lead-mirror`** (не «платформенный» 404).

### GitHub Actions

Отдельный workflow для сборки **не обязателен**: Cloudflare сам выполняет `npm run build` на своих раннерах. Достаточно push в отслеживаемые ветки.

## Критично: не указывайте `wrangler deploy` как команду деплоя

Проект собирается как **чистый SSG** (`output: 'static'` в Astro). На **Cloudflare Pages** после `npm run build` платформа публикует каталог **`dist`** (Git-интеграция сама забирает артефакт сборки).

- **Нельзя** указывать **`npx wrangler deploy`** (деплой **Worker**, не Pages). Wrangler в неинтерактивном режиме может выполнить **`astro add cloudflare`**, включить режим **server** и **повторно** собрать проект в Miniflare — тогда пререндер **Open Graph** (`astro-og-canvas`, `node:path`, `fs`) падает с **`No such module "node:path"`**.
- Если в интерфейсе **Deploy command обязателен** и пустое значение не принимается, укажите **no-op**, который ничего не собирает и не трогает репозиторий:
  - **`true`** (в стандартном Linux-образе CI есть утилита `/usr/bin/true`, код выхода 0), или
  - **`exit 0`**
  Смысл: билд уже сделал **`npm run build`**, выкладка **`dist`** и **Pages Functions** из **`functions/`** выполняется платформой; вторая «умная» команда не нужна.
- Команда **`npx wrangler pages deploy dist`** — это **другой** сценарий (ручная выкладка каталога). Для проекта с **подключённым Git** она обычно **избыточна** и может дублировать деплой; используйте только если так требует ваш конкретный пайплайн, и **не** путайте с **`wrangler deploy`**.

Если Wrangler уже изменил файлы в репозитории (появились `@astrojs/cloudflare`, `wrangler.toml`, правки `astro.config`), откатите эти изменения к варианту из `main` с **`output: 'static'`** и без адаптера Cloudflare.

### Ошибка в логе: после `Success: Build command completed` идёт `npx wrangler deploy`

Типичная последовательность:

1. Первый **`npm run build`** завершается успешно (статический вывод в `dist/`).
2. В логе появляется **`Executing user deploy command: npx wrangler deploy`**.
3. Wrangler запускает автонастройку и снова вызывает **`npm run build`** уже с **`@astrojs/cloudflare`** → сборка падает с **`No such module "node:path"`** в Miniflare при prerender OG.

**Что сделать:** в **Workers & Pages** → ваш проект → **Settings** → **Build** (или **Builds & deployments**) поле **Deploy command** очистить или заменить на **`true`**. Сохранить и запустить **Retry deployment** / новый push. В репозитории менять ничего не нужно, если `astro.config` по-прежнему **`output: 'static'`** без адаптера Cloudflare.

## Что меняется относительно Netlify

- **Сборка:** `npm run build`, каталог вывода **`dist`** (как сейчас).
- **Формы Netlify** на Cloudflare Pages **не работают**. Заявки уходят в **MAX** через функцию **`/api/max-lead-mirror`** (файл `functions/api/max-lead-mirror.js`). Клиент по-прежнему шлёт параллельный POST на `/` для Netlify — на CF это просто не даёт 200; успех определяется по ответу зеркала MAX.
- **Редиректы и заголовки:** дублируются из `netlify.toml` в `public/_redirects` и `public/_headers` для совместимости с Cloudflare Pages.

## Пошагово в панели Cloudflare

1. **Workers & Pages** → **Create** → **Pages** → подключить GitHub-репозиторий `weirdsar/sii5`.
2. **Build settings:**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - **Deploy command:** если поле можно оставить пустым — оставьте пустым; если **обязательно** — укажите **`true`** (см. раздел «Критично» выше).
3. **Переменные среды (Environment variables)** — минимум для сборки Astro:
   - `NODE_VERSION` = `22` (или актуальная LTS, совместимая с `engines` в `package.json`)
   - `PUBLIC_MAX_LEAD_MIRROR_PATH` = `/api/max-lead-mirror` — **обязательно для продакшена на CF**, иначе в бандле останется путь Netlify.
   - Остальные `PUBLIC_*` (Метрика, при необходимости `PUBLIC_MAX_BOT_URL` для локальной отладки) — как на Netlify.
4. **Переменные для Functions** (те же имена, что в `.env.example` для сервера):
   - `MAX_BOT_TOKEN` (или `MAX_PLATFORM_ACCESS_TOKEN`)
   - `MAX_USER_ID` / `MAX_NOTIFY_USER_ID` и/или `MAX_CHAT_ID` / `MAX_NOTIFY_CHAT_ID`
   - либо прокси: `MAX_LEAD_WEBHOOK_URL`, опционально `MAX_LEAD_WEBHOOK_BODY_FORMAT`, при необходимости `PUBLIC_MAX_BOT_URL` как fallback URL для прокси внутри функции  
   Секреты лучше помечать как **Encrypted** в UI Cloudflare.
5. **Домен:** привязать `sii5.ru` (или нужный) в разделе Custom domains; DNS — у регистратора или в Cloudflare.
6. После первого деплоя проверить отправку формы с продакшена и появление сообщения в MAX.

## Полный чеклист «все необходимые настройки»

Сделать в **Dashboard** (подключение Git к GitHub без API-токена с особыми правами не повторить из этого репо):

| # | Где | Что |
|---|-----|-----|
| 1 | **Workers & Pages** → **Create** → **Pages** | Подключить **`weirdsar/sii5`**, ветка продакшена **`main`**. |
| 2 | **Build** | **Build command:** `npm run build` · **Output:** `dist` · **Root:** `/` (пусто). |
| 3 | **Build** | **Deploy command:** пусто или **`true`**. Не **`npx wrangler deploy`**. |
| 4 | **Environment variables (Production)** | `NODE_VERSION` = `22`. |
| 5 | **Environment variables (Production)** | `PUBLIC_MAX_LEAD_MIRROR_PATH` = `/api/max-lead-mirror`. |
| 6 | **Environment variables (Production)** | `PUBLIC_METRIKA_ID` и др. `PUBLIC_*` — как на Netlify. |
| 7 | **Settings → Functions** | Переменные для **`functions/api/max-lead-mirror.js`**: `MAX_BOT_TOKEN` + получатель (`MAX_USER_ID` / `MAX_CHAT_ID` и т.д.) или `MAX_LEAD_WEBHOOK_URL` — **Encrypted**. |
| 8 | **Preview** (опционально) | Те же `PUBLIC_*` и при необходимости тестовые секреты для превью-деплоев. |
| 9 | **Custom domains** | `sii5.ru` / `www` — по инструкции CF, SSL Full (strict) при origin за прокси. |
| 10 | **Первый деплой** | Убедиться, что статус **Success**; открыть сайт, проверить форму и MAX. |

Подключение репозитория по **SSH Deploy Key** делается в **GitHub** (Deploy keys) и/или в мастере подключения Pages — не через `wrangler`.

## API Token: какие права нужны

Токен из **`docs/.cloudflare.env`** с правами только **Read** позволяет **`wrangler whoami`** и чтение списка проектов, но **не** создание проекта и не все изменения настроек: ответ API **`Authentication error [code: 10000]`** означает **недостаточно прав**.

Для **`wrangler pages project create`** и правок через API как минимум:

- **Account** → **Cloudflare Pages** → **Edit** (для нужного аккаунта).

Либо шаблон **Create Custom Token** и вручную отметить **Pages — Edit**. После смены токена снова проверьте: `npx wrangler pages project list`.

## Локальные секреты и Wrangler

- Файл **`docs/.cloudflare.env`** — только на вашей машине, **в git не коммитится** (см. **`.gitignore`**). Имена переменных и комментарии — в **`docs/cloudflare-env.example`**.
- Для **Wrangler** задайте **`CLOUDFLARE_API_TOKEN`** (My Profile → API Tokens). **Global API Key** — устаревший способ для API; не вставляйте ключи в чат и не дублируйте их в репозиторий.
- Подгрузка в терминале (bash/zsh, формат строк `ИМЯ=значение`):

```bash
set -a && source docs/.cloudflare.env && set +a
npx wrangler whoami
# npx wrangler pages project list
```

## Локальная проверка функции

Для полного E2E удобен `wrangler pages dev` (отдельно от Astro dev) или деплой в preview-ветку. В `astro dev` функция Cloudflare не поднимается — для локального теста MAX по-прежнему можно использовать `PUBLIC_MAX_BOT_URL` (прямой вебхук) или `netlify dev` со старым зеркалом.

## Деплой через GitHub Actions (если «build token» в Cloudflare отозван)

Сообщение *«The build token selected for this build has been deleted or rolled»* относится к **встроенной** связке **Cloudflare ↔ GitHub** в настройках Worker/Pages (отдельный токен в панели). Файлы **`docs/.cloudflare.env`** и **`/.cloudflare.env`** на вашем ПК **не участвуют** в этой сборке и их правки **не могут** вызвать эту ошибку — нужно **переподключить GitHub** в **Workers & Pages → Settings → Builds** или перейти на деплой из **GitHub Actions**.

В репозитории есть workflow **`.github/workflows/cloudflare-pages.yml`**:

1. **GitHub** → репозиторий **`weirdsar/sii5`** → **Settings** → **Secrets and variables** → **Actions** → вкладка **Secrets** (не Variables) → **New repository secret**:
   - **`CLOUDFLARE_API_TOKEN`** — API Token с правами **Account → Cloudflare Pages → Edit** (и при необходимости **Workers** для того же аккаунта). Имя секрета должно совпадать **буква в букву**; иначе Wrangler в CI выдаст: *«set a CLOUDFLARE_API_TOKEN environment variable»*.
   - **`CLOUDFLARE_ACCOUNT_ID`** — ID аккаунта (строка из URL дашборда `dash.cloudflare.com/<ACCOUNT_ID>/...`).
   - Секреты нужно добавлять как **Repository secrets**. Если создать только **Environment** secrets без указания `environment:` в workflow, переменные в job **не попадут**.
2. Опционально: **Variables** → **`PUBLIC_METRIKA_ID`** — ID Яндекс.Метрики (как в `.env`), иначе при сборке в Actions может подставиться запасной плейсхолдер из кода.
3. В **Cloudflare Pages** должен существовать проект с именем **`sii5`** (или измените `--project-name` в workflow).
4. Чтобы **не было двойных деплоев**, отключите автосборку из **встроенного Git** в Cloudflare для этого проекта **или** не включайте этот workflow — выберите **один** канал.

Локальные ключи в **`docs/.cloudflare.env`** по-прежнему нужны только для **Wrangler / API с вашего компьютера**, не для Actions.

## Поддомен `mafia.sii5.ru` (отдельный лендинг Vite)

Каталог в репозитории: **`mafia_sii5_ru/`** — лендинг марафона «Созвездие аргументов» (Vite + TypeScript + Tailwind), не связан с основным Astro-сайтом **sii5.ru**. Деплой **вторым** проектом Cloudflare Pages из того же репо **`weirdsar/sii5`**.

| Поле | Значение |
|------|----------|
| **Root directory** (Build → Root directory) | `mafia_sii5_ru` |
| **Build command** | **`npm ci && npm run build`** |
| **Build output directory** | **`dist`** |
| **Deploy command** | пусто или **`true`** — не **`npx wrangler deploy`** |
| **Environment variables** | **`NODE_VERSION`** = **`22`** (как в корневом `package.json`) |

Переменные **`PUBLIC_*`** для Astro здесь не нужны. В **Custom domains** второго проекта — **`mafia.sii5.ru`**; DNS — по мастеру Cloudflare.

Заголовки безопасности: **`mafia_sii5_ru/public/_headers`** (копируется в **`dist/_headers`** при сборке).

### Зеркало на GitHub Pages (бесплатно, не Cloudflare)

Workflow: **`.github/workflows/github-pages-mafia.yml`**. Сборка задаёт **`VITE_BASE=/<имя-репо>/`**, чтобы статика работала по адресу вида **`https://<user>.github.io/<repo>/`** (для репозитория **`sii5`** — **`https://weirdsar.github.io/sii5/`**).

1. **GitHub** → репозиторий **`weirdsar/sii5`** → **Settings** → **Pages** → **Build and deployment** → **Source: GitHub Actions** (один раз).
2. Пуш в **`main`** с изменениями в **`mafia_sii5_ru/`** или вручную: **Actions** → **Deploy mafia to GitHub Pages** → **Run workflow**.
3. После зелёного job — сайт по ссылке из вкладки **Pages** (или см. **deploy → page_url** в логе job **deploy**).

Локально проверить подпуть: **`VITE_BASE=/sii5/ npm run build`** и **`npx vite preview`** (в `vite.config` уже подхвачен `base`).

## Netlify

Файл `netlify.toml` и `netlify/functions/` можно оставить для резервного деплоя или удалить позже, когда миграция закреплена.
