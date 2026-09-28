export {};
type CheckoutEvent = { name?: string; data?: { transaction_id?: unknown; currency_code?: unknown; totals?: Record<string, unknown> } };
type PaddleClient = {
  Environment: { set(environment: 'sandbox'): void };
  Initialize(options: { token: string; eventCallback(event: CheckoutEvent): void }): void;
  Checkout: { close(): void; open(options: { items: { priceId: string; quantity: number }[];
    customData: { sc_setup_sha256_v1: string }; settings: {
    displayMode: 'inline'; variant: 'one-page'; locale: string; successUrl: string; showAddDiscounts: false;
    theme: 'light'; frameTarget: string; frameInitialHeight: number; frameStyle: string;
  } }): void };
};
declare global { interface Window { Paddle?: PaddleClient } }

const root = document.querySelector<HTMLElement>('[data-paddle-checkout]');
if (root) {
  const config = root.dataset;
  const status = root.querySelector<HTMLElement>('[data-checkout-status]')!;
  const retry = root.querySelector<HTMLButtonElement>('[data-checkout-retry]')!;
  const frame = root.querySelector<HTMLElement>('.paddle-checkout-frame')!;
  const fields = ['subtotal', 'discount', 'tax', 'credit', 'total'] as const;
  const totals = fields.map(field => root.querySelector<HTMLElement>(`[data-checkout-${field}]`)!);
  let client: Promise<PaddleClient> | undefined;
  let paddle: PaddleClient | undefined;
  let openingTimeout: ReturnType<typeof setTimeout> | undefined;
  let active = false;
  let pendingSecret: string | undefined;
  const transactionIdPattern = /^txn_[a-z0-9]{26}$/;

  function fail(message = config.error!) {
    active = false;
    clearTimeout(openingTimeout);
    pendingSecret = undefined;
    try { sessionStorage.removeItem('sc-setup-v1:pending'); } catch { /* Storage may be unavailable. */ }
    // Close before displaying the error: close() may synchronously emit an event.
    try { paddle?.Checkout.close(); } catch { /* The retry remains available. */ }
    frame.replaceChildren();
    totals.forEach(total => { total.textContent = '—'; });
    status.textContent = message;
    retry.hidden = false;
    retry.disabled = false;
  }
  function updateTotals(data: CheckoutEvent['data']) {
    const currency = data?.currency_code;
    const values = fields.map(field => data?.totals?.[field === 'total' ? 'balance' : field]);
    if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)
      || values.some(value => typeof value !== 'number' || !Number.isFinite(value) || value < 0)) throw Error();
    // Paddle.js amounts are major-unit numbers, unlike REST API minor-unit strings.
    const format = new Intl.NumberFormat(document.documentElement.lang, {style:'currency', currency, currencyDisplay:'code'});
    totals.forEach((total, i) => { total.textContent = format.format(values[i] as number).replace(/\u00a0/g, ' '); });
  }
  function onEvent(event: CheckoutEvent) {
    if (!active) return;
    // Read only totals/currency for display; never retain customer or payment data.
    if (event.name === 'checkout.loaded' || event.name === 'checkout.updated') {
      clearTimeout(openingTimeout);
      try { updateTotals(event.data); } catch { fail(); return; }
      if (event.name === 'checkout.loaded') {
        const id = event.data?.transaction_id;
        if (typeof id !== 'string' || !transactionIdPattern.test(id) || !pendingSecret) { fail(); return; }
        try {
          sessionStorage.setItem(`sc-setup-v1:${id}`, pendingSecret);
          sessionStorage.setItem('sc-setup-v1:latest', id);
          sessionStorage.removeItem('sc-setup-v1:pending');
          pendingSecret = undefined;
        } catch { fail(config.storageError!); return; }
      }
      status.textContent = '';
    }
    if (event.name === 'checkout.closed' || event.name === 'checkout.error') fail();
    if (event.name === 'checkout.payment.error' || event.name === 'checkout.payment.failed') status.textContent = config.paymentError!;
    if (event.name === 'checkout.completed') {
      const id = event.data?.transaction_id;
      try {
        if (typeof id !== 'string' || !transactionIdPattern.test(id)
          || !sessionStorage.getItem(`sc-setup-v1:${id}`)) return;
        sessionStorage.setItem('sc-setup-v1:latest', id);
        active = false;
        location.assign(new URL(config.paddleSuccess!, location.origin).href);
      } catch { fail(config.storageError!); }
    }
    // The backend webhook alone grants access; this event only navigates.
  }
  function load() {
    if (client) return client;
    client = new Promise<PaddleClient>((resolve, reject) => {
      if (window.Paddle) { resolve(window.Paddle); return; }
      const script = document.createElement('script');
      const failed = () => { clearTimeout(timeout); script.remove(); reject(new Error('Checkout unavailable')); };
      const timeout = setTimeout(failed, 10000);
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onerror = failed;
      script.onload = () => { clearTimeout(timeout); if (window.Paddle) resolve(window.Paddle); else failed(); };
      document.head.append(script);
    }).then(api => {
      if (config.paddleSandbox === 'true') api.Environment.set('sandbox');
      api.Initialize({ token: config.paddleToken!, eventCallback: onEvent });
      paddle = api;
      return api;
    }).catch(() => { client = undefined; throw new Error('Checkout unavailable'); });
    return client;
  }
  async function open() {
    if (active) return;
    active = true;
    retry.disabled = true;
    retry.hidden = true;
    status.textContent = config.loading!;
    try {
      const api = await load();
      let secret: string, digest: string;
      try {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        secret = btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
        digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
        sessionStorage.removeItem('sc-setup-v1:latest');
        sessionStorage.setItem('sc-setup-v1:pending', secret);
        pendingSecret = secret;
      } catch { fail(config.storageError!); return; }
      openingTimeout = setTimeout(fail, 15000);
      api.Checkout.open({
        items: [{ priceId: config.paddlePrice!, quantity: 1 }],
        customData: { sc_setup_sha256_v1: digest },
        settings: { displayMode: 'inline', variant: 'one-page', locale: document.documentElement.lang, theme: 'light',
          frameTarget: 'paddle-checkout-frame', frameInitialHeight: 450,
          frameStyle: 'width: 100%; min-width: 312px; background-color: transparent; border: none;',
          successUrl: new URL(config.paddleSuccess!, location.origin).href, showAddDiscounts: false },
      });
    } catch { fail(); }
  }
  if (new URLSearchParams(location.search).has('_ptxn')) status.textContent = config.paymentLinkError!;
  else { retry.addEventListener('click', () => location.reload()); void open(); }
}
