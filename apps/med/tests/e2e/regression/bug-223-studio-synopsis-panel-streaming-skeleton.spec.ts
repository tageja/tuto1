import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  mockStudioBrainstorm,
  mockStudioNewWizardApis,
  saveStudioDraftFromIntake,
  skipIfStudioAuthExpired,
  studioSynopsisSkeleton,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #223 — SynopsisPanel streaming skeleton', {
  tag: [TAG.regression, TAG.studio, bugTag(223)],
}, () => {
  configureStudioAccess();

  test('shows skeleton shimmer while brainstorm stream is delayed', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page, { delayMs: 500 });
    await gotoStudio(page, STUDIO_NEW, { mockApis: false });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await saveStudioDraftFromIntake(page);

    await expect(studioSynopsisSkeleton(page)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('heading', { name: /^test course$/i })).toBeVisible({
      timeout: 25_000,
    });
  });
});
