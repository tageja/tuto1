import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #206 — /admin/audio batch UI renders Preview trigger', {
  tag: [TAG.regression, TAG.adminPages, TAG.audio, bugTag(206)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('Batch Audio Generation shows Preview without firing batch POST', async ({ page }) => {
    const posts: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/api/audio/batch')) {
        posts.push(req.url());
      }
    });

    const consoleErrors = await gotoAdmin(page, '/admin/audio', { collectConsole: true });

    await expect(page.getByRole('heading', { name: /batch audio generation/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('button', { name: /^preview$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /generate all audio/i })).toBeVisible();

    expect(posts).toEqual([]);
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
