import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Same invariant as Bug #12, scoped to Emergency — Module 2 (Triage Intake).
 */

test.beforeAll(() => requireSupabaseAdmin('Bug #21'));

test.describe('Bug #21 — Module 2 flashcards do not duplicate across consecutive lessons', {
  tag: [TAG.regression, TAG.content, TAG.data, TAG.module2, bugTag(21)],
}, () => {
  test('M2 Lesson 2 flashcards share <50% card fronts with Lesson 1', async () => {
    const sb = getSupabaseAdmin();

    const { data: course } = await sb
      .from('nursed_courses')
      .select('id')
      .eq('slug', 'emergency-nursing-communication')
      .single();
    expect(course?.id).toBeTruthy();

    const { data: mod } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .eq('slug', 'triage-intake')
      .single();
    expect(mod?.id).toBeTruthy();

    const { data: lessons } = await sb
      .from('nursed_lessons')
      .select('id')
      .eq('module_id', mod!.id)
      .order('order_index')
      .limit(3);

    const cardsFor = async (lessonId: string): Promise<Set<string>> => {
      const { data: steps } = await sb
        .from('nursed_lesson_steps')
        .select('config')
        .eq('lesson_id', lessonId)
        .eq('type', 'flash_card');
      const all = new Set<string>();
      for (const s of steps ?? []) {
        const cards: Array<{ front_en?: string; front?: string }> = s.config?.cards ?? [];
        cards.forEach((c) => all.add((c.front_en ?? c.front ?? '').trim().toLowerCase()));
      }
      return all;
    };

    expect(lessons?.length).toBeGreaterThanOrEqual(2);
    const l1 = await cardsFor(lessons![0].id);
    const l2 = await cardsFor(lessons![1].id);

    if (l1.size === 0 || l2.size === 0) {
      test.skip(true, 'one of the lessons has no flashcards');
    }

    const overlap = [...l2].filter((c) => l1.has(c));
    const overlapPct = (overlap.length / l2.size) * 100;
    expect(overlapPct, `M2 L2 reuses ${overlap.length}/${l2.size} flashcard fronts from M2 L1: ${overlap.join(', ')}`).toBeLessThan(50);
  });
});
