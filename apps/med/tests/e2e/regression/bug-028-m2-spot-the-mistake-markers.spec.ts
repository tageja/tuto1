/**
 * Minor — M2 `spot_the_mistake` (if any): at least one identifiable mistake marker (same
 * invariants as Bug #13, scoped to Triage Intake module).
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM2Steps, spotTheMistakeHasMarker } from '../_shared/m2-triage-intake-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-028-m2-spot-the-mistake-markers'));

test.describe('Bug #028 — M2 spot_the_mistake steps include a mistake', {
  tag: [TAG.regression, TAG.module2, TAG.content, TAG.data, bugTag(28)],
}, () => {
  test('every M2 spot_the_mistake row has mistake metadata', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM2Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'spot_the_mistake')) {
      const cfg = (row.config ?? {}) as Record<string, unknown>;
      if (!spotTheMistakeHasMarker(cfg)) {
        violations.push(`${row.lesson_slug} (${row.id}): no mistake marker in config`);
      }
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
