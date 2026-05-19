/**
 * Bug #113 — M10 `script_read` / `audio_shadow`: single-word speaker role labels only.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { linesWithMultiWordNurseRoles, loadM10Steps } from '../_shared/m10-emergency-procedures-communication-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-113-m10-script-read-single-word-nurse-roles'));

test.describe('Bug #113 — M10 script/audio steps use single-word speaker role labels', {
  tag: [TAG.regression, TAG.module10, TAG.content, TAG.data, bugTag(113)],
}, () => {
  test('no script_read or audio_shadow line starts with Charge Nurse / Senior Nurse etc.', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM10Steps(sb);
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
