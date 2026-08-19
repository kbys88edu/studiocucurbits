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
    expect(html).toContain('Hero_2560x1440.png');
    expect(html).toContain('Suspended');
    expect(detail).toContain('traces_suspended.png');
    expect(detail).toContain('central_sc_suspended.png');
    expect(detail).toContain('Sound in suspension. A body still in motion.');
    expect(detail.indexOf('Sound in suspension. A body still in motion.')).toBeLessThan(detail.indexOf('Hear what stays in motion.'));
    expect(detail.indexOf('Hear what stays in motion.')).toBeLessThan(detail.indexOf('Hold a sound without stopping its time.'));
    expect(detail).not.toContain('Freeze. Hold. Transform. Release.');
    expect(detail).toContain('A small set of controls. A wide internal space.');
    expect(detail).toContain('Be notified when Suspended is released.');
    expect(detailJa).toContain('浮遊する音。動き続ける身体。');
    expect(detailJa).toContain('動き続ける音を聴く。');
    expect(detailJa).toContain('音を止めずに、その時間を留める。');
    expect(detailJa).toContain('Suspendedのリリースをお知らせします。');
    expect(detailJa).toContain('Windows / macOS / Linux 各アルファ版');
    expect(detailJa).toContain('ファクトリープリセット 8種');
    expect(detailJa).not.toContain('BETA INFORMATION');
    expect(detailJa).not.toContain('Hear what stays in motion.');
    expect(detail).toContain('Almost Motionless');
    expect(detail).not.toContain('¥4,400');
    expect(detail).not.toContain('$29.00');
    expect(detail).not.toContain('¥4,400');
    expect(detail).toContain('value="suspended_product_page"');
    expect(detail).not.toContain('Audio comparison in production');
    expect(detail).not.toContain('Demonstration video in production');
    expect(detail).not.toContain('Buy');
    expect(html).toContain('Vitreous');
  });

  it('publishes product-specific support guidance without an unverified install path', () => {
    const support = renderedPage('/support/suspended');
    expect(support).toContain('Installation');
    expect(support).toContain('Reporting a bug');
    expect(support).not.toContain('C:\\Program Files\\Common Files\\VST3');
  });
});
