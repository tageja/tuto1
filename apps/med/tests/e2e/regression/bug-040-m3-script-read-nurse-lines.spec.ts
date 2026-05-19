/**
 * Minor — M3 `script_read`: nurse spoken lines end with "." or "?"; VI line_N aligns with script turns.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import {
  loadM3Steps,
  nurseLinePunctuationViolations,
  nurseTurnsFromScriptReadConfig,
} from '../_shared/m3-immediate-instructions-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-040-m3-script-read-nurse-lines'));

test.describe('Bug #040 — M3 script_read nurse line punctuation', {
  tag: [TAG.regression, TAG.module3, TAG.content, TAG.data, bugTag(40)],
}, () => {
  test('nurse dialogue lines satisfy punctuation + line_i_vi parity', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM3Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'script_read')) {
      const cfg = row.config ?? {};
      const base = `${row.lesson_slug} (${row.id})`;

      const turns = nurseTurnsFromScriptReadConfig(cfg as Record<string, unknown>);
      if (turns.length === 0) {
        violations.push(`${base}: no nurse turns parsed from script/lines`);
        continue;
      }
      turns.forEach((ln, ti) => {
        const msg = nurseLinePunctuationViolations(ln);
        if (msg) violations.push(`${base} nurse(${ti + 1}): ${msg}: "${ln}"`);
      });

      const scriptLines =
        typeof (cfg as { script?: string }).script === 'string'
          ? (cfg as { script: string }).script
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
          : [];

      scriptLines.forEach((_, li) => {
        const viKey = `line_${li}_vi`;
        const raw = cfg[viKey as keyof typeof cfg];
        const vi =
          typeof raw === 'string'
            ? raw
            : raw != null
              ? String(raw)
              : '';
        if (!vi.trim()) {
          violations.push(`${base}: missing ${viKey} for English script line ${li + 1}`);
        }
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
