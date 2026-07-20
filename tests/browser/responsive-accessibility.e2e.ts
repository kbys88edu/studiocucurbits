import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const siteUrl = 'http://127.0.0.1:49284';
const viewports = [360, 390, 768, 1024, 1440, 1920];

for (const width of viewports) {
  test(`the studio home remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${siteUrl}/`);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Studio Cucurbits home' })).toBeVisible();
  });
}

test('the mobile menu toggle is visible and operable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${siteUrl}/`);

  const toggle = page.getByRole('banner').getByRole('button', { name: 'Menu', exact: true });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
});

test('the language switch keeps the equivalent static route', async ({ page }) => {
  await page.goto(`${siteUrl}/products/`);
  const languageSwitch = page.getByRole('navigation', { name: 'Language' });
  await languageSwitch.getByRole('link', { name: '日本語', exact: true }).click();
  await expect(page).toHaveURL(`${siteUrl}/ja/products/`);
  await languageSwitch.getByRole('link', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(`${siteUrl}/products/`);
});

test('reduced motion suppresses decorative motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${siteUrl}/`);
  expect(await page.locator('[data-decorative-animation]').evaluate((element) => parseFloat(getComputedStyle(element).animationDuration))).toBeLessThanOrEqual(0.01);
});

test('has no serious or critical axe violations', async ({ page }) => {
  await page.goto(`${siteUrl}/`);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([]);
});
