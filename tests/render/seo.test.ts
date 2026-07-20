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
      ['/products/suspended', 'SC Suspended | Audio Instruments | Studio Cucurbits.', 'A held sound continues to move internally.'],
      ['/collections/traces', 'Traces | Audio Instruments | Studio Cucurbits.', 'Three processors for composing memory, suspension and spectral transformation.'],
      ['/support', 'Support | Studio Cucurbits.', 'Editable installation and support guidance.'],
      ['/privacy', 'Privacy | Studio Cucurbits.', 'Privacy information requiring final review.'],
    ]) {
      const html = renderedPage(path);

      expect(html).toContain(`<title>${title}</title>`);
      expect(html).toContain(`<meta name="description" content="${description}">`);
      expect(html).toContain(`<link rel="canonical" href="https://www.studiocucurbits.com${path}/">`);
    }
  });

  it('does not publish product offers for products that are not available', () => {
    const html = renderedPage('/products/suspended');

    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).not.toContain('"@type":"Product"');
    expect(html).not.toContain('"@type":"Offer"');
    expect(html).not.toContain('availability');
    expect(html).not.toContain('aggregateRating');
  });

  it('keeps Japanese static aliases self-canonical and locale-aware in breadcrumbs', () => {
    for (const path of ['/ja', '/ja/about', '/ja/work', '/ja/products', '/ja/collections']) {
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

  it('publishes a sitemap of English and Japanese public routes without hidden records', () => {
    const sitemap = builtFile('/sitemap-index.xml');

    for (const path of ['/about/', '/ja/about/', '/products/suspended/', '/ja/products/suspended/', '/collections/traces/', '/ja/collections/traces/']) {
      expect(sitemap).toContain(`<loc>https://www.studiocucurbits.com${path}</loc>`);
    }

    for (const path of ['/products/hidden-prototype/', '/products/palimpsest/', '/collections/future-artist-collection/']) {
      expect(sitemap).not.toContain(path);
    }

    expect(builtFile('/robots.txt')).toContain('Sitemap: https://www.studiocucurbits.com/sitemap-index.xml');
  });

  it('localizes primary Japanese pages and links each published equivalent language version', () => {
    for (const path of ['/ja', '/ja/about', '/ja/work', '/ja/products', '/ja/collections']) {
      const html = renderedPage(path);

      expect(html).toContain('<html lang="ja">');
      expect(html).toContain('<link rel="alternate" hreflang="en"');
      expect(html).toContain('<link rel="alternate" hreflang="ja"');
      expect(html).toContain('<link rel="alternate" hreflang="x-default"');
    }

    const home = renderedPage('/ja');
    const about = renderedPage('/ja/about');
    const products = renderedPage('/ja/products');

    expect(home).toContain('\u97f3\u697d\u30fb\u30b5\u30a6\u30f3\u30c9\u30fbAI\u30fb\u30af\u30ea\u30a8\u30a4\u30c6\u30a3\u30d6\u30c6\u30af\u30ce\u30ed\u30b8\u30fc');
    expect(home).toContain('<meta name="description" content="Studio Cucurbits.\u306f\u3001\u97f3\u697d\u3068\u30af\u30ea\u30a8\u30a4\u30c6\u30a3\u30d6\u30c6\u30af\u30ce\u30ed\u30b8\u30fc\u306e\u30b9\u30bf\u30b8\u30aa\u3067\u3059\u3002">');
    expect(about).toContain('<title>Studio Cucurbits.\u306b\u3064\u3044\u3066 | Studio Cucurbits.</title>');
    expect(products).toContain('<h1 id="products-title">\u30aa\u30fc\u30c7\u30a3\u30aa\u30fb\u30a4\u30f3\u30b9\u30c8\u30a5\u30eb\u30e1\u30f3\u30c4</h1>');
  });

  it('uses Japanese SEO titles and accessible labels on Japanese catalogue detail pages', () => {
    const product = renderedPage('/ja/products/suspended');
    const collection = renderedPage('/ja/collections/traces');

    expect(product).toContain('<title>SC Suspended | \u30aa\u30fc\u30c7\u30a3\u30aa\u30fb\u30a4\u30f3\u30b9\u30c8\u30a5\u30eb\u30e1\u30f3\u30c4 | Studio Cucurbits.</title>');
    expect(collection).toContain('<title>Traces | \u30aa\u30fc\u30c7\u30a3\u30aa\u30fb\u30a4\u30f3\u30b9\u30c8\u30a5\u30eb\u30e1\u30f3\u30c4 | Studio Cucurbits.</title>');
    expect(product).toContain('<a class="skip-link" href="#main-content">\u30b3\u30f3\u30c6\u30f3\u30c4\u3078\u79fb\u52d5</a>');
    expect(product).toContain('aria-label="\u8a00\u8a9e"');
  });
});
