import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sdk = 'https://cdn.paddle.com/paddle/v2/paddle.js';
// Fake only the external SDK. The page, routing, summary and retry logic are real.
const fakeSdk = `window.calls = []; window.openCount = 0; window.Paddle = {
  Environment: {set: value => calls.push(['environment', value])},
  Initialize: options => { window.checkoutEvent = options.eventCallback; calls.push(['initialize', options.token]); },
  Checkout: {close: () => checkoutEvent({name:'checkout.closed'}), open: options => {
    calls.push(['open', options]); window.openCount++;
    checkoutEvent({name:'checkout.loaded', data: { transaction_id:'txn_' + 'a'.repeat(25) + window.openCount,
      currency_code:'USD', totals:{subtotal:29, tax:2.9, total:31.9, discount:0, credit:0, balance:31.9}
    }});
  }}
};`;

test('buy opens a branded inline page with localized totals and a product-specific redirect', async ({ page }) => {
  let loads = 0;
  await page.route(sdk, async route => { loads++; await route.fulfill({ contentType: 'application/javascript', body: fakeSdk }); });
  await page.goto('/products/suspended/');
  expect(loads).toBe(0);
  await page.locator('[data-suspended-event="click_suspended_buy"]').first().click();
  await expect(page).toHaveURL(/\/purchase\/suspended\/$/);
  await expect(page.locator('.brand img')).toBeVisible();
  await expect(page.getByRole('heading', {name:'Cart'})).toBeVisible();
  await expect(page.getByRole('heading', {name:'AFTER PAYMENT'})).toBeVisible();
  await expect(page.locator('[data-checkout-total]')).toHaveText('USD 31.90');
  const calls = await page.evaluate(() => (window as any).calls);
  expect(calls.slice(0, 2)).toEqual([['environment', 'sandbox'], ['initialize', `test_${'a'.repeat(27)}`]]);
  const options = calls[2][1];
  expect(options.items).toEqual([{ priceId: 'pri_01m3eaewadnm7grc2armnnkbsr', quantity: 1 }]);
  expect(options.settings).toMatchObject({ displayMode: 'inline', variant: 'one-page', locale: 'en',
    successUrl: new URL('/setup/', page.url()).href });
  expect(options.customData?.sc_setup_sha256_v1).toMatch(/^[a-f0-9]{64}$/);
  const proof = await page.evaluate(async () => {
    const secret = sessionStorage.getItem(`sc-setup-v1:txn_${'a'.repeat(25)}1`);
    if (!secret) return null;
    const bytes = Uint8Array.from(atob(secret.replaceAll('-', '+').replaceAll('_', '/') + '='), c => c.charCodeAt(0));
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
    return { secret, length: bytes.length, digest, latest: sessionStorage.getItem('sc-setup-v1:latest') };
  });
  expect(proof?.length).toBe(32);
  expect(proof?.latest).toBe(`txn_${'a'.repeat(25)}1`);
  expect(proof?.digest).toBe(options.customData.sc_setup_sha256_v1);
  expect(JSON.stringify(options)).not.toContain(proof!.secret);
  await page.evaluate(() => (window as any).checkoutEvent({name:'checkout.updated', data:{
    currency_code:'JPY', totals:{subtotal:4000,tax:400,total:4400,discount:0,credit:0,balance:4400}
  }}));
  await expect(page.locator('[data-checkout-total]')).toHaveText('JPY 4,400');
  await expect(page.getByRole('link', {name:'Refund policy',exact:true}).first()).toBeVisible();
  expect(loads).toBe(1);
});

test('failed checkout retry keeps separate tab-local proof and completion opens setup in this tab', async ({ page }) => {
  let loads = 0;
  await page.route(sdk, route => route.fulfill({ contentType: 'application/javascript',
    body: fakeSdk.replace('window.openCount = 0;', `window.openCount = ${loads++};`) }));
  await page.goto('/purchase/suspended/');
  await expect(page.locator('[data-checkout-total]')).not.toHaveText('—');
  const first = await page.evaluate(() => sessionStorage.getItem(`sc-setup-v1:txn_${'a'.repeat(25)}1`));
  await page.evaluate(() => (window as any).checkoutEvent({name:'checkout.error'}));
  await page.locator('[data-checkout-retry]').click();
  await expect(page.locator('[data-checkout-total]')).not.toHaveText('—');
  const second = await page.evaluate(() => sessionStorage.getItem(`sc-setup-v1:txn_${'a'.repeat(25)}2`));
  expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(second).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(second).not.toBe(first);
  expect(loads).toBe(2);
  await page.evaluate(() => (window as any).checkoutEvent({name:'checkout.completed',data:{transaction_id:`txn_${'a'.repeat(25)}2`}}));
  await expect(page).toHaveURL(/\/setup\/$/);
  expect(page.url()).not.toContain(second!);
});

