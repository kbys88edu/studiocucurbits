import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));
const renderedPage = (path: string) => {
  const file = new URL(`../../dist${path}/index.html`, import.meta.url);
  return existsSync(file) ? readFileSync(file, 'utf8') : '';
};

describe('draft shop routes', () => {
  beforeAll(() => execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'pipe' }), 30_000);

  it('withholds draft product, note, support and bundle pages', () => {
    for (const path of ['/products/suspended', '/ja/products/suspended', '/products/suspended/notes', '/support/suspended', '/collections/traces']) {
      expect(renderedPage(path)).toBe('');
    }
  });

  it('retains the forthcoming catalogue status without a broken product link', () => {
    const html = renderedPage('/products');
    expect(html).toContain('Suspended');
    expect(html).toContain('Hero_2560x1440.png');
    expect(html).not.toContain('href="/products/suspended/"');
  });

  it('publishes private setup routes in both languages without a payment SDK', () => {
    for (const path of ['/setup', '/ja/setup']) {
      const page = renderedPage(path);
      expect(page).toContain('data-setup');
      expect(page).not.toContain('cdn.paddle.com');
      expect(page).not.toContain('data-paddle-token');
    }
  });
});
