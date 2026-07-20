import { expect, test } from '@playwright/test';

test('audio controls are native, start paused, show loading, and pause competing audio', async ({ page }) => {
  await page.route('**/audio/*.wav', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      contentType: 'audio/wav',
      body: Buffer.from('UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAACAgA==', 'base64'),
    });
  });

  await page.goto('/media-test/');

  const comparisons = page.locator('[data-audio-comparison-root]');
  await expect(comparisons).toHaveCount(2);
  await expect(comparisons.first().locator('[data-audio-loading]')).toBeVisible();
  await expect(page.locator('audio[autoplay]')).toHaveCount(0);

  const firstPlay = comparisons.first().getByRole('button', { name: 'Play dry' });
  await expect(firstPlay).toHaveJSProperty('tagName', 'BUTTON');
  await firstPlay.focus();
  await page.keyboard.press('Space');
  await expect(comparisons.first().locator('audio').first()).toHaveJSProperty('paused', false);

  await comparisons.nth(1).getByRole('button', { name: 'Play dry' }).click();
  await expect(comparisons.first().locator('audio').first()).toHaveJSProperty('paused', true);
  await expect(comparisons.nth(1).locator('audio').first()).toHaveJSProperty('paused', false);
});
