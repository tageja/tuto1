import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin, openAdminSidebarIfMobile } from '../_shared/admin-pages';
import { mockAdminPendingCount } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #270 — Admin sidebar shows pending count badge', {
  tag: [TAG.regression, TAG.studio, TAG.review, TAG.nav, TAG.adminPages, bugTag(270)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('courses nav link shows pending review count badge', async ({ page }) => {
    await mockAdminPendingCount(page, 3);
    await gotoAdmin(page, '/admin');
    await openAdminSidebarIfMobile(page);

    const coursesLink = page.locator('aside nav a[href="/admin/courses"]');
    await expect(coursesLink).toBeVisible({ timeout: 15_000 });
    await expect(coursesLink.getByText('3', { exact: true })).toBeVisible();
  });
});
