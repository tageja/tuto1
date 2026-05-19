/**
 * Populate missionEn / missionVi for M8 L7 mission step (Bug #086).
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

const MISSION_STEP_ID = 'af7af184-beaa-46d7-ae2d-95560aa28159';

const missionEn =
  'On your next shift, give a concise verbal report to the on-call doctor about one patient (use ISBAR: patient, situation, background, assessment, recommendation). Record the exact English phrases you used for situation and recommendation. Share with your study partner and refine one sentence for clarity and urgency.';

const missionVi =
  'Trong ca làm tiếp theo, hãy báo cáo ngắn gọn với bác sĩ trực về một bệnh nhân (dùng ISBAR: bệnh nhân, tình huống, tiền sử, đánh giá, đề xuất). Ghi lại các câu tiếng Anh bạn đã dùng cho tình huống và đề xuất. Chia sẻ với bạn học và chỉnh sửa một câu cho rõ ràng và phù hợp mức độ khẩn cấp.';

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
