import { expect, test } from '@playwright/test';
import {
  assertBecomeCreatorDocumentTitle,
  becomeCreatorHeading,
  creatorLoginCta,
  creatorRegisterCta,
  gotoBecomeCreator,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #207 — /become-creator public page loads', {
  tag: [TAG.regression, TAG.studio, bugTag(207)],
}, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('returns 200 with title, heading, and login/register CTAs when logged out', async ({ page }) => {
    const response = await gotoBecomeCreator(page);
    expect(response?.status()).toBe(200);

    await assertBecomeCreatorDocumentTitle(page);
    await expect(becomeCreatorHeading(page)).toBeVisible();
    await expect(creatorLoginCta(page)).toBeVisible();
    await expect(creatorRegisterCta(page)).toBeVisible();
  });
});
