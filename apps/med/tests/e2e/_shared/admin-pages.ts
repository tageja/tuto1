import fs from 'fs';
import path from 'path';
import { expect, test, type Page } from '@playwright/test';
import { loginEmailField, loginPasswordField } from './auth-login-fields';
import { attachConsoleHygiene } from './auth-pages';
import { AUTH_DISABLED, TEST_ADMIN_USER } from './env';

export const adminAuthFile = path.resolve('tests', '.auth', 'admin.json');

export const EMERGENCY_COURSE_ADMIN_PATH = '/admin/courses/emergency-nursing-communication';
export const EMERGENCY_M1_L1_ADMIN_PATH =
  '/admin/courses/emergency-nursing-communication/lessons/whats-happening-first-words-in-an-emergency';

const NOT_FOUND_RE = /404|not found|không tìm thấy/i;

/** Remaining admin routes covered by bug-201 (parametrised load smoke). */
export const ADMIN_LOAD_ONLY_PATHS = [
  '/admin/animations',
  '/admin/audio',
  '/admin/feedback',
  '/admin/hospital',
  '/admin/hospital/courses',
  '/admin/hospital/learners',
  '/admin/hospital/speaking',
] as const;

export function skipIfAdminAuthExpired(page: Page, reason: string): void {
  if (page.url().includes('/auth/login')) {
    test.skip(true, reason);
  }
}

export function attachAdminConsoleHygiene(page: Page): string[] {
  return attachConsoleHygiene(page);
}

export async function loginAsTestAdmin(page: Page): Promise<void> {
  if (AUTH_DISABLED) return;

  await page.context().clearCookies();
  await page.goto('/auth/login?next=/admin', { waitUntil: 'domcontentloaded' });
  await loginEmailField(page).fill(TEST_ADMIN_USER.email);
  await loginPasswordField(page).fill(TEST_ADMIN_USER.password);
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await page.waitForFunction(() => window.location.pathname.startsWith('/admin'), {
    timeout: 35_000,
  });
}

export async function gotoAdmin(
  page: Page,
  adminPath: string,
  options?: { collectConsole?: boolean },
): Promise<string[]> {
  const consoleErrors = options?.collectConsole ? attachAdminConsoleHygiene(page) : [];
  const response = await page.goto(adminPath, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  skipIfAdminAuthExpired(page, 'admin auth file expired — run: npx playwright test --project=setup');
  if (!page.url().includes('/auth/login')) {
    expect(response?.status() ?? 200).toBeLessThan(500);
    await assertNoAdminNotFound(page);
  }
  return consoleErrors;
}

export async function assertNoAdminNotFound(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: NOT_FOUND_RE })).toHaveCount(0);
  await expect(page.getByText(NOT_FOUND_RE)).toHaveCount(0);
}

/** Assert unauthenticated /admin/* access shows login or redirects — never 404/500. */
export async function assertAdminRouteGated(page: Page, adminPath: string): Promise<void> {
  const response = await page.goto(adminPath, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const status = response?.status() ?? 0;
  expect(status).not.toBe(404);
  expect(status).not.toBeGreaterThanOrEqual(500);

  const url = page.url();
  const onLogin = /\/auth\/login/.test(url);
  const loginFormVisible = await page
    .getByRole('button', { name: /sign in|đăng nhập/i })
    .isVisible({ timeout: 5_000 })
    .catch(() => false);
  const adminLoginVisible = await page
    .locator('main')
    .getByText(/admin|quản trị/i)
    .first()
    .isVisible({ timeout: 2_000 })
    .catch(() => false);

  expect(onLogin || loginFormVisible || adminLoginVisible).toBeTruthy();
  await assertNoAdminNotFound(page);
}

/** Lesson editor step list rows (draggable cards). */
export function adminLessonStepRows(page: Page) {
  return page.locator('div.space-y-3 > div.card');
}

/** Verify drag-and-drop reorder fix exists in lesson editor source. */
export function assertLessonEditorDragFixInSource(): void {
  const lessonPagePath = path.resolve(
    'app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx',
  );
  const source = fs.readFileSync(lessonPagePath, 'utf8');
  expect(source).toContain(
    'const insertAt = dragIndex < dragOverIndex ? dragOverIndex - 1 : dragOverIndex',
  );
}

export async function openAdminSidebarIfMobile(page: Page): Promise<void> {
  const menuBtn = page.getByRole('button', { name: /open menu/i });
  if (await menuBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await menuBtn.click();
    await page.waitForTimeout(300);
  }
}
