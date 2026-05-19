/**
 * Bug #119 — M11 `recording_submit` on L5, L6, L7 (and L8 assessment) must have prompt text.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM11Steps } from '../_shared/m11-trauma-acute-injuries-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-119-m11-recording-submit-prompt'));

test.describe('Bug #119 — M11 recording_submit prompting text', {
  tag: [TAG.regression, TAG.module11, TAG.content, TAG.data, bugTag(119)],
}, () => {
  test('every recording_submit has promptEn, prompt_en, prompt, or prompt_vi', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM11Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'recording_submit')) {
      const cfg = row.config ?? {};
      const p =
        (typeof cfg.promptEn === 'string' && cfg.promptEn.trim()) ||
        (typeof cfg.prompt_en === 'string' && cfg.prompt_en.trim()) ||
        (typeof cfg.prompt === 'string' && cfg.prompt.trim()) ||
        (typeof cfg.prompt_vi === 'string' && cfg.prompt_vi.trim()) ||
        '';
      if (!p) violations.push(`${row.lesson_slug} (${row.id}): missing promptEn/prompt_en/prompt/prompt_vi`);
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
