/**
 * Bug #077 — M7 lessons 2–8 step-type blueprint (`red-flags-escalation`).
 *
 * L5: recording_submit before script_read is intentional (record attempt, then model script).
 * L6: two video steps — full script video + Round 2 partial-script video (both non-empty videoUrl).
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';
import { loadM7Steps, videoUrlFromConfig } from '../_shared/m7-red-flags-emergency-reporting-linter';

const BLUEPRINT: Record<string, readonly string[]> = {
  'recognising-stroke-symptoms-fast': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'quiz',
    'cloze',
    'script_read',
    'matching',
  ],
  'anaphylaxis-after-medication': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'quiz',
    'cloze',
    'script_read',
    'matching',
  ],
  'sepsis-screening-communication': [
    'flash_card',
    'scenario_intro',
    'audio_shadow',
    'flash_card',
    'video',
    'cloze',
    'script_read',
    'matching',
  ],
  'chest-pain-possible-mi': [
    'flash_card',
    'audio_shadow',
    'flash_card',
    'video',
    'cloze',
    'no_script',
    'recording_submit',
    'script_read',
    'matching',
  ],
  'pair-practice-unresponsive-patient': [
    'flash_card',
    'video',
    'flash_card',
    'script_read',
    'video',
    'cloze',
    'no_script',
    'recording_submit',
    'matching',
  ],
  'pair-practice-paediatric-emergency-escalation': [
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
  'module-assessment-red-flags-self-reflection': [
    'quiz',
    'spot_the_mistake',
    'cloze',
    'drag_order',
    'recording_submit',
    'matching',
    'self_reflection',
  ],
};

test.describe('Bug #077 — M7 lessons 2–8 DB curriculum', {
  tag: [TAG.regression, TAG.module7, TAG.content, TAG.data, bugTag(77)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-077-m7-lessons-l2-through-l8-db-curriculum');
  });

  test('ordered step types match blueprint for every lesson slug', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'red-flags-escalation')
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
        .select('order_index, type, config')
        .eq('lesson_id', lesson!.id)
        .order('order_index');
      const types = (steps ?? []).map((s) => s.type);
      expect(types, slug).toEqual([...BLUEPRINT[slug]]);

      if (slug === 'pair-practice-unresponsive-patient') {
        const videos = (steps ?? []).filter((s) => s.type === 'video');
        expect(videos.length, 'L6 should have exactly two video steps').toBe(2);
        const urls = videos.map((v) => videoUrlFromConfig(v.config as Record<string, unknown>));
        expect(urls.every((u) => u.length > 20), `L6 video URLs: ${urls.join(' | ')}`).toBe(true);
        expect(new Set(urls).size, 'L6 videos should be distinct assets').toBe(2);
      }
    }
  });
});
