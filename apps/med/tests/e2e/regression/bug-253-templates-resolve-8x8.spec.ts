import { expect, test } from '@playwright/test';
import { resolveTemplate } from '../../../lib/studio/resolve-template';
import {
  courseTemplateDefinitions,
  organisationalTraining,
  professionalCommunication,
  studentEnglish,
} from '../../../lib/studio/templates';
import { assertAllTemplates } from '../../../lib/studio/validate-templates';
import { TAG, bugTag } from '../_shared/tags';

const TEMPLATES = [professionalCommunication, organisationalTraining, studentEnglish] as const;

const DRAFT_IDS = Array.from({ length: 10 }, (_, index) => `e2e-draft-${index + 1}`);

test.describe('Bug #253 — all templates resolve to 8×8 steps', {
  tag: [TAG.regression, TAG.studio, TAG.template, TAG.data, bugTag(253)],
}, () => {
  test('assertAllTemplates passes for shipped template definitions', () => {
    expect(() => assertAllTemplates(Object.values(courseTemplateDefinitions))).not.toThrow();
  });

  for (const template of TEMPLATES) {
    test(`${template.id} resolves to 8 lessons × 8 steps across 10 draftIds`, () => {
      for (const draftId of DRAFT_IDS) {
        const resolved = resolveTemplate(template, draftId);

        expect(resolved).toHaveLength(8);
        for (const lesson of resolved) {
          expect(lesson.steps).toHaveLength(8);
        }
      }
    });
  }
});
