import { expect, test } from '@playwright/test';
import path from 'path';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM1Lesson1,
  navigateM1Lesson1ToAudioShadow,
  stubPairsMembershipInGroup,
} from '../_shared/emergency-m1-l1-flow';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Emergency M1 Lesson 1 — happy path milestones', {
  tag: [TAG.happyPath, TAG.module1, TAG.nav, TAG.state],
}, () => {
  test('reaches script_read after early lesson steps', async ({ page }) => {
    await stubPairsMembershipInGroup(page);
    await gotoEmergencyM1Lesson1(page);

    await dismissLessonTourIfPresent(page);
    await navigateM1Lesson1ToAudioShadow(page);

    const listenTab = page.getByRole('tab', { name: /listen|nghe/i }).first();
    await expect(listenTab).toBeVisible({ timeout: 15_000 });
    await listenTab.click();
    await page.waitForTimeout(300);

    const playBtn = page.getByRole('button', { name: /^play$/i });
    await playBtn.click();
    await page.waitForTimeout(600);

    const advanceAudioShadow = page.getByRole('button', { name: /^(next|tiếp theo)$/i }).last();
    await expect(advanceAudioShadow).toBeEnabled({ timeout: 10_000 });
    await advanceAudioShadow.click();
    await page.waitForTimeout(800);

    await expect(
      page.getByText(/read each line aloud|đọc to từng lượt/i),
    ).toBeVisible({ timeout: 30_000 });
  });
});
