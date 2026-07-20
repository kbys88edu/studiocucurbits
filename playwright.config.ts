import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.e2e.ts',
  use: { baseURL: 'http://127.0.0.1:49283' },
  webServer: [
    {
      command: 'npm run dev -- --config astro.playwright.config.mjs --host 127.0.0.1 --port 49283',
      url: 'http://127.0.0.1:49283/media-test/',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 49284',
      url: 'http://127.0.0.1:49284/',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
