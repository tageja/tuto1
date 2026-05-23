import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  studioSuggestionForm,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #219 — /studio/new category suggestion form', {
  tag: [TAG.regression, TAG.studio, TAG.data, bugTag(219)],
}, () => {
  configureStudioAccess();

  test('suggestion form fields submit and show success toast', async ({ page }) => {
    await page.route('**/api/studio/category-suggestions', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { id: 'test-id' } }),
        });
        return;
      }
      await route.continue();
    });

    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(
      page.getByRole('heading', { name: /suggest a missing category|đề xuất danh mục còn thiếu/i }),
    ).toBeVisible();

    const form = studioSuggestionForm(page);
    await expect(form.locator('select').first()).toBeVisible();
    await expect(form.getByPlaceholder(/healthcare -> nurse -> icu/i)).toBeVisible();
    await expect(form.getByPlaceholder(/^ICU$/i)).toBeVisible();
    await expect(form.locator('textarea').first()).toBeVisible();
    await expect(form.getByRole('button', { name: /submit category suggestion|gửi đề xuất danh mục/i })).toBeVisible();

    await form.getByPlaceholder(/healthcare -> nurse -> icu/i).fill('Healthcare -> Nurse -> ICU');
    await form.getByPlaceholder(/^ICU$/i).fill('ICU');
    await form.locator('textarea').first().fill('Need ICU-specific nursing English category.');
    await form.getByRole('button', { name: /submit category suggestion|gửi đề xuất danh mục/i }).click();

    await expect(
      page
        .locator('.fixed.bottom-4')
        .getByText(/category suggestion sent for review|đã gửi đề xuất danh mục để review/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
