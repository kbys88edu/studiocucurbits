import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

describe('global navigation', () => {
  it('presents Audio Instruments as a parent-brand area without a purchase CTA', () => {
    const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
    const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run build'] : ['run', 'build'];
    execFileSync(command, args, { cwd: root, stdio: 'pipe' });
    const html = readFileSync(new URL('../../dist/index.html', import.meta.url), 'utf8');

    expect(html).toContain('Audio Instruments');
    expect(html).toContain('href="/about/"');
    expect(html).not.toContain('Buy now');
  });
});
