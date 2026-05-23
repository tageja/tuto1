import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudioCourse,
  mockStudioCourseValidate,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
  studioReviewValidateButton,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #260 — Validate button calls validate API', {
  tag: [TAG.regression, TAG.studio, TAG.review, bugTag(260)],
}, () => {
  configureStudioAccess();

  test('shows all content looks good after successful validation', async ({ page }) => {
    await mockStudioCourseValidate(page, {
      data: { valid: true, issueCount: 0, issues: [], totalSteps: 3 },
    });
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const validateRequest = page.waitForRequest(
      (req) =>
        req.method() === 'GET' &&
        req.url().includes(`/api/studio/courses/${MOCK_STUDIO_COURSE_ID}/validate`),
    );

    await studioReviewValidateButton(page).click();
    await validateRequest;

    await expect(page.getByText(/all content looks good|nội dung đã đầy đủ/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
