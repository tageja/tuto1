/**
 * Populate missionEn / missionVi for M5 L7 mission step (Bug #053).
 * Usage (from apps/med): node tests/scripts/fix-m5-l7-mission-copy.mjs
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

const MISSION_STEP_ID = '7c376269-90ac-4c9b-89b5-98ad60cacd7d';

const missionEn =
  'Before your next clinical shift, write out a short SBAR template on a card or phone note: Situation — Background — Assessment — Recommendation. Next time you observe a nurse escalate a concern, notice whether they follow this structure and which phrases they use. Bring one example to your next session.';

const missionVi =
  'Trước ca lâm sàng tiếp theo, hãy viết ra một mẫu SBAR ngắn trên giấy ghi chú hoặc điện thoại: Tình huống — Lịch sử — Đánh giá — Khuyến nghị. Lần tới khi quan sát một điều dưỡng báo cáo khẩn, hãy chú ý họ có tuân theo cấu trúc này không và dùng cụm từ nào. Mang một ví dụ đến buổi học tiếp theo.';

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
console.log('OK missionEn=', (check.config?.missionEn ?? '').length, 'missionVi=', (check.config?.missionVi ?? '').length);
