import { expect, test } from '@playwright/test';
import {
  advanceStudioToGenerationStep,
  configureStudioAccess,
  mockStudioGenerate,
  studioGenerationHeading,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #231 — Studio Step 3 generation UI', {
  tag: [TAG.regression, TAG.studio, bugTag(231)],
}, () => {
  configureStudioAccess();

  test('advances to GenerationProgress without blank screen', async ({ page }) => {
    await mockStudioGenerate(page);
    await advanceStudioToGenerationStep(page);

    await expect(studioGenerationHeading(page)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

