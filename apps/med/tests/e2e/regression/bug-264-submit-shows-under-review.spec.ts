import { expect, test } from '@playwright/test';
import {
  buildMockStudioCoursePayload,
  configureStudioAccess,
  gotoStudioCourse,
  mockStudioCourseSubmit,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
  studioReviewSubmitButton,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #264 — Submit shows Under Review after success', {
  tag: [TAG.regression, TAG.studio, TAG.review, bugTag(264)],
}, () => {
  configureStudioAccess();

  test('submitted course hides submit button and shows under review banner', async ({ page }) => {
    let reviewStatus = 'draft';

    await page.route(`**/api/studio/courses/${MOCK_STUDIO_COURSE_ID}`, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: buildMockStudioCoursePayload({
            reviewStatus,
            submittedAt: reviewStatus === 'submitted' ? '2026-05-23T12:00:00.000Z' : null,
          }),
        }),
      });
    });

    await mockStudioCourseSubmit(page, {
      onPost: () => {
        reviewStatus = 'submitted';
      },
    });

    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID, { mockCourse: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(studioReviewSubmitButton(page)).toBeVisible({ timeout: 30_000 });

    const submitRequest = page.waitForRequest(
      (req) =>
        req.method() === 'POST' &&
        req.url().includes(`/api/studio/courses/${MOCK_STUDIO_COURSE_ID}/submit`),
    );
    await studioReviewSubmitButton(page).click();
    await submitRequest;

    await expect(page.getByRole('heading', { name: /under review|đang chờ duyệt/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(studioReviewSubmitButton(page)).toHaveCount(0);
  });
});
