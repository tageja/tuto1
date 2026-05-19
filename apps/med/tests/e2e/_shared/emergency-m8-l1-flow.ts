/**
 * Emergency Nursing Communication — Module 8 (Documentation & Rapid Reporting) — Lesson 1
 * slug: end-of-shift-handover-to-incoming-nurse
 *
 * Step order (L1, in-progress authoring): scenario_intro → flash_card → audio_shadow →
 * script_read → quiz → cloze → matching — **no video step** (differs from standard 8-step L1 blueprint).
 */

import { expect, type Page } from '@playwright/test';
import {
  dismissLessonTourIfPresent,
  stubPairsMembershipInGroup,
  waitForScenarioIntroCta,
} from './emergency-m1-l1-flow';

export { dismissLessonTourIfPresent, stubPairsMembershipInGroup };

export const EMERGENCY_M8_LESSON_1_PATH =
  '/learn/courses/emergency-nursing-communication/lessons/end-of-shift-handover-to-incoming-nurse';

/** M1–M6 lessons (48) — same snapshot as M7 L1 gate. */
const PREREQ_M1_THROUGH_M6: string[] = [
  'a0bdb62c-6419-4328-9ef5-4efc470db3bd',
  'ab02736f-fc83-4e8b-b1b7-e61aa4138fdb',
  'f448ce51-b3d9-4139-a8b7-7f2ded79ed9c',
  'c35b8bd4-a909-44aa-b3b4-d47b8b4e4ddd',
  'c09635dc-7c70-4b13-80d6-19c9699f6e4c',
  '5c88947e-c06a-4909-9030-84ad7ac03bac',
  '73463bbb-b7f0-4995-b845-7b9f39ab04ce',
  'edca7ca5-4e78-46cb-9902-abe4fda91c88',
  '6c532f17-43e9-4cca-bf48-1652a25a4e75',
  '2a4a2b3c-ed62-4052-93a5-da93f25ee231',
  '843d9362-dbc4-4859-b248-5fe23acf0e3c',
  '09200f06-17e7-4116-bfa8-0ca6578db90c',
  '22cb2740-3080-4723-9661-013b80e02220',
  'fabdfb93-9718-45fb-bfa7-5ca803cb57ec',
  'df2bbf7d-9fef-473c-afee-a377b454e948',
  '91279571-3ace-4a32-865c-50b53804f6e5',
  'fcefb412-3047-42f7-a06c-9364968677f9',
  'e38b886e-0f6f-4e42-9f56-bb733f2d9926',
  '7155da09-4912-4a5a-afda-3124026448be',
  'dde9b2a1-25e9-4b12-89f8-9b43f966fa28',
  '7f48b28a-c708-4eb6-953d-55676f542f2f',
  'a384f8b3-376c-400b-8491-f01c2bab2487',
  '6d96ec73-914d-42ad-865f-01d78f6e5d34',
  '306d01b9-d671-44e4-b182-b64cf452f248',
  '509a6b69-ec56-4918-a994-bcc641096a59',
  '1f00aca7-2647-4af0-908b-bde5ec0836f7',
  '6c4b1c84-8b78-4c23-8f08-f7fbb2964b7e',
  '3675c263-f3c6-4c3e-9b5c-36b51b133b3f',
  '73eec875-712f-4d72-82e7-dc50b1a59416',
  'c3225978-ab4d-435d-87c4-3ef676c0f8b2',
  'f481e9d9-20d1-4ec2-b311-1e58e08d3bc4',
  'efd86585-2627-4a92-97a6-366869f8986f',
  'ea250d4d-b929-42d5-b92f-f288a0b11827',
  'e17d9b49-a8b6-4c56-a4a6-110a0ee12b27',
  'cc217ca0-603b-4991-b40f-9f633a36c5e3',
  '4f03ac57-2d68-4ff5-b607-4972abbda6cc',
  '82124ebf-4557-4507-beda-6c3d82bcacbb',
  'fc385e4b-ed0f-4789-a1ba-f493c126a132',
  '2377a392-5327-404c-b984-cfa32f1d4c3e',
  'f1e51c42-29e6-4e17-bc03-a7e2237d7190',
  '5af420e8-5a6c-4472-9c4c-7ef967d600fb',
  '3dc620a9-3b09-40d8-9e4e-9fd280c3b4e8',
  '3820e970-c003-4649-ba10-7cd5859cd717',
  '6fcc7281-3eef-4495-8d53-a3618f12a429',
  '5f6d4fd1-dc69-41db-a4da-e346f68fdb82',
  '985b6422-70ed-4a14-b73a-7057d5d9b584',
  'e233fce4-b3bd-4d21-a2f7-e7ac3f080858',
  'a2c678ea-fc00-4691-9f34-7858227dd3d9',
];

