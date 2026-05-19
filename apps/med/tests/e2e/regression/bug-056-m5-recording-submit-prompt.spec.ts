/**
 * Bug #056 — M5 `recording_submit` steps (L8 assessment) must have spoken prompt text.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM5Steps } from '../_shared/m5-deteriorating-escalation-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-056-m5-recording-submit-prompt'));

test.describe('Bug #056 — M5 recording_submit prompting text', {
  tag: [TAG.regression, TAG.module5, TAG.content, TAG.data, bugTag(56)],
}, () => {
  test('every recording_submit has prompt, prompt_en, or prompt_vi', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM5Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'recording_submit')) {
      const cfg = row.config ?? {};
      const p =
        (typeof cfg.prompt === 'string' && cfg.prompt.trim()) ||
        (typeof cfg.prompt_en === 'string' && cfg.prompt_en.trim()) ||
        (typeof cfg.prompt_vi === 'string' && cfg.prompt_vi.trim()) ||
        '';
      if (!p) violations.push(`${row.lesson_slug} (${row.id}): missing prompt/prompt_en/prompt_vi`);
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
