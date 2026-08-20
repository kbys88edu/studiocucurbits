import { defineConfig } from '@playwright/test';

// Astro 7 refuses to start a second dev server while another holds the
// .astro/dev.json lock. This suite deliberately runs two of them from one
// project root, so both opt out of the lock.

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.e2e.ts',
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
      reuseExistingServer: !process.env.CI,
    },
  ],
});
