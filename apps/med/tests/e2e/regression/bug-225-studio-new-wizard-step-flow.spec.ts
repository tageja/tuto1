import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  mockStudioBrainstorm,
  mockStudioNewWizardApis,
  saveStudioDraftFromIntake,
  skipIfStudioAuthExpired,
  studioLooksGoodButton,
  studioMainForm,
  studioRefineWithAiButton,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #225 — /studio/new wizard step flow', {
  tag: [TAG.regression, TAG.studio, bugTag(225)],
}, () => {
  configureStudioAccess();

  test('Step 1 intake → Step 2 synopsis with action buttons', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await gotoStudio(page, STUDIO_NEW, { mockApis: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(page.getByRole('heading', { name: /start a course draft|bắt đầu bản nháp/i })).toBeVisible();
    await expect(studioMainForm(page)).toBeVisible();
    await expect(studioRefineWithAiButton(page)).toHaveCount(0);

    await saveStudioDraftFromIntake(page);

    await expect(studioMainForm(page)).toHaveCount(0);
    await expect(page.getByText(/ai synopsis|tóm tắt ai/i)).toBeVisible({ timeout: 15_000 });

    await expect(studioLooksGoodButton(page)).toBeVisible({ timeout: 25_000 });
    await expect(studioRefineWithAiButton(page)).toBeVisible();
  });
});
