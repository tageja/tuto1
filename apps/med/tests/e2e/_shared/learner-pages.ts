import path from 'path';
import { expect, test, type Page } from '@playwright/test';
import { attachConsoleHygiene } from './auth-pages';

export const learnerAuthFile = path.resolve('tests', '.auth', 'learner.json');

export const EMERGENCY_COURSE_ID = '9113d5cb-cedb-4bea-9678-7321020230e8';
export const EMERGENCY_COURSE_SLUG = 'emergency-nursing-communication';
export const EMERGENCY_COURSE_TITLE = /emergency nursing communication/i;
export const EMERGENCY_COURSE_PATH = `/learn/courses/${EMERGENCY_COURSE_SLUG}`;
export const EMERGENCY_MODULE_1_PATH =
  '/learn/courses/emergency-nursing-communication/modules/first-contact-in-an-emergency';
export const EMERGENCY_M1_LESSON_1_PATH =
  '/learn/courses/emergency-nursing-communication/lessons/whats-happening-first-words-in-an-emergency';

const NOT_FOUND_RE = /404|not found|không tìm thấy/i;

/** Skip when saved session expired (landed on login). */
export function skipIfAuthExpired(page: Page, reason: string): void {
  if (page.url().includes('/auth/login')) {
    test.skip(true, reason);
  }
}

/** Console hygiene for learner pages — ignores transient Supabase/network dev noise. */
export function attachLearnerConsoleHygiene(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => {
    if (err.message.includes('Failed to load chunk')) return;
    if (/failed to fetch/i.test(err.message)) return;
    errors.push(err.message);
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('Hydration')) return;
    if (text.includes('ERR_CONNECTION_TIMED_OUT')) return;
    if (text.includes('Failed to load resource')) return;
    if (/failed to fetch/i.test(text)) return;
    if (text.includes('Failed to fetch RSC payload')) return;
    if (text.includes('WebSocket is already')) return;
    errors.push(text);
  });
  return errors;
}

/** Mobile viewport hides sidebar off-canvas until the hamburger is opened. */
export async function openLearnerSidebarIfMobile(page: Page): Promise<void> {
  const menuBtn = page.getByRole('button', { name: /open menu/i });
  if (await menuBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await menuBtn.click();
    await page.waitForTimeout(300);
  }
}

export async function gotoLearner(
  page: Page,
  path: string,
  options?: { collectConsole?: boolean },
): Promise<string[]> {
  const consoleErrors = options?.collectConsole ? attachLearnerConsoleHygiene(page) : [];
  const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  if (page.url().includes('/auth/login')) {
    return consoleErrors;
  }
  expect(response?.status() ?? 200).toBeLessThan(400);
  await assertNoNotFound(page);
  return consoleErrors;
}

export async function assertNoNotFound(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: NOT_FOUND_RE })).toHaveCount(0);
  await expect(page.getByText(NOT_FOUND_RE)).toHaveCount(0);
}

/** Sidebar EN | VI toggle (not the top-bar VI hints control). */
export async function clickSidebarLangToggle(page: Page): Promise<void> {
  const toggle = page.locator('aside button').filter({ hasText: /^en\s*\|\s*vi$/i }).first();
  await expect(toggle).toBeVisible({ timeout: 10_000 });
  await toggle.evaluate((el) => (el as HTMLElement).click());
  await page.waitForTimeout(400);
}

export const VI_DIACRITICS =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export async function assertSidebarNavLink(
  page: Page,
  label: RegExp,
  expectedPath: RegExp,
): Promise<void> {
  await openLearnerSidebarIfMobile(page);
  const link = page.locator('aside').getByRole('link', { name: label });
  await expect(link).toBeVisible();
  await link.evaluate((el) => (el as HTMLElement).click());
  await expect(page).toHaveURL(expectedPath, { timeout: 30_000 });
  await assertNoNotFound(page);
}
