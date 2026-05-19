/**
 * Bug #103 — Replace multi-word speaker label "Senior Nurse:" with single-word "Mentor:"
 * on M9 L4 audio_shadow (asking-a-senior-colleague-for-feedback).
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

const AUDIO_SHADOW_STEP_ID = '55cec4c2-9d59-4b79-bc00-9ab372e4ee0d';

function relabel(text) {
  return text
    .replace(/^Senior Nurse:/gm, 'Mentor:')
    .replace(/^Charge Nurse:/gm, 'Lead:')
    .replace(/^Head Nurse:/gm, 'Lead:')
    .replace(/^Ward Nurse:/gm, 'Nurse:');
}

const { data: row, error } = await sb
  .from('nursed_lesson_steps')
  .select('id, type, config')
  .eq('id', AUDIO_SHADOW_STEP_ID)
  .single();
if (error || !row) {
  console.error('missing', AUDIO_SHADOW_STEP_ID, error?.message);
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
const { error: updErr } = await sb.from('nursed_lesson_steps').update({ config: cfg }).eq('id', AUDIO_SHADOW_STEP_ID);
if (updErr) {
  console.error('update failed', updErr.message);
  process.exit(1);
}
console.log('OK', row.type, AUDIO_SHADOW_STEP_ID);
