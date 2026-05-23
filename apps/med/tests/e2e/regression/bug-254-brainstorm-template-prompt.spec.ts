import { expect, test } from '@playwright/test';
import { buildBrainstormPrompt } from '../../../lib/studio/prompts/brainstorm';
import { getCourseTemplate } from '../../../lib/studio/templates';
import type { CourseIntakeForm } from '../../../lib/studio/types';
import {
  buildE2eValidSynopsis,
  configureStudioAccess,
  gotoStudio,
  mockStudioBrainstorm,
  skipIfStudioAuthExpired,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const VALID_INTAKE: CourseIntakeForm = {
  profession: 'HR Manager',
  industry: 'Corporate',
  topic: 'Onboarding',
  targetAgeGroup: '25-45 professionals',
  learnerLevel: 'intermediate',
  language: 'bilingual',
  courseSize: 'starter',
  numModules: 3,
  estimatedMinutesPerLesson: 15,
};

const ORG_SYNOPSIS = buildE2eValidSynopsis({
  courseTitle: 'Organisational Onboarding Course',
  module1Title: 'Compliance Foundations',
});
ORG_SYNOPSIS.templateId = 'organisational_training';

const MOCK_ORG_BRAINSTORM_NDJSON =
  '{"type":"partial","synopsis":{"courseTitle":"Organisational Onboarding Course","modules":[]}}\n' +
  `{"type":"complete","synopsis":${JSON.stringify(ORG_SYNOPSIS)}}\n`;

test.describe('Bug #254 — brainstorm API uses template-specific prompt', {
  tag: [TAG.regression, TAG.studio, TAG.template, TAG.auth, bugTag(254)],
}, () => {
  test('buildBrainstormPrompt includes organisational training tone', () => {
    const template = getCourseTemplate('organisational_training');
    const { system, prompt } = buildBrainstormPrompt(VALID_INTAKE, template);
    expect(template.id).toBe('organisational_training');
    expect(system).toMatch(/organisational|compliance|training/i);
    expect(prompt).toMatch(/onboarding|HR Manager/i);
  });

  test.describe('creator session', () => {
    configureStudioAccess();

    test('POST organisational_training streams NDJSON with courseTitle and modules', async ({ page }) => {
      await mockStudioBrainstorm(page, { body: MOCK_ORG_BRAINSTORM_NDJSON });
      await gotoStudio(page, STUDIO_NEW);
      skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

      const result = await page.evaluate(async (payload) => {
        const res = await fetch('/api/studio/brainstorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return {
          status: res.status,
          contentType: res.headers.get('content-type') ?? '',
          body: await res.text(),
        };
      }, { templateId: 'organisational_training', intakeForm: VALID_INTAKE });

      expect(result.status).toBe(200);
      expect(result.contentType).toMatch(/ndjson/i);

      const lines = result.body.trim().split('\n').filter(Boolean);
      expect(lines.length).toBeGreaterThan(0);

      const completeLine = lines.find((line) => line.includes('"type":"complete"'));
      expect(completeLine).toBeTruthy();

      const event = JSON.parse(completeLine!) as {
        type: string;
        synopsis?: { courseTitle?: string; modules?: unknown[] };
      };
      expect(event.type).toBe('complete');
      expect(event.synopsis?.courseTitle).toBeTruthy();
      expect(Array.isArray(event.synopsis?.modules)).toBe(true);
      expect(event.synopsis!.modules!.length).toBeGreaterThan(0);
    });
  });
});
