import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin, skipIfAdminAuthExpired } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #267 — Admin courses Pending Review tab loads', {
  tag: [TAG.regression, TAG.studio, TAG.review, TAG.adminPages, bugTag(267)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('pending review tab is visible and clickable without crash', async ({ page }) => {
    await gotoAdmin(page, '/admin/courses');
    skipIfAdminAuthExpired(page, 'admin auth expired — run: npx playwright test --project=setup');

    const pendingTab = page.getByRole('button', { name: /pending review|chờ duyệt/i });
    await expect(pendingTab).toBeVisible({ timeout: 30_000 });

    await pendingTab.click();

    await expect(page.getByRole('heading', { name: /course management|quản lý khóa học/i })).toBeVisible();
    const emptyOrTable = page
      .getByText(/no courses found|không tìm thấy khóa học/i)
      .or(page.locator('table'));
    await expect(emptyOrTable.first()).toBeVisible({ timeout: 15_000 });
  });
});
