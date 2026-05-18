import { expect, test } from '@playwright/test';
import path from 'path';
import { countPlayingAudio, pauseAllAudio, snapshotAllAudio } from '../_shared/audio';
import {
  dismissLessonTourIfPresent,
  gotoEmergencyM1Lesson1,
  navigateM1Lesson1ToAudioShadow,
  stubPairsMembershipInGroup,
} from '../_shared/emergency-m1-l1-flow';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #11 — "Audio keeps playing when switching tabs and multiple
 * audio tracks overlap simultaneously. At Step 5: When listening to the
 * conversation in the 'Listen' tab, if the user switches to other tabs
 * (e.g., Read Along), the audio from Step 5 keeps playing and overlaps
 * with new audio from the next tab."
 * Location: Emergency Nursing → Lesson 1 → Step 5 (audio_shadow)
 *
 * Step order for Lesson 1 ("What's happening? First words in an emergency"):
 *   1. scenario_intro   → click "I'm Ready"
 *   2. flash_card       → 6 cards, click Next × 5, then Finish (×2)
 *   3. video            → native MP4, simulate watched, click Done Watching
 *   4. quick_response   → select any option → Confirm → Next
 *   5. audio_shadow     → TARGET (has 👂 Listen / 📖 Read along / 🗣️ Speak together tabs)
 *
 * Acceptance:
 *   - Only ONE audio element should be playing at any given moment.
 *   - Switching the phase tab in audio_shadow must pause prior audio immediately.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

// ── Back-compat re-exports used only in this spec's traces ───────────────────
const dismissTourIfPresent = dismissLessonTourIfPresent;
const navigateToAudioShadow = navigateM1Lesson1ToAudioShadow;

// ── Test ──────────────────────────────────────────────────────────────────────

test.describe('Bug #11 — only one audio plays at a time', {
  tag: [TAG.regression, TAG.audio, TAG.state, TAG.module1, bugTag(11)],
}, () => {
  test('switching audio_shadow phase tab pauses prior audio', async ({ page }) => {
    await stubPairsMembershipInGroup(page);

    await gotoEmergencyM1Lesson1(page);

    await dismissTourIfPresent(page);
    await navigateToAudioShadow(page);

    const playBtn = page.getByRole('button', { name: 'Play' });
    await expect(playBtn).toBeVisible({ timeout: 30_000 });

    await page.evaluate(() => {
      document.querySelectorAll('audio').forEach((a) => {
        a.pause();
        a.currentTime = 0;
      });
    });

    const listenTab = page.getByRole('tab', { name: /listen|nghe/i }).first();
    await expect(listenTab).toBeVisible({ timeout: 5_000 });
    await listenTab.click();
    await page.waitForTimeout(300);

    await playBtn.click();
    await page.waitForTimeout(500);

    expect(await countPlayingAudio(page)).toBe(1);

    const readAlongTab = page.getByRole('tab', { name: /read along|đọc theo/i }).first();
    await expect(readAlongTab).toBeVisible({ timeout: 3_000 });
    await readAlongTab.click();
    await page.waitForTimeout(300);

    const playing = await countPlayingAudio(page);
    const snap = await snapshotAllAudio(page);
    expect(
      playing,
      `audio still playing after switching to Read Along tab:\n${JSON.stringify(snap, null, 2)}`,
    ).toBeLessThanOrEqual(0);

    await pauseAllAudio(page);
  });
});
