export interface NewsletterValues {
  email?: string;
}

export type NewsletterLocale = 'en' | 'ja';

const messages = {
  en: {
    loading: 'Subscribing…',
    success: 'Thank you for subscribing.',
    unavailable: 'Newsletter signup is not configured yet.',
    invalidEmail: 'Enter a valid email address.',
    error: 'Subscription could not be confirmed.',
  },
  ja: {
    loading: '登録しています…',
    success: 'ご登録ありがとうございます。',
    unavailable: 'ニュースレターの登録は現在準備中です。',
    invalidEmail: '有効なメールアドレスを入力してください。',
    error: '登録を確認できませんでした。',
  },
} as const;

export type NewsletterState =
  | { status: 'idle'; message: '' }
  | { status: 'loading'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
  | { status: 'unavailable'; message: string };

export function validateNewsletter({ email = '' }: NewsletterValues, locale: NewsletterLocale = 'en') {
  return /^\S+@\S+\.\S+$/.test(email.trim()) ? {} : { email: messages[locale].invalidEmail };
}

export function newsletterState(endpoint?: string, locale: NewsletterLocale = 'en'): NewsletterState {
  return endpoint?.trim()
    ? { status: 'idle', message: '' }
    : { status: 'unavailable', message: messages[locale].unavailable };
}

export async function submitNewsletter(form: HTMLFormElement, locale: NewsletterLocale = 'en') {
  const endpoint = form.dataset.endpoint?.trim();
  if (!endpoint) throw new Error(messages[locale].unavailable);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) throw new Error(messages[locale].error);
}

export function initNewsletterForms(root: ParentNode = document) {
  root.querySelectorAll<HTMLFormElement>('[data-newsletter-form]').forEach((form) => {
    const status = form.querySelector<HTMLElement>('[data-newsletter-status]');
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
    const locale: NewsletterLocale = form.dataset.newsletterLocale === 'ja' ? 'ja' : 'en';

    form.addEventListener('invalid', () => {
      const error = validateNewsletter({ email: new FormData(form).get('email')?.toString() }, locale);
      if (status && error.email) status.textContent = error.email;
    }, true);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const error = validateNewsletter({ email: new FormData(form).get('email')?.toString() }, locale);
      if (error.email) {
        if (status) status.textContent = error.email;
        return;
      }

      const state = newsletterState(form.dataset.endpoint, locale);
      if (state.status === 'unavailable') {
        if (status) status.textContent = state.message;
        return;
      }

      if (status) status.textContent = messages[locale].loading;
      if (submit) submit.disabled = true;
      try {
        await submitNewsletter(form, locale);
        if (status) status.textContent = messages[locale].success;
        form.reset();
      } catch (error) {
        if (status) status.textContent = error instanceof Error ? error.message : messages[locale].error;
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });
}
