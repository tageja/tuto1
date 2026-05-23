import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  studioMainForm,
  STUDIO_NEW,
  trackStudioDraftPosts,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #216 — /studio/new form validation', {
  tag: [TAG.regression, TAG.studio, TAG.auth, bugTag(216)],
}, () => {
  configureStudioAccess();

  test('empty submit triggers HTML5 validation and no draft POST', async ({ page }) => {
    const posts = trackStudioDraftPosts(page);
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const form = studioMainForm(page);
    await form.getByRole('button', { name: /save draft|lưu bản nháp/i }).click();
    await expect(page).toHaveURL(STUDIO_NEW);

    const professionMsg = await form.getByPlaceholder(/registered nurse/i).evaluate(
      (el) => (el as HTMLInputElement).validationMessage,
    );
    expect(professionMsg.length).toBeGreaterThan(0);
    expect(posts).toEqual([]);
  });

  test('filled intake without category shows category-required toast', async ({ page }) => {
    const posts = trackStudioDraftPosts(page);
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const form = studioMainForm(page);
    await form.getByPlaceholder(/registered nurse/i).fill('Registered Nurse');
    await form.getByPlaceholder(/healthcare/i).fill('Healthcare');
    await form.getByPlaceholder(/emergency communication/i).fill('Emergency communication');
    await form.getByPlaceholder(/22-35 working professionals/i).fill('22-35 professionals');
    await form.getByRole('button', { name: /save draft|lưu bản nháp/i }).click();

    await expect(
      page.locator('p.text-red-500').filter({
        hasText: /choose an approved category|hãy chọn danh mục đã duyệt/i,
      }),
    ).toBeVisible({ timeout: 10_000 });
    expect(posts).toEqual([]);
    await expect(page).toHaveURL(STUDIO_NEW);
  });
});
