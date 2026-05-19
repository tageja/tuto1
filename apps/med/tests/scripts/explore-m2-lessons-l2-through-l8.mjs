/**
 * Playwright walker: Emergency · Module 2 (Triage) · Lessons **2–8** only.
 * Login: env EXPLORATION_EMAIL (default `test-m2@test.com`) / env EXPLORATION_PASSWORD (default `password`).
 *
 * Prereqs (DB, service role — same vars as seed script):
 * - Ensures **Emergency Module 1** + **Module 2 Lesson 1** are marked `completed`
 *   for the exploration account so **Lesson 2** unlocks (no L1 browser walk).
 *
 * Run from `apps/med` with dev server on PORT 3001:
 *   node tests/scripts/explore-m2-lessons-l2-through-l8.mjs
 *
 * Stdout: JSON summary. Append human notes to `tests/exploration/findings-module-2.md` manually or via agent.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const raw = fs.readFileSync(envPath, 'utf8');
/** @type {Record<string, string>} */
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';
const EXPLORATION_EMAIL = process.env.EXPLORATION_EMAIL ?? 'test-m2@test.com';
const EXPLORATION_PASSWORD = process.env.EXPLORATION_PASSWORD ?? 'password';

const EMERGENCY_M1_LESSON_IDS = [
  'a0bdb62c-6419-4328-9ef5-4efc470db3bd',
  'ab02736f-fc83-4e8b-b1b7-e61aa4138fdb',
  'f448ce51-b3d9-4139-a8b7-7f2ded79ed9c',
  'c35b8bd4-a909-44aa-b3b4-d47b8b4e4ddd',
  'c09635dc-7c70-4b13-80d6-19c9699f6e4c',
  '5c88947e-c06a-4909-9030-84ad7ac03bac',
  '73463bbb-b7f0-4995-b845-7b9f39ab04ce',
  'edca7ca5-4e78-46cb-9902-abe4fda91c88',
];

const M2_L2_L8_SLUGS = [
  'describing-symptoms',
  'the-triage-sequence-in-order',
  'a-different-presentation',
  'your-turn-to-ask-the-questions',
  'pair-triage-round-1',
  'triage-challenge',
  'triage-assessment',
];

async function userIdByEmail(sb, email) {
  const { data: rid, error } = await sb.rpc('get_auth_user_id_by_email', { user_email: email });
  if (!error && rid) return /** @type {string} */ (rid);
  const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  return data?.users?.find((u) => u.email === email)?.id ?? null;
}

async function ensureLearnerAuthUser(sb, email, password) {
  let userId = await userIdByEmail(sb, email);
  if (userId) {
    await sb.auth.admin.updateUserById(userId, { password });
    return userId;
  }
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'M2 QA Explorer' },
  });
  if (error) throw error;
  userId = data.user.id;
  await sb.from('nursed_profiles').upsert(
    {
      id: userId,
      full_name: 'M2 QA Explorer',
      hospital_id: null,
      role: 'learner',
      avatar_url: null,
    },
    { onConflict: 'id', ignoreDuplicates: false },
  );
  return userId;
}

async function seedM1AndM2L1(sb, email) {
  const userId = await ensureLearnerAuthUser(sb, email, EXPLORATION_PASSWORD);
  if (!userId) throw new Error(`Could not ensure auth user for ${email}.`);

  const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
  if (!course?.id) throw new Error('Emergency course not found');

  const { data: mod } = await sb
    .from('nursed_modules')
    .select('id')
    .eq('course_id', course.id)
    .eq('slug', 'triage-intake')
    .single();
  if (!mod?.id) throw new Error('triage-intake module not found');

  const { data: m2Lessons } = await sb
    .from('nursed_lessons')
    .select('id, slug, order_index')
    .eq('module_id', mod.id)
    .order('order_index');

  const m2L1 = m2Lessons?.find((l) => l.slug === 'asking-the-right-questions');
  if (!m2L1) throw new Error('M2 L1 lesson not found');

  const now = new Date().toISOString();
  const upsertOne = async (lessonId) => {
    const { error } = await sb.from('nursed_progress').upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completion_pct: 100,
        current_step_index: 999,
        last_active: now,
      },
      { onConflict: 'user_id,lesson_id' },
    );
    if (error) throw error;
  };

  for (const id of EMERGENCY_M1_LESSON_IDS) await upsertOne(id);
  await upsertOne(m2L1.id);

  return { userId, m2L1Id: m2L1.id };
}

