import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  mockStudioGenerateStreaming,
  reachStudioGenerationStep,
  studioGenerationHeading,
  studioGenerationProgressBar,
  studioLessonDoneCheckmarks,
  studioLessonSpinners,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #235 — Studio generation progress UI', {
  tag: [TAG.regression, TAG.studio, bugTag(235)],
}, () => {
  configureStudioAccess();

  test('shows progress bar, lesson status, and generating copy while streaming', async ({ page }) => {
    await reachStudioGenerationStep(page, {
      streamingGenerate: true,
      streamDelayMs: 100,
      streamIncludeComplete: false,
    });

    await expect(studioGenerationHeading(page)).toBeVisible();
    await expect(studioGenerationProgressBar(page)).toBeVisible();
    await expect(page.getByText(/generating your course|đang tạo khóa học|filling the fixed template|điền nội dung/i).first()).toBeVisible();

    await expect(studioLessonSpinners(page).or(studioLessonDoneCheckmarks(page)).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
