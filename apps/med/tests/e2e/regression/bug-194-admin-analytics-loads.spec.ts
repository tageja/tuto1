import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #194 — /admin/analytics page loads', {
  tag: [TAG.regression, TAG.adminPages, TAG.data, bugTag(194)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('renders chart, table, or empty state without console errors', async ({ page }) => {
    const consoleErrors = await gotoAdmin(page, '/admin/analytics', { collectConsole: true });

    const content = page
      .locator('canvas, svg, table')
      .or(page.getByText(/no data|empty|chưa có|loading|đang tải|analytics|phân tích/i));
    await expect(content.first()).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('main')).not.toBeEmpty();

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