test('retry isolates a late loaded event from the previous checkout', async ({ page }) => {
  let loads = 0;
  const stalledSdk = fakeSdk.replace("checkoutEvent({name:'checkout.loaded', data: {", "if(false) checkoutEvent({name:'checkout.loaded', data: {")
    + `window.emitLateA = () => checkoutEvent({name:'checkout.loaded', data:{transaction_id:'txn_${'a'.repeat(25)}1',
      currency_code:'USD', totals:{subtotal:29,tax:2.9,total:31.9,discount:0,credit:0,balance:31.9}}});`;
  await page.route(sdk, route => route.fulfill({ contentType: 'application/javascript',
    body: ++loads === 1 ? stalledSdk : fakeSdk.replace('window.openCount = 0;', 'window.openCount = 1;') }));
  await page.goto('/purchase/suspended/');
  await expect.poll(() => page.evaluate(() => (window as any).openCount)).toBe(1);
  await page.evaluate(() => (window as any).checkoutEvent({name:'checkout.error'}));
  await page.locator('[data-checkout-retry]').click();
  await expect.poll(() => page.evaluate(() => (window as any).openCount)).toBe(2);
  await page.evaluate(() => {
    if (!(window as any).emitLateA) return;
    (window as any).emitLateA();
    (window as any).checkoutEvent({name:'checkout.loaded', data:{transaction_id:`txn_${'a'.repeat(25)}2`,
      currency_code:'USD', totals:{subtotal:29,tax:2.9,total:31.9,discount:0,credit:0,balance:31.9}}});
  });
  expect(loads).toBe(2);
  expect(await page.evaluate(() => sessionStorage.getItem(`sc-setup-v1:txn_${'a'.repeat(25)}1`))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem(`sc-setup-v1:txn_${'a'.repeat(25)}2`))).toMatch(/^[A-Za-z0-9_-]{43}$/);
});

test('Paddle payment links never open a second item-based checkout', async ({ page }) => {
  let loads = 0;
  await page.route(sdk, route => { loads++; return route.fulfill({ contentType: 'application/javascript', body: fakeSdk }); });
  for (const value of [`txn_${'b'.repeat(26)}`, 'malformed']) {
    await page.goto(`/purchase/suspended/?_ptxn=${value}`);
    await expect(page.locator('[data-checkout-status]')).toContainText('payment link');
    expect(await page.evaluate(() => (window as any).calls?.filter((call: any[]) => call[0] === 'open') ?? [])).toEqual([]);
  }
  expect(loads).toBe(0);
});

test('a new checkout cannot reuse a stale setup handoff when its loaded callback is lost', async ({ page }) => {
  const stalledSdk = fakeSdk.replace("checkoutEvent({name:'checkout.loaded', data: {", "if(false) checkoutEvent({name:'checkout.loaded', data: {");
  await page.route(sdk, route => route.fulfill({ contentType: 'application/javascript', body: stalledSdk }));
  await page.addInitScript(() => sessionStorage.setItem('sc-setup-v1:latest', `txn_${'z'.repeat(26)}`));
  await page.goto('/purchase/suspended/');
  await expect.poll(() => page.evaluate(() => (window as any).calls?.some((call: any[]) => call[0] === 'open'))).toBe(true);
  expect(await page.evaluate(() => sessionStorage.getItem('sc-setup-v1:latest'))).toBeNull();
});

