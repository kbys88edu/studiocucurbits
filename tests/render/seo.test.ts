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

function builtFile(path: string) {
  return readFileSync(new URL(`../../dist${path}`, import.meta.url), 'utf8');
}

describe('production SEO', () => {
  beforeAll(buildSite, 30_000);

  it('renders a unique canonical title and description for public page types', () => {
    expect(renderedPage('')).toContain('<link rel="canonical" href="https://www.studiocucurbits.com/">');

    for (const [path, title, description] of [
      ['/products', 'Audio Instruments | Studio Cucurbits.', 'Audio Instruments from Studio Cucurbits are in development.'],
      ['/support', 'Support | Studio Cucurbits.', 'Editable installation and support guidance.'],
      ['/privacy', 'Privacy | Studio Cucurbits.', 'Privacy information requiring final review.'],
    ]) {
      const html = renderedPage(path);

      expect(html).toContain(`<title>${title}</title>`);
      expect(html).toContain(`<meta name="description" content="${description}">`);
      expect(html).toContain(`<link rel="canonical" href="https://www.studiocucurbits.com${path}/">`);
    }
  });

  it('withholds product and collection detail pages from public output', () => {
    for (const path of ['/products/suspended', '/products/vitreous', '/collections/traces', '/collections/tendril']) {
      expect(renderedPage(path)).toBe('');
    }
  });

  it('keeps Japanese static aliases self-canonical and locale-aware in breadcrumbs', () => {
    for (const path of ['/ja', '/ja/about', '/ja/work', '/ja/products']) {
      const html = renderedPage(path);

      expect(html).toContain(`<link rel="canonical" href="https://www.studiocucurbits.com${path}/">`);
      expect(html).toContain('"item":"https://www.studiocucurbits.com/ja/"');
    }
  });

  it('publishes the correct Open Graph locale and breadcrumb root label for each language', () => {
    const english = renderedPage('/about');
    const japanese = renderedPage('/ja/about');

    expect(english).toContain('<meta property="og:locale" content="en_US">');
    expect(english).toContain('"position":1,"name":"Home","item":"https://www.studiocucurbits.com/"');
    expect(japanese).toContain('<meta property="og:locale" content="ja_JP">');
    expect(japanese).toContain('"position":1,"name":"ホーム","item":"https://www.studiocucurbits.com/ja/"');
  });

  it('publishes a sitemap without withheld product or collection records', () => {
    const sitemap = builtFile('/sitemap-index.xml');

    for (const path of ['/about/', '/ja/about/', '/products/', '/ja/products/']) {
      expect(sitemap).toContain(`<loc>https://www.studiocucurbits.com${path}</loc>`);
    }

    for (const path of ['/products/suspended/', '/ja/products/suspended/', '/collections/traces/', '/ja/collections/traces/', '/collections/tendril/']) {
      expect(sitemap).not.toContain(path);
    }

    expect(builtFile('/robots.txt')).toContain('Sitemap: https://www.studiocucurbits.com/sitemap-index.xml');
  });

  it('localizes primary Japanese pages and links each published equivalent language version', () => {
    for (const path of ['/ja', '/ja/about', '/ja/work', '/ja/products']) {
      const html = renderedPage(path);

      expect(html).toContain('<html lang="ja">');
      expect(html).toContain('<link rel="alternate" hreflang="en"');
      expect(html).toContain('<link rel="alternate" hreflang="ja"');
      expect(html).toContain('<link rel="alternate" hreflang="x-default"');
    }

    const home = renderedPage('/ja');
    const about = renderedPage('/ja/about');
    const products = renderedPage('/ja/products');

    expect(home).toContain('音楽・サウンド・AI・クリエイティブテクノロジー');
    expect(home).toContain('<meta name="description" content="Studio Cucurbits.は、音楽とクリエイティブテクノロジーのスタジオです。">');
    expect(about).toContain('<title>Studio Cucurbits.について | Studio Cucurbits.</title>');
    expect(products).toContain('<h1 id="products-title">オーディオ・インストゥルメンツ</h1>');
  });
});
