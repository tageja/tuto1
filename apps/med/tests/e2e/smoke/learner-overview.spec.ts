import { expect, test } from '@playwright/test';
import path from 'path';
import { TAG } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');

test.use({ storageState: authFile });

test.describe('Smoke — learner overview', { tag: [TAG.smoke, TAG.nav] }, () => {
  test('/learn renders the overview page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => {
      // Ignore transient Turbopack dev-mode chunk compilation errors; these do
      // not affect the rendered page and never occur in production builds.
      if (e.message.includes('Failed to load chunk')) return;
      errors.push(e.message);
    });

    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/learn/);

    await expect(page.locator('aside, nav').first()).toBeVisible();

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('/learn/courses lists at least one course card', async ({ page }) => {
    const cards = page.locator('[data-testid="course-card"], a[href*="/learn/courses/"]');

    for (let attempt = 0; attempt < 6; attempt++) {
      const apiWait = page.waitForResponse((r) => /\/api\/courses(\?|$)/.test(r.url()) && r.status() === 200, {
        timeout: 90_000,
      });
      await page.goto('/learn/courses', { waitUntil: 'domcontentloaded', timeout: 120_000 });
      await apiWait.catch(() => {});

      await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible', timeout: 30_000 });

      try {
        await expect(cards.first()).toBeVisible({ timeout: 20_000 });
        return;
      } catch {}

      try {
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
      } catch {
        /* dev server briefly unavailable — retry full navigation */
      }
    }

    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
  });
});
