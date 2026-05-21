import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #195 — /admin/students page loads', {
  tag: [TAG.regression, TAG.adminPages, TAG.data, bugTag(195)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('shows student list or empty state', async ({ page }) => {
    const consoleErrors = await gotoAdmin(page, '/admin/students', { collectConsole: true });

    const content = page
      .locator('table tbody tr')
      .or(page.getByText(/student|learner|học viên|no students|empty|chưa có/i));
    await expect(content.first()).toBeVisible({ timeout: 60_000 });

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
