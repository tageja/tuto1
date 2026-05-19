/**
 * Minor — M2 `audio_shadow`: non-empty EN transcript + transcriptSegments with `vi` hints.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM2Steps } from '../_shared/m2-triage-intake-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-029-m2-audio-shadow-transcripts'));

test.describe('Bug #029 — M2 audio_shadow transcript + segments', {
  tag: [TAG.regression, TAG.module2, TAG.content, TAG.data, bugTag(29)],
}, () => {
  test('every audio_shadow step has transcript + transcriptSegments with vi', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM2Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'audio_shadow')) {
      const cfg = row.config ?? {};
      const tr =
        (typeof cfg.transcript === 'string' && cfg.transcript.trim()) ||
        (typeof cfg.transcriptEn === 'string' && cfg.transcriptEn.trim()) ||
        '';

      if (!tr.length) {
        violations.push(`${row.lesson_slug} (${row.id}): empty transcript/transcriptEn`);
      }

      const segments = Array.isArray(cfg.transcriptSegments) ? cfg.transcriptSegments : [];
      if (segments.length === 0) {
        violations.push(`${row.lesson_slug} (${row.id}): transcriptSegments missing or empty`);
        continue;
      }

      segments.forEach((seg: unknown, i: number) => {
        const s = seg as { en?: string; vi?: string };
        if (!String(s?.en ?? '').trim()) {
          violations.push(`${row.lesson_slug} (${row.id}) seg[${i}]: empty en`);
        }
        if (!String(s?.vi ?? '').trim()) {
          violations.push(`${row.lesson_slug} (${row.id}) seg[${i}]: empty vi`);
        }
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
