import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const useLocalWebServer = env.PW_USE_LOCAL_WEBSERVER === 'true';
const baseURL =
  env.E2E_BASE_URL ??
  (useLocalWebServer ? 'http://127.0.0.1:4200' : 'https://development.web-attendix.razz-dev.com');

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: useLocalWebServer
    ? {
        command: 'npm run start -- --host 127.0.0.1 --port 4200',
        url: 'http://127.0.0.1:4200',
        reuseExistingServer: !env.CI,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
