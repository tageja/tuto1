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

const LESSON_IDS = [
  '71dbf6fc-32b8-4ad3-82ca-da2c5f960656',
  'd6de30df-e79d-4ad9-88df-eb7494655bdf',
  'd9224a8e-26c0-4045-ac80-77c62471670d',
  '979741a9-c89b-4dac-afca-703b5845480c',
  '880a481f-8042-449b-b5a0-5c03288dbba0',
  '3961c91e-ca9d-457d-aefb-9454ccf13b92',
  '8ccd2759-7a8a-49cf-a655-20210919dcda',
  '5f09e1c0-c4bb-43b8-8edb-880f3525439c',
  'c343e6c1-a202-4da7-b549-d35f3f27fd57',
  '45935cf2-b657-4c4d-a7d4-eb98e2ac6475',
  'd62f3f77-4299-434c-a268-f00f2641c492',
  '5c9d9abf-7214-4a11-b8b8-34f429b94553',
];

const { data: mods } = await sb
  .from('nursed_modules')
  .select('id, order_index, slug')
  .in('order_index', [9, 10, 11, 12]);
const modIds = mods.map((m) => m.id);

const { data: lessons } = await sb
  .from('nursed_lessons')
  .select('id, slug, order_index, module_id')
  .in('module_id', modIds)
  .in('order_index', [2, 3, 4]);

const modById = new Map(mods.map((m) => [m.id, m.order_index]));

console.log('=== 1a Step counts ===');
for (const l of lessons.sort((a, b) => {
  const ma = modById.get(a.module_id) - modById.get(b.module_id);
  return ma !== 0 ? ma : a.order_index - b.order_index;
})) {
  const { data: steps } = await sb
    .from('nursed_lesson_steps')
    .select('type, order_index')
    .eq('lesson_id', l.id)
    .order('order_index');
  const types = steps.map((s) => `${s.type}(${s.order_index})`).join(', ');
  console.log(`M${modById.get(l.module_id)} L${l.order_index}`, l.slug, 'total=', steps.length, types);
}

console.log('\n=== 1b L2/L3 audio_shadow ===');
for (const l of lessons.filter((x) => x.order_index === 2 || x.order_index === 3)) {
  const { data: step } = await sb
    .from('nursed_lesson_steps')
    .select('order_index, config')
    .eq('lesson_id', l.id)
    .eq('type', 'audio_shadow')
    .maybeSingle();
  const cfg = step?.config ?? {};
  const segs = Array.isArray(cfg.transcriptSegments) ? cfg.transcriptSegments : [];
  console.log(
    `M${modById.get(l.module_id)} L${l.order_index}`,
    l.slug,
    'idx',
    step?.order_index,
    'segs',
    segs.length,
    'audioUrl',
    cfg.audioUrl ?? cfg.audio_url,
  );
}

console.log('\n=== 1c L4 quiz ===');
for (const l of lessons.filter((x) => x.order_index === 4)) {
  const { data: step } = await sb
    .from('nursed_lesson_steps')
    .select('order_index, config')
    .eq('lesson_id', l.id)
    .eq('type', 'quiz')
    .maybeSingle();
  const q = step?.config?.questions ?? [];
  const opts = q[0]?.options?.length ?? 0;
  console.log(`M${modById.get(l.module_id)}`, l.slug, 'quiz idx', step?.order_index, 'q', q.length, 'opts q1', opts);
}

console.log('\n=== 1d Duplicates ===');
for (const lid of LESSON_IDS) {
  const { data: steps } = await sb.from('nursed_lesson_steps').select('order_index').eq('lesson_id', lid);
  const counts = {};
  for (const s of steps) counts[s.order_index] = (counts[s.order_index] ?? 0) + 1;
  for (const [idx, c] of Object.entries(counts)) {
    if (c > 1) console.log('DUP', lid, idx, c);
  }
}
console.log('done');
