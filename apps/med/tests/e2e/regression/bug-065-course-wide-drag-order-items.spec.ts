/**
 * Bug #065 — Course-wide: `drag_order` has ≥3 orderable lines (config.lines or items+correct_order).
 */

import { expect, test } from '@playwright/test';
import { dragOrderLinesFromConfig } from '../_shared/course-wide-step-linter';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

test.beforeAll(() => requireSupabaseAdmin('bug-065-course-wide-drag-order-items'));

test.describe('Bug #065 — course-wide drag_order has ≥3 lines', {
  tag: [TAG.regression, TAG.content, TAG.data, bugTag(65)],
}, () => {
  test('every drag_order resolves to at least 3 non-empty lines', async () => {
    const sb = getSupabaseAdmin();
    const { data: steps, error } = await sb.from('nursed_lesson_steps').select('id, config').eq('type', 'drag_order');
    expect(error).toBeNull();

    const violations: string[] = [];
    for (const row of steps ?? []) {
      const lines = dragOrderLinesFromConfig(row.config ?? {});
      if (lines.length < 3) {
        violations.push(`${row.id}: only ${lines.length} line(s) (lines[] or items+correct_order)`);
      }
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
