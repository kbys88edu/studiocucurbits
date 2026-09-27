import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser', testMatch: 'licensing.e2e.ts', workers: 1,
  timeout: 15000,
  use: { baseURL: 'http://127.0.0.1:49397' },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 49397',
    url: 'http://127.0.0.1:49397/', timeout: 60000,
    env: { ASTRO_PREVIEW_BACKGROUND: '1', LICENSING_API_BASE: 'https://abcdefghij.execute-api.ap-northeast-1.amazonaws.com/production' },
  },
});
