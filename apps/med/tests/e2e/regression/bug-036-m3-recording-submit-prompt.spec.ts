/**
 * Minor — M3 `recording_submit`: spoken prompt populated for learners.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM3Steps } from '../_shared/m3-immediate-instructions-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-036-m3-recording-submit-prompt'));

test.describe('Bug #036 — M3 recording_submit prompting text', {
  tag: [TAG.regression, TAG.module3, TAG.content, TAG.data, bugTag(36)],
}, () => {
  test('every recording_submit has prompt, prompt_en, or prompt_vi', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM3Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'recording_submit')) {
      const cfg = row.config ?? {};
      const p =
        (typeof cfg.prompt === 'string' && cfg.prompt.trim()) ||
        (typeof cfg.prompt_en === 'string' && cfg.prompt_en.trim()) ||
        (typeof cfg.prompt_vi === 'string' && cfg.prompt_vi.trim()) ||
        '';
      if (!p) {
        violations.push(`${row.lesson_slug} (${row.id}): missing prompt/prompt_en/prompt_vi`);
      }
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
