import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #200 — /admin/site page loads', {
  tag: [TAG.regression, TAG.adminPages, TAG.nav, bugTag(200)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('shows site settings form or content', async ({ page }) => {
    const consoleErrors = await gotoAdmin(page, '/admin/site', { collectConsole: true });

    const form = page
      .locator('form, input, textarea, select')
      .or(page.getByText(/site settings|homepage|video|cài đặt/i));
    await expect(form.first()).toBeVisible({ timeout: 60_000 });

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
