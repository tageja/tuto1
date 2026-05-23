import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  mockStudioBrainstorm,
  mockStudioNewWizardApis,
  saveStudioDraftFromIntake,
  skipIfStudioAuthExpired,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const MOCK_BRAINSTORM_ERROR_NDJSON =
  '{"type":"error","error":"Brainstorm failed"}\n';

test.describe('Bug #224 — brainstorm error handling', {
  tag: [TAG.regression, TAG.studio, bugTag(224)],
}, () => {
  configureStudioAccess();

  test('shows user-facing error when stream returns type error', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page, { body: MOCK_BRAINSTORM_ERROR_NDJSON });
    await gotoStudio(page, STUDIO_NEW, { mockApis: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await saveStudioDraftFromIntake(page);

    await expect(
      page.locator('.card.border-error\\/30').filter({
        hasText: /could not generate the course synopsis|không thể tạo tóm tắt khóa học/i,
      }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
