/**
 * Bug #045 — M4 `flash_card` steps: canonical `front_en` / `back_vi`.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM4Steps } from '../_shared/m4-common-emergency-scenarios-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-045-m4-flash-card-canonical-fields'));

test.describe('Bug #045 — M4 flash cards use front_en + back_vi', {
  tag: [TAG.regression, TAG.module4, TAG.content, TAG.data, bugTag(45)],
}, () => {
  test('every flash_card uses canonical bilingual fields with content', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM4Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'flash_card')) {
      const cards = Array.isArray(row.config?.cards) ? row.config!.cards : [];
      if (cards.length === 0) {
        violations.push(`${row.lesson_slug} (${row.id}): no cards[]`);
        continue;
      }
      cards.forEach((c: unknown, i: number) => {
        const card = c as { front_en?: string; back_vi?: string };
        if (!(card.front_en ?? '').trim() || !(card.back_vi ?? '').trim()) {
          violations.push(`${row.lesson_slug} (${row.id}) card[${i}]: missing front_en or back_vi`);
        }
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
