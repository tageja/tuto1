import type { Page } from '@playwright/test';

/**
 * Audio helpers — used by bug-011 (audio overlap) and audio-shadow tests.
 *
 * Playwright cannot evaluate actual sound output, but it CAN inspect every
 * <audio> element's paused/currentTime state. That's enough to catch
 * "multiple tracks playing at once" and "audio kept playing after tab change".
 */

export interface AudioSnapshot {
  src: string;
  paused: boolean;
  currentTime: number;
  duration: number;
  muted: boolean;
}

export async function snapshotAllAudio(page: Page): Promise<AudioSnapshot[]> {
  return page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('audio'));
    return els.map((el) => ({
      src: el.currentSrc || el.src || '',
      paused: el.paused,
      currentTime: el.currentTime,
      duration: el.duration || 0,
      muted: el.muted,
    }));
  });
}

export async function countPlayingAudio(page: Page): Promise<number> {
  const snap = await snapshotAllAudio(page);
  return snap.filter((a) => !a.paused).length;
}

/**
 * Pause every audio element on the page. Useful for test cleanup so leaked
 * audio doesn't bleed into the next test.
 */
export async function pauseAllAudio(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('audio').forEach((el) => el.pause());
  });
}
