import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #1 — "Database error occurs when registering a new account"
 * Location: Register Page
 * Status in feedback: FIXED (per the spreadsheet note)
 *
 * Even if fixed, we keep this as a regression test so it can never come back.
 */

test.describe('Bug #1 — register flow does not crash', {
  tag: [TAG.regression, TAG.auth, TAG.crossCutting, bugTag(1)],
}, () => {
  test('POST to /auth/register does not return a 500', async ({ page }) => {
    const failures: string[] = [];
    page.on('response', (res) => {
      if (res.url().includes('/auth') && res.status() >= 500) {
        failures.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
    await page.getByLabel(/email/i).fill(`test+${Date.now()}@example.com`);
    await page.getByLabel(/password|mật khẩu/i).first().fill('TestPass123!');

    const submit = page.getByRole('button', { name: /register|đăng ký|sign up/i });
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(2000);
    }

    expect(failures, `5xx responses from auth endpoints: ${failures.join(', ')}`).toEqual([]);
  });
});
