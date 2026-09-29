import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, expect, it } from 'vitest';

const token = `test_${'a'.repeat(27)}`;
const output = mkdtempSync(join(tmpdir(), 'op201-shop-test-'));
const fixture = fileURLToPath(new URL('../fixtures/site-preview.v1.json', import.meta.url));
afterAll(() => rmSync(output, { recursive: true, force: true }));
const page = (path: string) => readFileSync(join(output, path, 'index.html'), 'utf8');
const exists = (path: string) => existsSync(join(output, path, 'index.html'));
function build(mode: string, catalogueFile: string) {
  const { MODE: _testMode, ...env } = process.env;
  execFileSync('npm', ['run', 'build', '--', '--mode', mode, '--outDir', output], {
    cwd: new URL('../..', import.meta.url), stdio: 'pipe',
    env: { ...env, DOWNLOAD_RELEASE_SNAPSHOT: 'null', SITE_CATALOGUE_FILE: catalogueFile,
      PADDLE_CHECKOUT_ENVIRONMENT: 'sandbox', PADDLE_CLIENT_TOKEN: token },
  });
}

it('keeps drafts out of public output and renders the private sandbox offer', () => {
  build('production', '');
  expect(exists('products/suspended')).toBe(false);
  expect(page('purchase/suspended')).not.toContain('data-paddle-token');
  expect(() => build('production', fixture)).toThrow();

  build('sandbox', fixture);
  for (const locale of ['', 'ja/']) {
    const product = page(`${locale}products/suspended`);
    const purchase = page(`${locale}purchase/suspended`);
    expect(product).toContain(locale ? 'Suspended ライセンス' : 'Suspended licence');
    expect(product).not.toContain('PRIVATE PREVIEW');
    expect(product).toContain('/catalogue-media/suspended/box-art.png');
    expect(product).toContain('/catalogue-media/suspended/interface.png');
    expect(product).toContain('src="https://example.test/demo.mp4"');
    expect(product).toContain('src="https://example.test/sample.mp3"');
    expect(product).toContain('$29');
    expect(product).toContain(locale ? 'Traces バンドル' : 'Traces bundle');
    expect(product).toContain('$99');
    expect(product).not.toContain('<thead>');
    expect(product).toContain('BUY <span>$29</span>');
    expect(product).toContain('BUY <span>$99</span>');
    expect(product).toContain(locale ? 'システム要件' : 'SYSTEM REQUIREMENTS');
    expect(product).toContain('macOS, Linux');
    expect(product).toContain(locale ? 'VST3, AU（macOSのみ）' : 'VST3, AU (macOS only)');
    expect(product).toContain('data-recommended-download');
    expect(product).not.toContain('data-paddle-token');
    expect(purchase).toContain(`data-paddle-token="${token}"`);
    expect(purchase).toContain('data-paddle-price="pri_01m3eaewadnm7grc2armnnkbsr"');
  }
}, 60_000);
