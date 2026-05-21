import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #198 — /admin/coupons page loads', {
  tag: [TAG.regression, TAG.adminPages, TAG.data, bugTag(198)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('shows coupon list or empty state', async ({ page }) => {
    const consoleErrors = await gotoAdmin(page, '/admin/coupons', { collectConsole: true });

    const content = page
      .locator('table tbody tr, .card')
      .or(page.getByText(/coupon|mã|no coupon|empty|chưa có/i));
    await expect(content.first()).toBeVisible({ timeout: 60_000 });

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
