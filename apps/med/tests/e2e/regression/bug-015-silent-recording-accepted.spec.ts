import { expect, test } from '@playwright/test';
import path from 'path';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #15 — "User can 'cheat' the speaking exercises by clicking the
 * record button, remaining silent, and stopping the recording. The system
 * still accepts and marks the step as completed."
 * Location: recording_submit step type
 *
 * Fix: RecordingStep.tsx now runs a Voice Activity Detection (VAD) amplitude
 * check (isSilentBlob) after each recording. If the RMS amplitude is below
 * 0.005 the recording is rejected and the learner sees an error.
 *
 * Test strategy:
 *   - --use-fake-ui-for-media-stream prevents the browser mic-permission dialog.
 *   - addInitScript patches AudioContext.decodeAudioData to always return a
 *     zero-amplitude buffer, guaranteeing the VAD sees silence regardless of
 *     what the fake device actually captured. This is 100% parallel-safe.
 *   - /api/lessons/:id is mocked to return a single recording_submit step so
 *     we jump straight to the recording UI.
 *   - /api/pairs/membership is mocked so JoinGroupGate does not block.
 *   - After start → stop the test expects the VAD error banner and confirms
 *     the step has NOT advanced to the playback / submit state.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');

test.use({
  storageState: authFile,
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  },
});

const MOCK_LESSON = {
  id: 'fa98bd09-d562-4175-8ddd-ea635aedb6e1',
  slug: 'qa-test-lesson',
  title: 'QA Recording Test',
  title_vi: null,
  module_id: 'mock-module',
  nursed_lesson_steps: [
    {
      id: 'fa98bd09-d562-4175-8ddd-ea635aedb6e1',
      type: 'recording_submit',
      title: 'Speak clearly',
      order_index: 1,
      config: { prompt: 'Say: Good morning, this is a test.' },
    },
  ],
};

test.describe('Bug #15 — silent recordings are rejected', {
  tag: [TAG.regression, TAG.audio, TAG.state, TAG.module1, bugTag(15)],
}, () => {
  test('a silent recording does not mark step complete', async ({ page }) => {
    // Patch AudioContext so VAD always sees a zero-amplitude (silent) buffer.
    // This is deterministic regardless of what the fake mic device captures.
    await page.addInitScript(() => {
      const OrigCtx = window.AudioContext;
      class SilentAudioContext extends OrigCtx {
        override decodeAudioData(_buf: ArrayBuffer): Promise<AudioBuffer> {
          const silent = super.createBuffer(1, 44100, 44100);
          return Promise.resolve(silent);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).AudioContext = SilentAudioContext;
    });

    // Mock the lesson API so we only see the recording step
    await page.route('**/api/lessons/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_LESSON }),
      });
    });

    // Mock membership so JoinGroupGate passes through
    await page.route('**/api/pairs/membership', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ inGroup: true }),
      });
    });

    // Mock lesson-access endpoints that might block rendering
    await page.route('**/api/lesson-access**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ allowed: true }),
      });
    });

    await page.goto(
      '/learn/courses/foundations-of-nursing-english/lessons/qa-test-lesson',
    );

    // Wait for recording step to render
    const startBtn = page.getByRole('button', { name: /start recording|bắt đầu ghi âm/i });
    await expect(startBtn).toBeVisible({ timeout: 15_000 });

    // Record (fake device — AudioContext is patched to see silence)
    await startBtn.click();
    await page.waitForTimeout(1200);

    const stopBtn = page.getByRole('button', { name: /stop recording|dừng ghi âm/i });
    await expect(stopBtn).toBeVisible();
    await stopBtn.click();

    // VAD detects silence → error banner, step stays at idle
    const errorBanner = page.getByText(/didn't hear|không nghe thấy/i);
    await expect(errorBanner).toBeVisible({ timeout: 15_000 });

    // Playback audio element must NOT be visible (step not advanced to 'recorded')
    await expect(page.locator('audio')).not.toBeVisible();
  });
});
