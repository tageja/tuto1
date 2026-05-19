/**
 * Bug #123 — M11 `script_read` / `audio_shadow`: single-word speaker role labels only.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { linesWithMultiWordNurseRoles, loadM11Steps } from '../_shared/m11-trauma-acute-injuries-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-123-m11-script-read-single-word-nurse-roles'));

test.describe('Bug #123 — M11 script/audio steps use single-word speaker role labels', {
  tag: [TAG.regression, TAG.module11, TAG.content, TAG.data, bugTag(123)],
}, () => {
  test('no script_read or audio_shadow line starts with Charge Nurse / Senior Nurse etc.', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM11Steps(sb);
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
