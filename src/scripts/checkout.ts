export {};
type PaddleClient = {
  Environment: { set(environment: 'sandbox'): void };
  Initialize(options: { token: string; eventCallback(event: { name?: string }): void }): void;
  Checkout: { close(): void; open(options: { items: { priceId: string; quantity: number }[]; settings: {
    displayMode: 'overlay'; variant: 'one-page'; locale: string; successUrl: string; showAddDiscounts: false;
  } }): void };
};
declare global { interface Window { Paddle?: PaddleClient } }

const root = document.querySelector<HTMLElement>('[data-paddle-checkout]');
if (root) {
  const config = root.dataset;
  const status = root.querySelector<HTMLElement>('[data-checkout-status]')!;
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-suspended-event="click_suspended_buy"]');
  let client: Promise<PaddleClient> | undefined;
  let busy = false;
  let openingTimeout: ReturnType<typeof setTimeout> | undefined;
  let opener: HTMLAnchorElement | undefined;
  function setBusy(value: boolean) {
    busy = value;
    links.forEach(link => link.setAttribute('aria-disabled', String(value)));
  }
  function load() {
    if (client) return client;
    client = new Promise<PaddleClient>((resolve, reject) => {
      if (window.Paddle) { resolve(window.Paddle); return; }
      const script = document.createElement('script');
      const fail = () => { clearTimeout(timeout); script.remove(); reject(new Error('Checkout unavailable')); };
      const timeout = setTimeout(fail, 10000);
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onerror = fail;
      script.onload = () => {
        clearTimeout(timeout);
        if (window.Paddle) resolve(window.Paddle); else fail();
      };
      document.head.append(script);
    }).then(paddle => {
      if (config.paddleSandbox === 'true') paddle.Environment.set('sandbox');
      paddle.Initialize({ token: config.paddleToken!, eventCallback: event => {
        // Do not inspect, log, store or forward customer/payment event data.
        if (['checkout.loaded', 'checkout.closed', 'checkout.error'].includes(event.name ?? '')) clearTimeout(openingTimeout);
        if (event.name === 'checkout.loaded') status.textContent = '';
        if (event.name === 'checkout.closed') { setBusy(false); status.textContent = ''; opener?.focus(); }
        if (event.name === 'checkout.error') { setBusy(false); status.textContent = config.error!; }
        if (event.name === 'checkout.payment.error') status.textContent = config.paymentError!;
        // Paddle's successUrl redirects; only the backend webhook grants access.
      } });
      return paddle;
    }).catch(() => { client = undefined; throw new Error('Checkout unavailable'); });
    return client;
  }
  links.forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', async event => {
      event.preventDefault();
      if (busy) return;
      opener = link;
      setBusy(true);
      status.textContent = root.dataset.loading!;
      try {
        const paddle = await load();
        openingTimeout = setTimeout(() => {
          paddle.Checkout.close();
          setBusy(false);
          status.textContent = config.error!;
          opener?.focus();
        }, 15000);
        paddle.Checkout.open({
          items: [{ priceId: root.dataset.paddlePrice!, quantity: 1 }],
          settings: { displayMode: 'overlay', variant: 'one-page', locale: document.documentElement.lang,
            successUrl: root.dataset.paddleSuccess!, showAddDiscounts: false },
        });
      } catch {
        clearTimeout(openingTimeout);
        setBusy(false);
        status.textContent = root.dataset.error!;
      }
    });
  });
}
