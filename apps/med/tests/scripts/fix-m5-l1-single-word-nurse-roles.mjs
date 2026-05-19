/**
 * Bug #060 — Replace multi-word speaker label "Charge Nurse:" with single-word "Lead:"
 * on M5 L1 script_read + audio_shadow (bubble alignment).
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

const STEP_IDS = [
  '5b8bb97e-b127-4430-b44e-17d37916976c', // audio_shadow L1
  '5d385eeb-36ab-4e59-9685-09e7d18cf881', // script_read L1
];

function relabel(text) {
  return text.replace(/^Charge Nurse:/gm, 'Lead:');
}

for (const id of STEP_IDS) {
  const { data: row, error } = await sb.from('nursed_lesson_steps').select('id, type, config').eq('id', id).single();
  if (error || !row) {
    console.error('missing', id, error?.message);
    process.exit(1);
  }
  const cfg = { ...(row.config ?? {}) };
  if (typeof cfg.script === 'string') cfg.script = relabel(cfg.script);
  if (typeof cfg.transcript === 'string') cfg.transcript = relabel(cfg.transcript);
  if (Array.isArray(cfg.transcriptSegments)) {
    cfg.transcriptSegments = cfg.transcriptSegments.map((seg) => {
      const s = { ...seg };
      if (typeof s.en === 'string') s.en = relabel(s.en);
      return s;
    });
  }
  const { error: updErr } = await sb.from('nursed_lesson_steps').update({ config: cfg }).eq('id', id);
  if (updErr) {
    console.error('update failed', id, updErr.message);
    process.exit(1);
  }
  console.log('OK', row.type, id);
}
