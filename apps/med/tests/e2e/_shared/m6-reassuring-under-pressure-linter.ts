/**
 * Data-quality helpers for Emergency course → Module 5
 * (`reassurance-under-pressure`).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export const EMERGENCY_COURSE_SLUG = 'emergency-nursing-communication';
export const M6_MODULE_SLUG = 'reassurance-under-pressure';

/** Multi-word speaker labels break script_read bubble alignment (both render left). */
export const MULTI_WORD_NURSE_ROLE = /^(charge\s+nurse|senior\s+nurse|head\s+nurse|ward\s+nurse)\s*:/i;

export type M6StepRow = {
  id: string;
  lesson_id: string;
  lesson_slug: string;
  type: string;
  order_index: number;
  config: Record<string, unknown> | null;
};

export function scriptFromConfig(cfg: Record<string, unknown> | null | undefined): string {
  if (!cfg) return '';
  return typeof cfg.script === 'string' ? cfg.script : '';
}

export async function loadM6Steps(sb: SupabaseClient): Promise<M6StepRow[]> {
  const { data: course, error: cErr } = await sb
    .from('nursed_courses')
    .select('id')
    .eq('slug', EMERGENCY_COURSE_SLUG)
    .single();
  if (cErr || !course) throw new Error(`course ${EMERGENCY_COURSE_SLUG}: ${cErr?.message}`);

  const { data: mod, error: mErr } = await sb
    .from('nursed_modules')
    .select('id')
    .eq('course_id', course.id)
    .eq('slug', M6_MODULE_SLUG)
    .single();
  if (mErr || !mod) throw new Error(`module ${M6_MODULE_SLUG}: ${mErr?.message}`);

  const { data: lessons, error: lErr } = await sb
    .from('nursed_lessons')
    .select('id, slug')
    .eq('module_id', mod.id);
  if (lErr || !lessons?.length) throw new Error(`lessons: ${lErr?.message}`);

  const slugByLesson = new Map(lessons.map((l) => [l.id, l.slug]));
  const { data: steps, error: sErr } = await sb
    .from('nursed_lesson_steps')
    .select('id, lesson_id, type, order_index, config')
    .in(
      'lesson_id',
      lessons.map((l) => l.id),
    )
    .order('order_index');
  if (sErr) throw new Error(sErr.message);

  return (steps ?? []).map((row) => ({
    id: row.id,
    lesson_id: row.lesson_id,
    lesson_slug: slugByLesson.get(row.lesson_id) ?? row.lesson_id,
    type: row.type,
    order_index: row.order_index,
    config: row.config as Record<string, unknown> | null,
  }));
}

export function parseBracketBlankAnswers(clozeText: string): string[] {
  const out: string[] = [];
  const re = /\[([^\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clozeText)) !== null) {
    out.push(m[1]);
  }
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickDecoysFromScript(answers: Set<string>, script: string, count: number): string[] {
  const candidates = [
    ...new Set(
      script
        .split(/\s+/)
        .map((w) => w.replace(/^[^\w]+|[^\w]+$/g, ''))
        .filter((w) => w.length > 2 && !answers.has(w.toLowerCase())),
    ),
  ];
  return shuffle(candidates).slice(0, count);
}

export function linesWithMultiWordNurseRoles(cfg: Record<string, unknown>): string[] {
  const hits: string[] = [];
  const script = typeof cfg.script === 'string' ? cfg.script : '';
  for (const raw of script.split('\n')) {
    const line = raw.trim();
    if (line && MULTI_WORD_NURSE_ROLE.test(line)) hits.push(line);
  }
  const tr = typeof cfg.transcript === 'string' ? cfg.transcript : '';
  for (const raw of tr.split('\n')) {
    const line = raw.trim();
    if (line && MULTI_WORD_NURSE_ROLE.test(line)) hits.push(line);
  }
  const segments = Array.isArray(cfg.transcriptSegments) ? cfg.transcriptSegments : [];
  for (const seg of segments) {
    const en = String((seg as { en?: string }).en ?? '').trim();
    if (en && MULTI_WORD_NURSE_ROLE.test(en)) hits.push(en);
  }
  return hits;
}

const NURSE_PREFIX = /^nurse(\s+[a-z0-9]+)?\s*:\s*/i;

export function nurseTurnsFromScriptReadConfig(cfg: Record<string, unknown>): string[] {
  const lines: string[] = [];
  if (Array.isArray(cfg.lines)) {
    for (const entry of cfg.lines as Array<{ role?: string; text?: string }>) {
      const role = (entry.role ?? '').toLowerCase();
      const text = (entry.text ?? '').trim();
      if (!text) continue;
      if (role.includes('nurse')) lines.push(text);
    }
    if (lines.length) return lines;
  }
  const script = typeof cfg.script === 'string' ? cfg.script : '';
  if (!script) return [];
  return script
    .split('\n')
    .map((raw) => raw.trim())
    .filter((raw) => NURSE_PREFIX.test(raw))
    .map((raw) => raw.replace(NURSE_PREFIX, '').trim())
    .filter(Boolean);
}

export function nurseLinePunctuationViolations(line: string): string | null {
  if (!line.trim()) return 'empty nurse line';
  if (/\?\?/.test(line)) return 'contains ??';
  if (/\.\?\s*$/.test(line) || /\.\?$/.test(line)) return 'ends with .?';
  const t = line.trim();
  if (t.endsWith('!')) return 'ends with ! (use . or ? only)';
  if (!(t.endsWith('.') || t.endsWith('?'))) return 'must end with . or ?';
  return null;
}
