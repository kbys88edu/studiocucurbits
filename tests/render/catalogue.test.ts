import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getLocale } from '../../src/lib/locale';

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

describe('Audio Instruments catalogue', () => {
  it('features SC Suspended as the latest studio item', () => {
    buildSite();

    expect(renderedPage('')).toContain('SC Suspended');
  });

  it('excludes deliberately hidden products from the public catalogue', () => {
    buildSite();

    expect(renderedPage('/products')).not.toContain('Hidden prototype');
  });

  it('renders a localized coming-soon status for the catalogue', () => {
    buildSite();

    expect(renderedPage('/products')).toContain('Coming soon');
  });

  it('renders the Japanese coming-soon label from a generated Japanese route', () => {
    expect(getLocale(new URL('https://www.studiocucurbits.com/ja/products/'))).toBe('ja');
    buildSite();
    const html = renderedPage('/ja/products');

    expect(html).toContain('\u8fd1\u65e5\u516c\u958b');
    expect(html).not.toContain('\u8b4c\uff65\u8b5b\uff6c\u96b1\u30fb');
  });
}, 30_000);
