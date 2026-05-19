/**
 * Minor — M3 `matching`: every pair entry has EN + VI text.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM3Steps } from '../_shared/m3-immediate-instructions-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-042-m3-matching-pairs-nonempty'));

test.describe('Bug #042 — M3 matching pairs bilingual text', {
  tag: [TAG.regression, TAG.module3, TAG.content, TAG.data, bugTag(42)],
}, () => {
  test('every matching step has nonempty en + vi for each pair', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM3Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'matching')) {
      const cfg = row.config ?? {};
      const pairs = Array.isArray(cfg.pairs) ? cfg.pairs : [];
      if (pairs.length === 0) {
        violations.push(`${row.lesson_slug} (${row.id}): no pairs`);
        continue;
      }
      pairs.forEach((p: unknown, i: number) => {
        const pair = p as { en?: string; vi?: string; left?: string; right?: string };
        const en = String(pair.en ?? pair.left ?? '').trim();
        const vi = String(pair.vi ?? pair.right ?? '').trim();
        if (!en) violations.push(`${row.lesson_slug} (${row.id}) pair[${i}]: empty EN (expected en or left)`);
        if (!vi) violations.push(`${row.lesson_slug} (${row.id}) pair[${i}]: empty VI (expected vi or right)`);
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
