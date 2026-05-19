/**
 * Bug #050 — M4 `script_read`: nurse lines punctuation + `line_N_vi` parity.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import {
  loadM4Steps,
  nurseLinePunctuationViolations,
  nurseTurnsFromScriptReadConfig,
} from '../_shared/m4-common-emergency-scenarios-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-050-m4-script-read-nurse-lines'));

test.describe('Bug #050 — M4 script_read nurse line punctuation', {
  tag: [TAG.regression, TAG.module4, TAG.content, TAG.data, bugTag(50)],
}, () => {
  test('nurse dialogue lines satisfy punctuation + line_i_vi parity', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM4Steps(sb);
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
