import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudioCourse,
  mockStudioCourseValidate,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
  studioReviewValidateButton,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #261 — Validation issues shown inline', {
  tag: [TAG.regression, TAG.studio, TAG.review, bugTag(261)],
}, () => {
  configureStudioAccess();

  test('lists issue count and lesson field details', async ({ page }) => {
    await mockStudioCourseValidate(page, {
      data: {
        valid: false,
        issueCount: 2,
        totalSteps: 3,
        issues: [
          {
            stepId: 'step-1',
            stepType: 'mcq',
            lessonTitle: 'L1',
            moduleTitle: 'Module 1',
            field: 'question_en',
            reason: 'empty',
          },
          {
            stepId: 'step-2',
            stepType: 'cloze',
            lessonTitle: 'L2',
            moduleTitle: 'Module 1',
            field: 'sentence_en',
            reason: 'placeholder',
          },
        ],
      },
    });
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await studioReviewValidateButton(page).click();

    await expect(page.getByText(/2 issue\(s\) found|2 lỗi/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/L1/)).toBeVisible();
    await expect(page.getByText(/question_en/i)).toBeVisible();
    await expect(page.getByText(/empty/i)).toBeVisible();
  });
});
