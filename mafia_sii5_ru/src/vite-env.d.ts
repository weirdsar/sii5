/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Если задан, показ рассадки только при `?lineup=<это значение>` (или showLineup). */
  readonly VITE_LINEUP_REVEAL_KEY?: string;
  /** Полный URL API видимости таблицы; иначе `BASE_URL` + `api/lineup-table-visibility`. */
  readonly VITE_LINEUP_TABLE_VISIBILITY_API?: string;
}
