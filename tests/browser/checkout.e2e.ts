import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sdk = 'https://cdn.paddle.com/paddle/v2/paddle.js';
// Fake only the external SDK. The page, routing, summary and retry logic are real.
const fakeSdk = `window.calls = []; window.Paddle = {
  Environment: {set: value => calls.push(['environment', value])},
  Initialize: options => { window.checkoutEvent = options.eventCallback; calls.push(['initialize', options.token]); },
  Checkout: {close: () => checkoutEvent({name:'checkout.closed'}), open: options => {
    calls.push(['open', options]); checkoutEvent({name:'checkout.loaded', data: {
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
  await expect(page).toHaveURL(/\/purchase\/$/);
  await expect(page.locator('.brand img')).toBeVisible();
  await expect(page.getByRole('heading', {name:'Purchase Suspended'})).toBeVisible();
  await expect(page.locator('[data-checkout-total]')).toHaveText('USD 31.90');
  await expect.poll(() => page.evaluate(() => (window as any).calls)).toEqual([
    ['environment', 'sandbox'], ['initialize', `test_${'a'.repeat(27)}`],
    ['open', { items: [{ priceId: 'pri_01m3eaewadnm7grc2armnnkbsr', quantity: 1 }],
      settings: { displayMode: 'inline', variant: 'one-page', locale: 'en', theme: 'light',
        frameTarget: 'paddle-checkout-frame', frameInitialHeight: 450,
        frameStyle: 'width: 100%; min-width: 312px; background-color: transparent; border: none;',
        successUrl: 'https://www.studiocucurbits.com/downloads/suspended/', showAddDiscounts: false } }],
  ]);
  await page.evaluate(() => (window as any).checkoutEvent({name:'checkout.updated', data:{
    currency_code:'JPY', totals:{subtotal:4000,tax:400,total:4400,discount:0,credit:0,balance:4400}
  }}));
  await expect(page.locator('[data-checkout-total]')).toHaveText('JPY 4,400');
  await expect(page.getByRole('link', {name:'Refund policy',exact:true}).first()).toBeVisible();
  expect(loads).toBe(1);
});

test('retries a failed SDK load in Japanese without exposing provider data', async ({ page }) => {
  await page.route(sdk, route => route.abort());
  await page.goto('/ja/products/suspended/');
  await page.locator('[data-suspended-event="click_suspended_buy"]').first().click();
  await expect(page).toHaveURL(/\/ja\/purchase\/$/);
  await expect(page.locator('[data-checkout-status]')).toContainText('決済画面を開けませんでした');
  await page.unroute(sdk);
  await page.route(sdk, route => route.fulfill({ contentType: 'application/javascript', body: fakeSdk }));
  await page.locator('[data-checkout-retry]').click();
  await expect.poll(() => page.evaluate(() => (window as any).calls?.find((c: any[]) => c[0] === 'open')?.[1].settings.locale)).toBe('ja');
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
  await expect(page).toHaveURL(/\/purchase\/$/);
  await expect.poll(() => page.locator('[data-paddle-checkout]').innerText()).toContain('Enable JavaScript');
  await expect(page.getByRole('link', {name:'Contact support',exact:true}).first()).toBeVisible();
  await expect(page.getByRole('heading', {name:'3. Activate the plugin'})).toBeVisible();
  await context.close();
});

test('stalled checkout can be retried without a stale total or duplicate SDK', async ({ page }) => {
  const stalledSdk = fakeSdk.replace("checkoutEvent({name:'checkout.loaded', data: {", "if(false) checkoutEvent({name:'checkout.loaded', data: {");
  await page.route(sdk, route => route.fulfill({contentType:'application/javascript',body:stalledSdk}));
  await page.clock.install();
  await page.goto('/purchase/');
  await expect.poll(() => page.evaluate(() => (window as any).calls?.length)).toBe(3);
  await page.clock.fastForward(20_000);
  await expect(page.locator('[data-checkout-status]')).toContainText('could not');
  await page.locator('[data-checkout-retry]').click();
  await expect.poll(() => page.evaluate(() => (window as any).calls.filter((c: any[]) => c[0] === 'open').length)).toBe(2);
  await page.evaluate(() => (window as any).checkoutEvent({name:'checkout.loaded',data:{
    currency_code:'USD',totals:{subtotal:29,tax:0,total:29,discount:0,credit:0,balance:29}
  }}));
  await page.clock.fastForward(20_000);
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
    await page.goto(`${locale}/purchase/`);
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
