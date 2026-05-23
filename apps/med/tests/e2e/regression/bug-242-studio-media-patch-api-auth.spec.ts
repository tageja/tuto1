import { expect, test } from '@playwright/test';
import { STUDIO_MEDIA_PATCH_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const VALID_MEDIA_PATCH_BODY = {
  creator_notes: 'Character / Presenter:\nNurse\n\nScene / Setting:\nHospital\n\nAdditional Notes:\n—',
};

test.describe('Bug #242 — PATCH /api/studio/media auth', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.auth, bugTag(242)],
}, () => {
  test('PATCH without session returns 403', async ({ request }) => {
    const response = await request.patch(STUDIO_MEDIA_PATCH_API, {
      data: VALID_MEDIA_PATCH_BODY,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(403);
  });
});
