import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  mockStudioGenerateStreaming,
  reachStudioGenerationStep,
  studioGenerationViewCourseLink,
  studioLessonDoneCheckmarks,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #238 — Studio generation lesson progress', {
  tag: [TAG.regression, TAG.studio, bugTag(238)],
}, () => {
  configureStudioAccess();

  test('marks lessons done incrementally then all streamed lessons on complete', async ({ page }) => {
    await reachStudioGenerationStep(page, { streamingGenerate: true, streamDelayMs: 250 });

    const seenCounts: number[] = [];
    await expect
      .poll(
        async () => {
          const count = await studioLessonDoneCheckmarks(page).count();
          if (seenCounts.at(-1) !== count) seenCounts.push(count);
          return count;
        },
        { timeout: 25_000, intervals: [50, 100, 150] },
      )
      .toBe(3);

    expect(seenCounts.some((value) => value === 1)).toBeTruthy();
    expect(seenCounts[seenCounts.length - 1]).toBe(3);

    await expect(studioGenerationViewCourseLink(page)).toBeVisible({ timeout: 15_000 });
  });
});
