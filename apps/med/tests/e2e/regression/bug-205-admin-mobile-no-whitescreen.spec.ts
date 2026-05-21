import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin, openAdminSidebarIfMobile } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #205 — admin mobile viewport does not white-screen', {
  tag: [TAG.regression, TAG.adminPages, TAG.visual, bugTag(205)],
}, () => {
  test.use({
    storageState: adminAuthFile,
    viewport: { width: 390, height: 844 },
  });

  for (const path of ['/admin', '/admin/courses'] as const) {
    test(`${path} renders main chrome at 390×844`, async ({ page }) => {
      await gotoAdmin(page, path);
      await expect(page.locator('main')).toBeVisible({ timeout: 30_000 });
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(20);
      await openAdminSidebarIfMobile(page);
      await expect(page.getByRole('link', { name: /courses|khóa học|overview/i }).first()).toBeVisible({
        timeout: 10_000,
      });
    });
  }
});
