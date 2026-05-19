/**
 * Minor — M3 (Immediate Instructions) `cloze` steps: bracket blanks non-empty; word bank must
 * offer distractors via `decoys` / `decoyPool` OR a rich enough `script` for auto-decoys.
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import {
  loadM3Steps,
  parseBracketBlankAnswers,
  pickDecoysFromScript,
  scriptFromConfig,
} from '../_shared/m3-immediate-instructions-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-038-m3-cloze-word-bank-coherent'));

test.describe('Bug #038 — M3 cloze blanks and distractor pool integrity', {
  tag: [TAG.regression, TAG.module3, TAG.content, TAG.data, bugTag(38)],
}, () => {
  test('every cloze step has coherent blanks + word bank inputs', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM3Steps(sb);
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

      const badAns = answers.find((a) => !a.length);
      if (badAns !== undefined) {
        violations.push(`${id}: empty bracket blank`);
      }

      const answerLower = new Set(answers.map((a) => a.toLowerCase()));
      const decoysRaw = [...(Array.isArray(cfg.decoys) ? cfg.decoys : []), ...(Array.isArray(cfg.decoyPool) ? cfg.decoyPool : [])];

      const decoysStr = decoysRaw
        .map((x) => (typeof x === 'string' ? x.trim() : String(x ?? '').trim()))
        .filter((s) => s.length > 0);

      const badDecoySlot = decoysRaw.some((x) => typeof x === 'string' && x !== x.trim());
      if (badDecoySlot) {
        violations.push(`${id}: decoys/decoyPool entry has leading/trailing spaces`);
      }

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
