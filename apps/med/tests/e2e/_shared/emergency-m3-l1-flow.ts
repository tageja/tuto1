/**
 * Emergency Nursing Communication — Module 3 (Immediate Instructions) — Lesson 1
 * slug: safety-first-giving-urgent-instructions
 *
 * Step order (L1): scenario_intro → flash_card → audio_shadow → video → quiz → cloze → script_read → matching
 */

import { expect, type Page } from '@playwright/test';
import {
  dismissLessonTourIfPresent,
  stubPairsMembershipInGroup,
  waitForScenarioIntroCta,
} from './emergency-m1-l1-flow';

export { dismissLessonTourIfPresent, stubPairsMembershipInGroup };

export const EMERGENCY_M3_LESSON_1_PATH =
  '/learn/courses/emergency-nursing-communication/lessons/safety-first-giving-urgent-instructions';

/** Module 1 lessons must read `completed` for M3 L1 unlock (matches seed scripts). */
const EMERGENCY_M1_LESSON_IDS_COMPLETED_FOR_M3_GATE: string[] = [
  'a0bdb62c-6419-4328-9ef5-4efc470db3bd',
  'ab02736f-fc83-4e8b-b1b7-e61aa4138fdb',
  'f448ce51-b3d9-4139-a8b7-7f2ded79ed9c',
  'c35b8bd4-a909-44aa-b3b4-d47b8b4e4ddd',
  'c09635dc-7c70-4b13-80d6-19c9699f6e4c',
  '5c88947e-c06a-4909-9030-84ad7ac03bac',
  '73463bbb-b7f0-4995-b845-7b9f39ab04ce',
  'edca7ca5-4e78-46cb-9902-abe4fda91c88',
];

/** Module 2 (Triage Intake) — all eight lessons for M3 L1 gate. Supabase snapshot 2026-05-19. */
const EMERGENCY_M2_LESSON_IDS_COMPLETED_FOR_M3_GATE: string[] = [
  '6c532f17-43e9-4cca-bf48-1652a25a4e75',
  '2a4a2b3c-ed62-4052-93a5-da93f25ee231',
  '843d9362-dbc4-4859-b248-5fe23acf0e3c',
  '09200f06-17e7-4116-bfa8-0ca6578db90c',
  '22cb2740-3080-4723-9661-013b80e02220',
  'fabdfb93-9718-45fb-bfa7-5ca803cb57ec',
  'df2bbf7d-9fef-473c-afee-a377b454e948',
  '91279571-3ace-4a32-865c-50b53804f6e5',
];

const PREREQ_LESSON_IDS_FOR_M3_L1 = [
  ...EMERGENCY_M1_LESSON_IDS_COMPLETED_FOR_M3_GATE,
  ...EMERGENCY_M2_LESSON_IDS_COMPLETED_FOR_M3_GATE,
];

export async function wireEmergencyM3L1LessonGates(page: Page) {
  await stubPairsMembershipInGroup(page);

  await page.route('**/api/module-progress**', async (route) => {
    const res = await route.fetch().catch(() => null);
    if (!res?.ok()) {
      return route.fulfill({ json: { data: { gateOpen: true } } });
    }
    const j = (await res.json().catch(() => ({}))) as { data?: { gateOpen?: boolean } };
    j.data ??= {};
    j.data.gateOpen = true;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(j),
    });
  });

  await page.route('**/api/progress/course**', async (route) => {
    const res = await route.fetch().catch(() => null);

    let rows: Record<string, unknown>[] = [];
    if (res?.ok()) {
      const parsed = (await res.json().catch(() => ({ data: [] as unknown[] }))) as {
        data: unknown[];
      };
      rows = Array.isArray(parsed.data) ? (parsed.data as Record<string, unknown>[]) : [];
    }

    const byLesson = new Map<string, Record<string, unknown>>();
    for (const row of rows) {
      const lid = row.lesson_id as string | undefined;
      if (lid) byLesson.set(lid, { ...row });
    }

    for (const lessonId of PREREQ_LESSON_IDS_FOR_M3_L1) {
      const prev = byLesson.get(lessonId) ?? {};
      byLesson.set(lessonId, {
        ...prev,
        lesson_id: lessonId,
        completed: true,
        completion_pct: 100,
        current_step_index: Math.max(Number(prev.current_step_index ?? 0), 999),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [...byLesson.values()] }),
    });
  });
}

async function isNextLessonPage404(page: Page): Promise<boolean> {
  const t = ((await page.locator('main h1').first().textContent().catch(() => '')) ?? '').trim();
  if (t === '404') return true;
  return page.getByText(/This page could not be found/i).isVisible({ timeout: 600 }).catch(() => false);
}

