import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  mockStudioBrainstorm,
  mockStudioNewWizardApis,
  saveStudioDraftFromIntake,
  skipIfStudioAuthExpired,
  studioLooksGoodButton,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #222 — SynopsisPanel content after brainstorm', {
  tag: [TAG.regression, TAG.studio, TAG.content, bugTag(222)],
}, () => {
  configureStudioAccess();

  test('shows course title, module accordion, and lesson detail', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await gotoStudio(page, STUDIO_NEW, { mockApis: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await saveStudioDraftFromIntake(page);
    await expect(studioLooksGoodButton(page)).toBeEnabled({ timeout: 25_000 });

    await expect(page.getByRole('heading', { name: /^test course$/i })).toBeVisible();

    const moduleToggle = page.getByRole('button', { name: /module 1|chương 1/i }).first();
    await expect(moduleToggle).toBeVisible();

    await moduleToggle.click();
    await moduleToggle.click();

    await expect(
      page.getByRole('button', { name: /(?:lesson|bài)\s*1:.*lesson 1/i }),
    ).toBeVisible({ timeout: 10_000 });

    await expect(page.getByRole('heading', { name: /^lesson 1$/i })).toBeVisible();
  });
});
