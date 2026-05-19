/**
 * Populate missionEn / missionVi for M7 L7 mission step (Bug #076).
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

const MISSION_STEP_ID = '9c8957d8-4035-4f05-b1d7-8b0404514aa8';

const missionEn =
  'On your next shift, notice one moment when you must escalate a clinical red flag (chest pain, breathing distress, or altered consciousness). Write the exact English phrase you used or wish you had used. Share it with your study partner and compare how clearly you stated location, vitals, and urgency.';

const missionVi =
  'Trong ca làm tiếp theo, hãy chú ý một khoảnh khắc bạn phải báo cáo dấu hiệu đỏ lâm sàng (đau ngực, khó thở, hoặc thay đổi ý thức). Viết lại câu tiếng Anh bạn đã dùng hoặc ước gì bạn đã nói. Chia sẻ với bạn học và so sánh mức độ rõ ràng khi nêu vị trí, chỉ số sinh tồn và mức độ khẩn cấp.';

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
