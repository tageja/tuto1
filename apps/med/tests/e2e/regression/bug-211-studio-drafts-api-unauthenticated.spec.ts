import { expect, test } from '@playwright/test';
import { STUDIO_DRAFTS_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const MINIMAL_DRAFT_BODY = {
  profession: 'Nurse',
  industry: 'Healthcare',
  topic: 'Emergency communication',
  target_age_group: 'Adults',
  category_id: '00000000-0000-0000-0000-000000000001',
};

test.describe('Bug #211 — /api/studio/drafts requires auth', {
  tag: [TAG.regression, TAG.studio, bugTag(211)],
}, () => {
  test('GET without session returns 401 or 403', async ({ request }) => {
    const response = await request.get(STUDIO_DRAFTS_API);
    expect([401, 403]).toContain(response.status());
  });

  test('POST without session returns 401 or 403', async ({ request }) => {
    const response = await request.post(STUDIO_DRAFTS_API, {
      data: MINIMAL_DRAFT_BODY,
      headers: { 'Content-Type': 'application/json' },
    });
    expect([401, 403]).toContain(response.status());
  });
});
