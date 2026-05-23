import { expect, test } from '@playwright/test';
import { ADMIN_MEDIA_QUEUE_PATCH_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const VALID_ADMIN_MEDIA_PATCH_BODY = {
  status: 'complete',
  output_url: 'https://example.com/video.mp4',
};

test.describe('Bug #246 — PATCH /api/admin/media-queue auth', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.auth, bugTag(246)],
}, () => {
  test('PATCH without session returns 403', async ({ request }) => {
    const response = await request.patch(ADMIN_MEDIA_QUEUE_PATCH_API, {
      data: VALID_ADMIN_MEDIA_PATCH_BODY,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(403);
  });
});
