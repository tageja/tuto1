/**
 * Backfill drag_order `lines` from `items` + `correct_order` when lines[] is empty
 * (DragOrderStep.tsx reads config.lines). Course-wide data fix for assessment L8 steps.
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

function linesFromConfig(cfg) {
  const lines = Array.isArray(cfg.lines) ? cfg.lines.map((s) => String(s).trim()).filter(Boolean) : [];
  if (lines.length >= 3) return lines;
  const items = Array.isArray(cfg.items) ? cfg.items : [];
  const order = Array.isArray(cfg.correct_order) ? cfg.correct_order : [];
  if (!items.length) return [];
  const byId = new Map(items.map((it) => [String(it.id ?? ''), String(it.text ?? it.text_en ?? '').trim()]));
  if (order.length) {
    return order.map((id) => byId.get(String(id)) ?? '').filter(Boolean);
  }
  return items.map((it) => String(it.text ?? it.text_en ?? '').trim()).filter(Boolean);
}

const { data: steps } = await sb.from('nursed_lesson_steps').select('id, config').eq('type', 'drag_order');
let updated = 0;
for (const row of steps ?? []) {
  const cfg = { ...(row.config ?? {}) };
  const existing = Array.isArray(cfg.lines) ? cfg.lines.filter((s) => String(s).trim()) : [];
  if (existing.length >= 3) continue;
  const derived = linesFromConfig(cfg);
  if (derived.length < 3) {
    console.warn('SKIP', row.id, 'cannot derive lines, items=', (cfg.items ?? []).length);
    continue;
  }
  cfg.lines = derived;
  const { error } = await sb.from('nursed_lesson_steps').update({ config: cfg }).eq('id', row.id);
  if (error) {
    console.error('FAIL', row.id, error.message);
    process.exit(1);
  }
  updated++;
  console.log('OK', row.id, derived.length, 'lines');
}
console.log('updated', updated);
