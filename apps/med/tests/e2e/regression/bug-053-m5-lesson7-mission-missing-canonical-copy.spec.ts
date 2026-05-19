/**
 * Bug #053 — M5 L7 (`pair-practice-round-2-responding-to-family-anxiety`) mission step:
 * `missionEn` / `missionVi` must be populated (not empty / exampleMission fallback).
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #053 — M5 L7 mission step lacks missionEn/missionVi in DB', {
  tag: [TAG.regression, TAG.module5, TAG.content, TAG.data, bugTag(53)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-053-m5-lesson7-mission-missing-canonical-copy');
  });

  test('Supabase mission step config includes substantial missionEn or missionVi', async () => {
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
      .eq('slug', 'pair-practice-round-2-responding-to-family-anxiety')
      .single();

    const { data: step } = await sb
      .from('nursed_lesson_steps')
      .select('config')
      .eq('lesson_id', lesson!.id)
      .eq('type', 'mission')
      .maybeSingle();

    const cfg = step?.config as { missionEn?: string; missionVi?: string } | null;
    const en = (cfg?.missionEn ?? '').trim();
    const vi = (cfg?.missionVi ?? '').trim();
    expect(en.length + vi.length, 'mission needs missionEn or missionVi in step.config').toBeGreaterThan(10);
  });
});
