import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, expect, it } from 'vitest';

const token = `test_${'a'.repeat(27)}`;
const stagingApi = 'https://abcdefghij.execute-api.ap-northeast-1.amazonaws.com/staging';
const output = mkdtempSync(join(tmpdir(), 'op191-storefront-test-'));
afterAll(() => rmSync(output, { recursive: true, force: true }));
const page = (path: string) => readFileSync(join(output, path, 'index.html'), 'utf8');
function build(mode: string, environment: string, url: string) {
  // Vitest exports MODE=test; Astro would otherwise inherit it over --mode.
  const { MODE: _testMode, ...env } = process.env;
  execFileSync('npm', ['run', 'build', '--', '--mode', mode, '--outDir', output], {
    cwd: new URL('../..', import.meta.url), stdio: 'pipe',
    env: { ...env, DOWNLOAD_RELEASE_SNAPSHOT: 'null', LICENSING_API_BASE: stagingApi, PADDLE_CHECKOUT_ENVIRONMENT: environment,
      PADDLE_CLIENT_TOKEN: url },
  });
}

it('keeps sandbox checkout out of production and exposes only labelled sandbox previews', () => {
  build('production', 'sandbox', token);
  expect(page('/setup')).not.toContain(`data-base="${stagingApi}"`);
  for (const locale of ['', '/ja']) {
    expect(page(`${locale}/products/suspended`)).not.toContain('data-paddle-token');
    expect(page(`${locale}/products/suspended`)).not.toContain(token);
    expect(page(`${locale}/purchase/suspended`)).not.toContain('data-paddle-token');
    expect(page(`${locale}/products/suspended`)).not.toContain('data-suspended-event="click_suspended_buy"');
    expect(page(`${locale}/pricing`)).not.toContain('USD');
  }
  build('production', 'live', `live_${'b'.repeat(27)}`);
  expect(page('/products/suspended')).not.toContain('data-paddle-token');
  expect(page('/products/suspended')).not.toContain(`live_${'b'.repeat(27)}`);
  expect(page('/purchase/suspended')).not.toContain('data-paddle-token');
  expect(page('/ja/purchase/suspended')).not.toContain('data-paddle-token');
  build('sandbox', 'sandbox', token);
  expect(page('/setup')).toContain(`data-base="${stagingApi}"`);
  expect(page('/recovery')).toContain(`data-base="${stagingApi}"`);
  for (const locale of ['', '/ja']) {
    const product = page(`${locale}/products/suspended`);
    const purchase = page(`${locale}/purchase/suspended`);
    expect(product).toContain(`href="${locale}/purchase/suspended/"`);
    expect(product).toContain('data-checkout-sandbox');
    expect(product).not.toContain('data-paddle-token');
    expect(purchase).toContain(`data-paddle-token="${token}"`);
    expect(purchase).toContain('data-paddle-price="pri_01m3eaewadnm7grc2armnnkbsr"');
    expect(purchase).toContain(`data-paddle-success="${locale}/setup/"`);
    expect(purchase).toContain('data-checkout-sandbox');
    expect(product).toContain('USD');
    expect(product).not.toContain('href="/downloads/suspended/"');
    expect(product).toContain(`href="${locale}/downloads/"`);
    expect(product).toContain(`href="${locale}/purchase/suspended/"`);
    expect(page(`${locale}/pricing`)).toContain('USD');
    expect(purchase).toContain(`href="${locale}/support/"`);
    expect(product).not.toContain('"@type":"Offer"');
  }
}, 60_000);
