import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

function buildSite() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run build'] : ['run', 'build'];
  execFileSync(command, args, { cwd: root, stdio: 'pipe' });
}

function renderedPage(path: string) {
  const file = new URL(`../../dist${path}/index.html`, import.meta.url);
  return existsSync(file) ? readFileSync(file, 'utf8') : '';
}

describe('data-generated instrument routes', () => {
  beforeAll(buildSite);

  it('generates routes for every visible product', () => {
    expect(renderedPage('/products/suspended')).toContain('SC Suspended');
    expect(renderedPage('/products/vitreous')).toContain('SC Vitreous');
  });

  it('does not emit empty links in public detail pages', () => {
    for (const path of ['/products/suspended', '/products/vitreous', '/collections/traces', '/collections/tendril']) {
      const html = renderedPage(path);

      expect(html).not.toBe('');
      expect(html).not.toContain('href=""');
    }
  });

  it('omits compatibility when no compatibility facts are supplied', () => {
    expect(renderedPage('/products/suspended')).not.toContain('>Compatibility</h2>');
  });

  it('does not link to collections without supplied public editorial content', () => {
    expect(renderedPage('/collections')).not.toContain('Future Artist Collection');
    expect(renderedPage('/collections/future-artist-collection')).toBe('');
  });

  it('generates Japanese instrument routes while retaining English canonical routes', () => {
    const japanese = renderedPage('/ja/products/suspended');
    const english = renderedPage('/products/suspended');

    expect(japanese).toContain('<html lang="ja">');
    expect(japanese).toContain('\u8fd1\u65e5\u516c\u958b');
    expect(japanese).toContain('href="/products/suspended/"');
    expect(japanese).toContain('href="/ja/products/"');
    expect(english).toContain('<html lang="en">');
    expect(english).toContain('Coming soon');
    expect(english).not.toContain('\u8fd1\u65e5\u516c\u958b');
  });
});
