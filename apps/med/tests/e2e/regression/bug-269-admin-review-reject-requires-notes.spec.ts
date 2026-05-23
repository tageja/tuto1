import { expect, test } from '@playwright/test';
import { adminAuthFile } from '../_shared/admin-pages';
import { ADMIN_COURSE_REVIEW_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #269 — Admin review reject requires notes', {
  tag: [TAG.regression, TAG.studio, TAG.review, TAG.auth, TAG.adminPages, bugTag(269)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('POST reject without review_notes returns 400', async ({ request }) => {
    const response = await request.post(ADMIN_COURSE_REVIEW_API, {
      data: { action: 'reject' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(400);
  });
});
