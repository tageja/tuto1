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
    await page.goto('/learn/courses', { waitUntil: 'domcontentloaded', timeout: 120_000 });
    const cards = page.locator('[data-testid="course-card"], a[href*="/learn/courses/"]');
    if (!(await cards.first().isVisible({ timeout: 5_000 }).catch(() => false))) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 });
    }
    await expect(cards.first()).toBeVisible({ timeout: 45_000 });
  });
});
