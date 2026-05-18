import { expect, test } from '@playwright/test';
import { TAG } from '../_shared/tags';

test.describe('Smoke — public homepage', { tag: [TAG.smoke, TAG.crossCutting] }, () => {
  test('homepage renders without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => {
      if (err.message.includes('Failed to load chunk')) return;
      consoleErrors.push(err.message);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/tuto/i);
    await expect(page.locator('body')).toBeVisible();

    expect(consoleErrors, `console errors on /:\n${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('homepage shows tuto. Pro brand somewhere', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/tuto\.?\s*pro/i).first()).toBeVisible();
  });
});
