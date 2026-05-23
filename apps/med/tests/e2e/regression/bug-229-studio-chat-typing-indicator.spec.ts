import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  mockStudioBrainstorm,
  mockStudioChat,
  mockStudioNewWizardApis,
  reachStudioSynopsisStep,
  studioRefineWithAiButton,
  studioRefinementChatInput,
  studioRefinementChatSendButton,
  studioRefinementTypingIndicator,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #229 — Studio chat typing indicator', {
  tag: [TAG.regression, TAG.studio, bugTag(229)],
}, () => {
  configureStudioAccess();

  test('shows typing indicator while chat stream is delayed', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await mockStudioChat(page, { delayMs: 600 });
    await reachStudioSynopsisStep(page);

    await studioRefineWithAiButton(page).click();
    await studioRefinementChatInput(page).fill('Update module titles');
    await studioRefinementChatSendButton(page).click();

    await expect(studioRefinementTypingIndicator(page)).toBeVisible({ timeout: 5_000 });
    await expect(studioRefinementTypingIndicator(page)).toHaveCount(0, { timeout: 15_000 });
  });
});
