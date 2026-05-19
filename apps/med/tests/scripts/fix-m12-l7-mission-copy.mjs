/**
 * Populate missionEn / missionVi for M12 L7 mission step (Bug #126).
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

const MISSION_STEP_ID = '59de9f18-1995-40ca-b38d-486fbb86114b';

const missionEn =
  'With your study partner, role-play managing family information requests during active treatment: explain what you can share now, what must wait for the doctor, and how you will update them. Record a 60-second response, then complete the cloze step to consolidate the phrases you used before reading your mission reflection.';

const missionVi =
  'Cùng bạn học, đóng vai quản lý yêu cầu thông tin từ gia đình trong khi điều trị đang diễn ra: giải thích những gì bạn có thể chia sẻ ngay, những gì phải chờ bác sĩ, và cách bạn sẽ cập nhật cho họ. Ghi âm câu trả lời 60 giây, sau đó hoàn thành bài điền từ để củng cố các cụm bạn đã dùng trước khi đọc nhiệm vụ mission.';

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
