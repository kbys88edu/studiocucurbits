import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { releaseSnapshot } from '../release-snapshot';
import { createHash } from 'node:crypto';

const root = new URL('../..', import.meta.url);
const page = (path: string) => new URL(`../../dist${path}`, import.meta.url);
function build(snapshot: unknown) {
  execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'pipe', env: { ...process.env, DOWNLOAD_RELEASE_SNAPSHOT: JSON.stringify(snapshot) } });
}

describe('release-derived download routes', () => {
  it('rebuilds scheduled runs only when the deployed release state changes', async () => {
    const workflow = readFileSync(new URL('../../.github/workflows/deploy.yml', import.meta.url), 'utf8');
    const script = workflow.split('          script: |\n')[1].split('\n\n  build:')[0].replace(/^            /gm, '');
    const run = new Function('context', 'core', 'require', 'fetch', `return (async () => { ${script} })()`);
    for (const [eventName, pointerStatus, deployedState, expected] of [
      ['push', 404, 'unpublished', 'true'],
      ['schedule', 404, 'unpublished', 'false'],
      ['schedule', 200, 'unpublished', 'true'],
      ['schedule', 200, createHash('sha256').update('pointer').digest('hex'), 'false'],
    ] as const) {
      const outputs: Record<string, string> = {};
      await run({ eventName }, { setOutput: (key: string, value: string) => { outputs[key] = value; } }, () => ({ createHash }), async (url: string) => url.includes('current.json') ? new Response('pointer', { status: pointerStatus }) : Response.json({ state: deployedState }));
      expect(outputs.changed).toBe(expected);
    }
    await expect(run({ eventName: 'schedule' }, {}, () => ({ createHash }), async () => new Response(null, { status: 503 }))).rejects.toThrow('Release pointer: 503');
  });

  it('omits unreleased routes, links, buttons and sitemap entries in both locales', () => {
    build(null);
    for (const locale of ['', '/ja']) {
      expect(existsSync(page(`${locale}/downloads/index.html`))).toBe(true);
      expect(existsSync(page(`${locale}/downloads/suspended/index.html`))).toBe(false);
      expect(readFileSync(page(`${locale}/downloads/index.html`), 'utf8')).not.toContain('/downloads/suspended/');
      expect(readFileSync(page(`${locale}/products/suspended/index.html`), 'utf8')).not.toContain('data-release-download=');
    }
    expect(readFileSync(page('/sitemap-index.xml'), 'utf8')).not.toContain('/downloads/suspended/');
    expect(JSON.parse(readFileSync(page('/download-state.json'), 'utf8')).state).toBe('unpublished');
  }, 30_000);

  it('automatically adds products and bundles while retaining earlier released products', () => {
    build(releaseSnapshot(['vitreous', 'traces'], ['suspended']));
    for (const locale of ['', '/ja']) {
      for (const slug of ['vitreous', 'traces', 'suspended']) {
        expect(existsSync(page(`${locale}/downloads/${slug}/index.html`))).toBe(true);
        expect(readFileSync(page(`${locale}/downloads/index.html`), 'utf8')).toContain(`${locale}/downloads/${slug}/`);
        expect(readFileSync(page('/sitemap-index.xml'), 'utf8')).toContain(`${locale}/downloads/${slug}/`);
      }
      expect(existsSync(page(`${locale}/downloads/tendril/index.html`))).toBe(false);
    }
  }, 30_000);

  it('rejects a mismatched manifest instead of publishing a partial catalogue', () => {
    const snapshot = releaseSnapshot();
    snapshot.pointer.manifestSha256 = '0'.repeat(64);
    expect(() => build(snapshot)).toThrow();
  }, 30_000);

  it('does not create pages for metadata-only or private release assets', () => {
    const snapshot = releaseSnapshot();
    const manifest = JSON.parse(snapshot.manifests[snapshot.pointer.manifestPath]);
    manifest.assets[0].customerDownload = false;
    const text = JSON.stringify(manifest);
    snapshot.manifests[snapshot.pointer.manifestPath] = text;
    snapshot.pointer.manifestSha256 = createHash('sha256').update(text).digest('hex');
    build(snapshot);
    expect(existsSync(page('/downloads/suspended/index.html'))).toBe(false);
  }, 30_000);
});
