/**
 * Bug #136 — M9–M12 L2/L3 `audio_shadow` + L4 `quiz` inserts (2026-05-19).
 * DB-only structural verification after Supabase step inserts.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

test.beforeAll(() => requireSupabaseAdmin('bug-136-m9-to-m12-l2-l3-audio-shadow-l4-quiz-structure'));

const LESSON_IDS_L2_L3_L4 = [
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
] as const;

const L2_L3_SEQUENCE = [
  'flash_card',
  'audio_shadow',
  'video',
  'flash_card',
  'script_read',
  'quiz',
  'cloze',
  'matching',
] as const;

const L4_SEQUENCE = [
  'flash_card',
  'video',
  'audio_shadow',
  'flash_card',
  'quiz',
  'script_read',
  'cloze',
  'matching',
] as const;

const MODULE_SLUGS = [
  'simulation-and-emergency-review',
  'emergency-procedures-communication',
  'trauma-acute-injuries',
  'family-communication-in-emergencies',
] as const;

type StepRow = {
  id: string;
  lesson_id: string;
  type: string;
  order_index: number;
  config: Record<string, unknown> | null;
  lesson_slug: string;
  lesson_order: number;
  module_slug: string;
};

async function loadAffectedSteps(): Promise<StepRow[]> {
  const sb = getSupabaseAdmin();
  const { data: course } = await sb
    .from('nursed_courses')
    .select('id')
    .eq('slug', 'emergency-nursing-communication')
    .single();
  const { data: mods } = await sb
    .from('nursed_modules')
    .select('id, slug')
    .eq('course_id', course!.id)
    .in('slug', [...MODULE_SLUGS]);
  const modIds = (mods ?? []).map((m) => m.id);
  const modSlug = new Map((mods ?? []).map((m) => [m.id, m.slug]));

  const { data: lessons } = await sb
    .from('nursed_lessons')
    .select('id, slug, order_index, module_id')
    .in('module_id', modIds)
    .in('order_index', [2, 3, 4]);
  const lessonMeta = new Map(
    (lessons ?? []).map((l) => [
      l.id,
      { slug: l.slug, order: l.order_index, module_slug: modSlug.get(l.module_id) ?? '' },
    ]),
  );

  const { data: steps } = await sb
    .from('nursed_lesson_steps')
    .select('id, lesson_id, type, order_index, config')
    .in('lesson_id', [...LESSON_IDS_L2_L3_L4])
    .order('order_index');

  return (steps ?? []).map((s) => {
    const meta = lessonMeta.get(s.lesson_id)!;
    return {
      id: s.id,
      lesson_id: s.lesson_id,
      type: s.type,
      order_index: s.order_index,
      config: s.config as Record<string, unknown> | null,
      lesson_slug: meta.slug,
      lesson_order: meta.order,
      module_slug: meta.module_slug,
    };
  });
}

test.describe('Bug #136 — M9–M12 L2/L3 audio_shadow + L4 quiz structure', {
  tag: [
    TAG.regression,
    TAG.module9,
    TAG.module10,
    TAG.module11,
    TAG.module12,
    TAG.content,
    TAG.data,
    bugTag(136),
  ],
}, () => {
  test('all 12 lessons have exactly 8 steps with expected type sequences', async () => {
    const steps = await loadAffectedSteps();
    const byLesson = new Map<string, StepRow[]>();
    for (const row of steps) {
      const list = byLesson.get(row.lesson_id) ?? [];
      list.push(row);
      byLesson.set(row.lesson_id, list);
    }

    const violations: string[] = [];
    for (const lessonId of LESSON_IDS_L2_L3_L4) {
      const rows = (byLesson.get(lessonId) ?? []).sort((a, b) => a.order_index - b.order_index);
      const label = rows[0]
        ? `${rows[0].module_slug} ${rows[0].lesson_slug}`
        : lessonId;
      if (rows.length !== 8) {
        violations.push(`${label}: expected 8 steps, got ${rows.length}`);
        continue;
      }
      const types = rows.map((r) => r.type);
      const expected =
        rows[0].lesson_order === 4 ? [...L4_SEQUENCE] : [...L2_L3_SEQUENCE];
      if (JSON.stringify(types) !== JSON.stringify(expected)) {
        violations.push(`${label}: types ${types.join(',')} !== ${expected.join(',')}`);
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('L2/L3 audio_shadow at order_index 2 with transcriptSegments', async () => {
    const steps = await loadAffectedSteps();
    const violations: string[] = [];
    for (const row of steps.filter((s) => s.lesson_order === 2 || s.lesson_order === 3)) {
      const audio = steps
        .filter((s) => s.lesson_id === row.lesson_id && s.type === 'audio_shadow')
        .sort((a, b) => a.order_index - b.order_index)[0];
      if (!audio) {
        violations.push(`${row.lesson_slug}: missing audio_shadow`);
        continue;
      }
      if (audio.order_index !== 2) {
        violations.push(`${row.lesson_slug}: audio_shadow order_index ${audio.order_index}, expected 2`);
      }
      const cfg = audio.config ?? {};
      const segs = Array.isArray(cfg.transcriptSegments) ? cfg.transcriptSegments : [];
      if (segs.length < 5) {
        violations.push(`${row.lesson_slug}: transcriptSegments length ${segs.length} < 5`);
      }
      segs.forEach((seg: unknown, i: number) => {
        const s = seg as { en?: string; vi?: string };
        if (!String(s.en ?? '').trim()) violations.push(`${row.lesson_slug} seg[${i}]: empty en`);
        if (!String(s.vi ?? '').trim()) violations.push(`${row.lesson_slug} seg[${i}]: empty vi`);
      });
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('L4 quiz at order_index 5 with 3×4 MCQ structure', async () => {
    const steps = await loadAffectedSteps();
    const violations: string[] = [];
    for (const row of steps.filter((s) => s.lesson_order === 4)) {
      const quiz = steps.find((s) => s.lesson_id === row.lesson_id && s.type === 'quiz');
      if (!quiz) {
        violations.push(`${row.lesson_slug}: missing quiz`);
        continue;
      }
      if (quiz.order_index !== 5) {
        violations.push(`${row.lesson_slug}: quiz order_index ${quiz.order_index}, expected 5`);
      }
      const questions = Array.isArray(quiz.config?.questions) ? quiz.config!.questions : [];
      if (questions.length !== 3) {
        violations.push(`${row.lesson_slug}: expected 3 questions, got ${questions.length}`);
      }
      questions.forEach((q: unknown, qi: number) => {
        const question = q as {
          prompt_en?: string;
          prompt_vi?: string;
          answer?: string;
          options?: Array<{ text?: string; text_en?: string; text_vi?: string }>;
        };
        if (!String(question.prompt_en ?? '').trim()) {
          violations.push(`${row.lesson_slug} Q${qi + 1}: missing prompt_en`);
        }
        if (!String(question.prompt_vi ?? '').trim()) {
          violations.push(`${row.lesson_slug} Q${qi + 1}: missing prompt_vi`);
        }
        if (!String(question.answer ?? '').trim()) {
          violations.push(`${row.lesson_slug} Q${qi + 1}: missing answer`);
        }
        const opts = Array.isArray(question.options) ? question.options : [];
        if (opts.length !== 4) {
          violations.push(`${row.lesson_slug} Q${qi + 1}: expected 4 options, got ${opts.length}`);
        }
        opts.forEach((o, oi) => {
          const textEn = String(o.text ?? o.text_en ?? '').trim();
          const textVi = String(o.text_vi ?? '').trim();
          if (!textEn) violations.push(`${row.lesson_slug} Q${qi + 1} opt[${oi}]: empty English text`);
          if (!textVi) violations.push(`${row.lesson_slug} Q${qi + 1} opt[${oi}]: empty text_vi`);
        });
      });
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('no duplicate order_index within any of the 12 lessons', async () => {
    const steps = await loadAffectedSteps();
    const violations: string[] = [];
    for (const lessonId of LESSON_IDS_L2_L3_L4) {
      const counts = new Map<number, number>();
      for (const row of steps.filter((s) => s.lesson_id === lessonId)) {
        counts.set(row.order_index, (counts.get(row.order_index) ?? 0) + 1);
      }
      for (const [idx, c] of counts) {
        if (c > 1) violations.push(`${lessonId} order_index ${idx}: ${c} duplicates`);
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });
});
