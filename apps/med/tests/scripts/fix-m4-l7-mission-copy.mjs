/**
 * One-off: populate missionEn / missionVi for M4 L7 `mixed-emergency-challenge` mission step (Bug #043).
 * Usage (from apps/med): node tests/scripts/fix-m4-l7-mission-copy.mjs
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const raw = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const MISSION_STEP_ID = '92aabcc2-fbf8-4efd-9062-58d62ceaa0ae';

const missionEn =
  'Respond to a mixed emergency scenario with a calm, structured approach. Identify the two main problems, prioritise the most urgent risk first, and communicate clearly with the patient and your partner nurse.';

const missionVi =
  'Hãy xử lý một tình huống cấp cứu phức tạp bằng cách bình tĩnh và có hệ thống. Xác định hai vấn đề chính, ưu tiên nguy cơ khẩn cấp nhất trước, và giao tiếp rõ ràng với bệnh nhân cùng đồng nghiệp điều dưỡng.';

const { data: row, error: fetchErr } = await sb
  .from('nursed_lesson_steps')
  .select('id, type, config')
  .eq('id', MISSION_STEP_ID)
  .single();
if (fetchErr || !row) {
  console.error('Mission step not found:', fetchErr?.message);
  process.exit(1);
}

const cfg = { ...(row.config ?? {}), missionEn, missionVi };
const { error: updErr } = await sb.from('nursed_lesson_steps').update({ config: cfg }).eq('id', MISSION_STEP_ID);
if (updErr) {
  console.error('Update failed:', updErr.message);
  process.exit(1);
}

const { data: check } = await sb.from('nursed_lesson_steps').select('config').eq('id', MISSION_STEP_ID).single();
console.log(
  'OK missionEn=',
  (check.config?.missionEn ?? '').length,
  'missionVi=',
  (check.config?.missionVi ?? '').length,
);
