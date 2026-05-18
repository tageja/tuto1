import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { AUTH_DISABLED, TEST_USER } from './_shared/env';

const authDir = path.resolve('tests', '.auth');
const authFile = path.join(authDir, 'learner.json');

/**
 * Runs once before any project. Logs in and saves the session so
 * authenticated specs can reuse it via `storageState: authFile`.
 *
 * Strategy:
 *  1. If a valid auth file already exists, load its cookies and verify the
 *     session is still active. Reuse it if valid (fast path — no credentials needed).
 *  2. Fall back to a fresh email/password login only when no session exists or
 *     the session has expired.
 *  3. Never overwrite the auth file unless the session is confirmed valid.
 */
setup('authenticate test learner', async ({ page, context }) => {
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  if (AUTH_DISABLED) {
    await context.storageState({ path: authFile });
    return;
  }

  // ── Step 1: Try to reuse the existing session ────────────────────────────
  if (fs.existsSync(authFile)) {
    try {
      const stored = JSON.parse(fs.readFileSync(authFile, 'utf-8')) as {
        cookies?: Array<Record<string, unknown>>;
        origins?: Array<{ origin: string; localStorage: Array<{ name: string; value: string }> }>;
      };
      if (stored.cookies && stored.cookies.length > 0) {
        // Load cookies into the fresh browser context.
        await context.addCookies(
          stored.cookies as Parameters<typeof context.addCookies>[0],
        );
        // Navigate to a protected route — the middleware will refresh tokens if needed.
        await page.goto('/learn/courses', {
          timeout: 20_000,
          waitUntil: 'domcontentloaded',
        });
        if (page.url().includes('/learn')) {
          console.log('[setup] session reused from auth file');
          await page.evaluate(() =>
            localStorage.setItem('nursed_lesson_tour_seen', '1'),
          ).catch(() => {});
          await context.storageState({ path: authFile });
          return;
        }
        console.log('[setup] existing session expired — performing fresh login');
      }
    } catch (e) {
      console.warn('[setup] could not reuse existing session:', (e as Error).message);
    }
  }

  // ── Step 2: Fresh login ──────────────────────────────────────────────────
  let loginSucceeded = false;
  try {
    // Clear any stale cookies left from the session-reuse attempt above.
    await context.clearCookies();
    await page.goto('/auth/login', { timeout: 15_000, waitUntil: 'domcontentloaded' });
    const emailField = page.getByLabel(/email/i);
    if (await emailField.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await emailField.fill(TEST_USER.email);
      await page.getByLabel(/password|mật khẩu/i).fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
      // waitForFunction polls window.location rather than waiting for page-load
      // events, which avoids Turbopack dev-mode chunk fetches keeping the
      // navigation open and causing waitForURL to timeout.
      await page.waitForFunction(
        () => window.location.pathname.startsWith('/learn'),
        { timeout: 30_000 },
      );
      loginSucceeded = true;
      console.log('[setup] fresh login succeeded');
    }
  } catch (err) {
    console.warn(`[setup] login skipped: ${(err as Error).message}`);
  }

  // Pre-dismiss the lesson onboarding tour so it never blocks test navigation.
  // TourProvider gates the tour on localStorage key "nursed_lesson_tour_seen" === "1".
  await page.evaluate(() => {
    localStorage.setItem('nursed_lesson_tour_seen', '1');
  }).catch(() => {});

  // Only write the auth file when we have a confirmed valid session.
  // If login failed and there is already an existing (possibly still-valid)
  // auth file, keep it rather than overwriting with an empty/invalid state.
  if (loginSucceeded || !fs.existsSync(authFile)) {
    await context.storageState({ path: authFile });
  } else {
    console.warn('[setup] keeping existing auth file — fresh login failed');
  }
});
