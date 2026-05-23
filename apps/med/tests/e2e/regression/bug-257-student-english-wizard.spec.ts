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

async function fillStudentEnglishIntake(page: Page): Promise<void> {
  const form = studioMainForm(page);
  await studioTemplateSelect(page).selectOption('student_english');
  await form.getByPlaceholder(/registered nurse/i).fill('Student');
  await form.getByPlaceholder(/healthcare/i).fill('University');
  await form.getByPlaceholder(/emergency communication/i).fill('Daily Conversation');
  await form.getByPlaceholder(/22-35 working professionals/i).fill('18-22 university students');

  const categorySelect = form.locator('select').filter({ hasText: /select category/i });
  await categorySelect.selectOption(MOCK_STUDIO_CATEGORY.id);
}

test.describe('Bug #257 — student English template wizard flow', {
  tag: [TAG.regression, TAG.studio, TAG.template, bugTag(257)],
}, () => {
  configureStudioAccess();

  test('selecting Student English advances to Step 2 without crash', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await gotoStudio(page, STUDIO_NEW, { mockApis: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await fillStudentEnglishIntake(page);
    await expect(studioTemplateSelect(page)).toHaveValue('student_english');

    await studioMainForm(page).getByRole('button', { name: /save draft|lưu bản nháp/i }).click();

    await expect(studioMainForm(page)).toHaveCount(0);
    await expect(page.getByText(/ai synopsis|tóm tắt ai/i)).toBeVisible({ timeout: 15_000 });
    await expect(studioLooksGoodButton(page)).toBeEnabled({ timeout: 25_000 });
  });
});
