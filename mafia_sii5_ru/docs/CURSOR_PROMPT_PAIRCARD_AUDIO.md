# Промпт для Cursor: аудио на карточке пары (интеграция в проект)

Используй этот блок при доработке **mafia** (`mafia_sii5_ru`) или при переносе логики в **Astro `PairCard.astro`**.

## Реализация в этом репозитории

- **Vanilla TS:** `mafia_sii5_ru/src/pairCardAudio.ts` — `Audio()`, fade in/out, жест пользователя, ленивая подгрузка.
- **Подключение:** `bindPairShowcaseAudio(shell, pairN)` из `main.ts` после создания `.pair-showcase-fx`.
- **Файлы:** `public/content/pair-audio/` + `README.md` с таблицей имён.

---

## Task: Implement Audio Management in PairCard.astro (или эквивалент в Vite)

### Audio Setup

- Добавь проп **`audioSrc`** / карту URL по паре (`ambient` + опционально `hover`).
- В **`<script>`** (или модуле TS) создавай **`new Audio()`** для ambient **по требованию** (не 10 экземпляров при load).
- **`audio.loop = true`**, стартовый **`audio.volume = 0`**.

### Interaction Logic (Vanilla TS)

- **`mouseenter`**: функция **`fadeIn`** — громкость **0 → 0.4** за **300 ms**, затем стабильно держать 0.4 во время hover; **`play()`**.
- **`mouseleave`**: **`fadeOut`** — к **0**, затем **`pause()`**.
- Только **после первого пользовательского жеста** на странице (`pointerdown` / `keydown`) разрешай `play()` (autoplay policy).

### Optimization

- **`preload="none"`** у `Audio`, **`src`** не назначать до «прогрева**: первое движение мыши **возле сетки карточек** или первый **hover** конкретной карточки (чтобы не тянуть все 10 файлов сразу).

### Генерация WAV в `mafia_sii5_ru`

```bash
npm run generate:pair-audio
```

Пишет `public/content/pair-audio/pair-{NN}-{ambient|hover}.wav` (см. `scripts/generate-pair-audio.mjs`). В коде пути — **`.wav`** в `PAIR_AUDIO_BY_N`.

### Звуковая карта (сценарий → файлы по номеру пары на сайте)

См. `public/content/pair-audio/README.md`. Кратко по смыслу (номера **как на сайте** `pairs.ts`):

1. Аделаида и Грейс — орган; шёлк + веер  
2. Энергия и Себастьян — провода; разряд + часы  
3. Лиса и Мечта — лес; цифровой пинг  
4. Hexe и Лелия — камень/вода; погружение  
5. Математик и Нафаня — монеты; казино  
6. Дичь и Блекджек — трава/зверь; затвор  
7. Колючка и Harley Queen — металл; смех + стекло  
8. Sky Lasso и Кот — ветер; ложка + гром  
9. Сексолог и Микки — пульс; свиток + гудок  
10. Дарксайдер и GOLD — гул; гонг  

---

*Звук — часть погружения; в стеке Astro + Vanilla TS важно не грузить всё сразу и не играть до жеста пользователя.*
