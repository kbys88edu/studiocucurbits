import { expect, test } from '@playwright/test';

const sdk = 'https://cdn.paddle.com/paddle/v2/paddle.js';
// The external payment SDK is the only fake: exercise our actual page/controller.
const fakeSdk = `window.calls = []; window.Paddle = {
  Environment: {set: value => calls.push(['environment', value])},
  Initialize: options => { window.checkoutEvent = options.eventCallback; calls.push(['initialize', options.token]); },
  Checkout: {open: options => { calls.push(['open', options]); checkoutEvent({name:'checkout.loaded'}); }}
};`;

test('opens one sandbox item, redirects to the product, and reuses the SDK after closing', async ({ page }) => {
  let loads = 0;
  await page.route(sdk, async route => { loads++; await route.fulfill({ contentType: 'application/javascript', body: fakeSdk }); });
  await page.goto('/products/suspended/');
  expect(loads).toBe(0);
  await page.locator('[data-suspended-event="click_suspended_buy"]').first().click();
  await expect.poll(() => page.evaluate(() => (window as any).calls)).toEqual([
    ['environment', 'sandbox'], ['initialize', `test_${'a'.repeat(27)}`],
    ['open', { items: [{ priceId: 'pri_01m3eaewadnm7grc2armnnkbsr', quantity: 1 }],
      settings: { displayMode: 'overlay', variant: 'one-page', locale: 'en',
        successUrl: 'https://www.studiocucurbits.com/downloads/suspended/', showAddDiscounts: false } }],
  ]);
  await page.evaluate(() => (window as any).checkoutEvent({ name: 'checkout.closed' }));
  await page.locator('[data-suspended-event="click_suspended_buy"]').last().click();
  await expect.poll(() => page.evaluate(() => (window as any).calls.filter((c: any[]) => c[0] === 'open').length)).toBe(2);
  expect(loads).toBe(1);
});

test('shows a safe localized error and allows retry when loading fails', async ({ page }) => {
  await page.route(sdk, route => route.abort());
  await page.goto('/ja/products/suspended/');
  await page.locator('[data-suspended-event="click_suspended_buy"]').first().click();
  await expect(page.locator('[data-checkout-status]')).toContainText('決済画面を開けませんでした');
  await page.unroute(sdk);
  await page.route(sdk, route => route.fulfill({ contentType: 'application/javascript', body: fakeSdk }));
  await page.locator('[data-suspended-event="click_suspended_buy"]').first().click();
  await expect.poll(() => page.evaluate(() => (window as any).calls?.find((c: any[]) => c[0] === 'open')?.[1].settings.locale)).toBe('ja');
  await page.evaluate(() => (window as any).checkoutEvent({ name: 'checkout.error', data: { secret: 'private-provider-error' } }));
  await expect(page.locator('[data-checkout-status]')).toContainText('決済画面を開けませんでした');
  await expect(page.locator('body')).not.toContainText('private-provider-error');
  await expect(page).toHaveURL(/\/ja\/products\/suspended\/$/);
});

test('keeps a useful guidance link when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:49398/products/suspended/');
  // Playwright's text selector deliberately skips NOSCRIPT, even with JS off.
  await expect.poll(() => page.locator('[data-paddle-checkout]').innerText()).toContain('Enable JavaScript');
  await expect(page.locator('[data-suspended-event="click_suspended_buy"]').first()).toHaveAttribute('href', 'https://www.studiocucurbits.com/purchase/');
  await context.close();
});

test('recovers if the SDK loads but its checkout frame never does', async ({ page }) => {
  const stalledSdk = fakeSdk.replace("checkoutEvent({name:'checkout.loaded'});", '')
    .replace('Checkout: {open:', "Checkout: {close: () => checkoutEvent({name:'checkout.closed'}), open:");
  await page.route(sdk, route => route.fulfill({ contentType: 'application/javascript', body: stalledSdk }));
  await page.goto('/products/suspended/');
  await page.clock.install();
  const buy = page.locator('[data-suspended-event="click_suspended_buy"]').first();
  await buy.click();
  await expect.poll(() => page.evaluate(() => (window as any).calls?.length)).toBe(3);
  await page.clock.fastForward(20_000);
  await expect(page.locator('[data-checkout-status]')).toContainText('could not');
  await expect(buy).toHaveAttribute('aria-disabled', 'false');
  await buy.click();
  await expect.poll(() => page.evaluate(() => (window as any).calls.filter((c: any[]) => c[0] === 'open').length)).toBe(2);
  await page.evaluate(() => (window as any).checkoutEvent({name:'checkout.loaded'}));
  await page.clock.fastForward(20_000);
  await expect(page.locator('[data-checkout-status]')).toBeEmpty();
  await expect(buy).toHaveAttribute('aria-disabled', 'true');
});
