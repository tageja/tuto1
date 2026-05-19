/**
 * Bug #081 — M7 `cloze` steps: bracket blanks + word bank integrity.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import {
  loadM7Steps,
  parseBracketBlankAnswers,
  pickDecoysFromScript,
  scriptFromConfig,
} from '../_shared/m7-red-flags-emergency-reporting-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-081-m7-cloze-word-bank-coherent'));

test.describe('Bug #081 — M7 cloze blanks and distractor pool integrity', {
  tag: [TAG.regression, TAG.module7, TAG.content, TAG.data, bugTag(81)],
}, () => {
  test('every cloze step has coherent blanks + word bank inputs', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM7Steps(sb);
    const stepsById = new Map(steps.map((s) => [s.id, s]));
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'cloze')) {
      const cfg = row.config ?? {};
      const raw =
        (typeof cfg.clozeText === 'string' && cfg.clozeText) ||
        (typeof cfg.cloze === 'string' && cfg.cloze) ||
        '';
      const id = `${row.lesson_slug} step#${row.order_index + 1} (${row.id})`;

      if (!raw.trim()) {
        violations.push(`${id}: missing clozeText/cloze`);
        continue;
      }

      const answers = parseBracketBlankAnswers(raw).map((a) => a.trim());
      if (answers.length === 0) {
        violations.push(`${id}: no [bracket] blanks found`);
        continue;
      }

      const answerLower = new Set(answers.map((a) => a.toLowerCase()));
      const decoysRaw = [...(Array.isArray(cfg.decoys) ? cfg.decoys : []), ...(Array.isArray(cfg.decoyPool) ? cfg.decoyPool : [])];
      const decoysStr = decoysRaw
        .map((x) => (typeof x === 'string' ? x.trim() : String(x ?? '').trim()))
        .filter((s) => s.length > 0);

      const localScript = typeof cfg.script === 'string' ? cfg.script : '';
      const sourceId = typeof cfg.source_step_id === 'string' ? cfg.source_step_id : '';
      const sourceScript =
        sourceId && stepsById.has(sourceId) ? scriptFromConfig(stepsById.get(sourceId)!.config) : '';
      const script = localScript.trim().length >= 40 ? localScript : sourceScript || localScript;
      let distractorOutsideAnswers = decoysStr.filter((d) => !answerLower.has(d.toLowerCase())).length;

      if (decoysStr.length === 0) {
        const auto = pickDecoysFromScript(answerLower, script, Math.max(3, answers.length));
        distractorOutsideAnswers = auto.filter((d) => !answerLower.has(d.toLowerCase())).length;
        if (distractorOutsideAnswers < 1 && script.trim().length < 40) {
          violations.push(
            `${id}: no decoys/decoyPool and script too short (${script.length}) to auto-build word bank chips`,
          );
        }
      } else if (distractorOutsideAnswers < 1) {
        violations.push(`${id}: decoys/decoyPool only repeat correct answers — need ≥1 unrelated distractor chip`);
      }
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
