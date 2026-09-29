import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser', testMatch: 'checkout.e2e.ts', workers: 1,
  use: { baseURL: 'http://127.0.0.1:49398' },
  webServer: {
    command: 'npm run dev -- --mode sandbox --host 127.0.0.1 --port 49398 --ignore-lock',
    url: 'http://127.0.0.1:49398/', reuseExistingServer: false,
    env: { ASTRO_DEV_BACKGROUND: '0', PADDLE_CHECKOUT_ENVIRONMENT: 'sandbox', PADDLE_CLIENT_TOKEN: `test_${'a'.repeat(27)}`,
      DOWNLOAD_RELEASE_SNAPSHOT: 'null', SITE_CATALOGUE_FILE: 'tests/fixtures/site-preview.v1.json' },
  },
});
