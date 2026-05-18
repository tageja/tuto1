import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';

/**
 * Playwright config for tuto. Pro (apps/med)
 *
 * Local dev:        BASE_URL unset  -> http://localhost:3001 (auto-starts `npm run dev`)
 * Against preview:  BASE_URL=https://med-xyz.vercel.app npm run test:e2e
 * Against prod:     BASE_URL=https://pro.tuto.asia      npm run test:e2e
 *
 * Tag-based selection:
 *   npm run test:e2e -- --grep @smoke
 *   npm run test:e2e -- --grep @regression
 *   npm run test:e2e -- --grep @module-1
 *   npm run test:e2e -- --grep @bug-11
 */

// Zero-dep .env.local loader (Next.js already reads this for the dev server;
// we mirror it into Playwright's process so test helpers see the same flags).
try {
  const raw = fs.readFileSync('.env.local', 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, val] = m;
    const clean = val.replace(/^['"]|['"]$/g, '');
    if (process.env[key] === undefined) process.env[key] = clean;
  }
} catch {
  // .env.local missing is fine when running against a remote BASE_URL
}

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';
const IS_LOCAL = BASE_URL.startsWith('http://localhost');
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: ['**/_shared/**', '**/_fixtures/**'],

  timeout: 150_000,
  expect: { timeout: 45_000 },

  // Local Turbopack can drop chunks under parallel load; serialize tests outside CI.
  fullyParallel: IS_CI,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 2 : 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/reports/html', open: 'never' }],
    ['json', { outputFile: 'tests/reports/results.json' }],
  ],

  outputDir: 'tests/reports/artifacts',

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      dependencies: ['setup'],
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
  ],

  webServer: IS_LOCAL
    ? {
        command: 'npm run dev',
        url: 'http://localhost:3001',
        reuseExistingServer: !IS_CI,
        timeout: 120_000,
        stdout: 'ignore',
        stderr: 'pipe',
      }
    : undefined,
});
