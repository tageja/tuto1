/**
 * Bug #064 — Course-wide: `sentence_builder` uses config.chunks + config.correct_order (≥3 chunks).
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

test.beforeAll(() => requireSupabaseAdmin('bug-064-course-wide-sentence-builder-words'));

test.describe('Bug #064 — course-wide sentence_builder chunks + correct_order', {
  tag: [TAG.regression, TAG.content, TAG.data, bugTag(64)],
}, () => {
  test('every sentence_builder has ≥3 chunks and non-empty correct_order', async () => {
    const sb = getSupabaseAdmin();
    const { data: steps, error } = await sb.from('nursed_lesson_steps').select('id, config').eq('type', 'sentence_builder');
    expect(error).toBeNull();

    const violations: string[] = [];
    for (const row of steps ?? []) {
      const cfg = row.config ?? {};
      const chunks = Array.isArray(cfg.chunks) ? cfg.chunks : [];
      const order = Array.isArray(cfg.correct_order) ? cfg.correct_order : [];
      if (chunks.length < 3) violations.push(`${row.id}: chunks.length=${chunks.length} (need ≥3)`);
      if (!order.length) violations.push(`${row.id}: correct_order empty`);
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
