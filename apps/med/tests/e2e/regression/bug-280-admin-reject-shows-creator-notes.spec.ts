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

test.describe('Bug #280 — Rejected course shows admin notes to creator', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.review, bugTag(280)],
}, () => {
  configureStudioAccess();

  test('rejection notes visible and submit for review re-enabled', async ({ page }) => {
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID, {
      payload: buildMockStudioCoursePayload({
        reviewStatus: 'rejected',
        reviewNotes: 'Needs more quiz variety',
      }),
    });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(page.getByRole('heading', { name: /revision requested|cần chỉnh sửa/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('Needs more quiz variety')).toBeVisible();
    await expect(studioReviewSubmitButton(page)).toBeVisible();
    await expect(studioReviewSubmitButton(page)).toBeEnabled();
  });
});
