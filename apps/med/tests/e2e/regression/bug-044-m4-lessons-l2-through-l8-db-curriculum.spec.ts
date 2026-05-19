/**
 * Bug #044 — Emergency Module **Common Emergency Scenarios** lessons **2–8** curated blueprint stays coherent:
 * ordered step types + `quick_response.options[].text_en`.
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

const BLUEPRINT: Record<string, readonly string[]> = {
  'bleeding-and-trauma': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'quiz',
    'cloze',
    'script_read',
    'matching',
  ],
  'fainting-fever-and-severe-pain': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'cloze',
    'script_read',
    'quiz',
    'matching',
  ],
  'a-complex-scenario-two-problems-at-once': [
    'flash_card',
    'scenario_intro',
    'flash_card',
    'audio_shadow',
    'video',
    'cloze',
    'script_read',
    'matching',
  ],
  'respond-to-the-scenario': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'cloze',
    'script_read',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'pair-scenario-practice-round-1': [
    'flash_card',
    'video',
    'flash_card',
    'cloze',
    'script_read',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'mixed-emergency-challenge': [
    'flash_card',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'matching',
    'mission',
  ],
  'common-scenarios-assessment': [
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

test.describe('Bug #044 — M4 lessons 2–8 DB curriculum (Common Emergency Scenarios)', {
  tag: [TAG.regression, TAG.module4, TAG.content, TAG.data, bugTag(44)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-044-m4-lessons-l2-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'common-emergency-scenarios')
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

  test('L8 quick_response step has options with text_en (canonical column)', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'common-emergency-scenarios')
      .single();
    const { data: lesson } = await sb
      .from('nursed_lessons')
      .select('id')
      .eq('module_id', mod!.id)
      .eq('slug', 'common-scenarios-assessment')
      .single();

    const { data: step } = await sb
      .from('nursed_lesson_steps')
      .select('type, config')
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
