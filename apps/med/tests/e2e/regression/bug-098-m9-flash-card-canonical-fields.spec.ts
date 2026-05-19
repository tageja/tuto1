/**
 * Bug #098 — M9 `flash_card`: canonical `front_en` / `back_vi` / `audio_en`.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM9Steps } from '../_shared/m9-simulation-emergency-review-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-098-m9-flash-card-canonical-fields'));

test.describe('Bug #098 — M9 flash cards use front_en + back_vi', {
  tag: [TAG.regression, TAG.module9, TAG.content, TAG.data, bugTag(98)],
}, () => {
  test('every flash_card uses canonical bilingual fields with content', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM9Steps(sb);
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
