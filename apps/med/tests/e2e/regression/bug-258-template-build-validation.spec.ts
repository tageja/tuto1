import fs from 'fs';
import path from 'path';
import { expect, test } from '@playwright/test';
import { resolveTemplate } from '../../../lib/studio/resolve-template';
import { professionalCommunication } from '../../../lib/studio/templates/professional_communication';
import { assertAllTemplates, assertTemplateResolves } from '../../../lib/studio/validate-templates';
import type { CourseTemplateDefinition } from '../../../lib/studio/types';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #258 — template system build-time validation', {
  tag: [TAG.regression, TAG.studio, TAG.template, TAG.data, bugTag(258)],
}, () => {
  test('templates/index.ts calls assertAllTemplates at import time', () => {
    const indexPath = path.resolve('lib/studio/templates/index.ts');
    const source = fs.readFileSync(indexPath, 'utf8');

    expect(source).toContain("import { assertAllTemplates } from '@/lib/studio/validate-templates'");
    expect(source).toContain('assertAllTemplates(Object.values(courseTemplateDefinitions))');
  });

  test('assertAllTemplates validates shipped templates without throwing', () => {
    // Importing templates/index runs assertAllTemplates — this re-import confirms no throw.
    expect(() => require('../../../lib/studio/templates')).not.toThrow();
  });

  test('pool pick exceeding available options throws during resolution', () => {
    const brokenTemplate: CourseTemplateDefinition = {
      ...professionalCommunication,
      lessons: professionalCommunication.lessons.map((lesson, index) =>
        index === 0
          ? {
              ...lesson,
              slots: [{ kind: 'pool', options: ['flash_card', 'audio_shadow'], pick: 99 }],
            }
          : lesson,
      ),
    };

    expect(() => resolveTemplate(brokenTemplate, 'invalid-pick-seed')).toThrow(
      /Pool pick count 99 exceeds available options/,
    );
    expect(() => assertTemplateResolves(brokenTemplate)).toThrow(
      /Pool pick count 99 exceeds available options/,
    );
  });

  test('assertAllTemplates propagates resolution errors from invalid templates', () => {
    const brokenTemplate: CourseTemplateDefinition = {
      ...professionalCommunication,
      id: 'broken_template',
      lessons: professionalCommunication.lessons.map((lesson, index) =>
        index === 0
          ? {
              ...lesson,
              slots: [{ kind: 'pool', options: ['quiz'], pick: 5 }],
            }
          : lesson,
      ),
    };

    expect(() => assertAllTemplates([brokenTemplate])).toThrow(/Pool pick count 5 exceeds/);
  });
});
