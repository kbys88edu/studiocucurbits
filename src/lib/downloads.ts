export const releaseOrigin = 'https://downloads.studiocucurbits.com';
export const currentReleaseUrl = `${releaseOrigin}/releases/current.json`;

export type PointerEntry = { candidateSha256: string; manifestPath: string; manifestSha256: string; versions: Record<string, string> };
type Pointer = PointerEntry & { schema: string; history: PointerEntry[] };
type Asset = { name: string; size: number; sha256: string; mediaType: string; customerDownload: boolean; key: string };
type Manifest = {
  schema: string; candidateSha256: string; repository: string; sourceSha: string; draftId: string;
  versions: Record<string, string>; candidateManifestSha256: string; stagingReceiptSha256: string;
  approvalSha256: string; assets: Asset[];
};
export type Installer = {
  name: string; url: string; platform: 'macos' | 'windows' | 'linux'; architecture: string;
  format: string; size: string; sha256: string;
};
export type ProductRelease = { version: string | null; installers: Installer[] };

const sha256 = /^[0-9a-f]{64}$/;
const sha = /^[0-9a-f]{40}$/;
const safeName = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,254}$/;
const product = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const version = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/;

function exact(value: unknown, keys: string[]): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).sort().join() === [...keys].sort().join();
}

function validVersions(value: unknown): value is Record<string, string> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.entries(value).length > 0 &&
    Object.entries(value).every(([key, item]) => product.test(key) && typeof item === 'string' && version.test(item));
}

function validPointerEntry(value: unknown): value is PointerEntry {
  return exact(value, ['candidateSha256', 'manifestPath', 'manifestSha256', 'versions']) &&
    typeof value.candidateSha256 === 'string' && sha256.test(value.candidateSha256) &&
    value.manifestPath === `releases/${value.candidateSha256}/manifest.json` && typeof value.manifestSha256 === 'string' &&
    sha256.test(value.manifestSha256) && validVersions(value.versions);
}

export function readCurrent(value: unknown): Pointer {
  if (exact(value, ['schema', 'candidateSha256', 'manifestPath', 'manifestSha256', 'versions']) &&
      value.schema === 'studio.cucurbits.r2-current.v1') {
    const entry = { candidateSha256: value.candidateSha256, manifestPath: value.manifestPath,
      manifestSha256: value.manifestSha256, versions: value.versions };
    if (validPointerEntry(entry)) return { ...entry, schema: value.schema, history: [] };
  }
  if (exact(value, ['schema', 'candidateSha256', 'manifestPath', 'manifestSha256', 'versions', 'history']) &&
      value.schema === 'studio.cucurbits.r2-current.v2' && Array.isArray(value.history)) {
    const entry = { candidateSha256: value.candidateSha256, manifestPath: value.manifestPath,
      manifestSha256: value.manifestSha256, versions: value.versions };
    const digests = new Set([entry.candidateSha256]);
    if (validPointerEntry(entry) && value.history.every((item) => validPointerEntry(item) && !digests.has(item.candidateSha256) && !!digests.add(item.candidateSha256)))
      return { ...entry, schema: value.schema, history: value.history };
  }
  throw new Error('Release metadata does not match');
}

function validManifest(value: unknown, current: PointerEntry): value is Manifest {
  if (!exact(value, ['schema', 'candidateSha256', 'repository', 'sourceSha', 'draftId', 'versions', 'candidateManifestSha256', 'stagingReceiptSha256', 'approvalSha256', 'assets']) ||
      value.schema !== 'studio.cucurbits.r2-production-manifest.v1' || value.candidateSha256 !== current.candidateSha256 ||
      typeof value.repository !== 'string' || !/^[A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*$/.test(value.repository) ||
      typeof value.sourceSha !== 'string' || !sha.test(value.sourceSha) || typeof value.draftId !== 'string' || !/^[1-9][0-9]*$/.test(value.draftId) ||
      !validVersions(value.versions) || Object.keys(current.versions).length !== Object.keys(value.versions).length ||
      !Object.entries(current.versions).every(([key, item]) => (value.versions as Record<string, string>)[key] === item) ||
      !['candidateManifestSha256', 'stagingReceiptSha256', 'approvalSha256'].every((key) => typeof value[key] === 'string' && sha256.test(value[key] as string)) ||
      !Array.isArray(value.assets)) return false;

  const prefix = `releases/${current.candidateSha256}/assets/`;
  const names = new Set<string>();
  return value.assets.every((row) => {
    if (!exact(row, ['name', 'size', 'sha256', 'mediaType', 'customerDownload', 'key']) ||
        typeof row.name !== 'string' || !safeName.test(row.name) || names.has(row.name)) return false;
    names.add(row.name);
    return Number.isSafeInteger(row.size) && (row.size as number) >= 0 && typeof row.sha256 === 'string' && sha256.test(row.sha256) &&
      typeof row.mediaType === 'string' && typeof row.customerDownload === 'boolean' && row.key === `${prefix}${row.name}`;
  });
}

function installer(asset: Asset): Installer | null {
  const lower = asset.name.toLowerCase();
  const platform = lower.endsWith('.pkg') ? 'macos' : lower.endsWith('.exe') || lower.endsWith('.msi') ? 'windows' : lower.endsWith('.deb') || lower.endsWith('.tar.zst') || lower.endsWith('.tar.gz') ? 'linux' : null;
  if (!platform) return null;
  return {
    name: asset.name, url: `${releaseOrigin}/${asset.key}`, platform,
    architecture: platform === 'macos' ? 'Universal' : lower.includes('arm64') || lower.includes('aarch64') ? 'ARM64' : platform === 'windows' ? 'x64' : 'x86-64',
    format: lower.endsWith('.tar.zst') ? 'TAR.ZST' : lower.endsWith('.tar.gz') ? 'TAR.GZ' : lower.slice(lower.lastIndexOf('.') + 1).toUpperCase(),
    size: `${Number((asset.size / 1_000_000).toFixed(1))} MB`, sha256: asset.sha256,
  };
}

export function releaseManifestUrl(value: unknown) {
  const entry = validPointerEntry(value) ? value : readCurrent(value);
  return new URL(entry.manifestPath, `${releaseOrigin}/`).toString();
}

export async function verifyManifestDigest(value: unknown, contents: string) {
  const entry = validPointerEntry(value) ? value : readCurrent(value);
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(contents)))]
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (digest !== entry.manifestSha256) throw new Error('Release metadata does not match');
}

export function detectPlatform(userAgent: string): 'macos' | 'windows' | 'linux' | null {
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macos';
  if (/Windows NT/i.test(userAgent)) return 'windows';
  return /Linux|X11/i.test(userAgent) && !/Android|CrOS/i.test(userAgent) ? 'linux' : null;
}

export function readRelease(current: unknown, approved: unknown, productSlug: string): ProductRelease {
  const entry = validPointerEntry(current) ? current : readCurrent(current);
  if (!validManifest(approved, entry)) throw new Error('Release metadata does not match');
  const releaseVersion = entry.versions[productSlug] ?? null;
  const installers = releaseVersion
    ? approved.assets.filter(({ customerDownload, name }) => customerDownload && name.toLowerCase().includes(productSlug))
      .map(installer).filter((value): value is Installer => value !== null)
    : [];
  return { version: releaseVersion, installers };
}

export function uniqueProductReleases(releases: ProductRelease[]): ProductRelease[] {
  const seen = new Set<string | null>();
  return releases.filter(({ version }) => !seen.has(version) && !!seen.add(version));
}
