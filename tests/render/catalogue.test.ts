import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getLocale } from '../../src/lib/locale';

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

async function getAvailablePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(typeof address === 'object' && address ? address.port : 0));
    });
  });
}

async function renderDevPage(path: string) {
  const port = await getAvailablePort();

  return new Promise<string>((resolve, reject) => {
    const server = spawn(process.execPath, ['node_modules/astro/astro.js', 'dev', '--config', 'tests/astro.server.config.mjs', '--host', '127.0.0.1', '--port', String(port)], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timeout = setTimeout(() => finish(new Error(`Astro dev server did not start: ${output}`)), 10_000);
    let output = '';

    function finish(error?: Error, html?: string) {
      clearTimeout(timeout);
      server.kill();
      error ? reject(error) : resolve(html!);
    }

    server.stdout.on('data', async (chunk: Buffer) => {
      output += chunk.toString();
      if (!output.includes('Local')) return;

      try {
        const response = await fetch(`http://127.0.0.1:${port}${path}`);
        finish(undefined, await response.text());
      } catch (error) {
        finish(error instanceof Error ? error : new Error(String(error)));
      }
    });
    server.stderr.on('data', (chunk: Buffer) => { output += chunk.toString(); });
    server.on('error', finish);
  });
}

describe('Audio Instruments catalogue', () => {
  it('features SC Suspended as the latest studio item', () => {
    buildSite();

    expect(renderedPage('')).toContain('SC Suspended');
  });

  it('excludes deliberately hidden products from the public catalogue', () => {
    buildSite();

    expect(renderedPage('/products')).not.toContain('Hidden prototype');
  });

  it('renders a localized coming-soon status for the catalogue', () => {
    buildSite();

    expect(renderedPage('/products')).toContain('Coming soon');
  });

  it('renders the Japanese coming-soon label when the active locale is ja', async () => {
    expect(getLocale(new URL('https://www.studiocucurbits.com/products/?lang=ja'))).toBe('ja');
    const html = await renderDevPage('/products/?lang=ja');

    expect(html).toContain('近日公開');
    expect(html).not.toContain('霑第律蜈ｬ髢・');
  });
}, 30_000);
