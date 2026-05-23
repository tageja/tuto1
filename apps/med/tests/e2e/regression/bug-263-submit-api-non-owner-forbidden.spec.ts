import path from 'path';
import { expect, test } from '@playwright/test';
import { MOCK_STUDIO_COURSE_SUBMIT_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const learnerAuthFile = path.resolve('tests', '.auth', 'learner.json');

test.describe('Bug #263 — POST /api/studio/courses/submit forbidden for learner', {
  tag: [TAG.regression, TAG.studio, TAG.review, TAG.auth, bugTag(263)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('POST with learner role returns 403', async ({ request }) => {
    const response = await request.post(MOCK_STUDIO_COURSE_SUBMIT_API);
    expect(response.status()).toBe(403);
  });
});
