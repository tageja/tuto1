import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  studioMainForm,
  studioTemplateSelect,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #215 — /studio/new intake form loads', {
  tag: [TAG.regression, TAG.studio, TAG.content, bugTag(215)],
}, () => {
  configureStudioAccess();

  test('renders required fields, template/size/language/category, and save draft', async ({ page }) => {
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(page.getByRole('heading', { name: /start a course draft|bắt đầu bản nháp/i })).toBeVisible({
      timeout: 30_000,
    });

    const form = studioMainForm(page);
    await expect(form.getByPlaceholder(/registered nurse/i)).toBeVisible();
    await expect(form.getByPlaceholder(/healthcare/i)).toBeVisible();
    await expect(form.getByPlaceholder(/emergency communication/i)).toBeVisible();
    await expect(form.getByPlaceholder(/22-35 working professionals/i)).toBeVisible();

    const templateSelect = studioTemplateSelect(page);
    const templateOptions = templateSelect.locator('option');
    await expect(templateOptions).toHaveCount(3);
    await expect(templateSelect.locator('option[value="professional_communication"]')).toHaveCount(1);
    await expect(templateSelect.locator('option[value="organisational_training"]')).toHaveCount(1);
    await expect(templateSelect.locator('option[value="student_english"]')).toHaveCount(1);

    const starterBtn = form.getByRole('button', { name: /^starter\b/i });
    const standardBtn = form.getByRole('button', { name: /^standard\b/i });
    const fullBtn = form.getByRole('button', { name: /^full\b/i });
    await expect(starterBtn).toBeVisible();
    await expect(standardBtn).toBeVisible();
    await expect(fullBtn).toBeVisible();
    await expect(starterBtn).toHaveClass(/border-primary/);

    const languageSelect = form.locator('select').filter({
      has: page.locator('option[value="bilingual"]'),
    });
    await expect(languageSelect.locator('option[value="bilingual"]')).toHaveCount(1);
    await expect(languageSelect.locator('option[value="en"]')).toHaveCount(1);
    await expect(languageSelect.locator('option[value="vi"]')).toHaveCount(1);

    await expect(form.locator('select').filter({ hasText: /select category/i })).toBeVisible();

    await expect(form.getByRole('button', { name: /save draft|lưu bản nháp/i })).toBeVisible();
  });
});
