/**
 * Cloudflare Pages Function: заявки с сайта → MAX (как netlify/functions/max-lead-mirror.mjs).
 * Маршрут: POST /api/max-lead-mirror
 *
 * Секреты в Cloudflare Pages → Settings → Variables: те же имена, что в .env.example (MAX_BOT_TOKEN и т.д.).
 */

const MAX_API_MESSAGES = 'https://platform-api.max.ru/messages';
const TEXT_LIMIT = 3800;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Пусто / отсутствует / "0" — как в Netlify-версии */
function envRecipient(env, ...keys) {
  for (const key of keys) {
    const s = String(env[key] ?? '').trim();
    if (s !== '' && s !== '0') {
      return s;
    }
  }
  return '';
}

function buildMaxMessageText(data) {
  const name = String(data.name ?? '').trim();
  const contact = String(data.contact ?? '').trim();
  const message = String(data.message ?? '').trim();
  const service = String(data.service ?? '').trim();
  const source = String(data.source ?? '').trim();

  const lines = [
    'Заявка с сайта sii5.ru',
    '',
    `Имя: ${name || '—'}`,
    `Контакт: ${contact || '—'}`,
  ];
  if (service) lines.push(`Услуга / тип: ${service}`);
  if (source) lines.push(`Источник: ${source}`);
  lines.push('', 'Сообщение:', message || '—');

  let text = lines.join('\n');
  if (text.length > TEXT_LIMIT) {
    text = text.slice(0, TEXT_LIMIT) + '\n…';
  }
  return text;
}

async function sendToMaxPlatform(token, chatIdRaw, userIdRaw, text) {
  const params = new URLSearchParams();
  const chatId = String(chatIdRaw ?? '').trim();
  const userId = String(userIdRaw ?? '').trim();

  if (userId !== '') {
    params.set('user_id', userId);
  } else if (chatId !== '') {
    params.set('chat_id', chatId);
  } else {
    return {
      ok: false,
      status: 503,
      body: { error: 'Set MAX_USER_ID / MAX_NOTIFY_USER_ID or MAX_CHAT_ID / MAX_NOTIFY_CHAT_ID' },
    };
  }

  const url = `${MAX_API_MESSAGES}?${params.toString()}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, notify: true, format: 'markdown' }),
  });

  const raw = await res.text();
  let detail = raw;
  try {
    detail = JSON.parse(raw);
  } catch {
    /* строка */
  }

  if (!res.ok) {
    console.error('[max-lead-mirror] MAX API error', res.status, detail);
  }

  return {
    ok: res.ok,
    status: res.status,
    body: res.ok ? { ok: true, channel: 'max' } : { ok: false, status: res.status, max: detail },
  };
}

async function proxyWebhook(target, bodyText, bodyFormat) {
  if (bodyFormat === 'form' || bodyFormat === 'urlencoded') {
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch {
      return { ok: false, status: 400, body: { error: 'Invalid JSON body' } };
    }
    const params = new URLSearchParams();
    for (const key of ['name', 'contact', 'message', 'service', 'source']) {
      const v = data[key];
      if (v != null && String(v).trim() !== '') {
        params.append(key, String(v));
      }
    }
    const upstream = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    return {
      ok: upstream.ok,
      status: upstream.ok ? 200 : 502,
      body: { ok: upstream.ok, status: upstream.status, channel: 'webhook' },
    };
  }

  const upstream = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyText,
  });
  return {
    ok: upstream.ok,
    status: upstream.ok ? 200 : 502,
    body: { ok: upstream.ok, status: upstream.status, channel: 'webhook' },
  };
}

export async function onRequest(context) {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    ...CORS,
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: jsonHeaders });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  let data;
  try {
    data = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  const env = context.env;
  const token = String(
    env.MAX_BOT_TOKEN || env.MAX_PLATFORM_ACCESS_TOKEN || ''
  ).trim();
  const userId = envRecipient(env, 'MAX_USER_ID', 'MAX_NOTIFY_USER_ID');
  const chatId = envRecipient(env, 'MAX_CHAT_ID', 'MAX_NOTIFY_CHAT_ID');

  const webhookTarget = String(
    env.MAX_LEAD_WEBHOOK_URL || env.PUBLIC_MAX_BOT_URL || ''
  ).trim();

  const bodyFormat = String(env.MAX_LEAD_WEBHOOK_BODY_FORMAT || 'json')
    .toLowerCase()
    .trim();

  try {
    if (token && (userId !== '' || chatId !== '')) {
      const text = buildMaxMessageText(data);
      const result = await sendToMaxPlatform(token, chatId, userId, text);
      const code = result.ok
        ? 200
        : result.status >= 400 && result.status < 600
          ? result.status
          : 502;
      return new Response(JSON.stringify(result.body), {
        status: code,
        headers: jsonHeaders,
      });
    }

    if (webhookTarget) {
      const bodyText = JSON.stringify(data);
      const result = await proxyWebhook(webhookTarget, bodyText, bodyFormat);
      return new Response(JSON.stringify(result.body), {
        status: result.ok ? 200 : result.status,
        headers: jsonHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error:
          'Configure MAX: set MAX_BOT_TOKEN + MAX_CHAT_ID (or MAX_USER_ID), or set MAX_LEAD_WEBHOOK_URL',
      }),
      { status: 503, headers: jsonHeaders }
    );
  } catch (e) {
    console.error('[max-lead-mirror]', e);
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), {
      status: 502,
      headers: jsonHeaders,
    });
  }
}
