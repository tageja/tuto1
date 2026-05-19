/**
 * Bug #060 — M5 `script_read` / `audio_shadow` must not use multi-word nurse role labels
 * (e.g. "Charge Nurse:") — both bubbles render on the left in ScriptReadStep.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { linesWithMultiWordNurseRoles, loadM5Steps } from '../_shared/m5-deteriorating-escalation-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-060-m5-script-read-single-word-nurse-roles'));

test.describe('Bug #060 — M5 script/audio steps use single-word speaker role labels', {
  tag: [TAG.regression, TAG.module5, TAG.content, TAG.data, bugTag(60)],
}, () => {
  test('no script_read or audio_shadow line starts with Charge Nurse / Senior Nurse etc.', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM5Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'script_read' || s.type === 'audio_shadow')) {
      const hits = linesWithMultiWordNurseRoles(row.config ?? {});
      hits.forEach((line) => {
        violations.push(`${row.lesson_slug} (${row.id} ${row.type}): "${line.slice(0, 80)}"`);
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
