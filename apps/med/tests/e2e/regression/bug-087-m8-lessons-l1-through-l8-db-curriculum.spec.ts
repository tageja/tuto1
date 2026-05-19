/**
 * Bug #087 — M8 lessons 1–8 step-type blueprint (`documentation-and-rapid-reporting`).
 *
 * L1 and L4 are **in-progress authoring** (shorter step sequences than the standard L1/L4
 * blueprints used in other modules). This spec encodes the **current** prod order — not the
 * eventual 8-step target — so the suite stays green while Tarun finishes content.
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

const BLUEPRINT: Record<string, readonly string[]> = {
  // IN-PROGRESS: missing video; script_read before quiz/cloze (standard L1 ends with script_read).
  'end-of-shift-handover-to-incoming-nurse': [
    'scenario_intro',
    'flash_card',
    'audio_shadow',
    'script_read',
    'quiz',
    'cloze',
    'matching',
  ],
  'on-call-doctor-night-report': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'quiz',
    'cloze',
    'script_read',
    'matching',
  ],
  'rapid-verbal-update-at-bedside': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'quiz',
    'cloze',
    'script_read',
    'matching',
  ],
  // IN-PROGRESS: missing audio_shadow and quiz (standard L4 includes both).
  'handing-over-a-deteriorating-patient-mid-treatment': [
    'flash_card',
    'scenario_intro',
    'flash_card',
    'video',
    'script_read',
    'cloze',
    'matching',
  ],
  'isbar-handover-for-a-stable-patient': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'cloze',
    'script_read',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'pair-practice-nurse-to-nurse-shift-handover': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'cloze',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'pair-practice-nurse-to-doctor-verbal-report': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'cloze',
    'no_script',
    'recording_submit',
    'mission',
    'matching',
  ],
  'module-assessment-documentation-self-reflection': [
    'quiz',
    'spot_the_mistake',
    'cloze',
    'drag_order',
    'recording_submit',
    'matching',
    'self_reflection',
  ],
};

test.describe('Bug #087 — M8 lessons 1–8 DB curriculum', {
  tag: [TAG.regression, TAG.module8, TAG.content, TAG.data, bugTag(87)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-087-m8-lessons-l1-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'documentation-and-rapid-reporting')
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
