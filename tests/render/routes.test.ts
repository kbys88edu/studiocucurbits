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

  it('lists SC Suspended without prices and with a notification CTA', () => {
    const html = renderedPage('/products');
    const detail = renderedPage('/products/suspended');
    const detailJa = renderedPage('/ja/products/suspended');
    expect(html).toContain('contrast_SC_Hero_2560x1440.png');
    expect(html).toContain('SC Suspended');
    expect(detail).toContain('SC_Suspended_mockup_20260722.png');
    expect(detail).toContain('Sound in suspension. A body still in motion.');
    expect(detailJa).toContain('浮遊する音。動き続ける身体。');
    expect(detail).toContain('Almost Motionless');
    expect(detail).not.toContain('¥4,400');
    expect(detail).not.toContain('$29.00');
    expect(detail).not.toContain('¥4,400');
    expect(detail).toContain('href="/newsletter/"');
    expect(html).toContain('SC Vitreous');
  });

  it('publishes product-specific support guidance without an unverified install path', () => {
    const support = renderedPage('/support/suspended');
    expect(support).toContain('Installation');
    expect(support).toContain('Reporting a bug');
    expect(support).not.toContain('C:\\Program Files\\Common Files\\VST3');
  });
});
