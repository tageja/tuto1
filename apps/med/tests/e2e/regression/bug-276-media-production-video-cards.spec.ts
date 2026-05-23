import { expect, test } from '@playwright/test';
import {
  buildMockStudioCourseTwoModulesPayload,
  configureStudioAccess,
  E2E_OVERVIEW_COURSE_ID,
  gotoStudioCourse,
  skipIfStudioAuthExpired,
  studioCourseMediaTab,
  studioVideoRequestCharacterField,
  studioVideoRequestSceneField,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #276 — Media Production tab shows video request cards', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, TAG.mediaQueue, bugTag(276)],
}, () => {
  configureStudioAccess();

  test('two pending cards show scripts and production fields', async ({ page }) => {
    await gotoStudioCourse(page, E2E_OVERVIEW_COURSE_ID, {
      payload: buildMockStudioCourseTwoModulesPayload(),
    });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await studioCourseMediaTab(page).click();

    await expect(page.getByText(/first video script for e2e/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/second video script for e2e/i)).toBeVisible();
    await expect(studioVideoRequestCharacterField(page).first()).toBeVisible();
    await expect(studioVideoRequestSceneField(page).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /submit video request|gửi yêu cầu video/i }).first()).toBeVisible();
  });
});
