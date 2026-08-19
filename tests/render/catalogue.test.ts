import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

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
  it('publishes Suspended as the sole Audio Instruments product', () => {
    buildSite();

    expect(renderedPage('')).toContain('Suspended');
    expect(renderedPage('/products')).toContain('Suspended');
  });

  it('excludes deliberately hidden products from the public catalogue', () => {
    buildSite();

    expect(renderedPage('/products')).not.toContain('Hidden prototype');
  });

  it('uses the regenerated hero image and shows the Suspended product card', () => {
    buildSite();

    expect(renderedPage('/products')).toContain('Hero_2560x1440.png');
    expect(renderedPage('/products')).toContain('catalogue-card');
  });

  it('uses the plugin hero image for the current studio update', () => {
    buildSite();

    expect(renderedPage('')).toContain('src="/images/products/website/individual/traces_suspended.png"');
    expect(renderedPage('')).toContain('Notify me');
  });

  it('summarizes unpublished instrument areas without exposing collection routes', () => {
    buildSite();

    const html = renderedPage('/products');
    expect(html).toContain('Windows / macOS / Linux Alpha builds');
    expect(html).toContain('Collection in development');
    expect(html).toContain('Physical modelling collection in development');
    expect(html).toContain('Standalone material processor / Coming later');
    expect(html).not.toContain('href="/collections/traces/"');
  });

  it('uses natural Japanese labels on the Japanese catalogue', () => {
    const html = renderedPage('/ja/products');

    expect(html).toContain('オーディオ・インストゥルメンツ');
    expect(html).toContain('Windows / macOS / Linux 各アルファ版');
    expect(html).not.toContain('PRODUCTS');
  });
}, 30_000);
