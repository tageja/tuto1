import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  studioTemplateSelect,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const EN_DESCRIPTIONS = [
  /workplace english for adults in specific roles/i,
  /company training, compliance, and soft skills/i,
  /english learning for university students/i,
];

test.describe('Bug #255 — studio new page template descriptions', {
  tag: [TAG.regression, TAG.studio, TAG.template, TAG.i18n, bugTag(255)],
}, () => {
  configureStudioAccess();

  test('English template descriptions are visible in the selector', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('nursed_lang', 'en'));
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const templateSelect = studioTemplateSelect(page);
    for (const pattern of EN_DESCRIPTIONS) {
      await expect(templateSelect).toContainText(pattern);
    }
  });

  test('studio chrome switches to Vietnamese while template descriptions stay English', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('nursed_lang', 'vi'));
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(page.getByRole('heading', { name: /bắt đầu bản nháp khóa học/i })).toBeVisible({
      timeout: 30_000,
    });

    const templateSelect = studioTemplateSelect(page);
    for (const pattern of EN_DESCRIPTIONS) {
      await expect(templateSelect).toContainText(pattern);
    }
  });
});
