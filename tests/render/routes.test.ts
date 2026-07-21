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

describe('SC Suspended sales routes', () => {
  beforeAll(buildSite);

  it('publishes SC Suspended while withholding other product and collection routes', () => {
    expect(renderedPage('/products/suspended')).toContain('SC Suspended');
    expect(renderedPage('/products/vitreous')).toBe('');
    expect(renderedPage('/collections/traces')).toBe('');
    expect(renderedPage('/collections/tendril')).toBe('');
  });

  it('lists SC Suspended with its public price and notification CTA', () => {
    const html = renderedPage('/products');
    const detail = renderedPage('/products/suspended');
    expect(html).toContain('contrast_SC_Hero_2560x1440.png');
    expect(html).toContain('SC Suspended');
    expect(detail).toContain('$29.00');
    expect(detail).toContain('href="/newsletter/"');
    expect(html).not.toContain('SC Vitreous');
  });
});
