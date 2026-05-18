import { expect, test } from '@playwright/test';
import path from 'path';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #5 — "Currently, the system activates both A1 and A2 simultaneously.
 * This allows users to learn A2 before completing A1."
 *
 * Product resolution (2026-05-17): "Foundations of Nursing English" (A1) has been
 * set to published=false in the DB. It now appears in the "Coming Soon" section
 * with the lock badge — learners cannot access it until Tarun publishes it.
 * "Emergency Nursing Communication" (A2) remains the active course.
 *
 * This test guards that the A1 card stays in the locked/coming-soon state and
 * cannot be clicked into.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

test.describe('Bug #5 — A1 course shows as Coming Soon (not yet available)', {
  tag: [TAG.regression, TAG.state, TAG.crossCutting, bugTag(5)],
}, () => {
  test('Foundations of Nursing English (A1) card shows the lock/coming-soon badge', async ({ page }) => {
    await page.goto('/learn/courses', { waitUntil: 'domcontentloaded', timeout: 120_000 });

    const a1Card = page
      .locator('[data-testid="course-card"]')
      .filter({ hasText: /foundations of nursing english/i })
      .first();
    if (!(await a1Card.isVisible({ timeout: 5_000 }).catch(() => false))) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
    }
    await expect(a1Card).toBeVisible({ timeout: 45_000 });

    // The card must show the lock badge (not a clickable "Start" button)
    const comingSoonBadge = a1Card.getByText(/coming soon|sắp ra mắt/i);
    await expect(comingSoonBadge.first()).toBeVisible();

    // There must be no navigable link to the A1 course content
    const startLink = a1Card.getByRole('link', { name: /start|bắt đầu/i });
    await expect(startLink).not.toBeVisible();
  });
});
