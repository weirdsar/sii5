/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Если задан: числа в таблице рассадки только при `?lineup=<точное значение>`. Если не задан — матрица видна всем, скрыть: `?lineup=0` / hide / false. */
  readonly VITE_LINEUP_REVEAL_KEY?: string;
  /** Полный URL API видимости таблицы; иначе `BASE_URL` + `api/lineup-table-visibility`. */
  readonly VITE_LINEUP_TABLE_VISIBILITY_API?: string;
}
