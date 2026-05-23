import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  advanceStudioToGenerationStep,
  MOCK_GENERATE_ERROR_NDJSON,
  mockStudioGenerate,
  studioGenerationTryAgainButton,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #237 — Studio generation error state', {
  tag: [TAG.regression, TAG.studio, bugTag(237)],
}, () => {
  configureStudioAccess();

  test('shows error message and Try again after generate stream error', async ({ page }) => {
    await mockStudioGenerate(page, { body: MOCK_GENERATE_ERROR_NDJSON });
    await advanceStudioToGenerationStep(page);

    await expect(page.getByText('Generation failed').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/course generation failed|không thể tạo khóa học/i).first()).toBeVisible();
    await expect(studioGenerationTryAgainButton(page)).toBeVisible();
  });
});
