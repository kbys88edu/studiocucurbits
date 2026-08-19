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

describe('newsletter announcement route', () => {
  beforeAll(buildSite, 30_000);

  it('renders an accessible unavailable newsletter form', () => {
    const html = renderedPage('/newsletter');

    expect(html).toContain('type="email"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Newsletter signup is not configured yet.');
    expect(html).toMatch(/data-newsletter-status[^>]*>Newsletter signup is not configured yet\.<\/p>/);
    expect(html).toContain('href="/privacy/"');
    expect(html).toContain('value="suspended"');

    const japanese = renderedPage('/ja/newsletter');
    expect(japanese).toContain('ニュースレターの登録は現在準備中です。');
    expect(japanese).toContain('data-newsletter-locale="ja"');
    expect(japanese).toContain('"name":"ニュースレター"');
    expect(japanese).not.toContain('"name":"Newsletter"');
  });

  it('provides a live privacy route for newsletter consent', () => {
    expect(renderedPage('/privacy')).toContain('Draft content requiring final review before publication.');
    expect(renderedPage('/ja/privacy')).toContain('Draft content requiring final review before publication.');
  });

  it('does not publish video copy or a broken play control without a source', () => {
    const html = renderedPage('/newsletter');

    expect(html).not.toContain('<video');
    expect(html).not.toContain('Demonstration video in production');
  });

  it('does not publish an audio placeholder until source files exist', () => {
    const html = renderedPage('/newsletter');

    expect(html).not.toContain('Audio comparison in production');
    expect(html).not.toContain('autoplay');
  });
});
