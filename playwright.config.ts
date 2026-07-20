import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.e2e.ts',
  use: { baseURL: 'http://127.0.0.1:49279' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 49279',
    url: 'http://127.0.0.1:49279',
    reuseExistingServer: !process.env.CI,
  },
});
