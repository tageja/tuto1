import { expect, test } from '@playwright/test';
import {
  buildMockPendingVideoItem,
  buildMockStudioCoursePayload,
  configureStudioAccess,
  gotoStudioCourse,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
  studioCourseMediaTab,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #240 — Media Production tab shows queue or empty state', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.content, bugTag(240)],
}, () => {
  configureStudioAccess();

  test('with video items — shows request cards', async ({ page }) => {
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID, {
      payload: buildMockStudioCoursePayload({
        videoItems: [buildMockPendingVideoItem()],
      }),
    });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await studioCourseMediaTab(page).click();
    await expect(page.getByText(/module 1 · lesson 1 · step 1.*video/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/E2E AI script for manual video production/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /submit video request|gửi yêu cầu video/i })).toBeVisible();
  });

  test('without video items — shows empty state', async ({ page }) => {
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await studioCourseMediaTab(page).click();
    await expect(page.getByText(/no video requests for this course/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: /submit video request|gửi yêu cầu video/i })).toHaveCount(0);
  });
});
