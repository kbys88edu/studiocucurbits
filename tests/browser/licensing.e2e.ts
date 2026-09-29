import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const api = 'https://abcdefghij.execute-api.ap-northeast-1.amazonaws.com/production';
const schema = 'studio.cucurbits.licensing.v2';
const code = Buffer.alloc(32, 12).toString('base64url');
const accountId = '00000000-0000-4000-8000-000000000001';
const challenge = { schema, type: 'offline-challenge', protocolVersion: 2, requestId: 'browser-test',
  createdAt: '2026-09-27T00:00:00Z', challengeNonce: 'nonce', productId: 'suspended',
  machineBindingDigest: 'a'.repeat(64), machineLabel: 'My offline computer' };

test('recovery scrubs the fragment, requires a click, and clears the code on exit', async ({ page }) => {
  const calls: any[] = [];
  await page.route(`${api}/**`, async route => {
    calls.push(route.request().postDataJSON());
    expect(route.request().headers().referer).toBeUndefined();
    await route.fulfill({ json: { accountId, activationCode: code } });
  });
  await page.goto(`/recovery/#token=${'T'.repeat(43)}`);
  await expect(page).toHaveURL(/\/recovery\/$/);
  await expect(page.locator('#recover-confirm')).toBeVisible();
  expect(calls).toHaveLength(0);
  await page.locator('#recover-confirm button').click();
  await expect(page.locator('#new-code')).toHaveValue(code);
  expect(calls[0].token).toBe('T'.repeat(43));
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  await expect(page.locator('#new-code')).toHaveValue('');
});

