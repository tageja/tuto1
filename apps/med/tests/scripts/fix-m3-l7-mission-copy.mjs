/**
 * One-off: populate missionEn / missionVi for M3 L7 `emergency-instruction-challenge` mission step (Bug #033).
 * Usage (from apps/med): node tests/scripts/fix-m3-l7-mission-copy.mjs
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

const MISSION_STEP_ID = '93156219-1cd5-42f3-ad6b-8e166a37f254';

const missionEn =
  'Give clear, calm emergency instructions to the patient or bystander. Use short sentences, one action at a time, and confirm understanding before moving to the next step. If they cannot follow, simplify the instruction and repeat it slowly.';

const missionVi =
  'Hãy đưa ra hướng dẫn cấp cứu rõ ràng và bình tĩnh cho bệnh nhân hoặc người nhà. Dùng câu ngắn, mỗi lần một hành động, và xác nhận họ hiểu trước khi chuyển bước tiếp theo. Nếu họ không làm theo, hãy đơn giản hóa lời hướng dẫn và nhắc lại chậm rãi.';

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
