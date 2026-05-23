import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  MOCK_GENERATE_COURSE_ID,
  MOCK_GENERATE_NDJSON,
  mockStudioBrainstorm,
  mockStudioChat,
  mockStudioGenerate,
  mockStudioNewWizardApis,
  reachStudioGenerationStep,
  skipIfStudioAuthExpired,
  studioGenerationProgressBar,
  studioGenerationViewCourseLink,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #274 — Generation progress completes with View Course link', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, bugTag(274)],
}, () => {
  configureStudioAccess();

  test('shows progress during stream and links to generated course', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await mockStudioChat(page);
    await mockStudioGenerate(page, { body: MOCK_GENERATE_NDJSON });

    await reachStudioGenerationStep(page);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(studioGenerationProgressBar(page)).toBeVisible({ timeout: 15_000 });

    const viewCourse = studioGenerationViewCourseLink(page);
    await expect(viewCourse).toBeVisible({ timeout: 30_000 });
    await expect(viewCourse).toHaveAttribute('href', `/studio/${MOCK_GENERATE_COURSE_ID}`);
  });
});
