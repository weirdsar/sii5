/**
 * Общая для всех посетителей видимость блока таблицы рассадки (Cloudflare Pages + KV).
 * Привязка KV в проекте Pages: имя binding — LINEUP_TABLE_KV, ключ хранится внутри функции.
 * Опционально: секрет LINEUP_TABLE_PANEL_PASSWORD (иначе по умолчанию 8888).
 */

const KV_KEY = 'lineup_table_root_visible';

/** @param {unknown} data @param {number} [status] */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export async function onRequestGet({ env }) {
  if (!env.LINEUP_TABLE_KV) {
    return json({ error: 'kv_unconfigured' }, 503);
  }
  const v = await env.LINEUP_TABLE_KV.get(KV_KEY);
  return json({ visible: v === '1' });
}

export async function onRequestPost({ env, request }) {
  if (!env.LINEUP_TABLE_KV) {
    return json({ error: 'kv_unconfigured' }, 503);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const secretRaw = env.LINEUP_TABLE_PANEL_PASSWORD;
  const secret =
    typeof secretRaw === 'string' && secretRaw.trim() !== '' ? secretRaw.trim() : '8888';
  if (body.password !== secret) {
    return json({ error: 'unauthorized' }, 401);
  }
  if (typeof body.visible !== 'boolean') {
    return json({ error: 'bad_visible' }, 400);
  }
  await env.LINEUP_TABLE_KV.put(KV_KEY, body.visible ? '1' : '0');
  return json({ visible: body.visible });
}
