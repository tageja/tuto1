import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #191 — /admin/courses course list loads', {
  tag: [TAG.regression, TAG.adminPages, TAG.nav, bugTag(191)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('shows at least one course row without console errors', async ({ page }) => {
    const consoleErrors = await gotoAdmin(page, '/admin/courses', { collectConsole: true });

    const courseRow = page
      .locator('table tbody tr')
      .or(page.locator('.card').filter({ has: page.getByRole('link', { name: /detail|chi tiết/i }) }))
      .or(page.getByRole('link', { name: /emergency|nursing|communication/i }));
    await expect(courseRow.first()).toBeVisible({ timeout: 60_000 });

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
