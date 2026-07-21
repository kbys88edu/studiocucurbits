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

describe('support, legal, and pre-launch routes', () => {
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

  it('withholds all individual collection pages until their launch preparation is complete', () => {
    for (const route of ['/collections/traces', '/collections/tendril', '/ja/collections/traces', '/ja/collections/tendril']) {
      expect(renderedPage(route)).toBe('');
    }
  });

  it('keeps Japanese support copy localized', () => {
    const support = renderedPage('/ja/support');

    expect(support).toContain('インストールとプラグインのスキャン');
    expect(support).toContain('よくある質問');
    expect(support).toContain('一般的なVST3の場所');
    expect(support).not.toContain('Installation and plugin scanning');
  });
}, 30_000);
