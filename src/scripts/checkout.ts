export {};
type CheckoutEvent = { name?: string; data?: { currency_code?: unknown; totals?: Record<string, unknown> } };
type PaddleClient = {
  Environment: { set(environment: 'sandbox'): void };
  Initialize(options: { token: string; eventCallback(event: CheckoutEvent): void }): void;
  Checkout: { close(): void; open(options: { items: { priceId: string; quantity: number }[]; settings: {
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

  function fail() {
    active = false;
    clearTimeout(openingTimeout);
    // Close before displaying the error: close() may synchronously emit an event.
    try { paddle?.Checkout.close(); } catch { /* The retry remains available. */ }
    frame.replaceChildren();
    totals.forEach(total => { total.textContent = '—'; });
    status.textContent = config.error!;
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
      try { updateTotals(event.data); status.textContent = ''; } catch { fail(); }
    }
    if (event.name === 'checkout.closed' || event.name === 'checkout.error') fail();
    if (event.name === 'checkout.payment.error') status.textContent = config.paymentError!;
    // Paddle's successUrl redirects; only the backend webhook grants access.
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
      openingTimeout = setTimeout(fail, 15000);
      api.Checkout.open({
        items: [{ priceId: config.paddlePrice!, quantity: 1 }],
        settings: { displayMode: 'inline', variant: 'one-page', locale: document.documentElement.lang, theme: 'light',
          frameTarget: 'paddle-checkout-frame', frameInitialHeight: 450,
          frameStyle: 'width: 100%; min-width: 312px; background-color: transparent; border: none;',
          successUrl: config.paddleSuccess!, showAddDiscounts: false },
      });
    } catch { fail(); }
  }
  retry.addEventListener('click', open);
  void open();
}
