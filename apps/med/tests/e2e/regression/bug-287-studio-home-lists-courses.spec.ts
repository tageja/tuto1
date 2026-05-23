import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  mockStudioApis,
  skipIfStudioAuthExpired,
  STUDIO_HOME,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #287 — Studio home lists drafts without console errors', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, bugTag(287)],
}, () => {
  configureStudioAccess();

  test('studio home renders course list or empty state cleanly', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !/failed to fetch|hydration/i.test(msg.text())) {
        consoleErrors.push(msg.text());
      }
    });

    await mockStudioApis(page);
    await gotoStudio(page, STUDIO_HOME, { mockApis: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const main = page.locator('main');
    await expect(main).toBeVisible({ timeout: 30_000 });

    await expect(page.getByRole('main').getByRole('link', { name: /create course|tạo khóa học/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    const hasDraft = (await page.locator('section.card h3').count()) > 0;
    const hasEmpty = await page.getByText(/no drafts yet|chưa có bản nháp/i).isVisible().catch(() => false);
    expect(hasDraft || hasEmpty).toBeTruthy();

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
