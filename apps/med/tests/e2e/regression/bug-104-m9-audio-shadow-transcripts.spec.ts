/**
 * Bug #104 — M9 `audio_shadow` transcript + segments (L4 only on current prod curriculum).
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM9Steps, M9_LESSON_SLUGS_WITH_AUDIO_SHADOW } from '../_shared/m9-simulation-emergency-review-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-104-m9-audio-shadow-transcripts'));

test.describe('Bug #104 — M9 audio_shadow transcript + segments', {
  tag: [TAG.regression, TAG.module9, TAG.content, TAG.data, bugTag(104)],
}, () => {
  test('every audio_shadow step has transcript + transcriptSegments with vi', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM9Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'audio_shadow')) {
      if (!M9_LESSON_SLUGS_WITH_AUDIO_SHADOW.has(row.lesson_slug)) {
        violations.push(`${row.lesson_slug} (${row.id}): unexpected audio_shadow — update linter set`);
        continue;
      }

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
