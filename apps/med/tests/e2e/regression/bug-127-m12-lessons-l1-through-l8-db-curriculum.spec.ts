/**
 * Bug #127 — M12 lessons 1–8 step-type blueprint (`family-communication-in-emergencies`).
 * Structurally identical to M11 — encode prod order as-is.
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

const BLUEPRINT: Record<string, readonly string[]> = {
  'explaining-a-cardiac-arrest-to-the-family': [
    'video',
    'flash_card',
    'audio_shadow',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'informing-family-that-condition-has-worsened': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'answering-will-they-survive-professionally': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'discussing-cpr-and-resuscitation-decisions': [
    'flash_card',
    'video',
    'audio_shadow',
    'flash_card',
    'script_read',
    'cloze',
    'matching',
  ],
  'supporting-grieving-families': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'cloze',
    'matching',
  ],
  'pair-practice-nurse-to-family-breaking-bad-news': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'cloze',
    'matching',
  ],
  'pair-practice-managing-information-requests-during-treatment': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'cloze',
    'mission',
    'matching',
  ],
  'module-assessment-family-communication-self-reflection': [
    'quiz',
    'cloze',
    'spot_the_mistake',
    'drag_order',
    'recording_submit',
    'matching',
    'self_reflection',
  ],
};

test.describe('Bug #127 — M12 lessons 1–8 DB curriculum', {
  tag: [TAG.regression, TAG.module12, TAG.content, TAG.data, bugTag(127)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-127-m12-lessons-l1-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'family-communication-in-emergencies')
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
