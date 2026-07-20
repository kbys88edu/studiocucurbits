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

describe('collection, support, and legal content pages', () => {
  beforeAll(buildSite, 30_000);

  it('generates the required static support and legal routes in both locales', () => {
    for (const route of ['/support', '/downloads', '/license', '/privacy', '/terms', '/coming-soon', '/beta', '/press', '/ja/support', '/ja/downloads', '/ja/license', '/ja/privacy', '/ja/terms', '/ja/coming-soon', '/ja/beta', '/ja/press']) {
      expect(renderedPage(route)).not.toBe('');
    }
  });

  it('marks every legal page as draft content requiring final review', () => {
    for (const route of ['/license', '/privacy', '/terms', '/ja/license', '/ja/privacy', '/ja/terms']) {
      expect(renderedPage(route)).toContain('Draft content requiring final review');
    }
  });

  it('renders supplied collection copy, membership, status, placeholders, and no checkout', () => {
    const traces = renderedPage('/collections/traces');
    const tendril = renderedPage('/collections/tendril');

    expect(traces).toContain('Three processors for composing memory, suspension and spectral transformation.');
    expect(traces).toContain('SC Suspended');
    expect(tendril).toContain('Experimental physical models for strings, air columns, friction and resonant bodies.');
    expect(tendril).toContain('Not a realistic emulation.');
    expect(tendril).toContain('Designed for unstable resonance, extended technique and non-idiomatic performance.');

    for (const html of [traces, tendril]) {
      expect(html).toContain('Forthcoming');
      expect(html).toContain('14 days');
      expect(html).toContain('Media preview in production');
      expect(html).not.toContain('Buy at intro price');
      expect(html).not.toContain('href=""');
    }
  });

  it('localizes shared support and collection content on Japanese routes', () => {
    const support = renderedPage('/ja/support');
    const traces = renderedPage('/ja/collections/traces');
    const collections = [traces, renderedPage('/ja/collections/tendril')];

    expect(support).toContain('\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3068\u30d7\u30e9\u30b0\u30a4\u30f3\u306e\u30b9\u30ad\u30e3\u30f3');
    expect(support).toContain('\u3088\u304f\u3042\u308b\u8cea\u554f');
    expect(support).toContain('\u4e00\u822c\u7684\u306aVST3\u306e\u5834\u6240');
    expect(support).toContain('<p class="eyebrow">\u30aa\u30fc\u30c7\u30a3\u30aa\u30fb\u30a4\u30f3\u30b9\u30c8\u30a5\u30eb\u30e1\u30f3\u30c4</p>');
    expect(support).not.toContain('Installation and plugin scanning');
    expect(support).not.toContain('Frequently asked questions');
    expect(support).not.toContain('<p class="eyebrow">Audio Instruments</p>');

    for (const html of collections) {
      expect(html).toContain('\u30b3\u30ec\u30af\u30b7\u30e7\u30f3\u306e\u30e1\u30c7\u30a3\u30a2');
      expect(html).toContain('Studio Cucurbits / \u30aa\u30fc\u30c7\u30a3\u30aa\u30fb\u30a4\u30f3\u30b9\u30c8\u30a5\u30eb\u30e1\u30f3\u30c4 / \u30b3\u30ec\u30af\u30b7\u30e7\u30f3</p>');
      expect(html).not.toContain('Media preview in production');
      expect(html).not.toContain('Included instruments');
      expect(html).not.toContain('Included products');
      expect(html).not.toContain('Any future introductory price');
      expect(html).not.toContain('/ Collection</p>');
      expect(html).not.toContain('Studio Cucurbits / Audio Instruments /');
    }
    expect(traces).toContain('\u542b\u307e\u308c\u308b\u88fd\u54c1');
  });
  it('does not publish hidden products inside public collection pages', () => {
    for (const route of ['/collections/traces', '/collections/tendril', '/ja/collections/traces', '/ja/collections/tendril']) {
      const html = renderedPage(route);

      expect(html).not.toContain('SC Palimpsest');
      expect(html).not.toContain('SC Refraction');
      expect(html).not.toContain('SC Piano String');
    }
  });
}, 30_000);
