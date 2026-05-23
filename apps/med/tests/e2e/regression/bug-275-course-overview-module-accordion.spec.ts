import { expect, test } from '@playwright/test';
import {
  buildMockStudioCourseTwoModulesPayload,
  configureStudioAccess,
  E2E_OVERVIEW_COURSE_ID,
  gotoStudioCourse,
  skipIfStudioAuthExpired,
  studioCourseOverviewTab,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #275 — Course overview shows expandable module accordion', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, bugTag(275)],
}, () => {
  configureStudioAccess();

  test('Overview tab lists two modules with lesson rows', async ({ page }) => {
    await gotoStudioCourse(page, E2E_OVERVIEW_COURSE_ID, {
      payload: buildMockStudioCourseTwoModulesPayload(),
    });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(studioCourseOverviewTab(page)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/2/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /module 1/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /module 2/i })).toBeVisible();
    await expect(page.getByText('Lesson 1').first()).toBeVisible();

    await page.getByRole('button', { name: /module 2/i }).click();
    await expect(page.getByText('Lesson 8')).toBeVisible();
  });
});
