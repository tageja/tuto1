/**
 * Bug #034 — Emergency Module **Immediate Instructions** lessons **2–8** curated blueprint stays coherent:
 * ordered step types + `quick_response.options[].text_en` (see Bug #033 for `mission` config).
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

const BLUEPRINT: Record<string, readonly string[]> = {
  'more-critical-instructions': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'quiz',
    'cloze',
    'script_read',
    'matching',
  ],
  'instructions-in-sequence': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'cloze',
    'script_read',
    'quiz',
    'matching',
  ],
  'when-the-patient-cannot-cooperate': [
    'flash_card',
    'scenario_intro',
    'flash_card',
    'audio_shadow',
    'video',
    'cloze',
    'script_read',
    'matching',
  ],
  'give-the-instruction': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'cloze',
    'script_read',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'pair-instructions-round-1': [
    'flash_card',
    'video',
    'flash_card',
    'cloze',
    'script_read',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'emergency-instruction-challenge': [
    'flash_card',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'matching',
    'mission',
  ],
  'instructions-assessment': [
    'flash_card',
    'quick_response',
    'quiz',
    'quiz',
    'cloze',
    'recording_submit',
    'self_reflection',
    'matching',
  ],
};

test.describe('Bug #034 — M3 lessons 2–8 DB curriculum (Immediate Instructions)', {
  tag: [TAG.regression, TAG.module3, TAG.content, TAG.data, bugTag(34)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-034-m3-lessons-l2-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course, error: cErr } = await sb
      .from('nursed_courses')
      .select('id')
      .eq('slug', 'emergency-nursing-communication')
      .single();
    expect(cErr, cErr?.message).toBeNull();
    expect(course?.id).toBeTruthy();

    const { data: mod, error: mErr } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'immediate-instructions-in-emergencies')
      .single();
    expect(mErr, mErr?.message).toBeNull();
    expect(mod?.id).toBeTruthy();

    for (const slug of Object.keys(BLUEPRINT)) {
      const { data: lesson, error: lErr } = await sb
        .from('nursed_lessons')
        .select('id, slug')
        .eq('module_id', mod!.id)
        .eq('slug', slug)
        .single();
      expect(lErr, `${slug}: ${lErr?.message}`).toBeNull();
      expect(lesson?.id).toBeTruthy();

      const { data: steps, error: sErr } = await sb
        .from('nursed_lesson_steps')
        .select('order_index, type')
        .eq('lesson_id', lesson!.id)
        .order('order_index');
      expect(sErr, sErr?.message).toBeNull();
      const types = (steps ?? []).map((s) => s.type);
      expect(types, slug).toEqual([...BLUEPRINT[slug]]);
    }
  });

  test('L8 quick_response step has options with text_en (canonical column)', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'immediate-instructions-in-emergencies')
      .single();
    const { data: lesson } = await sb
      .from('nursed_lessons')
      .select('id')
      .eq('module_id', mod!.id)
      .eq('slug', 'instructions-assessment')
      .single();

    const { data: step } = await sb
      .from('nursed_lesson_steps')
      .select('type, config')
      .eq('lesson_id', lesson!.id)
      .eq('type', 'quick_response')
      .order('order_index')
      .limit(1)
      .maybeSingle();

    expect(step?.type).toBe('quick_response');
    const opts = (step?.config as { options?: { text_en?: string }[] } | null)?.options ?? [];
    expect(opts.length, 'quick_response should have ≥1 option').toBeGreaterThanOrEqual(1);
    for (const o of opts) {
      expect(o.text_en?.trim().length ?? 0, 'each option needs text_en').toBeGreaterThan(0);
    }
  });
});
