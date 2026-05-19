/**
 * Bug #085 — M7 `matching` pairs: non-empty `left_en` + `right_vi`.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM7Steps } from '../_shared/m7-red-flags-emergency-reporting-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-085-m7-matching-pairs-nonempty'));

test.describe('Bug #085 — M7 matching pairs bilingual text', {
  tag: [TAG.regression, TAG.module7, TAG.content, TAG.data, bugTag(85)],
}, () => {
  test('every matching step has nonempty left_en + right_vi for each pair', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM7Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'matching')) {
      const cfg = row.config ?? {};
      const pairs = Array.isArray(cfg.pairs) ? cfg.pairs : [];
      if (pairs.length === 0) {
        violations.push(`${row.lesson_slug} (${row.id}): no pairs`);
        continue;
      }
      pairs.forEach((p: unknown, i: number) => {
        const pair = p as { left_en?: string; right_vi?: string; en?: string; vi?: string; left?: string; right?: string };
        const left = String(pair.left_en ?? pair.en ?? pair.left ?? '').trim();
        const right = String(pair.right_vi ?? pair.vi ?? pair.right ?? '').trim();
        if (!left) violations.push(`${row.lesson_slug} (${row.id}) pair[${i}]: empty left_en/en/left`);
        if (!right) violations.push(`${row.lesson_slug} (${row.id}) pair[${i}]: empty right_vi/vi/right`);
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
