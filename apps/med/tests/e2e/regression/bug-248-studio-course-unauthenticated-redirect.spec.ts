import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

const FAKE_COURSE_ID = '00000000-0000-0000-0000-000000000099';

test.describe('Bug #248 — unauthenticated /studio/[courseId] redirects to login', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.auth, bugTag(248)],
}, () => {
  test.beforeEach(async ({ context }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass — studio gate not enforced');
    await context.clearCookies();
  });

  test('/studio/[courseId] redirects to /auth/login', async ({ page }) => {
    await page.goto(`/studio/${FAKE_COURSE_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
    expect(page.url()).toMatch(/next=/);
    await expect(page.getByRole('heading', { name: /404|not found/i })).toHaveCount(0);
  });
});
