import { expect, test } from '@playwright/test';
import path from 'path';
import { getProgress, getTestUserId, getSupabaseAdmin } from '../_shared/supabase-admin';
import { TEST_USER, requireSupabaseAdmin } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Bugs #16 + #17 are serialised deliberately: Bug #16 mutates nursed_progress
 * for the shared test@test.com learner; Bug #17 reads profile aggregates for
 * that same learner. Running them concurrently with each other races the DB
 * snapshot that Bug #17 expects.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.beforeAll(() => requireSupabaseAdmin('Bugs #16–#17'));

test.describe.serial('Module 1 — Bugs #16 & #17 (progress + profile)', () => {
  test(
    'Bug #16 — re-entering a completed lesson preserves completion',
    { tag: [TAG.regression, TAG.module1, TAG.state, TAG.data, bugTag(16)] },
    async ({ page }) => {
      const userId = await getTestUserId(TEST_USER.email);
      expect(userId).toBeTruthy();

      const sb = getSupabaseAdmin();
      const { data: lessons } = await sb
        .from('nursed_lessons')
        .select('id, slug')
        .eq('order_index', 2)
        .limit(1);
      const lesson = lessons?.[0];
      expect(lesson, 'a lesson at order_index 2 must exist').toBeTruthy();

      const { data: priorRow } = await sb
        .from('nursed_progress')
        .select('*')
        .eq('user_id', userId!)
        .eq('lesson_id', lesson!.id)
        .maybeSingle();

      try {
        await sb.from('nursed_progress').upsert({
          user_id: userId,
          lesson_id: lesson!.id,
          completion_pct: 100,
          completed: true,
        });

        await page.goto(`/learn/courses/_/lessons/${lesson!.slug ?? lesson!.id}`);
        await page.waitForTimeout(2000);

        await page.goto('/learn');
        await page.waitForTimeout(1000);

        const after = await getProgress(userId!, lesson!.id);
        expect(after?.completed, 'completion must be preserved after non-finishing re-entry').toBe(true);
        expect(after?.completion_pct).toBe(100);
      } finally {
        if (priorRow) {
          await sb.from('nursed_progress').upsert(priorRow, { onConflict: 'user_id,lesson_id' });
        } else {
          await sb.from('nursed_progress').delete().eq('user_id', userId!).eq('lesson_id', lesson!.id);
        }
      }
    },
  );

  test(
    'Bug #17 — profile completion count is preserved after re-entry+exit',
    { tag: [TAG.regression, TAG.module1, TAG.state, bugTag(17)] },
    async ({ page }) => {
      const parseLessonsStat = (raw: string) => {
        const line = raw
          .split('\n')
          .map((l) => l.trim())
          .find((l) => /^\d+$/.test(l));
        return line ? Number(line) : NaN;
      };

      await page.goto('/learn/profile');
      const counterLocator = page.locator('[data-testid="profile-completed-count"]');
      await expect(counterLocator).toBeVisible();
      const beforeRaw = await counterLocator.innerText();
      const beforeN = parseLessonsStat(beforeRaw);
      expect(Number.isFinite(beforeN)).toBe(true);

      await page.goto(
        '/learn/courses/foundations-of-nursing-english/lessons/qa-test-lesson',
        { waitUntil: 'domcontentloaded' },
      );
      await page.waitForTimeout(1500);
      await page.goto('/learn/profile');

      const afterRaw = await counterLocator.innerText();
      const afterN = parseLessonsStat(afterRaw);
      expect(Number.isFinite(afterN)).toBe(true);

      expect(
        afterN,
        // Bug #17 targets regressions only; Brief lesson visits may legitimately
        // add a new completion without violating the invariant.
      ).toBeGreaterThanOrEqual(beforeN);
    },
  );
});
