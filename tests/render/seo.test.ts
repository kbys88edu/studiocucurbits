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
});
