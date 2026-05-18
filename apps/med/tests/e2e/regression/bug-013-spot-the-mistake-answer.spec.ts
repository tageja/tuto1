import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #13 — "Content mismatch in 'Spot the Mistake' quiz question."
 * Location: Emergency Nursing → Lesson 1 → Step 5
 *
 * The original spec checked `config.correct_index` but the actual step schema
 * uses one of three formats:
 *   A) `items[]` — each item has `original`, `corrected`, `explanation_en`
 *   B) `questions[]` — each question has `tokens[].is_wrong` + `correction_en`
 *   C) `lines[]` — each line has `has_mistake` boolean + `correction`
 *
 * Rewritten invariant: every spot_the_mistake step must have at least one
 * "mistake" indicator (is_wrong:true token, has_mistake:true line, or an
 * items[] entry with a non-empty corrected field), so there's something to spot.
 * A step with zero mistakes is an empty/broken exercise.
 */

test.beforeAll(() => requireSupabaseAdmin('Bug #13'));

test.describe('Bug #13 — spot_the_mistake steps each contain at least one mistake', {
  tag: [TAG.regression, TAG.content, TAG.data, TAG.module1, bugTag(13)],
}, () => {
  test('every spot_the_mistake step has at least one identifiable mistake', async () => {
    const sb = getSupabaseAdmin();
    const { data: steps } = await sb
      .from('nursed_lesson_steps')
      .select('id, lesson_id, config')
      .eq('type', 'spot_the_mistake');

    const violations: string[] = [];
    for (const step of steps ?? []) {
      const cfg = step.config ?? {};
      let hasMistake = false;

      // Format A: items[] with original/corrected
      const items: Array<{ corrected?: string; mistake?: string; incorrect?: string }> = Array.isArray(cfg.items)
        ? cfg.items
        : [];
      if (items.some((it) => it.corrected && it.corrected.trim().length > 0)) hasMistake = true;
      // Format D: items[] with {text, mistake, correction} — non-empty mistake field
      if (items.some((it) => it.mistake && it.mistake.trim().length > 0)) hasMistake = true;
      // Format E: items[] with {correct, incorrect} — presence of incorrect field
      if (items.some((it) => it.incorrect !== undefined)) hasMistake = true;

      // Format B: questions[] with tokens[].is_wrong
      const questions: Array<{ tokens?: Array<{ is_wrong?: boolean }> }> = Array.isArray(cfg.questions)
        ? cfg.questions
        : [];
      if (questions.some((q) => (q.tokens ?? []).some((t) => t.is_wrong === true))) hasMistake = true;

      // Format C: lines[] with has_mistake boolean
      const lines: Array<{ has_mistake?: boolean }> = Array.isArray(cfg.lines) ? cfg.lines : [];
      if (lines.some((l) => l.has_mistake === true)) hasMistake = true;

      if (!hasMistake) {
        violations.push(`${step.id} (lesson ${step.lesson_id}): no mistake indicators found in config`);
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });
});
