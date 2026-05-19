/**
 * Print ordered step types for Emergency · Module 2 (triage-intake) lessons 2–8.
 * Usage (from apps/med): node tests/scripts/dump-m2-lesson-steps.mjs
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const raw = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const L2_L8 = [
  'describing-symptoms',
  'the-triage-sequence-in-order',
  'a-different-presentation',
  'your-turn-to-ask-the-questions',
  'pair-triage-round-1',
  'triage-challenge',
  'triage-assessment',
];

async function main() {
  const { data: course } = await sb
    .from('nursed_courses')
    .select('id')
    .eq('slug', 'emergency-nursing-communication')
    .single();
  const { data: mod } = await sb
    .from('nursed_modules')
    .select('id')
    .eq('course_id', course.id)
    .eq('slug', 'triage-intake')
    .single();

  const { data: lessons } = await sb
    .from('nursed_lessons')
    .select('id, slug, title, order_index')
    .eq('module_id', mod.id)
    .in('slug', L2_L8)
    .order('order_index');

  const out = [];
  for (const lesson of lessons ?? []) {
    const { data: steps } = await sb
      .from('nursed_lesson_steps')
      .select('order_index, type, title')
      .eq('lesson_id', lesson.id)
      .order('order_index');
    out.push({
      slug: lesson.slug,
      title: lesson.title,
      order_index: lesson.order_index,
      steps: (steps ?? []).map((s) => ({ order: s.order_index, type: s.type, title: s.title })),
    });
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
