import { createHash } from 'node:crypto';

export function releaseSnapshot(slugs = ['suspended'], priorSlugs: string[] = []) {
  const manifests: Record<string, string> = {};
  function entry(names: string[], digest: string) {
    const versions = Object.fromEntries(names.map((slug) => [slug, '1.2.3']));
    const manifestPath = `releases/${digest}/manifest.json`;
    const text = JSON.stringify({
      schema: 'studio.cucurbits.r2-production-manifest.v1', candidateSha256: digest,
      repository: 'studio/repository', sourceSha: 'c'.repeat(40), draftId: '17', versions,
      candidateManifestSha256: 'd'.repeat(64), stagingReceiptSha256: 'e'.repeat(64), approvalSha256: 'f'.repeat(64),
      assets: names.map((slug) => {
        const name = `studio-cucurbits-${slug}-1.2.3.pkg`;
        return { name, size: 1234, sha256: '1'.repeat(64), mediaType: 'application/octet-stream', customerDownload: true, key: `releases/${digest}/assets/${name}` };
      }),
    });
    manifests[manifestPath] = text;
    return { candidateSha256: digest, manifestPath, manifestSha256: createHash('sha256').update(text).digest('hex'), versions };
  }
  const pointer = { schema: 'studio.cucurbits.r2-current.v2', ...entry(slugs, 'a'.repeat(64)), history: priorSlugs.length ? [entry(priorSlugs, 'b'.repeat(64))] : [] };
  return { pointer, manifests };
}

// Render tests launch real Astro builds; keep them independent of live releases.
process.env.DOWNLOAD_RELEASE_SNAPSHOT = JSON.stringify(releaseSnapshot());
