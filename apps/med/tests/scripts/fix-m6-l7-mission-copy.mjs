/**
 * Populate missionEn / missionVi for M6 L7 mission step (Bug #066).
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

const MISSION_STEP_ID = '0905540e-a85c-483c-84a4-a79f507fd824';

const missionEn =
  'On your next shift, notice one moment when a patient or family member needs reassurance. Write down the phrase you used or wish you had used in English. Share it with your study partner and compare approaches.';

const missionVi =
  'Trong ca làm tiếp theo, hãy chú ý một khoảnh khắc bệnh nhân hoặc người nhà cần được trấn an. Viết lại câu bạn đã dùng hoặc ước gì bạn đã nói bằng tiếng Anh. Chia sẻ với bạn học và so sánh cách tiếp cận.';

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
