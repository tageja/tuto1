/**
 * Shared navigation for Emergency Nursing Communication — Module 1 — Lesson 1
 * slug: whats-happening-first-words-in-an-emergency
 */

import { expect, type Page } from '@playwright/test';

export const EMERGENCY_M1_LESSON_1_PATH =
  '/learn/courses/emergency-nursing-communication/lessons/whats-happening-first-words-in-an-emergency';

export async function stubPairsMembershipInGroup(page: Page) {
  await page.route('**/api/pairs/membership', (route) =>
    route.fulfill({ json: { inGroup: true } }),
  );
}

/**
 * Turbopack dev can occasionally chunk-fail on first paint; retry until lesson title exists.
 * (Avoid waiting on `.animate-pulse` — ScenarioIntro decorative dots use the same class.)
 */
export async function gotoEmergencyM1Lesson1(page: Page) {
  const mainTitle = page.locator('main h1').first();

  for (let attempt = 0; attempt < 6; attempt++) {
    await page.goto(EMERGENCY_M1_LESSON_1_PATH, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    if (await mainTitle.isVisible({ timeout: 35_000 }).catch(() => false)) {
      return;
    }
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
  }

  await expect(mainTitle).toBeVisible({ timeout: 25_000 });
}

/**
 * scenario_intro CTA — call AFTER dismissing the Joyride overlay; it hides the lesson chrome.
 */
export async function waitForScenarioIntroCta(page: Page) {
  const readyBtn = page.getByRole('button', { name: /sẵn sàng|ready|Tôi đã/i });

  for (let attempt = 0; attempt < 6; attempt++) {
    if (await readyBtn.isVisible({ timeout: 22_000 }).catch(() => false)) {
      await expect(readyBtn).toBeVisible({ timeout: 5_000 });
      return;
    }
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.locator('main h1').first().waitFor({ state: 'visible', timeout: 35_000 }).catch(() => {});
  }

  await expect(readyBtn).toBeVisible({ timeout: 45_000 });
}

/** Dismiss the Joyride lesson tour if it appears. */
export async function dismissLessonTourIfPresent(page: Page) {
  const modal = page.getByRole('alertdialog');
  if (await modal.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const skip = page.getByRole('button', { name: /bỏ qua|skip/i });
    if (await skip.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await skip.click();
    } else {
      await page.getByRole('button', { name: /đóng|close/i }).first().click();
    }
    await page.waitForTimeout(300);
  }
}

/** Navigate from step 1 (scenario_intro) through step 4 to step 5 (audio_shadow). */
export async function navigateM1Lesson1ToAudioShadow(page: Page) {
  await waitForScenarioIntroCta(page);
  const readyBtn = page.getByRole('button', { name: /sẵn sàng|ready|Tôi đã/i });
  await readyBtn.click();
  await page.waitForTimeout(400);

  await expect(page.locator('[data-testid="flashcard-index"]')).toBeVisible({ timeout: 10_000 });

  for (let i = 0; i < 5; i++) {
    const nextBtn = page.getByRole('button', { name: /^next$|tiếp theo/i }).first();
    await expect(nextBtn).toBeVisible({ timeout: 5_000 });
    await nextBtn.click();
    await page.waitForTimeout(300);
  }

  const lastCardFinish = page.getByRole('button', { name: /^finish$|hoàn thành/i }).first();
  await expect(lastCardFinish).toBeVisible({ timeout: 5_000 });
  await lastCardFinish.click();
  await page.waitForTimeout(300);

  const summaryFinish = page.getByRole('button', { name: /^finish$|hoàn thành/i }).first();
  await expect(summaryFinish).toBeVisible({ timeout: 5_000 });
  await summaryFinish.click();
  await page.waitForTimeout(500);

  await page.waitForTimeout(800);

  await page.evaluate(() => {
    const v = document.querySelector<HTMLVideoElement>('video');
    if (!v) return;
    Object.defineProperty(v, 'duration', { get: () => 100, configurable: true });
    Object.defineProperty(v, 'currentTime', { get: () => 70, configurable: true });
    v.dispatchEvent(new Event('timeupdate'));
  });
  await page.waitForTimeout(400);

  const watchedBtn = page.getByRole('button', { name: /done watching|đã xem xong/i });
  await expect(watchedBtn).toBeVisible({ timeout: 5_000 });
  await watchedBtn.click();
  await page.waitForTimeout(500);

  const firstOptionDiv = page.locator('div.rounded-2xl').filter({ hasText: /calm down/i }).first();
  if (await firstOptionDiv.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await firstOptionDiv.click();
    await page.waitForTimeout(300);
  }

  const confirmBtn = page.getByRole('button', { name: /confirm|xác nhận/i });
  await expect(confirmBtn).toBeEnabled({ timeout: 3_000 });
  await confirmBtn.click();
  await page.waitForTimeout(400);

  const qrNextBtn = page.getByRole('button', { name: /^next$|tiếp theo/i }).first();
  await expect(qrNextBtn).toBeVisible({ timeout: 5_000 });
  await qrNextBtn.click();
  await page.waitForTimeout(500);
}
