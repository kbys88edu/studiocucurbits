import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

describe('related products', () => {
  it('localizes the Japanese related-products labels and links', () => {
    const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
    const args = process.platform === 'win32'
      ? ['/d', '/s', '/c', 'npm run build -- --config astro.playwright.config.mjs']
      : ['run', 'build', '--', '--config', 'astro.playwright.config.mjs'];

    execFileSync(command, args, { cwd: root, stdio: 'pipe' });
    const html = readFileSync(new URL('../../dist/related-products-test/index.html', import.meta.url), 'utf8');

    expect(html).toContain('<p class="eyebrow">オーディオ・インストゥルメンツ</p>');
    expect(html).toContain('<h2 id="related-products-title">関連製品</h2>');
    expect(html).toContain('href="/ja/products/suspended/"');
  }, 30_000);
});
