import path from 'path';
import { expect, test } from '@playwright/test';
import { STUDIO_MEDIA_PATCH_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const learnerAuthFile = path.resolve('tests', '.auth', 'learner.json');

const VALID_MEDIA_PATCH_BODY = {
  creator_notes: 'Character / Presenter:\nNurse\n\nScene / Setting:\nHospital\n\nAdditional Notes:\n—',
};

test.describe('Bug #243 — PATCH /api/studio/media forbidden for learner', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.auth, bugTag(243)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('PATCH with learner role returns 403', async ({ request }) => {
    const response = await request.patch(STUDIO_MEDIA_PATCH_API, {
      data: VALID_MEDIA_PATCH_BODY,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(403);
  });
});
