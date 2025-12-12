import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    // Note: App is served at /gitTrunfoPVP/ path (configured in vite.config.ts)
    baseURL: process.env.BASE_URL || 'http://localhost:3000/gitTrunfoPVP',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Note: webServer config removed - manually start dev server with `npm run dev`
  // before running tests. This is more reliable for development.
  // For CI, consider adding webServer config back or starting server in CI script.
});
