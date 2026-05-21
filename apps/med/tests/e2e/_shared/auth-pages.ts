import { expect, type Page } from '@playwright/test';

/** Collect console/page errors during navigation (filters dev noise). */
export function attachConsoleHygiene(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => {
    if (err.message.includes('Failed to load chunk')) return;
    errors.push(err.message);
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('Hydration')) return;
    if (text.includes('ERR_CONNECTION_TIMED_OUT')) return;
    if (text.includes('Failed to load resource')) return;
    errors.push(text);
  });
  return errors;
}

/** Auth pages use bilingual static copy (VI + EN), not a language toggle. */
export async function assertAuthBilingualChrome(page: Page): Promise<void> {
  const body = await page.locator('body').innerText();
  expect(body).toMatch(/đăng nhập|sign in/i);
  expect(body).toMatch(/mật khẩu|password/i);
}

export async function assertRegisterBilingualChrome(page: Page): Promise<void> {
  const body = await page.locator('body').innerText();
  expect(body).toMatch(/đăng ký|register/i);
  expect(body).toMatch(/họ và tên|full name/i);
}

export async function assertVerifyBilingualChrome(page: Page): Promise<void> {
  const body = await page.locator('body').innerText();
  expect(body).toMatch(/xác nhận email|verify your email/i);
}

/** Mock Supabase password grant failure (invalid credentials). */
export async function mockSupabaseInvalidLogin(page: Page): Promise<void> {
  await page.route(/\/auth\/v1\/token/, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Invalid login credentials',
        message: 'Invalid login credentials',
      }),
    });
  });
}

/** Mock Supabase sign-up duplicate user. */
export async function mockSupabaseDuplicateSignup(page: Page): Promise<void> {
  await page.route(/\/auth\/v1\/signup/, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({
        error_code: 'user_already_exists',
        msg: 'User already registered',
        message: 'User already registered',
      }),
    });
  });
}

export function trackAuthPosts(page: Page): string[] {
  const posts: string[] = [];
  page.on('request', (req) => {
    if (req.method() === 'POST' && /\/auth\/v1\/(token|signup)/.test(req.url())) {
      posts.push(req.url());
    }
  });
  return posts;
}
