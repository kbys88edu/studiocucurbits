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
  beforeAll(buildSite);

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
    expect(traces).toContain('SC Palimpsest');
    expect(traces).toContain('SC Suspended');
    expect(traces).toContain('SC Refraction');
    expect(tendril).toContain('Experimental physical models for strings, air columns, friction and resonant bodies.');
    expect(tendril).toContain('Not a realistic emulation.');
    expect(tendril).toContain('Designed for unstable resonance, extended technique and non-idiomatic performance.');
    expect(tendril).toContain('SC Piano String');
    expect(tendril).toContain('SC Cello');

    for (const html of [traces, tendril]) {
      expect(html).toContain('Forthcoming');
      expect(html).toContain('14 days');
      expect(html).toContain('Media preview in production');
      expect(html).not.toContain('Buy at intro price');
      expect(html).not.toContain('href=""');
    }
  });
}, 30_000);
