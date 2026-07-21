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
  it('keeps Audio Instruments in a pre-launch state', () => {
    buildSite();

    expect(renderedPage('')).not.toContain('SC Suspended');
    expect(renderedPage('/products')).not.toContain('SC Suspended');
  });

  it('excludes deliberately hidden products from the public catalogue', () => {
    buildSite();

    expect(renderedPage('/products')).not.toContain('Hidden prototype');
  });

  it('uses the regenerated hero image without showing product cards', () => {
    buildSite();

    expect(renderedPage('/products')).toContain('SC_Hero_2560x1440.png');
    expect(renderedPage('/products')).not.toContain('catalogue-card');
  });

  it('uses the plugin hero image for the current studio update', () => {
    buildSite();

    expect(renderedPage('')).toContain('src="/images/products/SC_Hero_2560x1440.png"');
  });
}, 30_000);
