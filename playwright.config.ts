import { defineConfig } from '@playwright/test';

// Astro 7 refuses to start a second dev server while another holds the
// .astro/dev.json lock. This suite deliberately runs two of them from one
// project root, so both opt out of the lock.

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.e2e.ts',
  testIgnore: ['licensing.e2e.ts', 'checkout.e2e.ts'], // Dedicated environment fixtures/configs.
  use: { baseURL: 'http://127.0.0.1:49283' },
  webServer: [
    {
      command: 'npm run dev -- --config astro.playwright.config.mjs --host 127.0.0.1 --port 49283 --ignore-lock',
      url: 'http://127.0.0.1:49283/media-test/',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 49284 --ignore-lock',
      url: 'http://127.0.0.1:49284/',
      env: { SUSPENDED_STAGING_INSTALLERS: JSON.stringify([
        { name: 'Studio-Cucurbits-suspended-1.pkg', url: 'https://staging.example/Suspended.pkg', version: '1.2.3' },
        { name: 'studio-cucurbits-suspended_1_amd64.deb', url: 'https://staging.example/Suspended.deb', version: '1.2.3' },
        { name: 'studio-cucurbits-suspended-1-1.tar.zst', url: 'https://staging.example/Suspended.tar.zst', version: '1.2.3' },
        { name: 'studio-cucurbits-suspended-1-x64.exe', url: 'https://staging.example/Suspended.exe', version: '1.2.3' },
        { name: 'Studio-Cucurbits-suspended-0.pkg', url: 'https://staging.example/Suspended-older.pkg', version: '1.1.0' },
        { name: 'studio-cucurbits-suspended_0_amd64.deb', url: 'https://staging.example/Suspended-older.deb', version: '1.1.0' },
      ]) },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
