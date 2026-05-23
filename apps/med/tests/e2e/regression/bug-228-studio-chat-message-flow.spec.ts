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
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const USER_MESSAGE = 'Move Module 2 to position 3';

test.describe('Bug #228 — Studio refinement chat message flow', {
  tag: [TAG.regression, TAG.studio, bugTag(228)],
}, () => {
  configureStudioAccess();

  test('creator and AI messages render after send', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await mockStudioChat(page);
    await reachStudioSynopsisStep(page);

    await studioRefineWithAiButton(page).click();
    await studioRefinementChatInput(page).fill(USER_MESSAGE);
    await studioRefinementChatSendButton(page).click();

    const userBubble = page.locator('.flex.justify-end').filter({ hasText: USER_MESSAGE });
    await expect(userBubble).toBeVisible({ timeout: 10_000 });

    const assistantBubble = page.locator('.flex.justify-start').filter({
      hasText: /pronunciation module to position 2/i,
    });
    await expect(assistantBubble).toBeVisible({ timeout: 10_000 });
  });
});
