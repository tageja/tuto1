import { expect, test } from '@playwright/test';
import {
  buildMockStudioCoursePayload,
  configureStudioAccess,
  gotoStudioCourse,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
  studioReviewSubmitButton,
  studioReviewValidateButton,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #259 — ReviewStatusPanel visible on studio course page', {
  tag: [TAG.regression, TAG.studio, TAG.review, bugTag(259)],
}, () => {
  configureStudioAccess();

  test('draft course shows validate and submit for review controls', async ({ page }) => {
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID, {
      payload: buildMockStudioCoursePayload({ reviewStatus: 'draft' }),
    });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(studioReviewValidateButton(page)).toBeVisible({ timeout: 30_000 });
    await expect(studioReviewSubmitButton(page)).toBeVisible();
  });
});
