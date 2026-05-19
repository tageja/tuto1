/**
 * Bug #068 — M6 `flash_card`: canonical `front_en` / `back_vi` (no legacy `front`/`back` only).
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM6Steps } from '../_shared/m6-reassuring-under-pressure-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-068-m6-flash-card-canonical-fields'));

test.describe('Bug #068 — M6 flash cards use front_en + back_vi', {
  tag: [TAG.regression, TAG.module6, TAG.content, TAG.data, bugTag(68)],
}, () => {
  test('every flash_card uses canonical bilingual fields with content', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM6Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'flash_card')) {
      const cards = Array.isArray(row.config?.cards) ? row.config!.cards : [];
      if (cards.length === 0) {
        violations.push(`${row.lesson_slug} (${row.id}): no cards[]`);
        continue;
      }
      cards.forEach((c: unknown, i: number) => {
        const card = c as { front_en?: string; back_vi?: string; front?: string; back?: string };
        if (!(card.front_en ?? '').trim() || !(card.back_vi ?? '').trim()) {
          violations.push(`${row.lesson_slug} (${row.id}) card[${i}]: missing front_en or back_vi`);
        }
        if ((card.front ?? '').trim() && !(card.front_en ?? '').trim()) {
          violations.push(`${row.lesson_slug} (${row.id}) card[${i}]: uses legacy front without front_en`);
        }
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
