import path from 'path';
import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  STUDIO_GENERATE_API,
  VALID_STUDIO_GENERATE_BODY,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const learnerAuthFile = path.resolve('tests', '.auth', 'learner.json');

test.describe('Bug #233 — POST /api/studio/generate auth', {
  tag: [TAG.regression, TAG.studio, TAG.auth, bugTag(233)],
}, () => {
  test('POST without session returns 403', async ({ request }) => {
    const response = await request.post(STUDIO_GENERATE_API, {
      data: VALID_STUDIO_GENERATE_BODY,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(403);
  });

  test.describe('learner session', () => {
    test.use({ storageState: learnerAuthFile });

    test('POST with learner role returns 403', async ({ request }) => {
      const response = await request.post(STUDIO_GENERATE_API, {
        data: VALID_STUDIO_GENERATE_BODY,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(response.status()).toBe(403);
    });
  });

  test.describe('creator session', () => {
    configureStudioAccess();

    test('POST with missing draftId returns 400', async ({ request }) => {
      const response = await request.post(STUDIO_GENERATE_API, {
        data: {},
        headers: { 'Content-Type': 'application/json' },
      });
      expect(response.status()).toBe(400);
      const json = await response.json();
      expect(json.error).toMatch(/draftId/i);
    });
  });
});
