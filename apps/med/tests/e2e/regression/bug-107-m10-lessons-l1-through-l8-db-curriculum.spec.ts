/**
 * Bug #107 — M10 lessons 1–8 step-type blueprint (`emergency-procedures-communication`).
 *
 * L1 video-first (no scenario_intro). L5/L6 cloze after recording_submit.
 * L7 mission before cloze (post-mission consolidation). L8 reordered assessment.
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

const BLUEPRINT: Record<string, readonly string[]> = {
  'explaining-iv-line-insertion': [
    'video',
    'flash_card',
    'audio_shadow',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'explaining-oxygen-mask-vs-nasal-cannula': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'explaining-defibrillator-pads-to-a-conscious-patient': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'gaining-rapid-consent-for-ng-tube': [
    'flash_card',
    'video',
    'audio_shadow',
    'flash_card',
    'script_read',
    'cloze',
    'matching',
  ],
  'explaining-catheter-insertion': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'cloze',
    'matching',
  ],
  'pair-practice-nurse-to-patient-iv-explanation': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'cloze',
    'matching',
  ],
  'pair-practice-gaining-rapid-consent': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'mission',
    'cloze',
    'matching',
  ],
  'module-assessment-procedures-self-reflection': [
    'quiz',
    'cloze',
    'recording_submit',
    'spot_the_mistake',
    'drag_order',
    'matching',
    'self_reflection',
  ],
};

test.describe('Bug #107 — M10 lessons 1–8 DB curriculum', {
  tag: [TAG.regression, TAG.module10, TAG.content, TAG.data, bugTag(107)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-107-m10-lessons-l1-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'emergency-procedures-communication')
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
