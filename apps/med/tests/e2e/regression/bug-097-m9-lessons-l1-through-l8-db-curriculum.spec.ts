/**
 * Bug #097 — M9 lessons 1–8 step-type blueprint (`simulation-and-emergency-review`).
 *
 * L1–L4 are in-progress video-first / shortened sequences (simulation debrief module).
 * L7 places script_read before video — intentional read-then-watch pedagogy for pair practice.
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

const BLUEPRINT: Record<string, readonly string[]> = {
  'team-debrief-after-resuscitation': [
    'scenario_intro',
    'flash_card',
    'video',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'discussing-a-near-miss-with-a-supervisor': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'presenting-a-case-to-the-ward-team': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'asking-a-senior-colleague-for-feedback': [
    'flash_card',
    'video',
    'audio_shadow',
    'flash_card',
    'script_read',
    'cloze',
    'matching',
  ],
  'reflecting-on-a-difficult-handover': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'cloze',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'pair-practice-nurse-to-supervisor-debrief': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'cloze',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'pair-practice-nurse-to-nurse-case-presentation': [
    'flash_card',
    'script_read',
    'video',
    'flash_card',
    'cloze',
    'no_script',
    'recording_submit',
    'mission',
    'matching',
  ],
  'module-assessment-debrief-self-reflection': [
    'quiz',
    'spot_the_mistake',
    'cloze',
    'drag_order',
    'recording_submit',
    'matching',
    'self_reflection',
  ],
};

test.describe('Bug #097 — M9 lessons 1–8 DB curriculum', {
  tag: [TAG.regression, TAG.module9, TAG.content, TAG.data, bugTag(97)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-097-m9-lessons-l1-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'simulation-and-emergency-review')
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
