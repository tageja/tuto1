import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin, skipIfAdminAuthExpired } from '../_shared/admin-pages';
import { mockAdminReviewQueue, MOCK_PENDING_REVIEW_COURSE } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #278 — Admin Pending Review tab lists submitted course', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.review, TAG.adminPages, bugTag(278)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('shows pending course with creator info and review actions', async ({ page }) => {
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

    await expect(page.getByRole('heading', { name: MOCK_PENDING_REVIEW_COURSE.title })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/QA Creator/)).toBeVisible();
    await expect(page.getByText(/creator@test\.com/)).toBeVisible();
    const card = page.locator('article').filter({ hasText: MOCK_PENDING_REVIEW_COURSE.title });
    await expect(card.getByRole('button', { name: /^duyệt$|^approve$/i })).toBeVisible();
    await expect(card.getByRole('button', { name: /^từ chối$|^reject$/i })).toBeVisible();
  });
});
