import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #196 — /admin/hospitals page loads', {
  tag: [TAG.regression, TAG.adminPages, TAG.data, bugTag(196)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('shows hospital list or empty state', async ({ page }) => {
    const consoleErrors = await gotoAdmin(page, '/admin/hospitals', { collectConsole: true });

    const content = page
      .locator('table tbody tr, .card')
      .or(page.getByText(/hospital|bệnh viện|no hospital|empty|chưa có/i));
    await expect(content.first()).toBeVisible({ timeout: 60_000 });

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
