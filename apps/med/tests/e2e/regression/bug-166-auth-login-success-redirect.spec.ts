import { expect, test } from '@playwright/test';
import { loginAsTestLearner } from '../_shared/auth';
import { AUTH_DISABLED } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #166 — /auth/login successful login redirects to learn', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(166)],
}, () => {
  test('test@test.com lands on /learn after sign-in', async ({ page }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass — login redirect not exercised');

    await page.context().clearCookies();
    await loginAsTestLearner(page);
    expect(page.url()).toMatch(/\/learn/);
    await expect(page.getByRole('heading', { name: /404|not found/i })).toHaveCount(0);
  });
});
