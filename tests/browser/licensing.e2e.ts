import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const api = 'https://abcdefghij.execute-api.ap-northeast-1.amazonaws.com/production';
const schema = 'studio.cucurbits.licensing.v2';
const code = 'C'.repeat(43);
const challenge = { schema, type: 'offline-challenge', protocolVersion: 2, requestId: 'browser-test',
  createdAt: '2026-09-27T00:00:00Z', challengeNonce: 'nonce', productId: 'suspended',
  machineBindingDigest: 'a'.repeat(64), machineLabel: 'My offline computer' };

test('recovery scrubs the fragment, requires a click, and clears the code on exit', async ({ page }) => {
  const calls: any[] = [];
  await page.route(`${api}/**`, async route => {
    calls.push(route.request().postDataJSON());
    expect(route.request().headers().referer).toBeUndefined();
    await route.fulfill({ json: { accountId: 'test', activationCode: code } });
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
    await route.fulfill({ json: { accountId: 'test', activationCode: code } });
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
