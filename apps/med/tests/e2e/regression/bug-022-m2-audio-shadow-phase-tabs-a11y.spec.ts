import { expect, test } from '@playwright/test';
import path from 'path';
import { countPlayingAudio, pauseAllAudio, snapshotAllAudio } from '../_shared/audio';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM2Lesson1,
  prepM2L1ReachedAudioShadowStep,
  wireEmergencyM2L1LessonGates,
} from '../_shared/emergency-m2-l1-flow';
import { TAG, bugTag } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #22 — Module 2 audio_shadow phase controls expose tab semantics', {
  tag: [TAG.regression, TAG.module2, TAG.audio, TAG.a11y, bugTag(22)],
}, () => {
  /** Match M2 L1 happy path — Turbopack + `gotoEmergencyM2Lesson1` retries can exceed 150s on mobile. */
  test.describe.configure({ timeout: 300_000 });

  test('switching phase tab stops Listen audio; tablist + tabpanel stay mounted', async ({ page }) => {
    await wireEmergencyM2L1LessonGates(page);

    await gotoEmergencyM2Lesson1(page);

    await dismissLessonTourIfPresent(page);
    await prepM2L1ReachedAudioShadowStep(page);

    const playBtn = page.getByRole('button', { name: /^play$/i }).first();
    await expect(playBtn).toBeVisible({ timeout: 30_000 });

    await pauseAllAudio(page);

    const listenTab = page.getByRole('tab', { name: /listen|nghe/i }).first();
    await expect(listenTab).toBeVisible({ timeout: 5_000 });
    await listenTab.click();
    await page.waitForTimeout(300);

    await playBtn.click();
    await page.waitForTimeout(500);

    expect(await countPlayingAudio(page)).toBeGreaterThanOrEqual(1);

    const readTab = page.getByRole('tab', { name: /read along|đọc theo/i }).first();
    await expect(readTab).toBeVisible({ timeout: 5_000 });
    await readTab.click();
    await page.waitForTimeout(300);

    const playing = await countPlayingAudio(page);
    const snap = await snapshotAllAudio(page);
    expect(
      playing,
      `Listen audio leaked after switching to Read Along:\n${JSON.stringify(snap, null, 2)}`,
    ).toBeLessThanOrEqual(0);

    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible();
    const panel = page.getByRole('tabpanel');
    await expect(panel).toBeVisible();

    await pauseAllAudio(page);
  });
});
