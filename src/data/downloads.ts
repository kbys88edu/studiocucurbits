import { createHash } from 'node:crypto';
import { products, collections } from './products';
import { currentReleaseUrl, readCurrent, readRelease, releaseManifestUrl, verifyManifestDigest } from '../lib/downloads';

async function catalogue() {
  // Local test snapshots never contain installer URLs or private staging credentials.
  const snapshot = process.env.DOWNLOAD_RELEASE_SNAPSHOT;
  const fixture = snapshot === undefined ? undefined : JSON.parse(snapshot);
  let staging = false;
  if (import.meta.env.MODE === 'development') {
    try {
      const installers = JSON.parse(process.env.SUSPENDED_STAGING_INSTALLERS || '[]');
      staging = Array.isArray(installers) && installers.some((item) => typeof item?.url === 'string' && item.url.startsWith('https://') && typeof item?.name === 'string' && /suspended.*\.(pkg|deb|tar\.zst|exe|msi)$/i.test(item.name));
    } catch {}
  }
  if (staging) return { state: 'development', slugs: new Set(['suspended']) };

  const response = snapshot === undefined
    ? await fetch(currentReleaseUrl, { signal: AbortSignal.timeout(30_000), cache: 'no-store' })
    : new Response(fixture ? JSON.stringify(fixture.pointer) : null, { status: fixture ? 200 : 404 });
  if (response.status === 404) return { state: 'unpublished', slugs: new Set<string>() };
  if (!response.ok) throw new Error(`Cannot read release pointer: ${response.status}`);
  const text = await response.text();
  const pointer = readCurrent(JSON.parse(text));
  const slugs = new Set<string>();
  // Fail the build on broken metadata: a transient outage must not remove live pages.
  for (const entry of [pointer, ...pointer.history]) {
    const manifestResponse = snapshot === undefined
      ? await fetch(releaseManifestUrl(entry), { signal: AbortSignal.timeout(30_000) })
      : new Response(fixture.manifests[entry.manifestPath] ?? null, { status: fixture.manifests[entry.manifestPath] ? 200 : 404 });
    if (!manifestResponse.ok) throw new Error(`Cannot read release manifest: ${manifestResponse.status}`);
    const contents = await manifestResponse.text();
    await verifyManifestDigest(entry, contents);
    const manifest = JSON.parse(contents);
    for (const slug of Object.keys(entry.versions)) {
      if (readRelease(entry, manifest, slug).installers.length) slugs.add(slug);
    }
  }
  return { state: createHash('sha256').update(text).digest('hex'), slugs };
}

const { state, slugs } = await catalogue();
export const downloadState = state;
export const downloadProducts = [
  ...products.map((product) => ({ ...product, image: product.media.heroImage })),
  ...collections.map((collection) => ({ ...collection, image: collection.heroImage })),
].filter(({ slug }) => slugs.has(slug)).map(({ slug, name, image, editorial }) => ({
  slug, name, image: image ?? '',
  imageAlt: { en: `${name} interface artwork`, ja: `${name}のインターフェース・アートワーク` },
  summary: { en: editorial.en.shortDescription, ja: editorial.ja.shortDescription },
}));
