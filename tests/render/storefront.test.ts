import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, expect, it } from 'vitest';

const token = `test_${'a'.repeat(27)}`;
const stagingApi = 'https://abcdefghij.execute-api.ap-northeast-1.amazonaws.com/staging';
const output = mkdtempSync(join(tmpdir(), 'op201-shop-test-'));
const fixture = fileURLToPath(new URL('../fixtures/site-preview.v1.json', import.meta.url));
afterAll(() => rmSync(output, { recursive: true, force: true }));
const page = (path: string) => readFileSync(join(output, path, 'index.html'), 'utf8');
const exists = (path: string) => existsSync(join(output, path, 'index.html'));
function build(mode: string, catalogueFile: string) {
  const { MODE: _testMode, ...env } = process.env;
  execFileSync('npm', ['run', 'build', '--', '--mode', mode, '--outDir', output], {
    cwd: new URL('../..', import.meta.url), stdio: 'pipe',
    env: { ...env, DOWNLOAD_RELEASE_SNAPSHOT: 'null', SITE_CATALOGUE_FILE: catalogueFile, LICENSING_API_BASE: stagingApi,
      PADDLE_CHECKOUT_ENVIRONMENT: 'sandbox', PADDLE_CLIENT_TOKEN: token },
  });
}

it('keeps drafts out of public output and renders the private sandbox offer', () => {
  build('production', '');
  expect(page('setup')).not.toContain(`data-base="${stagingApi}"`);
  expect(exists('products/suspended')).toBe(false);
  expect(page('purchase/suspended')).not.toContain('data-paddle-token');
  expect(() => build('production', fixture)).toThrow();

  build('sandbox', fixture);
  expect(page('setup')).toContain(`data-base="${stagingApi}"`);
  expect(page('recovery')).toContain(`data-base="${stagingApi}"`);
  for (const locale of ['', 'ja/']) {
    const product = page(`${locale}products/suspended`);
    const purchase = page(`${locale}purchase/suspended`);
    const section = product.slice(product.indexOf('data-suspended-product'));
    const title = product.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
    expect(product).toContain(locale ? 'Suspended ライセンス' : 'Suspended licence');
    expect(product).not.toContain('PRIVATE PREVIEW');
    expect(section).not.toMatch(/SC Suspended|SC SUSPENDED|TRACES|Traces/);
    expect(section).not.toMatch(/\(0\d\)/);
    expect(title).not.toMatch(/SC Suspended|SC SUSPENDED|TRACES|Traces/);
    expect(product).toContain('/catalogue-media/suspended/box-art.png');
    expect(product).toContain('/catalogue-media/suspended/interface.png');
    expect(product).toContain('src="https://example.test/demo.mp4"');
    expect(product).toContain('src="https://example.test/sample.mp3"');
    expect(product).toContain(locale ? 'グラニュラー・エフェクト' : 'GRANULAR AUDIO EFFECT');
    expect(product).toContain(locale ? '一瞬をつかまえる。' : 'Capture a moment of sound and keep it moving from within.');
    expect(product).toContain(locale ? '買い切り（サブスクリプションなし）・パソコン3台まで' : 'One-time payment · up to 3 computers');
    expect(product).toContain(locale ? '購入する <span>$29</span>' : 'Buy licence <span>$29</span>');
    expect(product.match(/class="shop-buy-band/g)).toHaveLength(1);
    expect(product).not.toContain('download-primary');
    expect(product).toContain(locale ? 'ライセンスを設定するまでは、数分おきに数秒間、音が途切れます。' : 'The demo mutes briefly every few minutes until a licence is activated.');
    expect(product).toContain(locale ? 'ほかのOS・過去のバージョン' : 'All installers and versions');
    expect(product).toContain(locale ? '動作環境' : 'SYSTEM REQUIREMENTS');
    expect(product).toContain('macOS, Linux');
    expect(product).toContain(locale ? 'VST3, AU（macOSのみ）' : 'VST3, AU (macOS only)');
    expect(product).toContain(locale ? 'インストールとサポート' : 'Setup and support');
    expect(product).toContain('data-recommended-download');
    expect(product).not.toContain('data-paddle-token');
    expect(purchase).toContain(`data-paddle-token="${token}"`);
    expect(purchase).toContain('data-paddle-price="pri_01m3eaewadnm7grc2armnnkbsr"');
    expect(purchase).toContain(`data-paddle-success="${locale ? '/ja' : ''}/setup/"`);
  }
  const astroDir = join(output, '_astro');
  const bundleJs = readdirSync(astroDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(join(astroDir, file), 'utf8'))
    .join('\n');
  expect(bundleJs).toContain('無料デモ版をダウンロード（');
  expect(bundleJs).toContain('Try the free demo — Download for ');
}, 60_000);
