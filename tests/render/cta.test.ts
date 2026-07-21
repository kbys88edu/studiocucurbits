import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

function buildSite() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run build'] : ['run', 'build'];
  execFileSync(command, args, { cwd: root, stdio: 'pipe' });
}

function productPageExists(slug: string, locale = '') {
  return existsSync(fileURLToPath(new URL(`../../dist/${locale}products/${slug}/index.html`, import.meta.url)));
}

describe('product calls to action', () => {
  beforeAll(buildSite, 30_000);

  it('publishes a notification CTA before Stripe checkout is configured', () => {
    expect(productPageExists('suspended')).toBe(true);
    expect(productPageExists('vitreous')).toBe(false);
    expect(productPageExists('suspended', 'ja/')).toBe(true);
  });
}, 30_000);
