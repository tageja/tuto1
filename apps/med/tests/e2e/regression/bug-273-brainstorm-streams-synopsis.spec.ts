import { expect, test } from '@playwright/test';
import {
  buildE2eValidSynopsis,
  configureStudioAccess,
  mockStudioBrainstorm,
  mockStudioNewWizardApis,
  reachStudioSynopsisStep,
  skipIfStudioAuthExpired,
  studioLooksGoodButton,
  studioSynopsisHeading,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const SYNOPSIS = buildE2eValidSynopsis({
  courseTitle: 'Test Course',
  module1Title: 'Compliance Foundations',
});
SYNOPSIS.templateId = 'organisational_training';

const MOCK_NDJSON =
  '{"type":"partial","synopsis":{"courseTitle":"Test Course","modules":[]}}\n' +
  `{"type":"complete","synopsis":${JSON.stringify(SYNOPSIS)}}\n`;

test.describe('Bug #273 — Brainstorm streams synopsis with module titles', {
  tag: [TAG.regression, TAG.studio, TAG.e2e, bugTag(273)],
}, () => {
  configureStudioAccess();

  test('synopsis panel shows modules and Continue is enabled', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page, { body: MOCK_NDJSON });
    await reachStudioSynopsisStep(page);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(studioSynopsisHeading(page)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /compliance foundations|module 2/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /module 2/i })).toBeVisible();
    await expect(studioLooksGoodButton(page)).toBeEnabled();
  });
});
