import { expect, test } from '@playwright/test';
import {
  buildMockStudioCoursePayload,
  configureStudioAccess,
  gotoStudioCourse,
  mockStudioCourseSubmit,
  mockStudioCourseValidate,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
  studioReviewSubmitButton,
  studioReviewValidateButton,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #277 — Review flow draft → validate → submit', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.review, bugTag(277)],
}, () => {
  configureStudioAccess();

  test('validate then submit shows under review state', async ({ page }) => {
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

    await mockStudioCourseValidate(page, {
      data: { valid: true, issueCount: 0, issues: [], totalSteps: 3 },
    });
    await mockStudioCourseSubmit(page, {
      onPost: () => {
        reviewStatus = 'submitted';
      },
    });

    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID, { mockCourse: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await studioReviewValidateButton(page).click();
    await expect(page.getByText(/all content looks good|nội dung đã đầy đủ/i)).toBeVisible({
      timeout: 15_000,
    });

    await studioReviewSubmitButton(page).click();
    await expect(page.getByRole('heading', { name: /under review|đang chờ duyệt/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(studioReviewSubmitButton(page)).toHaveCount(0);
  });
});
