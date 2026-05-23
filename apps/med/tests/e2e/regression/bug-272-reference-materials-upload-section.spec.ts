import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  studioReferenceFileInput,
  studioReferenceMaterialsHeading,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #272 — Reference materials upload on intake form', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, bugTag(272)],
}, () => {
  configureStudioAccess();

  test('shows Reference Materials section with image and PDF accept types', async ({ page }) => {
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(studioReferenceMaterialsHeading(page)).toBeVisible({ timeout: 15_000 });

    const fileInput = studioReferenceFileInput(page);
    await expect(fileInput).toHaveAttribute('accept', /image\/jpeg|image\/png|application\/pdf|\.pdf/i);
    await expect(fileInput).toHaveAttribute('accept', /image\//);
  });
});
