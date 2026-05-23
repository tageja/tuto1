import { expect, test } from '@playwright/test';
import {
  buildMockStudioCoursePayload,
  configureStudioAccess,
  gotoStudioCourse,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #266 — Approved state shows live URL', {
  tag: [TAG.regression, TAG.studio, TAG.review, bugTag(266)],
}, () => {
  configureStudioAccess();

  test('published course shows approved heading and slug link', async ({ page }) => {
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID, {
      payload: buildMockStudioCoursePayload({
        reviewStatus: 'published',
        slug: 'test-course-abc123',
      }),
    });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(page.getByRole('heading', { name: /course approved|khóa học đã được duyệt/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/live at|xem tại/i)).toBeVisible();

    const liveLink = page.getByRole('link', { name: /test-course-abc123/ });
    await expect(liveLink).toBeVisible();
    await expect(liveLink).toHaveAttribute('href', /test-course-abc123/);
  });
});
