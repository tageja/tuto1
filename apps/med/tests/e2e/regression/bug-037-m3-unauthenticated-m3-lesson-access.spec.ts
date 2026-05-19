import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { EMERGENCY_M3_LESSON_1_PATH } from '../_shared/emergency-m3-l1-flow';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #37 — unauthenticated learner cannot load Module 3 lesson', {
  tag: [TAG.regression, TAG.module3, TAG.auth, bugTag(37)],
}, () => {
  test('deep link redirects to login with return path', async ({ page }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass disables protected-route redirects');
    await page.context().clearCookies();
    await page.goto(EMERGENCY_M3_LESSON_1_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
    const url = new URL(page.url());
    const nextParam = url.searchParams.get('next');
    expect(nextParam).toBeTruthy();
    const decoded = decodeURIComponent(nextParam!);
    expect(decoded).toContain('emergency-nursing-communication');
    expect(decoded).toContain('safety-first-giving-urgent-instructions');
  });
});
