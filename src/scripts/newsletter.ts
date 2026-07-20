export interface NewsletterValues {
  email?: string;
}

export type NewsletterState =
  | { status: 'idle'; message: '' }
  | { status: 'loading'; message: 'Subscribing…' }
  | { status: 'success'; message: 'Thank you for subscribing.' }
  | { status: 'error'; message: string }
  | { status: 'unavailable'; message: 'Newsletter signup is not configured yet.' };

export function validateNewsletter({ email = '' }: NewsletterValues) {
  return /^\S+@\S+\.\S+$/.test(email.trim()) ? {} : { email: 'Enter a valid email address.' };
}

export function newsletterState(endpoint?: string): NewsletterState {
  return endpoint?.trim()
    ? { status: 'idle', message: '' }
    : { status: 'unavailable', message: 'Newsletter signup is not configured yet.' };
}

export async function submitNewsletter(form: HTMLFormElement) {
  const endpoint = form.dataset.endpoint?.trim();
  if (!endpoint) throw new Error('Newsletter signup is not configured yet.');

  const response = await fetch(endpoint, {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) throw new Error('Subscription could not be confirmed.');
}

export function initNewsletterForms(root: ParentNode = document) {
  root.querySelectorAll<HTMLFormElement>('[data-newsletter-form]').forEach((form) => {
    const status = form.querySelector<HTMLElement>('[data-newsletter-status]');
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');

    form.addEventListener('invalid', () => {
      const error = validateNewsletter({ email: new FormData(form).get('email')?.toString() });
      if (status && error.email) status.textContent = error.email;
    }, true);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const error = validateNewsletter({ email: new FormData(form).get('email')?.toString() });
      if (error.email) {
        if (status) status.textContent = error.email;
        return;
      }

      const state = newsletterState(form.dataset.endpoint);
      if (state.status === 'unavailable') {
        if (status) status.textContent = state.message;
        return;
      }

      if (status) status.textContent = 'Subscribing…';
      if (submit) submit.disabled = true;
      try {
        await submitNewsletter(form);
        if (status) status.textContent = 'Thank you for subscribing.';
        form.reset();
      } catch (error) {
        if (status) status.textContent = error instanceof Error ? error.message : 'Subscription could not be confirmed.';
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });
}
