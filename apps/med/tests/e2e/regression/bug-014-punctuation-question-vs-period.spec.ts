import { expect, test } from '@playwright/test';
import { getSupabaseAdmin } from '../_shared/supabase-admin';
import { requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #14 — "Sentences incorrectly end with a question mark (?) instead
 * of a period (.)"
 * Location: Emergency Nursing → Lesson 1 → Step 10
 *
 * Generalised data linter: any declarative sentence (not starting with WH-word
 * or auxiliary inversion) ending with '?' is suspicious. We flag rather than
 * fail hard, because some declaratives can legitimately be rhetorical questions.
 *
 * This test currently runs as a soft warning — it lists offenders rather than
 * failing the suite. Convert to hard-fail once you've audited the list.
 */

test.beforeAll(() => requireSupabaseAdmin('Bug #14'));

// Covers WH-words, auxiliary inversions, and common question starters used
// in medical scripts ("Have you...", "Any...", "Ready?", "Maybe...", "You...").
const WH_PREFIXES =
  /^(who|what|when|where|why|how|which|whose|do|does|did|is|are|was|were|can|could|will|would|should|may|might|have|has|had|am|shall|any|ready|maybe|you)\b/i;

// Known abbreviations whose trailing period must NOT trigger a sentence split.
const ABBREV_RE = /\b(Mr|Mrs|Ms|Dr|Prof|St|No|vs|etc|approx|Dept)\./g;

// Multi-word speaker prefixes like "Nurse:", "Charge Nurse:", "Team Leader:", "Nurse B:".
const SPEAKER_PREFIX_RE = /^(?:[A-Z][a-zA-Z]*(?:\s+[A-Z0-9][a-zA-Z0-9]*)*)\s*:\s*/;

/**
 * Split a raw speaker-turn string into individual sentences.
 * We split only on [.!] followed by whitespace + an uppercase letter, while
 * guarding against common abbreviations so "Mr. Smith" is not broken.
 */
function splitSentences(raw: string): string[] {
  // Temporarily replace abbreviation dots with a placeholder.
  const masked = raw.replace(ABBREV_RE, (m) => m.slice(0, -1) + '\u0000');
  // Split on ". " or "! " only when followed by uppercase (new sentence).
  const parts = masked.split(/(?<=[.!])\s+(?=[A-Z])/);
  // Restore the masked dots.
  return parts.map((s) => s.replace(/\u0000/g, '.'));
}

test.describe('Bug #14 — declarative sentences do not end with question marks', {
  tag: [TAG.regression, TAG.content, TAG.data, TAG.module1, bugTag(14)],
}, () => {
  test('no declarative line in script_read steps ends with ?', async () => {
    const sb = getSupabaseAdmin();
    const { data: steps } = await sb
      .from('nursed_lesson_steps')
      .select('id, config')
      .eq('type', 'script_read');

    const offenders: string[] = [];
    for (const step of steps ?? []) {
      const rawLines: string[] = step.config?.lines ?? step.config?.script?.split('\n') ?? [];
      for (const raw of rawLines) {
        // Strip speaker prefix (handles single and multi-word labels like
        // "Nurse:", "Charge Nurse:", "Team Leader:", "Nurse B:").
        const noPrefix = raw.trim().replace(SPEAKER_PREFIX_RE, '');
        if (!noPrefix) continue;
        for (const sentence of splitSentences(noPrefix)) {
          const sent = sentence.trim();
          if (!sent || !sent.endsWith('?')) continue;
          // Skip very short elliptical clinical queries (e.g. "Airway clear?",
          // "Oxygen?", "Ready?") — these are abbreviated questions, not errors.
          if (sent.split(/\s+/).length <= 3) continue;
          if (!WH_PREFIXES.test(sent)) {
            offenders.push(`${step.id}: "${sent}"`);
          }
        }
      }
    }
    expect(offenders, `declarative lines ending with ?:\n${offenders.join('\n')}`).toEqual([]);
  });
});
