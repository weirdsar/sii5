/**
 * Заявки с сайта → MAX (прямо в Platform API) или прокси на свой HTTPS-вебхук.
 *
 * Прямой MAX (рекомендуется для sii5 без своего PHP):
 *   MAX_BOT_TOKEN — токен из business.max.ru → Чат-боты → Интеграция (заголовок Authorization)
 *   MAX_CHAT_ID или MAX_NOTIFY_CHAT_ID — группа (id может быть отрицательным)
 *   MAX_USER_ID или MAX_NOTIFY_USER_ID — личка (как в Gidra `.deploy/.max.env`; приоритет над chat, как в submit-lead.php)
 *   Значение "0" в env считается «не задано»
 *
 * Прокси (как раньше):
 *   MAX_LEAD_WEBHOOK_URL или PUBLIC_MAX_BOT_URL
 *   MAX_LEAD_WEBHOOK_BODY_FORMAT=json|form
 */

const MAX_API_MESSAGES = 'https://platform-api.max.ru/messages';
const TEXT_LIMIT = 3800;

/** Пусто / отсутствует / "0" — как в PHP Gidra для notify_* */
function envRecipient(...envKeys) {
  for (const key of envKeys) {
    const s = String(process.env[key] ?? '').trim();
    if (s !== '' && s !== '0') {
      return s;
    }
  }
  return '';
}

function parseBody(event) {
  const raw = event.body;
  if (!raw) return { error: 'Empty body' };
  const text = event.isBase64Encoded
    ? Buffer.from(raw, 'base64').toString('utf8')
    : raw;
  try {
    return { data: JSON.parse(text) };
  } catch {
    return { error: 'Invalid JSON' };
  }
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

  // Как Gidra submit-lead.php: user_id > 0 важнее chat_id
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
    body: JSON.stringify({ text, notify: true }),
  });

  const raw = await res.text();
  let detail = raw;
  try {
    detail = JSON.parse(raw);
  } catch {
    /* оставляем строку */
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

export const handler = async (event) => {
  const jsonHeaders = { 'Content-Type': 'application/json' };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...jsonHeaders,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const parsed = parseBody(event);
  if (parsed.error) {
    return { statusCode: 400, headers: jsonHeaders, body: JSON.stringify({ error: parsed.error }) };
  }

  const data = parsed.data;
  const token = String(
    process.env.MAX_BOT_TOKEN || process.env.MAX_PLATFORM_ACCESS_TOKEN || ''
  ).trim();
  const userId = envRecipient('MAX_USER_ID', 'MAX_NOTIFY_USER_ID');
  const chatId = envRecipient('MAX_CHAT_ID', 'MAX_NOTIFY_CHAT_ID');

  const webhookTarget = String(
    process.env.MAX_LEAD_WEBHOOK_URL || process.env.PUBLIC_MAX_BOT_URL || ''
  ).trim();

  const bodyFormat = String(process.env.MAX_LEAD_WEBHOOK_BODY_FORMAT || 'json')
    .toLowerCase()
    .trim();

  try {
    // 1) Прямой MAX Platform API
    if (token && (userId !== '' || chatId !== '')) {
      const text = buildMaxMessageText(data);
      const result = await sendToMaxPlatform(token, chatId, userId, text);
      return {
        statusCode: result.ok ? 200 : result.status >= 400 && result.status < 600 ? result.status : 502,
        headers: jsonHeaders,
        body: JSON.stringify(result.body),
      };
    }

    // 2) Прокси на свой URL
    if (webhookTarget) {
      const bodyText = JSON.stringify(data);
      const result = await proxyWebhook(webhookTarget, bodyText, bodyFormat);
      return {
        statusCode: result.ok ? 200 : result.status,
        headers: jsonHeaders,
        body: JSON.stringify(result.body),
      };
    }

    return {
      statusCode: 503,
      headers: jsonHeaders,
      body: JSON.stringify({
        ok: false,
        error:
          'Configure MAX: set MAX_BOT_TOKEN + MAX_CHAT_ID (or MAX_USER_ID), or set MAX_LEAD_WEBHOOK_URL',
      }),
    };
  } catch (e) {
    console.error('[max-lead-mirror]', e);
    return {
      statusCode: 502,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, error: 'Server error' }),
    };
  }
};
