import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  studioMainForm,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #218 — /studio/new course size selector', {
  tag: [TAG.regression, TAG.studio, TAG.state, bugTag(218)],
}, () => {
  configureStudioAccess();

  test('only one course size is highlighted at a time', async ({ page }) => {
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const form = studioMainForm(page);
    const starterBtn = form.getByRole('button', { name: /^starter\b/i });
    const standardBtn = form.getByRole('button', { name: /^standard\b/i });
    const fullBtn = form.getByRole('button', { name: /^full\b/i });

    await expect(starterBtn).toHaveClass(/border-primary/);
    await expect(standardBtn).not.toHaveClass(/border-primary/);
    await expect(fullBtn).not.toHaveClass(/border-primary/);

    await standardBtn.click();
    await expect(standardBtn).toHaveClass(/border-primary/);
    await expect(starterBtn).not.toHaveClass(/border-primary/);
    await expect(fullBtn).not.toHaveClass(/border-primary/);

    await fullBtn.click();
    await expect(fullBtn).toHaveClass(/border-primary/);
    await expect(starterBtn).not.toHaveClass(/border-primary/);
    await expect(standardBtn).not.toHaveClass(/border-primary/);
  });
});
