import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

function buildSite() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run build'] : ['run', 'build'];
  execFileSync(command, args, { cwd: root, stdio: 'pipe' });
}

function renderedProduct(slug: string, locale = '') {
  return readFileSync(new URL(`../../dist/${locale}products/${slug}/index.html`, import.meta.url), 'utf8');
}

describe('product CTA rendering', () => {
  beforeAll(buildSite, 30_000);

  it('renders a localized notify CTA without an empty link and withholds private prices', () => {
    const html = renderedProduct('suspended');

    expect(html).toContain('Notify me');
    expect(html).toContain('href="/newsletter/"');
    expect(html).not.toContain('href=""');
    expect(html).not.toContain('class="price"');
  });

  it('uses the Japanese static newsletter path and localized CTA copy', () => {
    const html = renderedProduct('suspended', 'ja/');

    expect(html).toContain('お知らせを受け取る');
    expect(html).toContain('href="/ja/newsletter/"');
  });
}, 30_000);
