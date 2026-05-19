/**
 * Minor — M3 `flash_card` steps: canonical `front_en` / `back_vi` (no legacy-only cards),
 * no blank faces.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM3Steps } from '../_shared/m3-immediate-instructions-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-035-m3-flash-card-canonical-fields'));

test.describe('Bug #035 — M3 flash cards use front_en + back_vi', {
  tag: [TAG.regression, TAG.module3, TAG.content, TAG.data, bugTag(35)],
}, () => {
  test('every flash_card uses canonical bilingual fields with content', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM3Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'flash_card')) {
      const cfg = row.config ?? {};
      const cards = Array.isArray(cfg.cards) ? cfg.cards : [];
      if (cards.length === 0) {
        violations.push(`${row.lesson_slug} (${row.id}): no cards[]`);
        continue;
      }

      cards.forEach((c: unknown, i: number) => {
        const card = c as { front_en?: string; back_vi?: string; front?: string; back?: string };
        const frontEn = (card.front_en ?? '').trim();
        const backVi = (card.back_vi ?? '').trim();

        if (!frontEn || !backVi) {
          violations.push(
            `${row.lesson_slug} (${row.id}) card[${i}]: missing non-empty front_en or back_vi`,
          );
        }
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