test('recovery gives a generic acknowledgement and Japanese forms are accessible', async ({ page }) => {
  await page.route(`${api}/v2/recovery`, route => route.fulfill({ status: 202, json: { accepted: true } }));
  await page.goto('/ja/recovery/');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/licensing-recovery-ja.png', fullPage: true });
  await page.locator('#recovery-email').fill('test@fnab.xyz');
  await page.locator('#recover button').click();
  await expect(page.locator('#status')).toContainText('メール');
  await expect(page.locator('#recovery-email')).toHaveValue('');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('offline replacement preserves the chosen seat across a failed request and clears output', async ({ page }) => {
  const replacementCalls: any[] = [];
  await page.route(`${api}/**`, async route => {
    const body = route.request().postDataJSON();
    if (route.request().url().endsWith('/replace')) {
      replacementCalls.push(body);
      if (replacementCalls.length === 1) { await route.abort(); return; }
      await route.fulfill({ json: { schema, type: 'offline-response', requestId: challenge.requestId,
        challengeNonce: challenge.challengeNonce, signedPayload: challenge } });
    } else await route.fulfill({ json: { schema, type: 'seat-limit-response', signedPayload: {
      ...challenge, replacementNonce: 'replace-me', used: 2, total: 2 }, activeSeats: [
      { activationId: 'seat-1', machineLabel: 'Old computer', lastSeenAt: '2026-09-20' },
      { activationId: 'seat-2', machineLabel: 'Other computer', lastSeenAt: '2026-09-20' },
    ] } });
  });
  await page.goto('/offline/');
  await page.screenshot({ path: 'test-results/licensing-offline.png', fullPage: true });
  await page.locator('#challenge').fill(JSON.stringify(challenge));
  await page.locator('#code').fill(code);
  await page.locator('#import button').click();
  await page.locator('#seats input').first().check();
  await page.locator('#confirm').check();
  await page.locator('#replacement button').click();
  await expect(page.locator('#error')).not.toBeEmpty();
  await expect(page.locator('#seats input').last()).toBeDisabled();
  await expect(page.locator('#scope')).toBeDisabled();
  await page.locator('#replacement button').click();
  await expect(page.locator('#response')).toHaveValue(/^SC-ACT1-/);
  expect(replacementCalls[0]).toEqual(replacementCalls[1]);
  const downloading = page.waitForEvent('download');
  await page.locator('#download').click();
  expect((await downloading).suggestedFilename()).toBe('studio-cucurbits-activation.json');
  await expect(page.locator('#code')).toHaveValue('');
  await page.locator('#clear').click();
  await expect(page.locator('#response')).toHaveValue('');
  await expect(page.locator('#download')).not.toHaveAttribute('href');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('leaving during confirmation prevents a late code from reappearing', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let requested!: () => void;
  const started = new Promise<void>(resolve => { requested = resolve; });
  await page.route(`${api}/v2/recovery/confirm`, async route => {
    requested(); await gate;
    await route.fulfill({ json: { accountId, activationCode: code } });
  });
  await page.goto(`/recovery/#token=${'T'.repeat(43)}`);
  await page.locator('#recover-confirm button').click();
  await started;
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  release();
  await expect(page.locator('#clear')).toBeEnabled();
  await expect(page.locator('#new-code')).toHaveValue('');
  await expect(page.locator('#new-code-result')).toBeHidden();
});

test('embedded licence pages never enable confirmation', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(token => {
    const frame = document.createElement('iframe');
    frame.src = `/recovery/#token=${token}`; document.body.append(frame);
  }, 'T'.repeat(43));
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('[data-licensing]')).toHaveText('Open this page directly to use licence services.');
  await expect(frame.locator('#recover-confirm')).toHaveCount(0);
});
const setupTransaction = `txn_${'s'.repeat(26)}`;
const setupSecret = Buffer.alloc(32, 7).toString('base64url');

async function retainSetupProof(page: import('@playwright/test').Page) {
  await page.addInitScript(({ transactionId, secret }) => {
    sessionStorage.setItem('sc-setup-v1:latest', transactionId);
    sessionStorage.setItem(`sc-setup-v1:${transactionId}`, secret);
  }, { transactionId: setupTransaction, secret: setupSecret });
}

test('setup waits for the webhook and only generates a code after an explicit click', async ({ page }) => {
  await retainSetupProof(page);
  const calls: { path: string; body: unknown }[] = [];
  let statuses = 0;
  await page.route(`${api}/v2/setup/**`, route => {
    const path = new URL(route.request().url()).pathname;
    calls.push({ path, body: route.request().postDataJSON() });
    expect(route.request().headers().referer).toBeUndefined();
    if (path.endsWith('/status')) return route.fulfill({ json: { status: ++statuses === 1 ? 'waiting' : 'ready' } });
    return route.fulfill({ json: { accountId, activationCode: code } });
  });
  await page.goto('/setup/');
  await expect(page.locator('#setup-generate')).toBeVisible();
  expect(statuses).toBe(2);
  expect(calls.filter(call => call.path.endsWith('/confirm'))).toHaveLength(0);
  expect(calls.every(call => JSON.stringify(call.body) === JSON.stringify({ transactionId: setupTransaction, secret: setupSecret }))).toBe(true);
  await page.locator('#setup-generate').click();
  await expect(page.locator('#setup-code')).toHaveValue(code);
  expect(calls.filter(call => call.path.endsWith('/confirm'))).toHaveLength(1);
  expect(page.url()).not.toContain(setupSecret);
  expect(page.url()).not.toContain(code);
  expect(await page.evaluate(() => [sessionStorage.getItem('sc-setup-v1:latest'), sessionStorage.getItem(`sc-setup-v1:${'txn_' + 's'.repeat(26)}`), localStorage.length])).toEqual([null, null, 0]);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  await expect(page.locator('#setup-code')).toHaveValue('');
});

test('setup remains usable after returning with browser Back', async ({ page }) => {
  await retainSetupProof(page);
  await page.addInitScript(() => window.addEventListener('pageshow', event => {
    if (event.persisted) sessionStorage.setItem('test:setup-bfcache', 'yes');
  }));
  let confirmations = 0;
  await page.route(`${api}/v2/setup/status`, route => route.fulfill({ json: { status: 'ready' } }));
  await page.route(`${api}/v2/setup/confirm`, route => {
    confirmations++;
    return route.fulfill({ json: { accountId, activationCode: code } });
  });
  await page.goto('/setup/');
  await expect(page.locator('#setup-generate')).toBeVisible();
  await page.goto('/about/');
  await page.goBack();
  await expect(page).toHaveURL(/\/setup\/$/);
  // Headless Chromium can skip BFCache. Exercise its persisted events after real Back when it does.
  if (await page.evaluate(() => sessionStorage.getItem('test:setup-bfcache')) !== 'yes') {
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
  }
  await page.locator('#setup-generate').click();
  await expect(page.locator('#setup-code')).toHaveValue(code);
  expect(confirmations).toBe(1);
});

test('setup reports an existing account without exposing code rotation', async ({ page }) => {
  await retainSetupProof(page);
  await page.route(`${api}/v2/setup/status`, route => route.fulfill({ json: { status: 'existing' } }));
  await page.goto('/setup/');
  await expect(page.locator('#setup-status')).toContainText('existing activation code');
  await expect(page.locator('#setup-generate')).toBeHidden();
  await expect(page.getByRole('link', { name: /recovery/i })).toBeVisible();
});

test('webhook waiting is bounded and offers a manual status retry', async ({ page }) => {
  await retainSetupProof(page);
  let checks = 0;
  await page.route(`${api}/v2/setup/status`, route => { checks++; return route.fulfill({ json: { status: 'waiting' } }); });
  await page.clock.install();
  await page.goto('/setup/');
  await expect.poll(() => checks).toBeGreaterThan(0);
  await page.clock.fastForward(20_000);
  await expect(page.locator('#setup-retry')).toBeVisible();
  expect(checks).toBeLessThanOrEqual(4);
  const before = checks;
  await page.locator('#setup-retry').click();
  await expect.poll(() => checks).toBeGreaterThan(before);
  await expect(page.locator('#setup-generate')).toBeHidden();
});

test('setup guides lost-tab and refunded purchases to email recovery without revealing a code', async ({ page }) => {
  let calls = 0;
  await page.route(`${api}/v2/setup/status`, route => { calls++; return route.fulfill({ json: { status: 'unavailable' } }); });
  await page.goto('/setup/');
  await expect(page.locator('#setup-status')).toContainText('setup email');
  expect(calls).toBe(0);
  await retainSetupProof(page);
  await page.reload();
  await expect(page.locator('#setup-status')).toContainText('unavailable');
  await expect(page.locator('#setup-generate')).toBeHidden();
  expect(calls).toBe(1);
});

test('an ambiguous setup confirmation never offers the same claim again', async ({ page }) => {
  await retainSetupProof(page);
  await page.route(`${api}/v2/setup/status`, route => route.fulfill({ json: { status: 'ready' } }));
  await page.route(`${api}/v2/setup/confirm`, route => route.abort());
  await page.goto('/setup/');
  await page.locator('#setup-generate').click();
  await expect(page.locator('#setup-error')).toContainText('recovery');
  await expect(page.locator('#setup-generate')).toBeHidden();
  await expect(page.locator('#setup-code')).toHaveValue('');
});

test('setup rejects malformed successful responses without displaying a code', async ({ page }) => {
  await retainSetupProof(page);
  const bad = [
    { accountId, activationCode: 'C'.repeat(43) },
    { accountId: '00000000-0000-1000-8000-000000000001', activationCode: code },
  ];
  await page.route(`${api}/v2/setup/status`, route => route.fulfill({ json: { status: 'ready' } }));
  await page.route(`${api}/v2/setup/confirm`, route => route.fulfill({ json: bad.shift() }));
  for (let i = 0; i < 2; i++) {
    await page.goto('/setup/');
    await page.locator('#setup-generate').click();
    await expect(page.locator('#setup-error')).toContainText('recovery');
    await expect(page.locator('#setup-code')).toHaveValue('');
  }
});

test('setup email fragment is scrubbed and confirms only after a click', async ({ page }) => {
  const calls: unknown[] = [];
  await page.route(`${api}/v2/recovery/confirm`, route => {
    calls.push(route.request().postDataJSON());
    expect(route.request().headers().referer).toBeUndefined();
    return route.fulfill({ json: { accountId, activationCode: code } });
  });
  await page.goto(`/setup/#token=${'T'.repeat(43)}`);
  await expect(page).toHaveURL(/\/setup\/$/);
  await expect(page.locator('#setup-confirm-email')).toBeVisible();
  expect(calls).toHaveLength(0);
  await page.locator('#setup-confirm-email').click();
  await expect(page.locator('#setup-code')).toHaveValue(code);
  expect(calls[0]).toMatchObject({ schema, protocolVersion: 2, type: 'recovery-confirmation', token: 'T'.repeat(43) });
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
  await expect(page.locator('#setup-code')).toHaveValue('');
});

test('Japanese setup page is accessible and an embedded page refuses setup', async ({ page }) => {
  await page.goto('/ja/setup/');
  await expect(page.getByRole('heading', { name: 'ライセンスを設定する' })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto('/');
  await page.evaluate(() => {
    const frame = document.createElement('iframe');
    frame.src = `/setup/#token=${'T'.repeat(43)}`;
    document.body.append(frame);
  });
  await expect(page.frameLocator('iframe').locator('[data-setup]')).toContainText('Open this page directly');
});

test('a Paddle payment link on the gated production purchase page gives guidance without opening checkout', async ({ page }) => {
  let sdkLoads = 0;
  await page.route('https://cdn.paddle.com/paddle/v2/paddle.js', route => {
    sdkLoads++;
    return route.abort();
  });
  await page.goto(`/purchase/suspended/?_ptxn=txn_${'a'.repeat(26)}`);
  await expect(page.getByRole('alert')).toContainText('payment link');
  await expect(page.getByRole('heading', { name: 'Cart' })).toHaveCount(0);
  expect(sdkLoads).toBe(0);
});
