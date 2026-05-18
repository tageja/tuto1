import { expect, test } from '@playwright/test';
import path from 'path';
import { TAG, bugTag } from '../_shared/tags';

/**
 * Feedback bug #7 — "When switching the system language to English, the content
 * on the course cards is not fully translated. Some parts appear in English,
 * while others remain in Vietnamese"
 * Location: Explore Courses / Course Dashboard
 *
 * Acceptance heuristic:
 *   - Switch language to EN.
 *   - Inspect visible course-card text.
 *   - Assert no Vietnamese tone marks appear (à á ạ ã â ê ô ơ ư đ ...) in
 *     UI chrome strings (excluding raw lesson content which is intentionally
 *     bilingual). For now we check the labels around each course card.
 *
 * NB: this heuristic is conservative — it may need exclusion lists for proper
 * nouns / VI brand names that intentionally stay in VI even in EN view.
 */

const authFile = path.resolve('tests', '.auth', 'learner.json');
test.use({ storageState: authFile });

const VI_DIACRITICS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

test.describe('Bug #7 — EN view does not leak Vietnamese strings on course cards', {
  tag: [TAG.regression, TAG.i18n, TAG.crossCutting, bugTag(7)],
}, () => {
  test('course cards have no VI diacritics after switching to English', async ({ page }) => {
    await page.goto('/learn/courses', { waitUntil: 'domcontentloaded' });

    // Wait for at least one card to appear (client-side data fetch after hydration).
    await expect(page.locator('[data-testid="course-card"]').first()).toBeVisible({ timeout: 60_000 });

    // Target the "EN | VI" language toggle button specifically. The regex
    // "/en/i" accidentally matches the "Close menu" button (contains "en" in
    // "menu"), which is off-screen on mobile and causes a click timeout.
    const langToggle = page.locator('button').filter({ hasText: /^en\s*\|\s*vi$/i }).first();
    if (await langToggle.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await langToggle.evaluate((el) => (el as HTMLElement).click());
    }
    await page.waitForTimeout(400);

    const cards = await page.locator('[data-testid="course-card"]').all();
    expect(cards.length).toBeGreaterThan(0);

    const leaks: string[] = [];
    for (const card of cards) {
      const text = (await card.innerText()) ?? '';
      if (VI_DIACRITICS.test(text)) {
        leaks.push(text.split('\n')[0]);
      }
    }
    expect(leaks, `course cards with VI diacritics in EN mode: ${leaks.join(' | ')}`).toEqual([]);
  });
});
