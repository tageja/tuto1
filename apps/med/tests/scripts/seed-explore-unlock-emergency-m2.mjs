/**
 * One-off: mark Emergency course Module 1 (+ M2 L1) complete for test@test.com
 * so browser MCP can open M2 Lesson 2+ without playing the full prerequisite chain.
 *
 * Usage (from apps/med): node tests/scripts/seed-explore-unlock-emergency-m2.mjs
 *   [--all-m2]           mark all 8 Triage Intake lessons completed
 *   [--reset-emergency]  delete nursed_progress rows for this user for Emergency course (M1+M2 lessons)
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (same as Playwright admin tests).
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd());
const envPath = path.join(root, '.env.local');
const raw = fs.readFileSync(envPath, 'utf8');
/** @type {Record<string, string>} */
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

/** Must match `tests/e2e/_shared/emergency-m2-l1-flow.ts` snapshot (M2 gate). */
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

async function userIdByEmail(email) {
  const { data: rid, error } = await sb.rpc('get_auth_user_id_by_email', { user_email: email });
  if (!error && rid) return /** @type {string} */ (rid);
  const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  return data?.users?.find((u) => u.email === email)?.id ?? null;
}

async function main() {
  const email = 'test@test.com';
  const userId = await userIdByEmail(email);
  if (!userId) {
    console.error('No auth user for', email);
    process.exit(1);
  }

  const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
  if (!course?.id) throw new Error('Emergency course not found');

  const { data: mod } = await sb.from('nursed_modules').select('id').eq('course_id', course.id).eq('slug', 'triage-intake').single();
  if (!mod?.id) throw new Error('triage-intake module not found');

  const { data: m2Lessons } = await sb.from('nursed_lessons').select('id, slug, order_index').eq('module_id', mod.id).order('order_index');
  const m2L1 = m2Lessons?.find((l) => l.slug === 'asking-the-right-questions');
  if (!m2L1) throw new Error('M2 L1 lesson not found');

  if (process.argv.includes('--reset-emergency')) {
    const { data: modules } = await sb.from('nursed_modules').select('id').eq('course_id', course.id);
    const mids = modules?.map((m) => m.id) ?? [];
    if (mids.length === 0) throw new Error('No modules for Emergency course');

    const { data: lessonRows } = await sb.from('nursed_lessons').select('id').in('module_id', mids);
    const wipeIds = [...new Set((lessonRows ?? []).map((r) => r.id))];

    for (const lessonId of wipeIds) {
      await sb.from('nursed_progress').delete().eq('user_id', userId).eq('lesson_id', lessonId);
    }
    console.log('Reset Emergency course nursed_progress for learner:', {
      email,
      lessonProgressRowsTargets: wipeIds.length,
    });
    return;
  }

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

  for (const id of EMERGENCY_M1_LESSON_IDS) {
    await upsertOne(id);
  }

  /** Optional flag: `--all-m2` also marks every Triage Intake lesson completed (explore reopen / bug #16 checks). */
  const allM2 = process.argv.includes('--all-m2');
  const m2targets = allM2 && m2Lessons?.length ? m2Lessons : [m2L1];
  for (const l of m2targets) {
    await upsertOne(l.id);
  }

  console.log('Seeded complete:', {
    userId,
    email,
    m1Lessons: EMERGENCY_M1_LESSON_IDS.length,
    m2SlugsMarked: m2targets.map((l) => l.slug),
    allM2,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
