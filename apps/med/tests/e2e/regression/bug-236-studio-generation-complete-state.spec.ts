import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  MOCK_GENERATE_COURSE_ID,
  reachStudioGenerationStep,
  studioGenerationViewCourseLink,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #236 — Studio generation complete state', {
  tag: [TAG.regression, TAG.studio, bugTag(236)],
}, () => {
  configureStudioAccess();

  test('shows success state and View Course link with courseId from stream', async ({ page }) => {
    await reachStudioGenerationStep(page);

    const viewCourse = studioGenerationViewCourseLink(page);
    await expect(viewCourse).toBeVisible({ timeout: 25_000 });
    await expect(viewCourse).toHaveAttribute('href', `/studio/${MOCK_GENERATE_COURSE_ID}`);
    await expect(page.getByText(/ready for review|sẵn sàng để review/i)).toBeVisible();
  });
});
