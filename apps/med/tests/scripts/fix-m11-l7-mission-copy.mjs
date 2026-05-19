/**
 * Populate missionEn / missionVi for M11 L7 mission step (Bug #116).
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

const MISSION_STEP_ID = '22c2927b-a00c-4798-a1e6-cfc784e6a988';

const missionEn =
  'With your study partner, role-play a nurse-to-nurse trauma assessment: use SBAR to report mechanism of injury, vital signs, and GCS, then agree on two priority actions. Record a 60-second handover clip, then complete the cloze step to lock in the phrases you used before reading your mission reflection.';

const missionVi =
  'Cùng bạn học, đóng vai đánh giá chấn thương nurse-to-nurse: dùng SBAR báo cáo cơ chế chấn thương, dấu hiệu sinh tồn và GCS, rồi thống nhất hai hành động ưu tiên. Ghi âm handover 60 giây, sau đó hoàn thành bài điền từ để củng cố các cụm bạn đã dùng trước khi đọc nhiệm vụ mission.';

const { data: row, error: fetchErr } = await sb
  .from('nursed_lesson_steps')
  .select('id, config')
  .eq('id', MISSION_STEP_ID)
  .single();
if (fetchErr || !row) {
  console.error(fetchErr?.message);
  process.exit(1);
}

const cfg = { ...(row.config ?? {}), missionEn, missionVi };
const { error: updErr } = await sb.from('nursed_lesson_steps').update({ config: cfg }).eq('id', MISSION_STEP_ID);
if (updErr) {
  console.error(updErr.message);
  process.exit(1);
}
console.log('OK missionEn=', missionEn.length, 'missionVi=', missionVi.length);
