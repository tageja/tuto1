import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #197 — /admin/metrics page loads', {
  tag: [TAG.regression, TAG.adminPages, TAG.data, bugTag(197)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('super_admin metrics dashboard renders without crash', async ({ page }) => {
    const consoleErrors = await gotoAdmin(page, '/admin/metrics', { collectConsole: true });

    const forbidden = page.getByText(/403|forbidden|not authorized/i);
    await expect(forbidden).toHaveCount(0);

    const content = page
      .locator('.kpi-card, .card')
      .or(page.getByText(/metric|platform|learner|course|retention|tỷ lệ/i));
    await expect(content.first()).toBeVisible({ timeout: 60_000 });

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
