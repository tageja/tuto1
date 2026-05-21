import { expect, test } from '@playwright/test';
import {
  clickSidebarLangToggle,
  gotoLearner,
  learnerAuthFile,
  skipIfAuthExpired,
  VI_DIACRITICS,
} from '../_shared/learner-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #179 — /learn/courses catalogue with filters', {
  tag: [TAG.regression, TAG.learnerPages, TAG.i18n, TAG.nav, bugTag(179)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('published course cards, CTA, level filters, EN/VI toggle', async ({ page }) => {
    await gotoLearner(page, '/learn/courses');
    skipIfAuthExpired(page, 'learner auth file expired — run: npx playwright test --project=setup');

    await page.waitForResponse((r) => /\/api\/courses/.test(r.url()) && r.status() === 200, {
      timeout: 90_000,
    }).catch(() => {});

    const card = page.locator('[data-testid="course-card"]').first();
    await expect(card).toBeVisible({ timeout: 60_000 });
    await expect(card.locator('a[href*="/learn/courses/"]')).toBeVisible();
    const title = await card.locator('h2, h3').first().innerText();
    expect(title.trim().length).toBeGreaterThan(0);

    for (const level of ['All', 'A1', 'A2', 'B1', 'B2'] as const) {
      const btn = page.getByRole('button', { name: level === 'All' ? /all|tất cả/i : level });
      await expect(btn.first()).toBeVisible();
      await btn.first().click();
      await expect(btn.first()).toBeVisible();
    }

    await clickSidebarLangToggle(page);
    const cards = await page.locator('[data-testid="course-card"]').all();
    expect(cards.length).toBeGreaterThan(0);
    const leaks: string[] = [];
    for (const c of cards.slice(0, 3)) {
      const text = await c.innerText();
      if (VI_DIACRITICS.test(text)) leaks.push(text.split('\n')[0]);
    }
    expect(leaks, `VI diacritics on cards after EN toggle: ${leaks.join(' | ')}`).toEqual([]);
  });
});
