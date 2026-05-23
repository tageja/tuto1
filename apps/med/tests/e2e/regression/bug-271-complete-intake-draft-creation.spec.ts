import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  fillFullStudioIntakeForm,
  gotoStudio,
  mockStudioBrainstorm,
  mockStudioNewWizardApis,
  skipIfStudioAuthExpired,
  studioLooksGoodButton,
  studioMainForm,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #271 — Complete intake form creates draft and advances to synopsis', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, bugTag(271)],
}, () => {
  configureStudioAccess();

  test('fills all intake fields and reaches Step 2 brainstorm screen', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await gotoStudio(page, STUDIO_NEW, { mockApis: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await fillFullStudioIntakeForm(page);
    await studioMainForm(page).getByRole('button', { name: /save draft|lưu bản nháp/i }).click();

    await expect(studioMainForm(page)).toHaveCount(0, { timeout: 20_000 });
    await expect(page.getByText(/ai synopsis|tóm tắt ai/i)).toBeVisible({ timeout: 15_000 });
    await expect(studioLooksGoodButton(page)).toBeEnabled({ timeout: 25_000 });
  });
});
