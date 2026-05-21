import { expect, test } from '@playwright/test';
import {
  EMERGENCY_COURSE_ADMIN_PATH,
  adminAuthFile,
  gotoAdmin,
} from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #192 — /admin/courses/[courseId] course detail loads', {
  tag: [TAG.regression, TAG.adminPages, TAG.nav, bugTag(192)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('Emergency Nursing Communication shows modules or lessons', async ({ page }) => {
    const consoleErrors = await gotoAdmin(page, EMERGENCY_COURSE_ADMIN_PATH, {
      collectConsole: true,
    });

    await expect(
      page.getByRole('heading', { name: /emergency nursing communication/i }),
    ).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('heading', { name: /nội dung khóa học|course content/i })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /chỉnh sửa|edit/i }).first(),
    ).toBeVisible({ timeout: 30_000 });

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
