/**
 * Bug #054 — M5 lessons 2–8 step-type blueprint (authoring gaps on L2/L6/L8 are intentional).
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

const BLUEPRINT: Record<string, readonly string[]> = {
  'key-phrases-in-action-red-flags-urgency': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'script_read',
    'quiz',
    'matching',
  ],
  'understanding-the-situation-sbar-in-practice': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'quiz',
    'cloze',
    'script_read',
    'matching',
  ],
  'a-second-scenario-respiratory-deterioration': [
    'flash_card',
    'scenario_intro',
    'flash_card',
    'audio_shadow',
    'video',
    'cloze',
    'script_read',
    'matching',
  ],
  'your-turn-to-speak-open-deterioration-scenario': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'script_read',
    'no_script',
    'quick_response',
    'matching',
  ],
  'pair-practice-round-1-structured-sbar-handover': [
    'flash_card',
    'video',
    'flash_card',
    'cloze',
    'script_read',
    'no_script',
    'spot_the_mistake',
    'matching',
  ],
  'pair-practice-round-2-responding-to-family-anxiety': [
    'flash_card',
    'flash_card',
    'script_read',
    'no_script',
    'sentence_builder',
    'matching',
    'mission',
  ],
  'module-assessment-mixed-input-self-reflection': [
    'flash_card',
    'quick_response',
    'quiz',
    'cloze',
    'recording_submit',
    'self_reflection',
    'matching',
  ],
};

test.describe('Bug #054 — M5 lessons 2–8 DB curriculum', {
  tag: [TAG.regression, TAG.module5, TAG.content, TAG.data, bugTag(54)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-054-m5-lessons-l2-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'communicating-patient-deterioration-escalation-protocols')
      .single();

    for (const slug of Object.keys(BLUEPRINT)) {
      const { data: lesson } = await sb
        .from('nursed_lessons')
        .select('id, slug')
        .eq('module_id', mod!.id)
        .eq('slug', slug)
        .single();
      expect(lesson?.id, slug).toBeTruthy();

      const { data: steps } = await sb
        .from('nursed_lesson_steps')
        .select('order_index, type')
        .eq('lesson_id', lesson!.id)
        .order('order_index');
      const types = (steps ?? []).map((s) => s.type);
      expect(types, slug).toEqual([...BLUEPRINT[slug]]);
    }
  });

  test('L8 quick_response step has options with text_en', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'communicating-patient-deterioration-escalation-protocols')
      .single();
    const { data: lesson } = await sb
      .from('nursed_lessons')
      .select('id')
      .eq('module_id', mod!.id)
      .eq('slug', 'module-assessment-mixed-input-self-reflection')
      .single();

    const { data: step } = await sb
      .from('nursed_lesson_steps')
      .select('config')
      .eq('lesson_id', lesson!.id)
      .eq('type', 'quick_response')
      .order('order_index')
      .limit(1)
      .maybeSingle();

    const opts = (step?.config as { options?: { text_en?: string }[] } | null)?.options ?? [];
    expect(opts.length).toBeGreaterThanOrEqual(1);
    for (const o of opts) {
      expect(o.text_en?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });
});
