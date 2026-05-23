import { expect, test } from '@playwright/test';
import {
  buildMockStudioCoursePayload,
  configureStudioAccess,
  gotoStudioCourse,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
  studioReviewSubmitButton,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #265 — Rejected state shows review notes', {
  tag: [TAG.regression, TAG.studio, TAG.review, bugTag(265)],
}, () => {
  configureStudioAccess();

  test('rejected course shows notes and resubmit controls', async ({ page }) => {
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID, {
      payload: buildMockStudioCoursePayload({
        reviewStatus: 'rejected',
        reviewNotes: 'Please add more quiz variety',
      }),
    });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(page.getByRole('heading', { name: /revision requested|cần chỉnh sửa/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('Please add more quiz variety')).toBeVisible();
    await expect(studioReviewSubmitButton(page)).toBeVisible();
    await expect(studioReviewSubmitButton(page)).toBeEnabled();
  });
});