async function wireLearnRoutes(page) {
  await page.route('**/api/pairs/membership', (route) => route.fulfill({ json: { inGroup: true } }));

  await page.route('**/api/module-progress**', async (route) => {
    const res = await route.fetch().catch(() => null);
    if (!res?.ok()) {
      return route.fulfill({ json: { data: { gateOpen: true } } });
    }
    const j = await res.json().catch(() => ({}));
    const data =
      typeof j.data === 'object' && j.data !== null ? { ...j.data } : {};
    data.gateOpen = true;
    j.data = data;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(j),
    });
  });
}

/** Non-silent decode so `recording_submit` VAD can pass in automation. */

/** Fail fast instead of waiting for Playwright navigation when dev isn't listening. */
async function assertDevServerReachable() {
  try {
    const res = await fetch(BASE_URL, {
      redirect: 'follow',
      signal: AbortSignal.timeout(12_000),
    });
    if (res.status >= 502) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Cannot reach ${BASE_URL} (${detail}). From apps/med run: npm run dev (or set BASE_URL).`,
    );
  }
}

async function patchAudioForRecording(context) {
  await context.addInitScript(() => {
    const orig = AudioContext.prototype.decodeAudioData;
    AudioContext.prototype.decodeAudioData = function decodePatched(audioData) {
      return orig.call(this, audioData).then((buf) => {
        const ch = buf.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = 0.12 * Math.sin(i * 0.05);
        return buf;
      });
    };
  });
}

async function login(page) {
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'commit', timeout: 120_000 });
  const mail = page.locator('#login-email');
  const pwloc = page.locator('#login-password');
  await mail.waitFor({ state: 'visible', timeout: 20_000 });

  await mail.click();
  await mail.fill('');
  await mail.pressSequentially(EXPLORATION_EMAIL, { delay: 15 });

  await pwloc.click();
  await pwloc.fill('');
  await pwloc.pressSequentially(EXPLORATION_PASSWORD, { delay: 15 });
  await page.waitForTimeout(400);

  const ev = await mail.inputValue();
  const pv = await pwloc.inputValue();
  if (!ev || !/\S+@\S+/.test(ev)) throw new Error(`Email field did not hydrate (value="${ev}").`);
  if (!pv || pv.length < 4) throw new Error(`Password field did not hydrate (length=${pv?.length ?? 0}).`);

  await page.getByRole('button', { name: /^đăng nhập$/i }).click();
  await page
    .waitForResponse((r) => r.url().includes('auth/v1/token') && r.request().method() === 'POST', {
      timeout: 75_000,
    })
    .catch(() => null);

  await page.waitForTimeout(1500);
  const errTxt = await page.locator('.text-red-700').first().innerText().catch(() => '');
  if (errTxt.trim()) throw new Error(`Login form error on page: ${errTxt.trim()}`);

  const deadline = Date.now() + 180_000;
  let path = '';
  while (Date.now() < deadline) {
    path = await page.evaluate(() => window.location.pathname);
    if (path.startsWith('/learn')) break;
    await page.waitForTimeout(400);
  }
  if (!path.startsWith('/learn')) {
    const extra = await page.locator('.text-red-700').first().innerText().catch(() => '');
    throw new Error(`Login did not reach /learn (pathname=${path}). ${extra ? `UI: ${extra}` : ''}`);
  }

  await page.evaluate(() => {
    localStorage.setItem('nursed_lesson_tour_seen', '1');
  });
}

async function readStepSummary(page) {
  const el = page.locator('main p.tabular-nums').first();
  return (await el.textContent().catch(() => ''))?.trim() ?? '';
}

async function isFeedbackScreen(page) {
  return page.getByRole('button', { name: /skip all|bỏ qua tất cả/i }).isVisible({ timeout: 800 }).catch(() => false);
}

async function dismissFeedbackIfShown(page, log, slug) {
  if (!(await isFeedbackScreen(page))) return false;
  log.push(`${slug}: lesson feedback → Skip all`);
  await page.getByRole('button', { name: /skip all|bỏ qua tất cả/i }).click({ timeout: 10_000 });
  await page.waitForTimeout(500);
  return true;
}

/** One aggressive “try common controls” tick. Returns true if something was clicked or video was spoofed. */
async function explorerTick(page) {
  /** Quick Response: selectable cards are motion.div role=none — use cursor-pointer tiles + Confirm */
  const qrConfirm = page.getByRole('button', { name: /^confirm|^xác nhận$/i });
  const qrTile = page.locator('main div.cursor-pointer.rounded-2xl').first();
  if (await qrConfirm.isVisible({ timeout: 420 }).catch(() => false)) {
    const dis = await qrConfirm.isDisabled().catch(() => true);
    if (dis && (await qrTile.isVisible({ timeout: 450 }).catch(() => false))) {
      await qrTile.click({ timeout: 5_000 });
      await page.waitForTimeout(350);
      return true;
    }
    if (!dis) {
      await qrConfirm.click({ timeout: 5_000 });
      await page.waitForTimeout(400);
      return true;
    }
  }

  const candidates = [
    { name: /^(skip)$/i }, // Joyride
    { name: /^(next|tiếp theo)$/i },
    { name: /^done it!|^đã làm rồi$/i }, // Mission
    { name: /^got it|nhớ rồi$/i },
    { name: /^finish$|hoàn thành$/i },
    { name: /sẵn sàng|ready|Tôi đã/i },
    { name: /done watching|đã xem xong/i },
    { name: /check answers|kiểm tra/i },
    { name: /^(skip|bỏ qua)$/i },
    { name: /^play$/i },
    { name: /^submit|gửi$/i },
  ];

  for (const { name } of candidates) {
    const loc = page.getByRole('button', { name });
    const n = await loc.count();
    for (let i = 0; i < Math.min(n, 4); i++) {
      const btn = loc.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        const en = await btn.isEnabled().catch(() => false);
        if (en) {
          await btn.click({ timeout: 5_000 });
          await page.waitForTimeout(400);
          return true;
        }
      }
    }
  }

  // Cloze bank chips (explicit phrases unknown — tap any clickable inside #bank-area)
  const bank = page.locator('#bank-area');
  if (await bank.isVisible({ timeout: 500 }).catch(() => false)) {
    const chip = bank.locator('button, [role="button"], .cursor-pointer').first();
    if (await chip.isVisible({ timeout: 400 }).catch(() => false)) {
      await chip.click({ timeout: 4_000 });
      await page.waitForTimeout(250);
      return true;
    }
  }

  // Self-reflection textbox then submit pattern
  const ta = page.getByRole('textbox').first();
  if (await ta.isVisible({ timeout: 400 }).catch(() => false)) {
    await ta.fill(`exploration-${Date.now()}`);
    const sub = page.getByRole('button', { name: /submit|gửi|save|lưu/i }).first();
    if (await sub.isVisible({ timeout: 900 }).catch(() => false)) {
      await sub.click({ timeout: 5_000 });
      await page.waitForTimeout(500);
      return true;
    }
  }

  // Matching grid (🔗 in step title region)
  const matchHead = page.locator('main h3').filter({ hasText: '🔗' }).first();
  if (await matchHead.isVisible({ timeout: 500 }).catch(() => false)) {
    const matchGridBtns = page.locator('main .grid').first().locator('button:not([disabled])');
    const cnt = await matchGridBtns.count().catch(() => 0);
    if (cnt >= 2) {
      await matchGridBtns.nth(0).click({ timeout: 4_000 });
      await matchGridBtns.nth(Math.min(cnt - 1, 4)).click({ timeout: 4_000 });
      await page.waitForTimeout(450);
      return true;
    }
  }

  // Recording: Mic / Start recording (locale-messy — try common verbs)
  const rec = page.getByRole('button', { name: /record|recording|ghi âm|bắt đầu/i }).first();
  if (await rec.isVisible({ timeout: 450 }).catch(() => false)) {
    await rec.click({ timeout: 8_000 });
    await page.waitForTimeout(1_600);
    const stop = page.getByRole('button', { name: /stop|dừng|finish/i }).first();
    if (await stop.isVisible({ timeout: 12_000 }).catch(() => false)) {
      await stop.click({ timeout: 8_000 });
      await page.waitForTimeout(1_400);
      return true;
    }
  }

  // Video fudge
  await page.evaluate(() => {
    const v = document.querySelector('video');
    if (!v) return;
    try {
      Object.defineProperty(v, 'duration', { get: () => 120, configurable: true });
      Object.defineProperty(v, 'currentTime', { get: () => 118, configurable: true });
      v.dispatchEvent(new Event('timeupdate'));
      v.dispatchEvent(new Event('ended'));
    } catch {
      /* ignore */
    }
  });

  await page.locator('[data-testid="flashcard-index"]').first().waitFor({ state: 'visible', timeout: 300 }).catch(() => {});
  return false;
}

/**
 * Walk a single lesson from first paint toward feedback Skip / stale detection.
 */
async function walkLesson(page, slug, log, issues) {
  const urlPath = `/learn/courses/emergency-nursing-communication/lessons/${slug}`;
  await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 120_000 });

  /** wait for playable shell OR lock OR 404 */
  const mainH1 = page.locator('main h1').first();
  await mainH1.waitFor({ state: 'visible', timeout: 85_000 }).catch(() => {});

  const h1Txt = ((await mainH1.textContent().catch(() => '')) ?? '').trim();
  if (h1Txt === '404') {
    issues.push({ slug, severity: 'Major', note: `Next.js 404 shell on first navigation for ${slug} (retry Turbopack).` });
  }

  if (await page.getByRole('heading', { name: /complete previous lesson|Hoàn thành bài học trước/i }).isVisible({ timeout: 1_500 }).catch(() => false)) {
    issues.push({
      slug,
      severity: 'Critical',
      note: `${slug}: sequential lock despite seed — prerequisites not satisfied for ${EXPLORATION_EMAIL}.`,
    });
    log.push(`${slug}: BLOCKED (sequential gate)`);
    return;
  }

  let stagnant = 0;
  let prev = await readStepSummary(page);

  for (let iter = 0; iter < 140; iter++) {
    if (await dismissFeedbackIfShown(page, log, slug)) break;

    const summary = await readStepSummary(page);
    if (summary && summary !== prev) {
      prev = summary;
      stagnant = 0;
      log.push(`${slug}: ${summary}`);
    } else {
      stagnant++;
    }

    if (await isFeedbackScreen(page)) {
      await dismissFeedbackIfShown(page, log, slug);
      log.push(`${slug}: reached feedback iterations=${iter}`);
      break;
    }

    const clicked = await explorerTick(page);
    if (clicked) stagnant = Math.max(0, stagnant - 2);

    if (stagnant > 42) {
      issues.push({
        slug,
        severity: 'Major',
        note: `Automation stalled (${stagnant} ticks) summary="${summary}". Needs manual MCP or tighter step handler.`,
      });
      log.push(`${slug}: STALL`);
      break;
    }
    await page.waitForTimeout(200);
  }
}

async function main() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local');

  const sb = createClient(url, key, { auth: { persistSession: false } });
  await seedM1AndM2L1(sb, EXPLORATION_EMAIL);
  await assertDevServerReachable();

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  });
  const context = await browser.newContext({
    baseURL: BASE_URL,
    locale: 'vi-VN',
    viewport: { width: 390, height: 844 },
  });
  await patchAudioForRecording(context);
  const page = await context.newPage();

  /** @type {string[]} */
  const log = [];
  /** @type {{ slug: string; severity: string; note: string }[]} */
  const issues = [];

  page.on('pageerror', (e) => {
    log.push(`[pageerror] ${e.message}`);
  });

  await wireLearnRoutes(page);
  await login(page);

  for (const slug of M2_L2_L8_SLUGS) {
    await walkLesson(page, slug, log, issues);
    await dismissFeedbackIfShown(page, log, slug).catch(() => {});
    await page.waitForTimeout(500);
  }

  await browser.close();

  console.log(JSON.stringify({ email: EXPLORATION_EMAIL, lessons: M2_L2_L8_SLUGS, issues, log }, null, 2));

  fs.mkdirSync(path.join(root, 'tests/reports'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'tests/reports/exploration-m2-l2-l8-automation.json'),
    JSON.stringify({ email: EXPLORATION_EMAIL, lessons: M2_L2_L8_SLUGS, issues, log }, null, 2),
    'utf8',
  );

  console.log('\nSaved: tests/reports/exploration-m2-l2-l8-automation.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
