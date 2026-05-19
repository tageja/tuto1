/**
 * Populate missionEn / missionVi for M10 L7 mission step (Bug #106).
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

const MISSION_STEP_ID = '65d9c7c0-e854-44b3-98ec-ac29095b602f';

const missionEn =
  'With your study partner, role-play gaining rapid consent for an NG tube: explain the procedure in simple English, check understanding, and respond to one concern. Record a 60-second explanation, then complete the post-mission cloze to consolidate key phrases you used.';

const missionVi =
  'Cùng bạn học, đóng vai xin phép nhanh đặt ống thông mũi-dạ dày: giải thích thủ thuật bằng tiếng Anh đơn giản, kiểm tra người bệnh đã hiểu, và trả lời một lo ngại. Ghi âm giải thích 60 giây, sau đó hoàn thành bài điền từ sau mission để củng cố các cụm tiếng Anh bạn đã dùng.';

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
