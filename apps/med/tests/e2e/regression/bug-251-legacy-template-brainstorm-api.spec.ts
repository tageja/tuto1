import { expect, test } from '@playwright/test';
import { buildBrainstormPrompt } from '../../../lib/studio/prompts/brainstorm';
import { getCourseTemplate, normalizeTemplateId } from '../../../lib/studio/templates';
import type { CourseIntakeForm } from '../../../lib/studio/types';
import {
  configureStudioAccess,
  gotoStudio,
  mockStudioBrainstorm,
  skipIfStudioAuthExpired,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const VALID_INTAKE: CourseIntakeForm = {
  profession: 'Registered Nurse',
  industry: 'Healthcare',
  topic: 'Emergency communication',
  targetAgeGroup: '22-35 professionals',
  learnerLevel: 'beginner',
  language: 'bilingual',
  courseSize: 'starter',
  numModules: 3,
  estimatedMinutesPerLesson: 15,
};

test.describe('Bug #251 — legacy template IDs do not crash brainstorm API', {
  tag: [TAG.regression, TAG.studio, TAG.template, TAG.auth, bugTag(251)],
}, () => {
  test('normalizeTemplateId maps safety_procedures to organisational_training', () => {
    expect(normalizeTemplateId('safety_procedures')).toBe('organisational_training');
    expect(getCourseTemplate('safety_procedures').id).toBe('organisational_training');
  });

  test('buildBrainstormPrompt accepts legacy-normalized template without throwing', () => {
    const template = getCourseTemplate('safety_procedures');
    const { system, prompt } = buildBrainstormPrompt(VALID_INTAKE, template);
    expect(system.length).toBeGreaterThan(0);
    expect(prompt.length).toBeGreaterThan(0);
    expect(template.id).toBe('organisational_training');
  });

  test.describe('creator session', () => {
    configureStudioAccess();

    test('POST with legacy templateId returns stream (mocked) not 400/500 template crash', async ({ page }) => {
      await mockStudioBrainstorm(page);
      await gotoStudio(page, STUDIO_NEW);
      skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

      const result = await page.evaluate(async (payload) => {
        const res = await fetch('/api/studio/brainstorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return { status: res.status, body: await res.text() };
      }, { templateId: 'safety_procedures', intakeForm: VALID_INTAKE });

      expect(result.status).toBe(200);
      expect(result.body).toContain('"type"');
      expect(result.body).not.toContain('Invalid brainstorm request');
    });
  });
});
