/**
 * Прогноз на даты марафона: запрос к Open-Meteo при каждой загрузке страницы (без API-ключа).
 * Координаты — окрестности с. Усовка (Саратовская об.), ~VolgaWhisper; часовой пояс мероприятия.
 */

const MARATHON_DATES = ['2026-04-25', '2026-04-26'] as const;
const LAT = 51.47;
const LON = 45.98;
const FETCH_TIMEOUT_MS = 9000;

type DailyPayload = {
  time: string[];
  weathercode: (number | null)[];
  temperature_2m_max: (number | null)[];
  temperature_2m_min: (number | null)[];
  precipitation_probability_max: (number | null)[];
};

type OpenMeteoForecast = {
  daily?: DailyPayload;
};

/** Краткие подписи к кодам WMO (как в Open-Meteo). */
function weatherCodeRu(code: number | null): string {
  if (code === null || Number.isNaN(code)) return '—';
  if (code === 0) return 'Ясно';
  if (code === 1) return 'Преимущественно ясно';
  if (code === 2) return 'Переменная облачность';
  if (code === 3) return 'Пасмурно';
  if (code === 45 || code === 48) return 'Туман';
  if (code >= 51 && code <= 55) return 'Морось';
  if (code === 56 || code === 57) return 'Ледяная морось';
  if (code === 61 || code === 63 || code === 65) return 'Дождь';
  if (code === 66 || code === 67) return 'Ледяной дождь';
  if (code === 71 || code === 73 || code === 75) return 'Снег';
  if (code === 77) return 'Снежные зёрна';
  if (code === 80 || code === 81 || code === 82) return 'Ливень';
  if (code === 85 || code === 86) return 'Снегопад';
  if (code === 95) return 'Гроза';
  if (code === 96 || code === 99) return 'Гроза с градом';
  return 'Осадки / облачность';
}

function formatDayLabel(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = Number(m[3]);
  const mo = Number(m[2]);
  const months = [
    'янв',
    'фев',
    'мар',
    'апр',
    'мая',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
  ];
  return `${d} ${months[mo - 1] ?? ''}`.trim();
}

function roundTemp(v: number | null): string {
  if (v === null || Number.isNaN(v)) return '—';
  return `${Math.round(v)}°`;
}

function buildForecastUrl(): string {
  const p = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    daily: [
      'weathercode',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
    ].join(','),
    timezone: 'Europe/Saratov',
    forecast_days: '16',
  });
  return `https://api.open-meteo.com/v1/forecast?${p.toString()}`;
}

async function fetchJson(url: string): Promise<OpenMeteoForecast> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as OpenMeteoForecast;
  } finally {
    window.clearTimeout(t);
  }
}

function renderRows(
  root: HTMLElement,
  rows: { label: string; desc: string; max: string; min: string; precip: string }[],
): void {
  root.replaceChildren();
  for (const r of rows) {
    const row = document.createElement('div');
    row.className = 'hero-weather-widget__row';

    const day = document.createElement('span');
    day.className = 'hero-weather-widget__day';
    day.textContent = r.label;

    const temps = document.createElement('span');
    temps.className = 'hero-weather-widget__temps';
    temps.title = 'макс. / мин.';
    temps.textContent = `${r.max} / ${r.min}`;

    const desc = document.createElement('span');
    desc.className = 'hero-weather-widget__desc';
    desc.textContent = r.desc;

    const precip = document.createElement('span');
    precip.className = 'hero-weather-widget__precip';
    precip.textContent = r.precip;

    row.append(day, temps, desc, precip);
    root.append(row);
  }
}

export function initHeroWeatherForecast(): void {
  const body = document.getElementById('hero-weather-widget-body');
  const widget = document.getElementById('hero-weather-widget');
  if (!body) return;

  const setBusy = (busy: boolean): void => {
    if (widget) widget.setAttribute('aria-busy', busy ? 'true' : 'false');
  };

  void (async () => {
    try {
      const data = await fetchJson(buildForecastUrl());
      const daily = data.daily;
      if (!daily?.time?.length) {
        body.textContent = 'Прогноз временно недоступен.';
        return;
      }

      const idx = (iso: string): number => daily.time.indexOf(iso);
      const rows: { label: string; desc: string; max: string; min: string; precip: string }[] = [];

      for (const date of MARATHON_DATES) {
        const i = idx(date);
        if (i < 0) {
          rows.push({
            label: formatDayLabel(date),
            desc: 'нет в текущем горизонте',
            max: '—',
            min: '—',
            precip: '',
          });
          continue;
        }

        const wc = daily.weathercode[i] ?? null;
        const tMax = daily.temperature_2m_max[i] ?? null;
        const tMin = daily.temperature_2m_min[i] ?? null;
        const pMax = daily.precipitation_probability_max[i] ?? null;

        let precip = '';
        if (pMax !== null && !Number.isNaN(pMax)) {
          precip = `осадки до ${Math.round(pMax)}%`;
        }

        rows.push({
          label: formatDayLabel(date),
          desc: weatherCodeRu(wc),
          max: roundTemp(tMax),
          min: roundTemp(tMin),
          precip,
        });
      }

      renderRows(body, rows);
    } catch {
      body.textContent = 'Не удалось загрузить прогноз. Обновите страницу позже.';
    } finally {
      setBusy(false);
    }
  })();
}
