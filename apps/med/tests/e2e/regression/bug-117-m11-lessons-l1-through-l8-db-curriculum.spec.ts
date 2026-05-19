/**
 * Bug #117 — M11 lessons 1–8 step-type blueprint (`trauma-acute-injuries`).
 *
 * Same late-module template as M10; L7 has cloze before mission (reversed from M10 L7).
 * L8 assessment order from prod DB (recording_submit after drag_order).
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

const BLUEPRINT: Record<string, readonly string[]> = {
  'road-traffic-accident-victim-in-ae': [
    'video',
    'flash_card',
    'audio_shadow',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'patient-with-fall-and-suspected-hip-fracture': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'burns-victim-initial-assessment': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'head-injury-gcs-assessment': [
    'flash_card',
    'video',
    'audio_shadow',
    'flash_card',
    'script_read',
    'cloze',
    'matching',
  ],
  'trauma-team-handover-at-hospital-doors': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'cloze',
    'matching',
  ],
  'pair-practice-nurse-to-doctor-trauma-handover': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'no_script',
    'recording_submit',
    'cloze',
    'matching',
  ],
  'pair-practice-nurse-to-nurse-trauma-assessment': [
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
  'module-assessment-trauma-self-reflection': [
    'quiz',
    'cloze',
    'spot_the_mistake',
    'drag_order',
    'recording_submit',
    'matching',
    'self_reflection',
  ],
};

test.describe('Bug #117 — M11 lessons 1–8 DB curriculum', {
  tag: [TAG.regression, TAG.module11, TAG.content, TAG.data, bugTag(117)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-117-m11-lessons-l1-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'trauma-acute-injuries')
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
