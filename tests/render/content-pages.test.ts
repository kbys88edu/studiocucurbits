import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

function buildSite() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run build'] : ['run', 'build'];
  execFileSync(command, args, { cwd: root, stdio: 'pipe', env: { ...process.env, LICENSING_API_BASE: '', SUSPENDED_STAGING_INSTALLERS: '[{"name":"Suspended.deb","url":"https://staging.example/Suspended.deb"}]' } });
}

function renderedPage(path: string) {
  const file = new URL(`../../dist${path}/index.html`, import.meta.url);
  return existsSync(file) ? readFileSync(file, 'utf8') : '';
}

describe('support, legal, and pre-launch routes', () => {
  beforeAll(buildSite, 30_000);

  it('generates the required static support and legal routes in both locales', () => {
    for (const route of ['/support', '/downloads', '/license', '/privacy', '/terms', '/refund', '/business', '/coming-soon', '/beta', '/press', '/ja/support', '/ja/downloads', '/ja/license', '/ja/privacy', '/ja/terms', '/ja/refund', '/ja/business', '/ja/coming-soon', '/ja/beta', '/ja/press']) {
      expect(renderedPage(route)).not.toBe('');
    }
  });

  it('publishes licence pages without working forms when no production API is configured', () => {
    for (const route of ['/recovery', '/offline', '/ja/recovery', '/ja/offline']) {
      const html = renderedPage(route);
      expect(html).toContain('name="referrer" content="no-referrer"');
      expect(html).toContain('support@studiocucurbits.com');
      expect(html).not.toContain('id="recover"');
      expect(html).not.toContain('id="import"');
      expect(html).not.toContain('assets.mailerlite.com');
    }
  });

  it('generates the download overview without draft product downloads', () => {
    for (const route of ['/downloads', '/ja/downloads']) {
      expect(renderedPage(route), route).not.toBe('');
    }
    expect(renderedPage('/downloads')).not.toContain('/downloads/suspended/');
    expect(renderedPage('/downloads/suspended')).toBe('');
    expect(renderedPage('/ja/downloads/suspended')).toBe('');
    expect(renderedPage('/products/suspended')).toBe('');
    expect(renderedPage('/ja/products/suspended')).toBe('');
  });

  it('states final terms rather than a draft placeholder', () => {
    for (const route of ['/license', '/privacy', '/terms', '/refund', '/business', '/ja/license', '/ja/privacy', '/ja/terms', '/ja/refund', '/ja/business']) {
      expect(renderedPage(route), route).not.toContain('Draft content requiring final review');
    }
  });

  it('withholds all individual collection pages until their launch preparation is complete', () => {
    for (const route of ['/collections/traces', '/collections/tendril', '/ja/collections/traces', '/ja/collections/tendril']) {
      expect(renderedPage(route)).toBe('');
    }
  });

  it('keeps Japanese support copy localized', () => {
    const support = renderedPage('/ja/support');

    expect(support).toContain('インストールとプラグインのスキャン');
    expect(support).toContain('よくある質問');
    expect(support).toContain('VST3の保存場所');
    expect(support).toContain('基本ガイド');
    expect(support).not.toContain('Installation and plugin scanning');
  });
}, 30_000);

describe('draft artist notes', () => {
  beforeAll(buildSite, 30_000);

  it('keeps notes out of the public build in both locales', () => {
    expect(renderedPage('/products/suspended/notes')).toBe('');
    expect(renderedPage('/ja/products/suspended/notes')).toBe('');
  });
});

describe('legal documents carry real terms', () => {
  beforeAll(buildSite, 30_000);

  it('publishes substantive content on every legal page, not an empty shell', () => {
    const expectations: Array<[string, string]> = [
      ['/terms', 'Products are delivered digitally'],
      ['/privacy', 'This site is a static site'],
      ['/license', 'Install and use the plugin on up to three of your own active computers'],
      ['/refund', 'Ask for a refund within 14 days of purchase'],
      ['/ja/terms', '製品はデジタルデータとして提供します'],
      ['/ja/privacy', '本サイトは静的サイトです'],
      ['/ja/refund', 'ご購入から14日以内にご連絡いただければ返金します'],
    ];

    for (const [route, phrase] of expectations) {
      expect(renderedPage(route), route).toContain(phrase);
    }
  });

  it('describes the processors the site actually uses', () => {
    const privacy = renderedPage('/privacy');
    expect(privacy).toContain('MailerLite');
    expect(privacy).toContain('GitHub Pages');
  });

  it('links every legal document from the site footer', () => {
    const home = renderedPage('/');
    for (const path of ['/terms/', '/privacy/', '/license/', '/refund/', '/business/']) {
      expect(home).toContain(`href="${path}"`);
    }

    const homeJa = renderedPage('/ja');
    for (const path of ['/ja/terms/', '/ja/privacy/', '/ja/license/', '/ja/refund/', '/ja/business/']) {
      expect(homeJa).toContain(`href="${path}"`);
    }
  });
});

describe('seller disclosure', () => {
  beforeAll(buildSite, 30_000);

  it('publishes 特定商取引法に基づく表記 with the seller details', () => {
    const ja = renderedPage('/ja/business');

    expect(ja).toContain('特定商取引法に基づく表記');
    for (const field of ['事業者名', '運営統括責任者', '所在地', '電話番号', 'メールアドレス', '販売価格', '支払方法', '引渡時期', '返品']) {
      expect(ja, field).toContain(field);
    }
    expect(ja).toContain('小林 祥恵');
    expect(ja).toContain('東京都渋谷区道玄坂1-10-8');
    expect(ja).toContain('050-5530-1800');
    expect(ja).toContain('contact@studiocucurbits.com');
  });

  it('publishes the same disclosure in English', () => {
    const en = renderedPage('/business');
    expect(en).toContain('Business information');
    expect(en).toContain('Sachie Kobayashi');
    expect(en).toContain('Shibuya-ku, Tokyo');
    expect(en).toContain('contact@studiocucurbits.com');
  });

  it('names a reachable contact instead of pointing at a page that has none', () => {
    for (const route of ['/refund', '/privacy', '/ja/refund', '/ja/privacy']) {
      const html = renderedPage(route);
      expect(html, route).toContain(route.includes('refund') ? 'refunds@studiocucurbits.com' : 'info@studiocucurbits.com');
      expect(html, route).not.toContain('sachiekobayashi.com');
      expect(html, route).not.toContain('support address published on the Support page');
    }
  });

  it('keeps the disclosure refund window consistent with the refund policy', () => {
    expect(renderedPage('/ja/business')).toContain('14日以内');
    expect(renderedPage('/ja/refund')).toContain('14日以内');
    expect(renderedPage('/business')).toContain('within 14 days');
    expect(renderedPage('/refund')).toContain('within 14 days');
  });
});
