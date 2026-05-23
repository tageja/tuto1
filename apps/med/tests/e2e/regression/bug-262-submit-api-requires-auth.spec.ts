import { expect, test } from '@playwright/test';
import { MOCK_STUDIO_COURSE_SUBMIT_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #262 — POST /api/studio/courses/submit requires auth', {
  tag: [TAG.regression, TAG.studio, TAG.review, TAG.auth, bugTag(262)],
}, () => {
  test('POST without session returns 401 or 403', async ({ request }) => {
    const response = await request.post(MOCK_STUDIO_COURSE_SUBMIT_API);
    expect([401, 403]).toContain(response.status());
  });
});
