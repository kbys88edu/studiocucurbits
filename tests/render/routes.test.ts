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

describe('pre-launch Audio Instruments routes', () => {
  beforeAll(buildSite);

  it('withholds individual product and collection routes until launch readiness', () => {
    expect(renderedPage('/products/suspended')).toBe('');
    expect(renderedPage('/products/vitreous')).toBe('');
    expect(renderedPage('/collections/traces')).toBe('');
    expect(renderedPage('/collections/tendril')).toBe('');
  });

  it('keeps the public products route as a development-only entry point', () => {
    const html = renderedPage('/products');
    expect(html).toContain('contrast_SC_Hero_2560x1440.png');
    expect(html).not.toContain('SC Suspended');
    expect(html).not.toContain('SC Vitreous');
  });
});
