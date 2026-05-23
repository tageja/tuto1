import path from 'path';
import { expect, test } from '@playwright/test';
import { configureStudioAccess, STUDIO_BRAINSTORM_API } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const learnerAuthFile = path.resolve('tests', '.auth', 'learner.json');

const VALID_BRAINSTORM_BODY = {
  draftId: '00000000-0000-0000-0000-000000000001',
  intakeForm: {
    profession: 'Registered Nurse',
    industry: 'Healthcare',
    topic: 'Emergency communication',
    targetAgeGroup: '22-35 professionals',
    learnerLevel: 'beginner',
    language: 'bilingual',
    courseSize: 'starter',
    numModules: 3,
    estimatedMinutesPerLesson: 15,
  },
};

test.describe('Bug #220 — POST /api/studio/brainstorm auth', {
  tag: [TAG.regression, TAG.studio, TAG.auth, bugTag(220)],
}, () => {
  test('POST without session returns 403', async ({ request }) => {
    const response = await request.post(STUDIO_BRAINSTORM_API, {
      data: VALID_BRAINSTORM_BODY,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(403);
  });

  test.describe('learner session', () => {
    test.use({ storageState: learnerAuthFile });

    test('POST with learner role returns 403', async ({ request }) => {
      const response = await request.post(STUDIO_BRAINSTORM_API, {
        data: VALID_BRAINSTORM_BODY,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(response.status()).toBe(403);
    });
  });

  test.describe('creator session', () => {
    configureStudioAccess();

    test('POST with empty body returns 400', async ({ request }) => {
      const response = await request.post(STUDIO_BRAINSTORM_API, {
        data: {},
        headers: { 'Content-Type': 'application/json' },
      });
      expect(response.status()).toBe(400);
    });
  });
});
