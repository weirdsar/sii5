/**
 * МАСТЕР-шаблон наложения текста на бланк `docs/Protokol_igry_odnostoronii_774_novyi_774.pdf` → `public/igra.pdf` (на сайте: `/igra.pdf`).
 *
 * Жёсткое правило: не менять здесь координаты, кегли, межстрочные интервалы, цвета и строки шапки
 * без отдельного утверждения макета (иначе поедет совпадение с печатным шаблоном).
 *
 * Разрешено менять только данные вне этого файла:
 * - состав и подписи пар (рассадка / `lineupPdfTeams.ts` и связанные данные).
 *
 * Файл **`public/igra.pdf`** (деплой: **`/igra.pdf`**): **18 страниц** (игры 1…18), каждая — копия печатного шаблона + наложение; порядок страниц = порядку игр.
 */

/**
 * Версия макета наложения. Менять при любом **утверждённом** изменении геометрии/типографики PDF;
 * согласовать с описанием в `docs/LINEUP.md` (раздел про `igra.pdf`).
 */
export const PROTOCOL_PDF_MASTER_VERSION = '2' as const;

/** Сколько игр / листов в одном `igra.pdf` (как столбцов в матрице рассадки). */
export const PROTOCOL_PDF_GAME_COUNT = 18 as const;

/** Тексты шапки (не из `protokol.MD`). */
export const HEADER_TEXT = {
  tournament: 'Созвездие аргументов',
  date: '25/04/2026',
  table: '1',
} as const;

/** Цвет основного текста (наложение), RGB 0…1. */
export const HEADER_BODY_RGB = [0.08, 0.09, 0.12] as const;

/** Поле «после ТУРНИР» + ограничение по первой колонке шапки. */
export const TOURNAMENT_FIELD = {
  headingRightX: 98,
  columnRightFraction: 0.34,
  columnRightMax: 288,
  y: 551.2,
  maxHeight: 18,
  minSize: 8,
  maxSize: 12,
  maxLines: 2,
  lineHeightMult: 1.05,
} as const;

export const DATE_FIELD = {
  x: 72,
  y: 528.3,
  maxWidth: 116,
  maxHeight: 16,
  minSize: 8,
  maxSize: 12,
  maxLines: 1,
} as const;

export const TABLE_NO_FIELD = {
  x: 300,
  y: 528.3,
  maxWidth: 44,
  maxHeight: 16,
  minSize: 8,
  maxSize: 13,
  maxLines: 1,
} as const;

export const GAME_NO_FIELD = {
  x: 369,
  y: 528.3,
  maxWidth: 44,
  maxHeight: 16,
  minSize: 8,
  maxSize: 13,
  maxLines: 1,
} as const;

/**
 * Колонка «Игрок», строки по местам 1…10.
 *
 * **Зафиксированное форматирование** (логика в `scripts/generate-igra-pdf.ts`, числа — только здесь):
 * - один общий кегль строки **`«команда»`** для всех десяти ячеек;
 * - при подборе кегля **сначала** требование: название команды **в одну строку** у всех пар; если невозможно — до **`maxTeamLines`** строк;
 * - строка **`A - B`** всегда **крупнее** команды: кегль фамилий ≥ кегль команды + **`minPlayerFontAboveTeamPt`**;
 * - кегль фамилий по строке подбирается по остатку высоты ячейки в пределах **`minLarge`…`maxLarge`**.
 */
export const PLAYER_COLUMN = {
  colX: 56,
  topGap: 6.8,
  maxW: 120,
  cellH: 29,
  rowBaselineY: [
    472.4, 439.5, 406.6, 373.7, 340.9, 308.0, 275.1, 242.3, 209.4, 176.5,
  ] as const,
  minSmall: 5.2,
  maxSmall: 8.6,
  minLarge: 6.8,
  maxLarge: 11.4,
  maxTeamLines: 2,
  maxPlayerLines: 2,
  gap: 2.4,
  lineHeightMult: 1.06,
  /** Строка фамилий не меньше кегля команды + этот запас (pt), иначе визуально «переворачивается» иерархия. */
  minPlayerFontAboveTeamPt: 1.15,
  /** Включён поиск кегля «команда» с приоритетом одной строки на всех парах. */
  preferTeamNameSingleLineFirst: true,
} as const;

