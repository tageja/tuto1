/**
 * Bug #063 — Course-wide: every `quick_response` step has options[].text_en populated.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

test.beforeAll(() => requireSupabaseAdmin('bug-063-course-wide-quick-response-options'));

test.describe('Bug #063 — course-wide quick_response options use text_en', {
  tag: [TAG.regression, TAG.content, TAG.data, bugTag(63)],
}, () => {
  test('every quick_response has options with non-empty text_en', async () => {
    const sb = getSupabaseAdmin();
    const { data: steps, error } = await sb.from('nursed_lesson_steps').select('id, config').eq('type', 'quick_response');
    expect(error).toBeNull();

    const violations: string[] = [];
    for (const row of steps ?? []) {
      const cfg = row.config ?? {};
      const opts = Array.isArray(cfg.options) ? cfg.options : [];
      if (!opts.length) {
        violations.push(`${row.id}: options[] empty`);
        continue;
      }
      opts.forEach((o: unknown, i: number) => {
        const opt = o as { text_en?: string };
        if (!(opt.text_en ?? '').trim()) {
          violations.push(`${row.id} opt[${i}]: missing text_en`);
        }
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
