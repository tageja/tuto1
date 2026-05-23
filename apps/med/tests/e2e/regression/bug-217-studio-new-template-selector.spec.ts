import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  studioTemplateSelect,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const TEMPLATES = [
  { value: 'professional_communication', label: /professional communication/i },
  { value: 'organisational_training', label: /organisational training/i },
  { value: 'student_english', label: /student english/i },
] as const;

test.describe('Bug #217 — /studio/new template selector', {
  tag: [TAG.regression, TAG.studio, TAG.state, bugTag(217)],
}, () => {
  configureStudioAccess();

  test('all three templates appear and update the select value', async ({ page }) => {
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const templateSelect = studioTemplateSelect(page);
    await expect(templateSelect.locator('option')).toHaveCount(3);

    for (const template of TEMPLATES) {
      await expect(templateSelect.locator('option', { hasText: template.label })).toHaveCount(1);
      await templateSelect.selectOption(template.value);
      await expect(templateSelect).toHaveValue(template.value);
    }
  });
});
