import path from 'path';
import { expect, test } from '@playwright/test';
import { ADMIN_COURSE_REVIEW_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const learnerAuthFile = path.resolve('tests', '.auth', 'learner.json');

test.describe('Bug #268 — POST /api/admin/courses/review requires super_admin', {
  tag: [TAG.regression, TAG.studio, TAG.review, TAG.auth, TAG.adminPages, bugTag(268)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('POST approve with learner role returns 403', async ({ request }) => {
    const response = await request.post(ADMIN_COURSE_REVIEW_API, {
      data: { action: 'approve' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(403);
  });
});
