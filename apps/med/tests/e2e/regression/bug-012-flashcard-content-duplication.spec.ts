import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #12 — "There is a content duplication issue between Lesson 1
 * and Lesson 2. The flashcard vocabulary and phrases in Lesson 2 are identical
 * to the ones taught in Lesson 1"
 * Location: Course = Emergency Nursing Communication
 *
 * This is a CONTENT bug (data in nursed_lesson_steps), not a UI bug.
 * Test queries the DB directly and asserts no flash_card step in lesson N
 * shares >= 50% of its cards with lesson N-1 of the same module.
 */

test.beforeAll(() => requireSupabaseAdmin('Bug #12'));

test.describe('Bug #12 — flashcards do not duplicate across consecutive lessons', {
  tag: [TAG.regression, TAG.content, TAG.data, TAG.module1, bugTag(12)],
}, () => {
  test('Lesson 2 flashcards share <50% content with Lesson 1', async () => {
    const sb = getSupabaseAdmin();

    const { data: course } = await sb
      .from('nursed_courses')
      .select('id')
      .ilike('title_vi', '%cấp cứu%')
      .limit(1)
      .single();
    expect(course?.id).toBeTruthy();

    const { data: modules } = await sb
      .from('nursed_modules')
      .select('id')
      .eq('course_id', course!.id)
      .order('order_index')
      .limit(1);
    const moduleId = modules![0].id;

    const { data: lessons } = await sb
      .from('nursed_lessons')
      .select('id, order_index')
      .eq('module_id', moduleId)
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

    const l1 = await cardsFor(lessons![0].id);
    const l2 = await cardsFor(lessons![1].id);

    if (l1.size === 0 || l2.size === 0) {
      test.skip(true, 'one of the lessons has no flashcards');
    }

    const overlap = [...l2].filter((c) => l1.has(c));
    const overlapPct = (overlap.length / l2.size) * 100;
    expect(overlapPct, `Lesson 2 reuses ${overlap.length}/${l2.size} flashcards from Lesson 1: ${overlap.join(', ')}`)
      .toBeLessThan(50);
  });
});
