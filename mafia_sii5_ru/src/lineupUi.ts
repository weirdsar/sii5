/**
 * Секция «Рассадка игроков за столом»: таблица 10 команд × 18 игр, показ мест по URL (см. `isLineupRevealedFromUrl`).
 */

import { assetUrl } from './baseUrl';
import { isLineupRevealedFromUrl, LINEUP_SEATS, lineupTeams } from './lineupSchedule';

function teamLabel(team: { a: string; b: string }): string {
  return `${team.a} — ${team.b}`;
}

/** Запас под padding ячейки и округление субпикселей */
const LINEUP_TEAM_COL_PAD_PX = 28;

/** Интервал опроса общей видимости таблицы (Cloudflare KV), мс. */
const LINEUP_VISIBILITY_POLL_MS = 8000;

/** Ключ localStorage, если API недоступен (статический хостинг / dev без Functions). */
const LINEUP_TABLE_LOCAL_KEY = 'mafia_lineup_table_root_visible';

/**
 * Пароль при недоступном API (совпадает с дефолтом в `functions/api/lineup-table-visibility.js`
 * и с `LINEUP_TABLE_PANEL_PASSWORD` в Cloudflare, если не задан).
 */
const LINEUP_TABLE_PANEL_PASSWORD_FALLBACK = '8888';

function lineupVisibilityEndpoint(): string {
  const custom = import.meta.env.VITE_LINEUP_TABLE_VISIBILITY_API?.trim();
  if (custom) return custom;
  return assetUrl('api/lineup-table-visibility');
}

/** Ширина первой колонки по самому широкому тексту (угол + названия + ники). */
function applyLineupTeamColumnWidth(wrap: HTMLElement): void {
  const table = wrap.querySelector<HTMLElement>('.lineup-table');
  if (!table) return;

  let maxW = 0;
  table
    .querySelectorAll<HTMLElement>(
      '.lineup-table__corner, .lineup-table__team-name, .lineup-table__team-nicks',
    )
    .forEach((el) => {
      maxW = Math.max(maxW, el.scrollWidth);
    });

  const minPx = 168;
  const w = Math.max(Math.ceil(maxW) + LINEUP_TEAM_COL_PAD_PX, minPx);
  wrap.style.setProperty('--lineup-team-col-w', `${w}px`);
}

