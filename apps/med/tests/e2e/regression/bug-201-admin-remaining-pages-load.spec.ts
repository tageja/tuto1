import { expect, test } from '@playwright/test';
import { ADMIN_LOAD_ONLY_PATHS, adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #201 — remaining admin pages load without 404', {
  tag: [TAG.regression, TAG.adminPages, TAG.nav, bugTag(201)],
}, () => {
  test.use({ storageState: adminAuthFile });

  for (const path of ADMIN_LOAD_ONLY_PATHS) {
    test(`${path} loads for admin`, async ({ page }) => {
      const consoleErrors = await gotoAdmin(page, path, { collectConsole: true });
      await expect(page.locator('main')).not.toBeEmpty();
      await expect(page.locator('body')).not.toHaveText(/^$/);
      expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
    });
  }
});
