/**
 * Bug #137 — M9–M12 new L2/L3 `audio_shadow` steps need real Supabase storage URLs.
 * audioUrl = PLACEHOLDER: batch audio generation pending (admin task).
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

const L2_L3_LESSON_IDS = [
  '71dbf6fc-32b8-4ad3-82ca-da2c5f960656',
  'd6de30df-e79d-4ad9-88df-eb7494655bdf',
  '979741a9-c89b-4dac-afca-703b5845480c',
  '880a481f-8042-449b-b5a0-5c03288dbba0',
  '8ccd2759-7a8a-49cf-a655-20210919dcda',
  '5f09e1c0-c4bb-43b8-8edb-880f3525439c',
  '45935cf2-b657-4c4d-a7d4-eb98e2ac6475',
  'd62f3f77-4299-434c-a268-f00f2641c492',
] as const;

const STORAGE_URL_RE = /^https:\/\/.+\.supabase\.co\/storage\/v1\/object\/public\//i;

test.beforeAll(() => requireSupabaseAdmin('bug-137-audio-shadow-placeholder-audio'));

test.describe('Bug #137 — M9–M12 L2/L3 audio_shadow real audio URLs', {
  tag: [TAG.regression, TAG.module9, TAG.module10, TAG.module11, TAG.module12, TAG.audio, bugTag(137)],
}, () => {
  test('each new L2/L3 audio_shadow has a Supabase storage audioUrl (not PLACEHOLDER)', async () => {
  // audioUrl = PLACEHOLDER: batch audio generation pending
    test.fixme(true, 'audioUrl is PLACEHOLDER until admin batch audio generation completes');

    const sb = getSupabaseAdmin();
    const { data: steps } = await sb
      .from('nursed_lesson_steps')
      .select('id, lesson_id, config')
      .in('lesson_id', [...L2_L3_LESSON_IDS])
      .eq('type', 'audio_shadow')
      .eq('order_index', 2);

    const violations: string[] = [];
    for (const row of steps ?? []) {
      const cfg = row.config as { audioUrl?: string; audio_url?: string } | null;
      const url = String(cfg?.audioUrl ?? cfg?.audio_url ?? '').trim();
      if (!url || url === 'PLACEHOLDER' || !STORAGE_URL_RE.test(url)) {
        violations.push(`${row.lesson_id} (${row.id}): invalid audioUrl "${url.slice(0, 40)}"`);
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });
});
