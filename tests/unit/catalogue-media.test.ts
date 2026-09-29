import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

it('copies catalogue product media to the site asset path', () => {
  const root = mkdtempSync(join(tmpdir(), 'catalogue-media-'));
  try {
    const catalogue = join(root, 'catalogue');
    const media = join(catalogue, 'products', 'suspended', 'media');
    mkdirSync(media, { recursive: true });
    writeFileSync(join(media, 'interface.png'), 'current interface');
    execFileSync(process.execPath, [fileURLToPath(new URL('../../scripts/sync-catalogue-media.mjs', import.meta.url))], {
      cwd: root, env: { ...process.env, PRODUCT_CATALOGUE_DIR: catalogue },
    });
    expect(readFileSync(join(root, 'public', 'catalogue-media', 'suspended', 'interface.png'), 'utf8'))
      .toBe('current interface');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
