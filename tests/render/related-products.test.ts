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

    expect(html).toContain('<p class="eyebrow">\u30aa\u30fc\u30c7\u30a3\u30aa\u30fb\u30a4\u30f3\u30b9\u30c8\u30a5\u30eb\u30e1\u30f3\u30c4</p>');
    expect(html).toContain('<h2 id="related-products-title">\u95a2\u9023\u3059\u308b\u30a4\u30f3\u30b9\u30c8\u30a5\u30eb\u30e1\u30f3\u30c4</h2>');
    expect(html).toContain('href="/ja/products/suspended/"');
  }, 30_000);
});
