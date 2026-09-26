import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';
import { expect, test, type Page, type Route } from '@playwright/test';

const siteUrl = 'http://127.0.0.1:49284';
const digest = 'a'.repeat(64);
const priorDigest = '9'.repeat(64);
const pointer = {
  schema: 'studio.cucurbits.r2-current.v2',
  candidateSha256: digest,
  manifestPath: `releases/${digest}/manifest.json`,
  manifestSha256: 'b'.repeat(64),
  versions: { suspended: '1.2.3' },
  history: [{ candidateSha256: priorDigest, manifestPath: `releases/${priorDigest}/manifest.json`, manifestSha256: '', versions: { suspended: '1.1.0' } }],
};
const manifest = {
  schema: 'studio.cucurbits.r2-production-manifest.v1', candidateSha256: digest,
  repository: 'studio/repository', sourceSha: 'c'.repeat(40), draftId: '17',
  versions: pointer.versions, candidateManifestSha256: 'd'.repeat(64),
  stagingReceiptSha256: 'e'.repeat(64), approvalSha256: 'f'.repeat(64),
  assets: [
    { name: 'Studio-Cucurbits-suspended-7.pkg', size: 12_500_000, sha256: '1'.repeat(64), mediaType: 'application/vnd.apple.installer+xml', customerDownload: true, key: `releases/${digest}/assets/Studio-Cucurbits-suspended-7.pkg` },
    { name: 'studio-cucurbits-suspended_7_amd64.deb', size: 10_000_000, sha256: '2'.repeat(64), mediaType: 'application/vnd.debian.binary-package', customerDownload: true, key: `releases/${digest}/assets/studio-cucurbits-suspended_7_amd64.deb` },
    { name: 'studio-cucurbits-suspended-7-x64.exe', size: 11_000_000, sha256: '3'.repeat(64), mediaType: 'application/octet-stream', customerDownload: true, key: `releases/${digest}/assets/studio-cucurbits-suspended-7-x64.exe` },
  ],
};
const priorManifest = { ...manifest, candidateSha256: priorDigest, draftId: '16', versions: { suspended: '1.1.0' }, assets: manifest.assets.slice(0, 2).map((asset) => ({ ...asset, key: asset.key.replace(digest, priorDigest) })) };
pointer.manifestSha256 = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
pointer.history[0].manifestSha256 = createHash('sha256').update(JSON.stringify(priorManifest)).digest('hex');

async function release(page: Page, userAgent: string, windows = true, brokenHistory = false) {
  await page.addInitScript((value: string) => Object.defineProperty(navigator, 'userAgent', { value }), userAgent);
  const currentManifest = windows ? manifest : { ...manifest, assets: manifest.assets.filter(({ name }) => !name.endsWith('.exe')) };
  const current = windows ? pointer : { ...pointer, manifestSha256: createHash('sha256').update(JSON.stringify(currentManifest)).digest('hex') };
  await page.route('https://downloads.studiocucurbits.com/releases/current.json', (route: Route) => route.fulfill({ json: current, headers: { 'access-control-allow-origin': '*' } }));
  await page.route(`https://downloads.studiocucurbits.com/releases/${digest}/manifest.json`, (route: Route) => route.fulfill({ json: currentManifest, headers: { 'access-control-allow-origin': '*' } }));
  await page.route(`https://downloads.studiocucurbits.com/releases/${priorDigest}/manifest.json`, (route: Route) => brokenHistory ? route.fulfill({ status: 404 }) : route.fulfill({ json: priorManifest, headers: { 'access-control-allow-origin': '*' } }));
}

