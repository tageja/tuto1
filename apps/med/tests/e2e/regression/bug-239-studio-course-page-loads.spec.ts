import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  gotoStudioCourse,
  mockStudioCourseApi,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
  STUDIO_HOME,
  studioCourseBackLink,
  studioCourseMediaTab,
  studioCourseOverviewTab,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const FAKE_COURSE_ID = '00000000-0000-0000-0000-000000000099';

test.describe('Bug #239 — /studio/[courseId] loads for creators', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.nav, bugTag(239)],
}, () => {
  configureStudioAccess();

  test('shows Overview and Media Production tabs for a course', async ({ page }) => {
    await gotoStudio(page, STUDIO_HOME);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const courseLinks = page.locator('main a[href^="/studio/"]:not([href="/studio/new"])');
    const linkCount = await courseLinks.count();

    if (linkCount > 0) {
      await courseLinks.first().click();
      await expect(page).toHaveURL(/\/studio\/[^/]+$/);
    } else {
      await mockStudioCourseApi(page);
      await page.goto(`/studio/${MOCK_STUDIO_COURSE_ID}`, { waitUntil: 'domcontentloaded' });
    }

    await expect(studioCourseOverviewTab(page)).toBeVisible({ timeout: 30_000 });
    await expect(studioCourseMediaTab(page)).toBeVisible();
  });

  test('unknown course id shows error instead of crashing', async ({ page }) => {
    await mockStudioCourseApi(page, {
      courseId: FAKE_COURSE_ID,
      status: 404,
      error: 'Not found',
    });
    await gotoStudio(page, `/studio/${FAKE_COURSE_ID}`, { mockApis: true });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(page.getByText(/not found|could not load course/i)).toBeVisible({ timeout: 15_000 });
    await expect(studioCourseBackLink(page)).toBeVisible();
    await expect(studioCourseOverviewTab(page)).toHaveCount(0);
  });
});

test.describe('Bug #239 — mocked course page smoke', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, bugTag(239)],
}, () => {
  configureStudioAccess();

  test('mocked course payload renders course title and tabs', async ({ page }) => {
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(page.getByRole('heading', { name: /E2E Studio Course/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(studioCourseOverviewTab(page)).toBeVisible();
    await expect(studioCourseMediaTab(page)).toBeVisible();
  });
});
