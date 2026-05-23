import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  mockStudioBrainstorm,
  mockStudioChat,
  mockStudioNewWizardApis,
  reachStudioSynopsisStep,
  studioRefineWithAiButton,
  studioRefinementChatPanel,
  studioSynopsisHeading,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #232 — Studio chat mobile stacked layout', {
  tag: [TAG.regression, TAG.studio, bugTag(232)],
}, () => {
  configureStudioAccess();

  test.use({ viewport: { width: 375, height: 667 } });

  test('chat panel stacks below synopsis on mobile', async ({ page }) => {
    await mockStudioNewWizardApis(page);
    await mockStudioBrainstorm(page);
    await mockStudioChat(page);
    await reachStudioSynopsisStep(page);

    await expect(studioRefineWithAiButton(page)).toBeVisible();

    await studioRefineWithAiButton(page).click();
    await expect(studioRefinementChatPanel(page)).toBeVisible();

    const synopsisBox = await studioSynopsisHeading(page).boundingBox();
    const chatBox = await studioRefinementChatPanel(page).boundingBox();
    expect(synopsisBox).not.toBeNull();
    expect(chatBox).not.toBeNull();

    if (synopsisBox && chatBox) {
      expect(chatBox.y).toBeGreaterThan(synopsisBox.y);
      expect(chatBox.x).toBeLessThanOrEqual(synopsisBox.x + 40);
    }
  });
});
