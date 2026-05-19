/**
 * Bug #094 — M8 `audio_shadow` transcript + segments (L1, L2, L3, L5; L4 has no audio_shadow).
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM8Steps, M8_LESSON_SLUG_NO_AUDIO_SHADOW } from '../_shared/m8-documentation-rapid-reporting-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-094-m8-audio-shadow-transcripts'));

test.describe('Bug #094 — M8 audio_shadow transcript + segments', {
  tag: [TAG.regression, TAG.module8, TAG.content, TAG.data, bugTag(94)],
}, () => {
  test('every audio_shadow step has transcript + transcriptSegments with vi', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM8Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter(
      (s) => s.type === 'audio_shadow' && s.lesson_slug !== M8_LESSON_SLUG_NO_AUDIO_SHADOW,
    )) {
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
