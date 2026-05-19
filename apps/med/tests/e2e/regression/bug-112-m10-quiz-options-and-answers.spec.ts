/**
 * Bug #112 — M10 `quiz` MCQ structure (L1–L3; L4 has no quiz — in-progress lesson).
 */

import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';
import { loadM10Steps } from '../_shared/m10-emergency-procedures-communication-linter';

test.beforeAll(() => requireSupabaseAdmin('bug-112-m10-quiz-options-and-answers'));

type QuizQuestion = {
  id?: string;
  options?: Array<{ id?: string; text?: string; text_en?: string; text_vi?: string }>;
  answer?: string | string[];
  correct_answer?: string | string[];
};

test.describe('Bug #112 — M10 quiz MCQ structure and answers', {
  tag: [TAG.regression, TAG.module10, TAG.content, TAG.data, bugTag(112)],
}, () => {
  test('each quiz question has options and correct option id match', async () => {
    const sb = getSupabaseAdmin();
    const steps = await loadM10Steps(sb);
    const violations: string[] = [];

    for (const row of steps.filter((s) => s.type === 'quiz')) {
      const cfg = row.config ?? {};
      const questions = (Array.isArray(cfg.questions) ? cfg.questions : []) as QuizQuestion[];
      const base = `${row.lesson_slug} (${row.id})`;

      if (questions.length === 0) {
        violations.push(`${base}: no questions[] in config`);
        continue;
      }

      questions.forEach((q, qi) => {
        const opts = Array.isArray(q.options) ? q.options : [];
        if (opts.length < 2) {
          violations.push(`${base} Q${qi + 1}: fewer than 2 options`);
          return;
        }

        const seen = new Set<string>();
        opts.forEach((o, oi) => {
          const oid = (o.id ?? '').trim();
          const textRaw = (o.text ?? o.text_en ?? '').toString();
          const textVi = (o.text_vi ?? '').toString();
          if (!oid.length) violations.push(`${base} Q${qi + 1} opt[${oi}]: empty option id`);
          if (!textRaw.trim()) violations.push(`${base} Q${qi + 1} opt[${oi} (${oid})]: empty English option text`);
          if (seen.has(oid)) violations.push(`${base} Q${qi + 1}: duplicate option id "${oid}"`);
          seen.add(oid);
          if (!textVi.trim()) violations.push(`${base} Q${qi + 1} opt[${oid}]: missing text_vi`);
        });

        const correctRaw = q.answer ?? q.correct_answer;
        const correct = Array.isArray(correctRaw) ? correctRaw[0] : correctRaw;
        const correctTrim = typeof correct === 'string' ? correct.trim() : '';
        if (!correctTrim) {
          violations.push(`${base} Q${qi + 1}: missing answer`);
          return;
        }
        if (!opts.some((o) => (o.id ?? '').trim() === correctTrim)) {
          violations.push(`${base} Q${qi + 1}: answer "${correctTrim}" is not among option ids`);
        }
      });
    }

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
