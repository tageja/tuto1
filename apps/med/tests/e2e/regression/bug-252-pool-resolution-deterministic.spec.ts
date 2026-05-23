import { expect, test } from '@playwright/test';
import { resolveTemplate } from '../../../lib/studio/resolve-template';
import {
  organisationalTraining,
  professionalCommunication,
  studentEnglish,
} from '../../../lib/studio/templates';
import { TAG, bugTag } from '../_shared/tags';

const TEMPLATES = [professionalCommunication, organisationalTraining, studentEnglish] as const;

test.describe('Bug #252 — pool resolution is deterministic', {
  tag: [TAG.regression, TAG.studio, TAG.template, TAG.data, bugTag(252)],
}, () => {
  for (const template of TEMPLATES) {
    test(`${template.id} resolves identically for the same draftId`, () => {
      const draftId = `deterministic-seed-${template.id}`;
      const first = resolveTemplate(template, draftId);
      const second = resolveTemplate(template, draftId);

      expect(first).toEqual(second);
      expect(first).toHaveLength(8);
      for (const lesson of first) {
        expect(lesson.steps).toHaveLength(8);
      }
    });

    test(`${template.id} resolves without error for a different draftId`, () => {
      const draftIdA = `draft-a-${template.id}`;
      const draftIdB = `draft-b-${template.id}`;

      const resolvedA = resolveTemplate(template, draftIdA);
      const resolvedB = resolveTemplate(template, draftIdB);

      expect(resolvedA).toHaveLength(8);
      expect(resolvedB).toHaveLength(8);
    });
  }
});
