import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  mockStudioBrainstorm,
  mockStudioChat,
  mockStudioNewWizardApis,
  reachStudioSynopsisStep,
  studioRefineWithAiButton,
  studioRefinementChatInput,
  studioRefinementChatPanel,
  studioRefinementChatSendButton,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #227 — Refine with AI toggles chat panel', {
  tag: [TAG.regression, TAG.studio, bugTag(227)],
}, () => {
  configureStudioAccess();

  test('shows RefinementChat with input and send after toggle', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await mockStudioChat(page);
    await reachStudioSynopsisStep(page);

    await expect(studioRefineWithAiButton(page)).toBeVisible();
    await expect(studioRefinementChatPanel(page)).toHaveCount(0);

    await studioRefineWithAiButton(page).click();

    await expect(studioRefinementChatPanel(page)).toBeVisible();
    await expect(studioRefinementChatInput(page)).toBeVisible();
    await expect(studioRefinementChatSendButton(page)).toBeVisible();
  });
});