export function initLineupSection(): void {
  const root = document.getElementById('rassadka-root');
  if (!root || !document.getElementById('rassadka')) return;

  const revealed = isLineupRevealedFromUrl();

  const wrap = document.createElement('div');
  wrap.className = 'lineup-table-wrap';

  const table = document.createElement('table');
  table.className = 'lineup-table';
  table.setAttribute('role', 'grid');
  table.setAttribute(
    'aria-label',
    revealed
      ? 'Рассадка: номер места за столом для каждой команды по играм'
      : 'Рассадка: номера мест в ячейках скрыты до открытия по ссылке от организаторов',
  );

  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  const corner = document.createElement('th');
  corner.className = 'lineup-table__corner';
  corner.scope = 'col';
  corner.textContent = 'Команда \\ раунд';
  hr.append(corner);
  for (let g = 1; g <= 18; g += 1) {
    const th = document.createElement('th');
    th.className = 'lineup-table__game';
    th.scope = 'col';
    th.textContent = String(g);
    th.title = `Игра ${g}: выделить столбец (ещё раз — снять)`;
    th.dataset.lineupGame = String(g);
    th.tabIndex = 0;
    hr.append(th);
  }
  thead.append(hr);
  table.append(thead);

  const tbody = document.createElement('tbody');
  lineupTeams.forEach((team, ti) => {
    const tr = document.createElement('tr');
    tr.dataset.lineupTeam = String(ti);
    const th = document.createElement('th');
    th.className = 'lineup-table__team';
    th.scope = 'row';
    th.dataset.lineupTeam = String(ti);
    th.tabIndex = 0;
    th.title = 'Выделить строку команды по всем играм (ещё раз — снять)';
    const teamName = document.createElement('span');
    teamName.className = 'lineup-table__team-name';
    teamName.textContent = `«${team.teamName}»`;
    const nicks = document.createElement('span');
    nicks.className = 'lineup-table__team-nicks';
    nicks.textContent = teamLabel(team);
    th.append(teamName, nicks);
    tr.append(th);

    const row = LINEUP_SEATS[ti];
    for (let gi = 0; gi < 18; gi += 1) {
      const td = document.createElement('td');
      td.className = 'lineup-table__cell';
      const v = row?.[gi];
      const num = typeof v === 'number' && v >= 1 && v <= 10 ? v : null;
      if (revealed && num !== null) {
        td.textContent = String(num);
        td.setAttribute('aria-label', `Игра ${gi + 1}, место ${num}`);
      } else {
        td.textContent = '—';
        td.classList.add('lineup-table__cell--masked');
        td.setAttribute('aria-label', revealed ? 'Нет данных' : 'Скрыто');
      }
      td.dataset.lineupGame = String(gi + 1);
      td.title = `Игра ${gi + 1}: выделить столбец`;
      tr.append(td);
    }
    tbody.append(tr);
  });
  table.append(tbody);

  wrap.append(table);
  root.replaceChildren(wrap);

  const scheduleTeamColMeasure = (): void => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => applyLineupTeamColumnWidth(wrap));
    });
  };
  scheduleTeamColMeasure();
  void document.fonts?.ready?.then(() => scheduleTeamColMeasure());

  let resizeT = 0;
  const onWinResize = (): void => {
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(() => applyLineupTeamColumnWidth(wrap), 120);
  };
  window.addEventListener('resize', onWinResize, { passive: true });

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => onWinResize());
    ro.observe(wrap);
  }

  const section = document.getElementById('rassadka');
  const tableToggle = document.getElementById('rassadka-table-toggle');
  if (section && tableToggle) {
    const syncToggleLabel = (tableHidden: boolean): void => {
      tableToggle.textContent = tableHidden ? 'Показать таблицу' : 'Скрыть таблицу';
      tableToggle.title = tableHidden
        ? 'Показать таблицу рассадки (общее для всех посетителей после ввода пароля)'
        : 'Скрыть таблицу рассадки для всех посетителей (нужен пароль)';
      tableToggle.setAttribute(
        'aria-label',
        tableHidden ? 'Показать таблицу рассадки' : 'Скрыть таблицу рассадки',
      );
    };

    const applyTableRootVisibility = (visible: boolean): void => {
      const hidden = !visible;
      const wasHidden = section.classList.contains('rassadka--table-hidden');
      if (hidden) section.classList.add('rassadka--table-hidden');
      else section.classList.remove('rassadka--table-hidden');
      syncToggleLabel(hidden);
      tableToggle.setAttribute('aria-expanded', hidden ? 'false' : 'true');
      /* Замер колонки только при открытии блока; иначе опрос KV каждые 8 с снова меряет scrollWidth
         внутри уже суженных sticky-ячеек и «уезжает» ширина вправо/всё уже. */
      if (visible && wasHidden) scheduleTeamColMeasure();
    };

    const fetchVisibilityRemote = async (): Promise<{ visible: boolean; ok: boolean }> => {
      try {
        const r = await fetch(lineupVisibilityEndpoint(), { cache: 'no-store' });
        if (!r.ok) return { visible: false, ok: false };
        const d = (await r.json()) as { visible?: boolean };
        return { visible: d.visible === true, ok: true };
      } catch {
        return { visible: false, ok: false };
      }
    };

    const readLocalVisibility = (): boolean => {
      try {
        return window.localStorage.getItem(LINEUP_TABLE_LOCAL_KEY) === '1';
      } catch {
        return false;
      }
    };

    const writeLocalVisibility = (v: boolean): void => {
      try {
        window.localStorage.setItem(LINEUP_TABLE_LOCAL_KEY, v ? '1' : '0');
      } catch {
        /* хранилище недоступно */
      }
    };

    /** Уже получали успешный ответ GET — не откатываемся на localStorage при сбое сети. */
    let remoteVisibilityAvailable = false;

    const pullAndApply = async (): Promise<void> => {
      const rem = await fetchVisibilityRemote();
      if (rem.ok) {
        remoteVisibilityAvailable = true;
        applyTableRootVisibility(rem.visible);
        return;
      }
      if (!remoteVisibilityAvailable) {
        applyTableRootVisibility(readLocalVisibility());
      }
    };

    void pullAndApply();
    window.setInterval(() => {
      void pullAndApply();
    }, LINEUP_VISIBILITY_POLL_MS);

    window.addEventListener('storage', (e) => {
      if (!remoteVisibilityAvailable && e.key === LINEUP_TABLE_LOCAL_KEY && e.newValue !== null) {
        applyTableRootVisibility(e.newValue === '1');
      }
    });

    let posting = false;
    tableToggle.addEventListener('click', () => {
      void (async () => {
        if (posting) return;
        const input = window.prompt('Пароль для показа или скрытия таблицы рассадки:');
        if (input === null) return;
        const wantVisible = section.classList.contains('rassadka--table-hidden');
        posting = true;
        try {
          let r: Response;
          try {
            r = await fetch(lineupVisibilityEndpoint(), {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ password: input, visible: wantVisible }),
            });
          } catch {
            if (remoteVisibilityAvailable) return;
            if (input !== LINEUP_TABLE_PANEL_PASSWORD_FALLBACK) return;
            writeLocalVisibility(wantVisible);
            applyTableRootVisibility(wantVisible);
            return;
          }

          let data: { visible?: boolean } = {};
          try {
            data = (await r.json()) as { visible?: boolean };
          } catch {
            /* пустой ответ */
          }

          if (r.ok) {
            remoteVisibilityAvailable = true;
            const v = typeof data.visible === 'boolean' ? data.visible : wantVisible;
            applyTableRootVisibility(v);
            return;
          }
          if (r.status === 401) return;
          if (input !== LINEUP_TABLE_PANEL_PASSWORD_FALLBACK) return;
          writeLocalVisibility(wantVisible);
          applyTableRootVisibility(wantVisible);
        } finally {
          posting = false;
        }
      })();
    });
  }

  let activeGameCol: number | null = null;
  /** Индекс команды 0…9; независим от выбранного столбца. */
  let activeTeamRow: number | null = null;

  const clearColumnHighlight = (): void => {
    wrap.querySelectorAll('.lineup-col--active').forEach((el) => {
      el.classList.remove('lineup-col--active');
    });
    wrap.removeAttribute('data-lineup-active-col');
    activeGameCol = null;
  };

  const applyColumnHighlight = (game1Based: number): void => {
    clearColumnHighlight();
    activeGameCol = game1Based;
    wrap.setAttribute('data-lineup-active-col', String(game1Based));
    wrap.querySelectorAll(`[data-lineup-game="${game1Based}"]`).forEach((el) => {
      el.classList.add('lineup-col--active');
    });
  };

  const clearRowHighlight = (): void => {
    wrap.querySelectorAll('tr.lineup-row--active').forEach((el) => {
      el.classList.remove('lineup-row--active');
    });
    wrap.removeAttribute('data-lineup-active-row');
    activeTeamRow = null;
  };

  const applyRowHighlight = (teamIndex: number): void => {
    clearRowHighlight();
    activeTeamRow = teamIndex;
    wrap.setAttribute('data-lineup-active-row', String(teamIndex));
    const row = wrap.querySelector(`tr[data-lineup-team="${teamIndex}"]`);
    row?.classList.add('lineup-row--active');
  };

  wrap.addEventListener('click', (e) => {
    const t = e.target as HTMLElement | null;
    if (!t || !wrap.contains(t)) return;

    const teamCell = t.closest('.lineup-table__team');
    if (teamCell && wrap.contains(teamCell)) {
      const ti = Number((teamCell as HTMLElement).dataset.lineupTeam);
      if (!Number.isInteger(ti) || ti < 0 || ti > 9) return;
      if (activeTeamRow === ti) clearRowHighlight();
      else applyRowHighlight(ti);
      return;
    }

    const hit = t.closest('[data-lineup-game]');
    if (!hit || !wrap.contains(hit)) return;
    const g = Number((hit as HTMLElement).dataset.lineupGame);
    if (!Number.isInteger(g) || g < 1 || g > 18) return;
    if (activeGameCol === g) clearColumnHighlight();
    else applyColumnHighlight(g);
  });

  wrap.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target as HTMLElement | null;
    if (!t || !wrap.contains(t)) return;
    if (t.classList.contains('lineup-table__team')) {
      e.preventDefault();
      const ti = Number(t.dataset.lineupTeam);
      if (!Number.isInteger(ti) || ti < 0 || ti > 9) return;
      if (activeTeamRow === ti) clearRowHighlight();
      else applyRowHighlight(ti);
      return;
    }
    if (!t.classList.contains('lineup-table__game')) return;
    e.preventDefault();
    const g = Number(t.dataset.lineupGame);
    if (!Number.isInteger(g) || g < 1 || g > 18) return;
    if (activeGameCol === g) clearColumnHighlight();
    else applyColumnHighlight(g);
  });
}
