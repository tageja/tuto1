import { expect, test, type Page } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  mockStudioBrainstorm,
  mockStudioNewWizardApis,
  MOCK_STUDIO_CATEGORY,
  skipIfStudioAuthExpired,
  studioLooksGoodButton,
  studioMainForm,
  studioTemplateSelect,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

async function fillOrganisationalIntake(page: Page): Promise<void> {
  const form = studioMainForm(page);
  await studioTemplateSelect(page).selectOption('organisational_training');
  await form.getByPlaceholder(/registered nurse/i).fill('HR Manager');
  await form.getByPlaceholder(/healthcare/i).fill('Corporate');
  await form.getByPlaceholder(/emergency communication/i).fill('Onboarding');
  await form.getByPlaceholder(/22-35 working professionals/i).fill('25-45 professionals');

  const categorySelect = form.locator('select').filter({ hasText: /select category/i });
  await categorySelect.selectOption(MOCK_STUDIO_CATEGORY.id);
}

test.describe('Bug #256 — organisational training template wizard flow', {
  tag: [TAG.regression, TAG.studio, TAG.template, bugTag(256)],
}, () => {
  configureStudioAccess();

  test('selecting Organisational Training advances to Step 2 without crash', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await gotoStudio(page, STUDIO_NEW, { mockApis: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await fillOrganisationalIntake(page);
    await expect(studioTemplateSelect(page)).toHaveValue('organisational_training');

    await studioMainForm(page).getByRole('button', { name: /save draft|lưu bản nháp/i }).click();

    await expect(studioMainForm(page)).toHaveCount(0);
    await expect(page.getByText(/ai synopsis|tóm tắt ai/i)).toBeVisible({ timeout: 15_000 });
    await expect(studioLooksGoodButton(page)).toBeEnabled({ timeout: 25_000 });
  });
});
