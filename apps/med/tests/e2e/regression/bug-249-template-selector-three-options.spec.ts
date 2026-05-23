import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  studioTemplateSelect,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const TEMPLATE_OPTIONS = [
  {
    value: 'professional_communication',
    name: 'Professional Communication',
    description: 'Workplace English for adults in specific roles',
  },
  {
    value: 'organisational_training',
    name: 'Organisational Training',
    description: 'Company training, compliance, and soft skills',
  },
  {
    value: 'student_english',
    name: 'Student English',
    description: 'English learning for university students (grammar, reading, listening)',
  },
] as const;

test.describe('Bug #249 — template selector shows 3 correct options', {
  tag: [TAG.regression, TAG.studio, TAG.template, TAG.content, bugTag(249)],
}, () => {
  configureStudioAccess();

  test('select lists three templates with names and non-empty descriptions', async ({ page }) => {
    await gotoStudio(page, STUDIO_NEW);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    const templateSelect = studioTemplateSelect(page);
    await expect(templateSelect.locator('option')).toHaveCount(3);

    for (const template of TEMPLATE_OPTIONS) {
      const option = templateSelect.locator(`option[value="${template.value}"]`);
      await expect(option).toHaveCount(1);
      const text = (await option.textContent()) ?? '';
      expect(text).toContain(template.name);
      expect(text).toContain(template.description);
      expect(template.description.trim().length).toBeGreaterThan(0);
    }
  });
});