export async function gotoEmergencyM3Lesson1(page: Page) {
  const mainTitle = page.locator('main h1').first();
  const visibilityMs = [32_000, 14_000, 14_000, 14_000, 14_000] as const;
  const waitForLessonShell = async (burst: number) =>
    mainTitle.isVisible({ timeout: visibilityMs[burst] ?? 14_000 }).catch(() => false);
  const NAV_RELOAD_BURST = 5;

  for (let attempt = 0; attempt < 8; attempt++) {
    await page.goto(EMERGENCY_M3_LESSON_1_PATH, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    await page.waitForTimeout(400);
    if (await isNextLessonPage404(page)) {
      await page.waitForTimeout(500);
      continue;
    }
    for (let burst = 0; burst < NAV_RELOAD_BURST; burst++) {
      if (await isNextLessonPage404(page)) break;
      if (await waitForLessonShell(burst)) return;
      if (burst < NAV_RELOAD_BURST - 1) {
        try {
          await page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
        } catch {
          await page.goto(EMERGENCY_M3_LESSON_1_PATH, {
            waitUntil: 'domcontentloaded',
            timeout: 120_000,
          });
        }
        await page.waitForTimeout(400);
        if (await isNextLessonPage404(page)) break;
      }
    }
  }
  await expect(mainTitle).toBeVisible({ timeout: 28_000 });
}

const M3_L1_PREVIEW_CARD_COUNT = 6;

async function waitForFlashCardDeck(page: Page) {
  await expect(page.getByRole('heading', { name: /thẻ học/i }).first()).toBeVisible({
    timeout: 20_000,
  });
}

async function completeFlashDeckAndAdvance(page: Page) {
  const main = page.locator('main');
  const finish = main.getByRole('button', { name: /^hoàn thành$|^finish$/i }).first();
  await expect(finish).toBeVisible({ timeout: 15_000 });
  const progressSave = page
    .waitForResponse((r) => r.url().includes('/api/progress') && r.request().method() === 'POST', {
      timeout: 25_000,
    })
    .catch(() => null);
  await finish.click({ force: true });
  await progressSave;
  await expect(page.getByRole('tab', { name: /listen|nghe/i }).first()).toBeVisible({
    timeout: 45_000,
  });
}

async function advanceOneFlashCard(page: Page) {
  const main = page.locator('main');
  const finishBtn = main.getByRole('button', { name: /^hoàn thành$|^finish$/i }).first();
  if (await finishBtn.isVisible({ timeout: 800 }).catch(() => false)) {
    await finishBtn.click({ force: true });
    await page.waitForTimeout(400);
    return;
  }
  const flipHint = main.getByText(/nhấn để xem tiếng việt/i).first();
  const viFaceVisible = await main
    .getByText(/tiếng việt/i)
    .first()
    .isVisible({ timeout: 1_500 })
    .catch(() => false);
  if (!viFaceVisible && (await flipHint.isVisible({ timeout: 2_000 }).catch(() => false))) {
    await flipHint.click({ force: true });
    await page.waitForTimeout(200);
  }
  const gotItBtn = main.getByRole('button', { name: /got it|nhớ rồi/i }).first();
  const nextBtn = main.getByRole('button', { name: /^tiếp theo$|^next$/i }).first();
  if (await gotItBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await gotItBtn.click({ force: true });
  } else {
    await expect(nextBtn).toBeVisible({ timeout: 10_000 });
    await nextBtn.click({ force: true });
  }
  await page.waitForTimeout(350);
}

export async function advanceFlashCardVocabPreview(page: Page) {
  await waitForFlashCardDeck(page);
  const main = page.locator('main');

  if (await main.getByText(/thẻ đã thuộc|cards mastered/i).isVisible({ timeout: 2_000 }).catch(() => false)) {
    await completeFlashDeckAndAdvance(page);
    return;
  }

  for (let i = 0; i < M3_L1_PREVIEW_CARD_COUNT; i++) {
    if (await page.getByRole('tab', { name: /listen|nghe/i }).first().isVisible({ timeout: 500 }).catch(() => false)) {
      return;
    }
    if (await main.getByText(/thẻ đã thuộc/i).isVisible({ timeout: 500 }).catch(() => false)) {
      break;
    }
    await advanceOneFlashCard(page);
  }

  await completeFlashDeckAndAdvance(page);
}

export async function prepM3L1ReachedAudioShadowStep(page: Page) {
  const onFlashDeck = await page
    .getByText(/nhấn để xem|tap to reveal/i)
    .first()
    .isVisible({ timeout: 3_000 })
    .catch(() => false);
  if (!onFlashDeck) {
    await waitForScenarioIntroCta(page);
    const readyBtn = page.getByRole('button', { name: /sẵn sàng|ready|Tôi đã/i });
    await readyBtn.click();
    await page.waitForTimeout(350);
  }
  await advanceFlashCardVocabPreview(page);
  await expect(page.getByRole('tab', { name: /listen|nghe/i }).first()).toBeVisible({ timeout: 25_000 });
}

export async function advanceM3L1AudioShadowThenCompleteVideo(page: Page) {
  const listenTab = page.getByRole('tab', { name: /listen|nghe/i }).first();
  await listenTab.click();
  await page.waitForTimeout(200);
  const playBtn = page.getByRole('button', { name: /^play$/i }).first();
  await playBtn.click();
  await page.waitForTimeout(450);
  const advanceTail = () => page.getByRole('button', { name: /^(next|tiếp theo)$/i }).last();
  await expect(advanceTail()).toBeEnabled({ timeout: 20_000 });
  await advanceTail().click();
  await page.waitForTimeout(500);
  for (let tries = 0; tries < 10; tries++) {
    const watchedBtn = page.getByRole('button', { name: /done watching|đã xem xong/i });
    if (await watchedBtn.isVisible({ timeout: 1_800 }).catch(() => false)) {
      await watchedBtn.click();
      await page.waitForTimeout(500);
      return;
    }
    const nx = advanceTail();
    if (await nx.isVisible({ timeout: 900 }).catch(() => false)) {
      const en = await nx.isEnabled({ timeout: 400 }).catch(() => false);
      if (en) await nx.click();
      await page.waitForTimeout(400);
      continue;
    }
    await page.evaluate(() => {
      const v = document.querySelector<HTMLVideoElement>('video');
      if (!v) return;
      Object.defineProperty(v, 'duration', { get: () => 100, configurable: true });
      Object.defineProperty(v, 'currentTime', { get: () => 72, configurable: true });
      v.dispatchEvent(new Event('timeupdate'));
    });
    await page.waitForTimeout(400);
  }
  await expect(page.getByRole('button', { name: /done watching|đã xem xong/i })).toBeVisible({
    timeout: 8_000,
  });
}

export const M3_L1_CLOZE_ANSWER_PHRASES = [
  'move your leg',
  'me help you',
  '1 to 10',
  'out through the mouth',
] as const;

export async function answerM3Lesson1RecognitionQuizWrongThenSkip(page: Page) {
  await expect(
    page.getByRole('heading', { level: 3 }).filter({ hasText: /Recognition|Recognition check|Kiểm tra|instruction/i }),
  ).toBeVisible({ timeout: 30_000 });
  const qs = page.locator('main div.card.p-4.space-y-3').filter({
    has: page.locator('p.font-medium'),
  });
  await expect(qs.first()).toBeVisible({ timeout: 15_000 });
  const n = await qs.count();
  expect(n, 'quiz should expose at least one question card').toBeGreaterThanOrEqual(1);
  for (let i = 0; i < n; i++) {
    const row = qs.nth(i);
    await row.scrollIntoViewIfNeeded();
    const opts = row.getByRole('button');
    const pick = opts.nth(Math.min(1, (await opts.count()) - 1));
    await pick.click({ force: true });
    await page.waitForTimeout(150);
  }
  await page.locator('main').getByRole('button', { name: /kiểm tra|check answers/i }).click();
  await page.waitForTimeout(600);
  const skipBtn = page.locator('main').getByRole('button', { name: /^(bỏ qua|skip)$/i });
  const nextQuizBtn = page.locator('main').getByRole('button', { name: /^(next|tiếp theo)$/i }).first();
  if (await skipBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await skipBtn.click();
  } else {
    await nextQuizBtn.click();
  }
  await page.waitForTimeout(450);
}

export async function completeM3Lesson1ClozeWordBank(page: Page) {
  await expect(page.getByText(/fill in the blanks|Điền vào|cụm từ/i).first()).toBeVisible({
    timeout: 25_000,
  });
  const bank = page.locator('#bank-area');
  await expect(bank).toBeVisible({ timeout: 15_000 });
  for (const phrase of M3_L1_CLOZE_ANSWER_PHRASES) {
    await bank.getByText(phrase, { exact: true }).click();
    await page.waitForTimeout(200);
  }
  await page.locator('main').getByRole('button', { name: /kiểm tra|check answers/i }).click();
  await page.waitForTimeout(500);
  const clozeNext = page.locator('main').getByRole('button', { name: /^(next|tiếp theo)$/i }).first();
  await expect(clozeNext).toBeVisible({ timeout: 12_000 });
  await clozeNext.click();
  await page.waitForTimeout(600);
}

export async function navigateM3Lesson1ToScriptReadSubtitle(page: Page) {
  await prepM3L1ReachedAudioShadowStep(page);
  await advanceM3L1AudioShadowThenCompleteVideo(page);
  await answerM3Lesson1RecognitionQuizWrongThenSkip(page);
  await completeM3Lesson1ClozeWordBank(page);
  await expect(page.getByText(/read each line aloud|đọc to từng lượt/i)).toBeVisible({
    timeout: 40_000,
  });
}
