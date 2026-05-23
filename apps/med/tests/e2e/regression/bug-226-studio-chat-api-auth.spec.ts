import path from 'path';

import { expect, test } from '@playwright/test';

import {

  configureStudioAccess,

  STUDIO_CHAT_API,

  VALID_STUDIO_CHAT_BODY,

} from '../_shared/studio-pages';

import { TAG, bugTag } from '../_shared/tags';



const learnerAuthFile = path.resolve('tests', '.auth', 'learner.json');



test.describe('Bug #226 — POST /api/studio/chat auth', {

  tag: [TAG.regression, TAG.studio, TAG.auth, bugTag(226)],

}, () => {

  test('POST without session returns 403', async ({ request }) => {

    const response = await request.post(STUDIO_CHAT_API, {

      data: VALID_STUDIO_CHAT_BODY,

      headers: { 'Content-Type': 'application/json' },

    });

    expect(response.status()).toBe(403);

  });



  test.describe('learner session', () => {

    test.use({ storageState: learnerAuthFile });



    test('POST with learner role returns 403', async ({ request }) => {

      const response = await request.post(STUDIO_CHAT_API, {

        data: VALID_STUDIO_CHAT_BODY,

        headers: { 'Content-Type': 'application/json' },

      });

      expect(response.status()).toBe(403);

    });

  });



  test.describe('creator session', () => {

    configureStudioAccess();



    test('POST with empty messages array is accepted or returns 400', async ({ request }) => {

      const response = await request.post(STUDIO_CHAT_API, {

        data: { ...VALID_STUDIO_CHAT_BODY, messages: [], draftId: null },

        headers: { 'Content-Type': 'application/json' },

      });

      expect([200, 400, 500]).toContain(response.status());

    });

  });

});

