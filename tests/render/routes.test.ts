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

describe('Suspended sales routes', () => {
  beforeAll(buildSite);

  it('publishes Suspended while withholding other product and collection routes', () => {
    expect(renderedPage('/products/suspended')).toContain('Suspended');
    expect(renderedPage('/products/vitreous')).toBe('');
    expect(renderedPage('/collections/traces')).toBe('');
    expect(renderedPage('/collections/tendril')).toBe('');
  });

  it('lists Suspended without prices and with a notification CTA', () => {
    const html = renderedPage('/products');
    const detail = renderedPage('/products/suspended');
    const detailJa = renderedPage('/ja/products/suspended');
    expect(html).toContain('Hero_2560x1440.png');
    expect(html).toContain('Suspended');
    expect(detail).toContain('traces_suspended.png');
    expect(detail).toContain('central_sc_suspended.png');
    expect(detail).toContain('Sound in suspension. A body still in motion.');
    expect(detailJa).toContain('浮遊する音。動き続ける身体。');
    expect(detailJa).toContain('特徴');
    expect(detailJa).toContain('Windows / macOS / Linux 各アルファ版');
    expect(detailJa).toContain('ファクトリープリセット 8種');
    expect(detail).toContain('ALPHA INFORMATION');
    expect(detail).not.toContain('BETA INFORMATION');
    expect(detail).toContain('Almost Motionless');
    expect(detail).toContain('Spread');
    expect(detail).toContain('Attack Threshold');
    expect(detail).not.toContain('<h3>Scatter</h3>');
    expect(detail).not.toContain('<h3>Breath</h3>');
    expect(detail).not.toContain('<h3>Fragility</h3>');
    expect(detail).not.toContain('¥4,400');
    expect(detail).not.toContain('$29.00');
    expect(detail).not.toContain('¥4,400');
    expect(detail).toContain('href="/newsletter/"');
    expect(html).toContain('Vitreous');
  });

  it('keeps every product content section collapsed until its heading is opened', () => {
    const detail = renderedPage('/products/suspended');
    const specificationsJa = renderedPage('/ja/products/suspended/specifications');

    for (const summary of ['UI and renders', 'FEATURES', 'USES', 'FACTORY PRESETS', 'ALPHA INFORMATION', 'CREDITS', 'SPECIFICATIONS']) {
      expect(detail).toContain(`<span class="launch-summary-title">${summary}</span>`);
    }
    expect(detail).not.toContain('<span class="launch-summary-title">CONTROLS</span>');
    expect(detail).not.toContain('<span class="launch-summary-title">FREEZE / RELEASE</span>');
    expect(detail).not.toContain('href="#freeze-release"');
    expect(detail).toContain('<section class="launch-section comparison"');
    expect(detail).toContain('<h2 id="comparison-title">A different kind of freeze</h2>');
    expect(detail).not.toContain('<details class="launch-section comparison launch-disclosure"');
    expect(detail.indexOf('A different kind of freeze')).toBeLessThan(detail.indexOf('<details class="launch-section product-gallery launch-disclosure">'));
    expect(detail).not.toContain('<summary class="launch-summary"><span class="eyebrow">');
    expect(detail).not.toContain('href="/products/suspended/specifications/"');
    expect(detail).toContain('Attack Threshold');
    expect(detail).not.toContain(' open>');
    expect(specificationsJa).toContain('<h1 id="specifications-title">Suspended</h1>');
  });

  it('publishes product-specific support guidance without an unverified install path', () => {
    const support = renderedPage('/support/suspended');
    expect(support).toContain('Installation');
    expect(support).toContain('Reporting a bug');
    expect(support).not.toContain('C:\\Program Files\\Common Files\\VST3');
  });
});
