import { expect, test } from '@playwright/test';
import { gotoLearner, learnerAuthFile, skipIfAuthExpired } from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #189 — rewards balance is non-negative', {
  tag: [TAG.regression, TAG.learnerPages, TAG.data, bugTag(189)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('star balance and streak display integers >= 0', async ({ page }) => {
    await gotoLearner(page, '/learn/rewards');
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    const res = await page.waitForResponse(
      (r) => /\/api\/rewards\/balance/.test(r.url()) && r.status() === 200,
      { timeout: 90_000 },
    );
    const json = (await res.json()) as {
      success?: boolean;
      data?: { balance?: { balance?: number }; streak?: number };
    };
    expect(json.success).toBe(true);
    const balance = json.data?.balance?.balance ?? 0;
    const streak = json.data?.streak ?? 0;
    expect(balance).toBeGreaterThanOrEqual(0);
    expect(streak).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(balance)).toBe(true);
    expect(Number.isInteger(streak)).toBe(true);
  });
});