test('macOS receives the approved macOS installer and retains Linux choice', async ({ page }) => {
  await release(page, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
  await page.goto(`${siteUrl}/downloads/suspended/`);
  await expect(page.getByRole('link', { name: 'Download for macOS' })).toHaveAttribute('href', /\.pkg$/);
  await expect(page.getByRole('link', { name: 'Linux Debian (AMD64)' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All installers' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Windows' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Windows x64' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Version 1.1.0' })).toBeVisible();
});

test('Linux receives the approved Linux installer and retains macOS choice', async ({ page }) => {
  await release(page, 'Mozilla/5.0 (X11; Linux x86_64)');
  await page.goto(`${siteUrl}/downloads/suspended/`);
  await expect(page.getByRole('link', { name: 'Download for Linux' })).toHaveAttribute('href', /\.deb$/);
  await expect(page.getByRole('link', { name: 'macOS Universal' }).first()).toBeVisible();
});

test('unknown systems receive a neutral choice instead of an installer guess', async ({ page }) => {
  await release(page, 'Mozilla/5.0 (UnknownOS)');
  await page.goto(`${siteUrl}/downloads/suspended/`);
  await expect(page.getByText('We could not identify your system.')).toBeVisible();
  await expect(page.locator('.download-primary')).toHaveCount(0);
  await expect(page.locator('.download-platform article')).toHaveCount(5);
});

test('Android receives manual choices rather than a desktop Linux guess', async ({ page }) => {
  await release(page, 'Mozilla/5.0 (Linux; Android 15)');
  await page.goto(`${siteUrl}/downloads/suspended/`);
  await expect(page.locator('.download-primary')).toHaveCount(0);
  await expect(page.locator('.download-platform article')).toHaveCount(5);
});

test('Windows receives the approved Windows installer', async ({ page }) => {
  await release(page, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  await page.goto(`${siteUrl}/downloads/suspended/`);
  await expect(page.getByRole('link', { name: 'Download for Windows' })).toHaveAttribute('href', /\.exe$/);
});

test('an empty Windows platform is omitted', async ({ page }) => {
  await release(page, 'Mozilla/5.0 (X11; Linux x86_64)', false);
  await page.goto(`${siteUrl}/downloads/suspended/`);
  await expect(page.getByRole('heading', { name: 'Windows' })).toHaveCount(0);
});

test('a broken historical manifest does not hide the current release', async ({ page }) => {
  await release(page, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', true, true);
  await page.goto(`${siteUrl}/downloads/suspended/`);
  await expect(page.getByRole('link', { name: 'Download for macOS' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Version 1.2.3' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Version 1.1.0' })).toHaveCount(0);
});

test('Japanese download actions remain localized', async ({ page }) => {
  await release(page, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
  await page.goto(`${siteUrl}/ja/downloads/suspended/`);
  await expect(page.getByRole('link', { name: 'macOS版をダウンロード' })).toBeVisible();
  await expect(page.getByText('for macOS')).toHaveCount(0);
});

test('development preview offers every private staging installer', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (X11; Linux x86_64)' }));
  await page.route('https://downloads.studiocucurbits.com/releases/current.json', (route: Route) => route.fulfill({ status: 404 }));
  await page.goto(`${siteUrl}/downloads/suspended/`);
  await expect(page.getByRole('link', { name: 'Download staging build for Linux' })).toHaveAttribute('href', 'https://staging.example/Suspended.deb');
  await expect(page.getByRole('link', { name: 'macOS Universal' }).first()).toHaveAttribute('href', 'https://staging.example/Suspended.pkg');
  await expect(page.getByRole('link', { name: 'Linux Universal Tarball (AMD64)' })).toHaveAttribute('href', 'https://staging.example/Suspended.tar.zst');
  await expect(page.getByRole('link', { name: 'Windows x64' }).first()).toHaveAttribute('href', 'https://staging.example/Suspended.exe');
  await expect(page.locator('.download-release').first().getByRole('heading', { level: 4 }).allTextContents()).resolves.toEqual(['macOS', 'Windows', 'Linux']);
  await expect(page.locator('.download-release').first().locator('.download-platform').last().getByRole('link').allTextContents()).resolves.toEqual(['Linux Debian (AMD64)', 'Linux Universal Tarball (AMD64)']);
  await expect(page.getByRole('heading', { name: 'Version 1.1.0' })).toBeVisible();
  await expect(page.locator('[data-download-stage]')).toHaveAttribute('aria-busy', 'false');
});

test('download page is responsive and has no serious accessibility violations', async ({ page }) => {
  await release(page, 'Mozilla/5.0 (X11; Linux x86_64)');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${siteUrl}/downloads/suspended/`);
  await expect(page.locator('[data-download-stage]')).toHaveAttribute('aria-busy', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  expect(await page.locator('.download-platform-heading img').first().evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([]);
});
