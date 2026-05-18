import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { EMERGENCY_M1_LESSON_1_PATH } from '../_shared/emergency-m1-l1-flow';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #18 — unauthenticated learner cannot load Module 1 lesson', {
  tag: [TAG.regression, TAG.module1, TAG.auth, bugTag(18)],
}, () => {
  test('deep link redirects to login with return path', async ({ page }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass disables protected-route redirects');
    await page.context().clearCookies();
    await page.goto(EMERGENCY_M1_LESSON_1_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
    const url = new URL(page.url());
    const nextParam = url.searchParams.get('next');
    expect(nextParam, 'expected ?next=<encoded lesson path> from middleware').toBeTruthy();
    const decoded = decodeURIComponent(nextParam!);
    expect(decoded).toContain('emergency-nursing-communication');
    expect(decoded).toContain('lessons');
  });
});
