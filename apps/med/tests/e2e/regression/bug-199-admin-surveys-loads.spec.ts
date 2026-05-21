import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #199 — /admin/surveys page loads', {
  tag: [TAG.regression, TAG.adminPages, TAG.data, bugTag(199)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('shows survey panels or response data', async ({ page }) => {
    const consoleErrors = await gotoAdmin(page, '/admin/surveys', { collectConsole: true });

    const content = page
      .locator('table tbody tr, .card')
      .or(page.getByText(/survey|khảo sát|hcmute|nurse|response|phản hồi/i));
    await expect(content.first()).toBeVisible({ timeout: 60_000 });

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
