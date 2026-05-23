import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  mockStudioBrainstorm,
  mockStudioChat,
  mockStudioNewWizardApis,
  reachStudioSynopsisStep,
  studioLooksGoodButton,
  studioRefineWithAiButton,
  studioRefinementChatInput,
  studioRefinementChatSendButton,
  studioUpdatedSynopsisHeading,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #230 — Studio chat updates synopsis panel', {
  tag: [TAG.regression, TAG.studio, bugTag(230)],
}, () => {
  configureStudioAccess();

  test('SynopsisPanel reflects mocked course title after AI response', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await mockStudioChat(page);
    await reachStudioSynopsisStep(page);

    await expect(studioLooksGoodButton(page)).toBeVisible();

    await studioRefineWithAiButton(page).click();
    await studioRefinementChatInput(page).fill('Update the course title');
    await studioRefinementChatSendButton(page).click();

    await expect(studioUpdatedSynopsisHeading(page)).toBeVisible({ timeout: 15_000 });
    await expect(studioLooksGoodButton(page)).toBeVisible();
  });
});
