/**
 * Bug #067 — M6 lessons 2–8 step-type blueprint (`reassurance-under-pressure`).
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

const BLUEPRINT: Record<string, readonly string[]> = {
  'anxious-family-at-icu-doors': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'quiz',
    'cloze',
    'script_read',
    'matching',
  ],
  'patient-refusing-treatment-during-emergency': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'quiz',
    'cloze',
    'script_read',
    'matching',
  ],
  'de-escalating-a-distressed-relative': [
    'flash_card',
    'scenario_intro',
    'audio_shadow',
    'flash_card',
    'video',
    'cloze',
    'script_read',
    'matching',
  ],
  'reassuring-a-childs-parent-in-paediatric-ed': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'cloze',
    'no_script',
    'script_read',
    'recording_submit',
    'matching',
  ],
  'pair-practice-calming-a-confused-elderly-patient': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'cloze',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'pair-practice-managing-family-demanding-answers': [
    'flash_card',
    'video',
    'flash_card',
    'no_script',
    'recording_submit',
    'cloze',
    'mission',
    'matching',
  ],
  'module-assessment-reassurance-self-reflection': [
    'quiz',
    'spot_the_mistake',
    'cloze',
    'drag_order',
    'recording_submit',
    'matching',
    'self_reflection',
  ],
};

test.describe('Bug #067 — M6 lessons 2–8 DB curriculum', {
  tag: [TAG.regression, TAG.module6, TAG.content, TAG.data, bugTag(67)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-067-m6-lessons-l2-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'reassurance-under-pressure')
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
});
