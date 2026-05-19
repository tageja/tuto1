/**
 * Bug #116 — M11 L7 (`pair-practice-nurse-to-nurse-trauma-assessment`) mission step:
 * `missionEn` / `missionVi` must be populated.
 */

import { expect, test } from '@playwright/test';
import { requireSupabaseAdmin } from '../_shared/env';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #116 — M11 L7 mission step lacks missionEn/missionVi in DB', {
  tag: [TAG.regression, TAG.module11, TAG.content, TAG.data, bugTag(116)],
}, () => {
  test.beforeAll(() => {
    requireSupabaseAdmin('bug-116-m11-lesson7-mission-missing-canonical-copy');
  });

  test('Supabase mission step config includes substantial missionEn or missionVi', async () => {
    const sb = getSupabaseAdmin();
    const { data: course } = await sb.from('nursed_courses').select('id').eq('slug', 'emergency-nursing-communication').single();
    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'trauma-acute-injuries')
      .single();
    const { data: lesson } = await sb
      .from('nursed_lessons')
      .select('id')
      .eq('module_id', mod!.id)
      .eq('slug', 'pair-practice-nurse-to-nurse-trauma-assessment')
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
