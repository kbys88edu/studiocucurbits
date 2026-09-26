import { describe, expect, it } from 'vitest';
import { detectPlatform, readCurrent, readRelease, uniqueProductReleases } from '../../src/lib/downloads';

const pointer = {
  schema: 'studio.cucurbits.r2-current.v1',
  candidateSha256: 'a'.repeat(64),
  manifestPath: `releases/${'a'.repeat(64)}/manifest.json`,
  manifestSha256: 'b'.repeat(64),
  versions: { suspended: '1.2.3' },
};

const manifest = {
  schema: 'studio.cucurbits.r2-production-manifest.v1',
  candidateSha256: 'a'.repeat(64),
  repository: 'studio/repository',
  sourceSha: 'c'.repeat(40),
  draftId: '17',
  versions: { suspended: '1.2.3' },
  candidateManifestSha256: 'd'.repeat(64),
  stagingReceiptSha256: 'e'.repeat(64),
  approvalSha256: 'f'.repeat(64),
  assets: [
    { name: 'Studio-Cucurbits-suspended-7.pkg', size: 12_500_000, sha256: '1'.repeat(64), mediaType: 'application/vnd.apple.installer+xml', customerDownload: true, key: `releases/${'a'.repeat(64)}/assets/Studio-Cucurbits-suspended-7.pkg` },
    { name: 'studio-cucurbits-suspended_7_amd64.deb', size: 10_000_000, sha256: '2'.repeat(64), mediaType: 'application/vnd.debian.binary-package', customerDownload: true, key: `releases/${'a'.repeat(64)}/assets/studio-cucurbits-suspended_7_amd64.deb` },
    { name: 'studio-cucurbits-suspended-7-3.tar.zst', size: 9_000_000, sha256: '3'.repeat(64), mediaType: 'application/zstd', customerDownload: true, key: `releases/${'a'.repeat(64)}/assets/studio-cucurbits-suspended-7-3.tar.zst` },
    { name: 'studio-cucurbits-suspended-7-3.tar.gz', size: 8_000_000, sha256: '5'.repeat(64), mediaType: 'application/gzip', customerDownload: true, key: `releases/${'a'.repeat(64)}/assets/studio-cucurbits-suspended-7-3.tar.gz` },
    { name: 'release-plan.json', size: 500, sha256: '4'.repeat(64), mediaType: 'application/json', customerDownload: false, key: `releases/${'a'.repeat(64)}/assets/release-plan.json` },
  ],
};

describe('public release metadata', () => {
  it('reads v1 and v2 pointers with immutable history', () => {
    expect(readCurrent(pointer).history).toEqual([]);
    const prior = {
      candidateSha256: '9'.repeat(64),
      manifestPath: `releases/${'9'.repeat(64)}/manifest.json`,
      manifestSha256: '8'.repeat(64),
      versions: { suspended: '1.2.3' },
    };
    const older = { ...prior, candidateSha256: '7'.repeat(64), manifestPath: `releases/${'7'.repeat(64)}/manifest.json`, versions: { vitreous: '1.0.0' } };
    expect(readCurrent({ ...pointer, schema: 'studio.cucurbits.r2-current.v2', history: [prior, older] }).history).toEqual([prior, older]);
  });

  it('builds Suspended installer choices only from the approved manifest', () => {
    expect(readRelease(pointer, manifest, 'suspended')).toEqual({
      version: '1.2.3',
      installers: [
        expect.objectContaining({ platform: 'macos', architecture: 'Universal', format: 'PKG', size: '12.5 MB', sha256: '1'.repeat(64) }),
        expect.objectContaining({ platform: 'linux', architecture: 'x86-64', format: 'DEB', size: '10 MB', sha256: '2'.repeat(64) }),
        expect.objectContaining({ platform: 'linux', architecture: 'x86-64', format: 'TAR.ZST', size: '9 MB', sha256: '3'.repeat(64) }),
        expect.objectContaining({ platform: 'linux', architecture: 'x86-64', format: 'TAR.GZ', size: '8 MB', sha256: '5'.repeat(64) }),
      ],
    });
  });

  it('rejects metadata that crosses release boundaries', () => {
    expect(() => readRelease({ ...pointer, candidateSha256: '0'.repeat(64) }, manifest, 'suspended')).toThrow('Release metadata does not match');
  });

  it('rejects non-versioned and traversing asset keys', () => {
    const malicious = structuredClone(manifest);
    malicious.assets[0].key = `releases/${'a'.repeat(64)}/assets/../../current.json`;
    expect(() => readRelease(pointer, malicious, 'suspended')).toThrow('Release metadata does not match');
  });

  it('rejects malformed release contracts', () => {
    expect(() => readRelease({ ...pointer, schema: 'foreign' }, manifest, 'suspended')).toThrow('Release metadata does not match');
    expect(() => readRelease(pointer, { ...manifest, unexpected: true }, 'suspended')).toThrow('Release metadata does not match');
  });

  it('returns no unrelated product installers', () => {
    expect(readRelease(pointer, manifest, 'vitreous')).toEqual({ version: null, installers: [] });
    const collisions = structuredClone(manifest);
    collisions.assets = collisions.assets.map((asset) => ({ ...asset,
      name: asset.name.replace('suspended', 'not-suspended'),
      key: asset.key.replace('suspended', 'not-suspended') }));
    expect(readRelease(pointer, collisions, 'suspended').installers).toEqual([]);
  });

  it('reads Windows installers and de-duplicates product versions newest first', () => {
    const windowsManifest = structuredClone(manifest);
    windowsManifest.assets = [
      { ...manifest.assets[0], name: 'studio-cucurbits-suspended-7-x64.exe', key: `releases/${'a'.repeat(64)}/assets/studio-cucurbits-suspended-7-x64.exe` },
      { ...manifest.assets[0], name: 'studio-cucurbits-suspended-7-arm64.msi', key: `releases/${'a'.repeat(64)}/assets/studio-cucurbits-suspended-7-arm64.msi` },
    ];
    expect(readRelease(pointer, windowsManifest, 'suspended').installers).toEqual([
      expect.objectContaining({ platform: 'windows', format: 'EXE', architecture: 'x64' }),
      expect.objectContaining({ platform: 'windows', format: 'MSI', architecture: 'ARM64' }),
    ]);
    const releases = [
      readRelease(pointer, manifest, 'suspended'),
      readRelease(pointer, manifest, 'suspended'),
      readRelease(pointer, manifest, 'vitreous'),
    ];
    expect(uniqueProductReleases(releases)).toEqual([releases[0], releases[2]]);
  });
});

describe('browser platform detection', () => {
  it('detects desktop macOS, Windows, and Linux only', () => {
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('macos');
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('windows');
    expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64)')).toBe('linux');
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 15)')).toBeNull();
    expect(detectPlatform('Mozilla/5.0 (X11; CrOS x86_64)')).toBeNull();
  });
});