test('retries a failed SDK load in Japanese without exposing provider data', async ({ page }) => {
  await page.route(sdk, route => route.abort());
  await page.goto('/ja/products/suspended/');
  await page.locator('[data-suspended-event="click_suspended_buy"]').first().click();
  await expect(page).toHaveURL(/\/ja\/purchase\/suspended\/$/);
  await expect(page.locator('[data-checkout-status]')).toContainText('決済画面を開けませんでした');
  await page.unroute(sdk);
  await page.route(sdk, route => route.fulfill({ contentType: 'application/javascript', body: fakeSdk }));
  await page.locator('[data-checkout-retry]').click();
  await expect.poll(() => page.evaluate(() => (window as any).calls?.find((c: any[]) => c[0] === 'open')?.[1].settings.locale)).toBe('ja');
  await page.evaluate(() => (window as any).checkoutEvent({ name: 'checkout.payment.failed' }));
  await expect(page.locator('[data-checkout-status]')).toContainText('お支払いが完了しませんでした');
  await expect(page.locator('[data-checkout-retry]')).toBeHidden();
  await page.evaluate(() => (window as any).checkoutEvent({ name: 'checkout.error', data: { secret: 'private-provider-error' } }));
  await expect(page.locator('[data-checkout-status]')).toContainText('決済画面を開けませんでした');
  await expect(page.locator('body')).not.toContainText('private-provider-error');
  await expect(page.locator('[data-checkout-total]')).toHaveText('—');
});

test('keeps guidance and support available with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:49398/products/suspended/');
  await page.locator('[data-suspended-event="click_suspended_buy"]').first().click();
  await expect(page).toHaveURL(/\/purchase\/suspended\/$/);
  await expect.poll(() => page.locator('[data-paddle-checkout]').innerText()).toContain('Enable JavaScript');
  await expect(page.getByRole('link', {name:'Contact support',exact:true}).first()).toBeVisible();
  await expect(page.getByRole('heading', {name:'AFTER PAYMENT'})).toBeVisible();
  await context.close();
});

test('stalled checkout can be retried without a stale total or duplicate SDK', async ({ page }) => {
  const stalledSdk = fakeSdk.replace("checkoutEvent({name:'checkout.loaded', data: {", "if(false) checkoutEvent({name:'checkout.loaded', data: {");
  let loads = 0;
  await page.route(sdk, route => route.fulfill({contentType:'application/javascript',body:++loads === 1 ? stalledSdk : fakeSdk}));
  await page.clock.install();
  await page.goto('/purchase/suspended/');
  await expect.poll(() => page.evaluate(() => (window as any).calls?.length)).toBe(3);
  await page.clock.fastForward(20_000);
  await expect(page.locator('[data-checkout-status]')).toContainText('could not');
  await page.locator('[data-checkout-retry]').click();
  await expect.poll(() => page.evaluate(() => (window as any).calls?.filter((c: any[]) => c[0] === 'open').length)).toBe(1);
  expect(loads).toBe(2);
  await expect(page.locator('[data-checkout-status]')).toBeEmpty();
  await expect(page.locator('[data-checkout-retry]')).toBeHidden();
  await page.evaluate(() => (window as any).checkoutEvent({name:'checkout.updated',data:{currency_code:'not-currency',totals:{total:NaN}}}));
  await expect(page.locator('[data-checkout-total]')).toHaveText('—');
  await expect(page.locator('[data-checkout-status]')).toContainText('could not');
});

test('branded checkout remains accessible and fits narrow screens in both languages', async ({ page }, testInfo) => {
  await page.route(sdk, route => route.fulfill({contentType:'application/javascript',body:fakeSdk}));
  for (const locale of ['', '/ja']) {
    await page.setViewportSize({width:1280,height:1000});
    await page.goto(`${locale}/purchase/suspended/`);
    await expect(page.locator('[data-checkout-total]')).not.toHaveText('—');
    expect((await new AxeBuilder({page}).include('[data-paddle-checkout]').analyze()).violations).toEqual([]);
    await page.screenshot({path:testInfo.outputPath(locale ? 'inline-ja-desktop.png' : 'inline-en-desktop.png')});
    await page.setViewportSize({width:320,height:900});
    const bounds = await page.locator('[data-paddle-checkout]').boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    await page.screenshot({path:testInfo.outputPath(locale ? 'inline-ja-mobile.png' : 'inline-en-mobile.png')});
  }
});
