import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  studioTemplateSelect,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const TEMPLATE_IDS = [
  'professional_communication',
  'organisational_training',
  'student_english',
] as const;

test.describe('Bug #250 — template selector passes correct templateId', {
  tag: [TAG.regression, TAG.studio, TAG.template, TAG.state, bugTag(250)],
}, () => {
  configureStudioAccess();

  test('selecting each template updates the select value (selected state)', async ({ page }) => {
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const templateSelect = studioTemplateSelect(page);

    for (const templateId of TEMPLATE_IDS) {
      await templateSelect.selectOption(templateId);
      await expect(templateSelect).toHaveValue(templateId);
    }
  });
});
