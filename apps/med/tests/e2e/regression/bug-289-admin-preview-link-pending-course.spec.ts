import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin, skipIfAdminAuthExpired } from '../_shared/admin-pages';
import { mockAdminReviewQueue, MOCK_PENDING_REVIEW_COURSE } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #289 — Admin preview link targets learner course slug', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.review, TAG.adminPages, bugTag(289)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('Pending Review card Preview href uses /learn/courses/[slug]', async ({ page }) => {
    await mockAdminReviewQueue(page);
    await page.route('**/api/courses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route('**/api/hospitals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await gotoAdmin(page, '/admin/courses');
    skipIfAdminAuthExpired(page, 'admin auth expired — run: npx playwright test --project=setup');

    await page.getByRole('button', { name: /pending review|chờ duyệt/i }).click();

    const card = page.locator('article').filter({ hasText: MOCK_PENDING_REVIEW_COURSE.title });
    const preview = card.getByRole('link', { name: /preview|xem thử/i });
    await expect(preview).toBeVisible({ timeout: 15_000 });
    await expect(preview).toHaveAttribute(
      'href',
      `/learn/courses/${MOCK_PENDING_REVIEW_COURSE.slug}`,
    );
  });
});
