import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { EMERGENCY_M4_LESSON_1_PATH } from '../_shared/emergency-m4-l1-flow';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #47 — unauthenticated learner cannot load Module 4 lesson', {
  tag: [TAG.regression, TAG.module4, TAG.auth, bugTag(47)],
}, () => {
  test('deep link redirects to login with return path', async ({ page }) => {
    test.fixme(AUTH_DISABLED, 'Auth bypass disables protected-route redirects');
    await page.context().clearCookies();
    await page.goto(EMERGENCY_M4_LESSON_1_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
    const nextParam = new URL(page.url()).searchParams.get('next');
    expect(nextParam).toBeTruthy();
    const decoded = decodeURIComponent(nextParam!);
    expect(decoded).toContain('emergency-nursing-communication');
    expect(decoded).toContain('chest-pain-and-breathing-emergencies');
  });
});
