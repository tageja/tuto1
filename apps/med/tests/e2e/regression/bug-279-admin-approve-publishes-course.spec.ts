import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin, skipIfAdminAuthExpired } from '../_shared/admin-pages';
import {
  mockAdminCourseReview,
  mockAdminReviewQueue,
  MOCK_PENDING_REVIEW_COURSE,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #279 — Admin approve removes course from pending list', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.review, TAG.adminPages, bugTag(279)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('approve clears pending queue entry', async ({ page }) => {
    let pending = [MOCK_PENDING_REVIEW_COURSE];

    await page.route('**/api/admin/courses/review-queue', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: pending }),
      });
    });

    await mockAdminCourseReview(page, MOCK_PENDING_REVIEW_COURSE.id, {
      onPost: () => {
        pending = [];
      },
      response: { success: true, reviewStatus: 'published' },
    });

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
    await expect(page.getByRole('heading', { name: MOCK_PENDING_REVIEW_COURSE.title })).toBeVisible({
      timeout: 15_000,
    });

    const card = page.locator('article').filter({ hasText: MOCK_PENDING_REVIEW_COURSE.title });
    await card.getByRole('button', { name: /^duyệt$|^approve$/i }).click();

    await expect(page.getByRole('heading', { name: MOCK_PENDING_REVIEW_COURSE.title })).toHaveCount(0, {
      timeout: 15_000,
    });
  });
});
