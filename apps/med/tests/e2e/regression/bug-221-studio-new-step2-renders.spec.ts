import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  mockStudioBrainstorm,
  mockStudioNewWizardApis,
  saveStudioDraftFromIntake,
  skipIfStudioAuthExpired,
  studioLooksGoodButton,
  studioRefineWithAiButton,
  studioSynopsisSkeleton,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #221 — /studio/new Step 2 renders after brainstorm', {
  tag: [TAG.regression, TAG.studio, bugTag(221)],
}, () => {
  configureStudioAccess();

  test('synopsis step shows panel and action buttons after mocked stream', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await gotoStudio(page, STUDIO_NEW, { mockApis: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await saveStudioDraftFromIntake(page);

    await expect(
      studioSynopsisSkeleton(page).or(page.getByText(/ai synopsis|tóm tắt ai/i)),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByRole('heading', { name: /^test course$/i })).toBeVisible({
      timeout: 20_000,
    });

    await expect(studioLooksGoodButton(page)).toBeVisible();
    await expect(studioRefineWithAiButton(page)).toBeVisible();
  });
});