/** Module 7 — all eight lessons for M8 L1 unlock (Supabase snapshot 2026-05-19). */
const PREREQ_M7_ALL: string[] = [
  '96c023e2-a2e1-4d22-9ed0-9d07c9099c18',
  '4743c475-8e5f-46ed-882f-9b207e3c568d',
  '876295ea-394e-4ec3-8c1b-32d71c029c87',
  '307bcb3b-ec69-4b68-b59e-16956dcfa0e0',
  'fa94eb31-e308-4d8b-9b37-6dd648a507df',
  '790794d6-a82e-4e8c-9aed-648280df53b3',
  'da238efc-048a-4d04-9cab-c27726941c04',
  '3d84445e-4013-43da-af55-2e9876a5a964',
];

const PREREQ_LESSON_IDS_FOR_M8_L1 = [...PREREQ_M1_THROUGH_M6, ...PREREQ_M7_ALL];

export async function wireEmergencyM8L1LessonGates(page: Page) {
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

    for (const lessonId of PREREQ_LESSON_IDS_FOR_M8_L1) {
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

async function isLessonPage404(page: Page): Promise<boolean> {
  const t = ((await page.locator('main h1').first().textContent().catch(() => '')) ?? '').trim();
  if (t === '404') return true;
  return page.getByText(/This page could not be found/i).isVisible({ timeout: 600 }).catch(() => false);
}

export async function gotoEmergencyM8Lesson1(page: Page) {
  const mainTitle = page.locator('main h1').first();
  for (let attempt = 0; attempt < 8; attempt++) {
    await page.goto(EMERGENCY_M8_LESSON_1_PATH, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    await page.waitForTimeout(400);
    if (await isLessonPage404(page)) continue;
    if (await mainTitle.isVisible({ timeout: 28_000 }).catch(() => false)) return;
    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
    } catch {
      /* retry goto */
    }
  }
  await expect(mainTitle).toBeVisible({ timeout: 28_000 });
}

const M8_L1_PREVIEW_CARD_COUNT = 6;

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
  for (let i = 0; i < M8_L1_PREVIEW_CARD_COUNT; i++) {
    if (await page.getByRole('tab', { name: /listen|nghe/i }).first().isVisible({ timeout: 500 }).catch(() => false)) {
      return;
    }
    await advanceOneFlashCard(page);
  }
  await completeFlashDeckAndAdvance(page);
}

export async function prepM8L1ReachedAudioShadowStep(page: Page) {
  const onFlashDeck = await page
    .getByText(/nhấn để xem|tap to reveal/i)
    .first()
    .isVisible({ timeout: 3_000 })
    .catch(() => false);
  if (!onFlashDeck) {
    await waitForScenarioIntroCta(page);
    await page.getByRole('button', { name: /sẵn sàng|ready|Tôi đã/i }).click();
    await page.waitForTimeout(350);
  }
  await advanceFlashCardVocabPreview(page);
  await expect(page.getByRole('tab', { name: /listen|nghe/i }).first()).toBeVisible({ timeout: 25_000 });
}

/** L1 has no video — advance audio_shadow directly into script_read. */
export async function advanceM8L1AudioShadowToScriptRead(page: Page) {
  const listenTab = page.getByRole('tab', { name: /listen|nghe/i }).first();
  await listenTab.click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /^play$/i }).first().click();
  await page.waitForTimeout(450);
  const advanceTail = page.getByRole('button', { name: /^(next|tiếp theo)$/i }).last();
  await expect(advanceTail).toBeEnabled({ timeout: 20_000 });
  await advanceTail.click();
  await page.waitForTimeout(600);
  await expect(
    page.getByText(/read each line aloud|đọc to từng lượt/i),
  ).toBeVisible({ timeout: 35_000 });
}

export async function navigateM8Lesson1ToScriptRead(page: Page) {
  await prepM8L1ReachedAudioShadowStep(page);
  await advanceM8L1AudioShadowToScriptRead(page);
}
