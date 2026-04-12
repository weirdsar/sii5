/**
 * Клиентская отправка: Netlify Forms + зеркало MAX (см. ContactForm / BriefForm).
 * Подключается из BaseLayout; формы остаются без inline-скриптов.
 */
import { getMaxLeadMirrorPath, getPublicMaxBotUrl } from '../data/env-public';

type MaxMirrorResult = { ok: boolean; skipped?: boolean; status?: number };

/** Netlify Forms: тело как `application/x-www-form-urlencoded` (совместимо с TS DOM typings). */
function formDataToUrlEncodedBody(fd: FormData): string {
  const p = new URLSearchParams();
  for (const [key, value] of fd.entries()) {
    if (typeof value === 'string') p.append(key, value);
  }
  return p.toString();
}

function resolveMaxLeadUrl(): string {
  let h = '';
  try {
    h = window.location.hostname || '';
  } catch {
    /* ignore */
  }
  const local = h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  const maxBotUrl = getPublicMaxBotUrl();
  const maxLeadMirrorPath = getMaxLeadMirrorPath();
  if (local) return maxBotUrl || '';
  return maxLeadMirrorPath;
}

async function postMaxMirror(
  maxUrl: string,
  payload: Record<string, string>
): Promise<MaxMirrorResult> {
  if (!maxUrl) return { ok: true, skipped: true };
  try {
    const res = await fetch(maxUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    const txt = await res.text();
    if (!res.ok) {
      console.warn('[lead-forms] max-lead-mirror', res.status, txt);
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.warn('[lead-forms] max-lead-mirror network', err);
    return { ok: false };
  }
}

function applyServiceQueryParamPrefill(): void {
  const params = new URLSearchParams(window.location.search);
  const serviceParam = params.get('service');
  if (!serviceParam) return;
  const tariffToOption: Record<string, string> = {
    start: 'landing',
    business: 'corporate',
    vip: 'custom',
  };
  const selectValue = tariffToOption[serviceParam] ?? serviceParam;
  document.querySelectorAll('select[name="service"]').forEach((select) => {
    if (!(select instanceof HTMLSelectElement)) return;
    const option = Array.from(select.options).find((o) => o.value === selectValue);
    if (option) select.value = selectValue;
  });
}

export function initContactForms(): void {
  applyServiceQueryParamPrefill();

  const forms = document.querySelectorAll<HTMLFormElement>('form[data-contact-form]');
  forms.forEach((form) => {
    if (form.dataset.vtFormBound === '1') return;
    form.dataset.vtFormBound = '1';

    const formName = form.getAttribute('name');
    const btnText = form.querySelector('.btn-text');
    const btnSpinner = form.querySelector('.btn-spinner');
    const submitBtn = form.querySelector('button[type="submit"]');
    const successEl = document.querySelector(
      `.form-success[data-form="${formName}"]`
    );
    const errorEl = document.querySelector(`.form-error[data-form="${formName}"]`);

    if (!formName || !btnText || !btnSpinner || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const botField = form.querySelector('[name="bot-field"]');
      const gotchaField = form.querySelector('[name="_gotcha"]');
      const botFilled =
        (botField instanceof HTMLInputElement && botField.value.trim() !== '') ||
        (gotchaField instanceof HTMLInputElement && gotchaField.value.trim() !== '');
      if (botFilled) {
        console.log('[lead-forms] Honeypot triggered — simulated success, Netlify/MAX not called');
        return;
      }

      const nameInput = form.querySelector('[name="name"]');
      const contactInput = form.querySelector('[name="contact"]');
      const nameVal = nameInput instanceof HTMLInputElement ? nameInput.value.trim() : '';
      const contactVal = contactInput instanceof HTMLInputElement ? contactInput.value.trim() : '';

      if (!nameVal || nameVal.length < 2) {
        alert('Пожалуйста, укажите ваше имя');
        return;
      }
      if (!contactVal || contactVal.length < 5) {
        alert('Пожалуйста, укажите телефон или email');
        return;
      }

      const privacyCheckbox = form.querySelector('[name="privacy-consent"]');
      if (privacyCheckbox instanceof HTMLInputElement && !privacyCheckbox.checked) {
        alert('Необходимо согласие с Политикой конфиденциальности');
        privacyCheckbox.focus();
        return;
      }

      btnText.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
      (submitBtn as HTMLButtonElement).disabled = true;

      const formData = new FormData(form);
      const messageEl = form.querySelector('[name="message"]');
      const maxPayload: Record<string, string> = {
        name: nameVal,
        contact: contactVal,
        message: messageEl instanceof HTMLTextAreaElement ? messageEl.value.trim() : '',
      };
      const serviceField = form.querySelector('[name="service"]');
      if (serviceField instanceof HTMLSelectElement) {
        maxPayload.service = serviceField.value;
      }
      const sourceField = form.querySelector<HTMLInputElement>('[name="source"]');
      if (sourceField?.value) {
        maxPayload.source = sourceField.value;
      }

      const maxUrl = resolveMaxLeadUrl();

      try {
        const maxPromise = postMaxMirror(maxUrl, maxPayload);
          const netlifyPromise = fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formDataToUrlEncodedBody(formData),
          });
        const results = await Promise.all([maxPromise, netlifyPromise]);
        const maxResult = results[0];
        const response = results[1];

        const netlifyOk = response.ok;
        const mirrorDelivered =
          maxResult.ok === true && maxResult.skipped !== true;
        if (netlifyOk || mirrorDelivered) {
          form.classList.add('hidden');
          if (successEl) {
            successEl.classList.remove('hidden');
            const maxWarn = successEl.querySelector('[data-max-warning]');
            if (maxWarn && maxUrl && maxResult.ok !== true) {
              maxWarn.classList.remove('hidden');
            }
          }
        } else {
          throw new Error('Ошибка отправки');
        }
      } catch (err) {
        console.error('[lead-forms] ContactForm error:', err);
        if (errorEl) errorEl.classList.remove('hidden');
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
        (submitBtn as HTMLButtonElement).disabled = false;
      }
    });
  });
}

