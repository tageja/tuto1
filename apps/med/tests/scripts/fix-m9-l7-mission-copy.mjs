/**
 * Populate missionEn / missionVi for M9 L7 mission step (Bug #096).
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

const MISSION_STEP_ID = '731f8744-30c5-44d4-89d7-d7e13b355310';

const missionEn =
  'After your next simulation or team debrief, write three sentences: what went well, what you would do differently, and one specific English phrase you will use in your next case presentation. Share with your study partner and ask for one piece of constructive feedback.';

const missionVi =
  'Sau buổi mô phỏng hoặc debrief tiếp theo, hãy viết ba câu: điều làm tốt, điều bạn sẽ làm khác, và một cụm tiếng Anh cụ thể bạn sẽ dùng trong lần trình bày ca bệnh tiếp theo. Chia sẻ với bạn học và xin một góp ý mang tính xây dựng.';

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
