import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  mockStudioBrainstorm,
  mockStudioChat,
  mockStudioGenerate,
  mockStudioNewWizardApis,
  reachStudioSynopsisStep,
  skipIfStudioAuthExpired,
  studioGenerationHeading,
  studioLooksGoodButton,
  trackStudioGeneratePosts,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #234 — Studio Step 3 triggers generation', {
  tag: [TAG.regression, TAG.studio, bugTag(234)],
}, () => {
  configureStudioAccess();

  test('advances to GenerationProgress and POSTs /api/studio/generate automatically', async ({ page }) => {
    const generatePosts = trackStudioGeneratePosts(page);

    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await mockStudioChat(page);
    await mockStudioGenerate(page);

    await reachStudioSynopsisStep(page);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await studioLooksGoodButton(page).click();

    await expect(studioGenerationHeading(page)).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => generatePosts.length, { timeout: 15_000 }).toBeGreaterThan(0);
  });
});