const BRIEF_FORM_ID = 'brief-form-project-brief';

export function initBriefForm(): void {
  const form = document.getElementById(BRIEF_FORM_ID);
  if (!(form instanceof HTMLFormElement) || form.dataset.vtBound === '1') return;
  form.dataset.vtBound = '1';

  const btnText = form.querySelector('.brief-btn-text');
  const btnSpinner = form.querySelector('.brief-btn-spinner');
  const submitBtn = form.querySelector('button[type="submit"]');
  const successEl = document.querySelector('.form-success[data-form="project-brief"]');
  const errorEl = document.querySelector('.form-error[data-form="project-brief"]');

  if (!btnText || !btnSpinner || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const botField = form.querySelector('[name="bot-field"]');
    const gotcha = form.querySelector('[name="_gotcha"]');
    if (
      (botField instanceof HTMLInputElement && botField.value.trim() !== '') ||
      (gotcha instanceof HTMLInputElement && gotcha.value.trim() !== '')
    ) {
      return;
    }

    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const contact = String(fd.get('contact') || '').trim();
    if (name.length < 2 || contact.length < 5) {
      alert('Укажите имя и контакт');
      return;
    }
    const privacy = form.querySelector('[name="privacy-consent"]');
    if (privacy instanceof HTMLInputElement && !privacy.checked) {
      alert('Нужно согласие с политикой');
      return;
    }

    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    (submitBtn as HTMLButtonElement).disabled = true;

    const lines = [
      'Форма: бриф проекта',
      `Компания: ${fd.get('company') || ''}`,
      `Тип: ${fd.get('project_type') || ''}`,
      `Цели: ${fd.get('goals') || ''}`,
      `Страницы/функции: ${fd.get('pages_features') || ''}`,
      `Сроки: ${fd.get('deadline') || ''}`,
      `Бюджет: ${fd.get('budget') || ''}`,
      `Референсы: ${fd.get('references') || ''}`,
      `Дополнительно: ${fd.get('extra') || ''}`,
    ];
    const messageBody = lines.join('\n');

    const maxUrl = resolveMaxLeadUrl();
    const maxPayload: Record<string, string> = {
      name,
      contact,
      message: messageBody,
      service: 'project-brief',
      source: 'Страница /brief',
    };

    try {
      const maxP = postMaxMirror(maxUrl, maxPayload);
      const netlifyP = fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formDataToUrlEncodedBody(fd),
      });
      const pair = await Promise.all([maxP, netlifyP]);
      const maxResult = pair[0];
      const res = pair[1];
      const netlifyOk = res.ok;
      const mirrorDelivered = maxResult.ok === true && maxResult.skipped !== true;
      if (netlifyOk || mirrorDelivered) {
        form.classList.add('hidden');
        if (successEl) {
          successEl.classList.remove('hidden');
          const mw = successEl.querySelector('[data-max-warning]');
          if (mw && maxUrl && maxResult.ok !== true) {
            mw.classList.remove('hidden');
          }
        }
      } else {
        throw new Error('netlify');
      }
    } catch (err) {
      console.error('[lead-forms] BriefForm error:', err);
      if (errorEl) errorEl.classList.remove('hidden');
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      (submitBtn as HTMLButtonElement).disabled = false;
    }
  });
}

/** Вызывать на каждом `astro:page-load` (View Transitions). */
export function initLeadForms(): void {
  initContactForms();
  initBriefForm();
}
