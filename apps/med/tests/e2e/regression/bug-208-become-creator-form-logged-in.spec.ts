import { expect, test } from '@playwright/test';
import { learnerAuthFile } from '../_shared/learner-pages';
import {
  creatorApplicationForm,
  creatorFullNameInput,
  creatorOrganisationInput,
  creatorProfessionInput,
  creatorSubmitButton,
  creatorTopicAreaInput,
  creatorWhyCreateInput,
  gotoBecomeCreator,
  skipIfBecomeCreatorRequiresLogin,
  assertBecomeCreatorApplicationReady,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #208 — /become-creator application form when signed in', {
  tag: [TAG.regression, TAG.studio, bugTag(208)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test('shows required fields, optional organisation, validation, and submit label', async ({ page }) => {
    await gotoBecomeCreator(page);
    await skipIfBecomeCreatorRequiresLogin(page, 'learner auth file expired — run global setup');
    await assertBecomeCreatorApplicationReady(page);
    await expect(creatorFullNameInput(page)).toBeVisible();
    await expect(creatorProfessionInput(page)).toBeVisible();
    await expect(creatorTopicAreaInput(page)).toBeVisible();
    await expect(creatorWhyCreateInput(page)).toBeVisible();

    await expect(creatorFullNameInput(page)).toHaveAttribute('required', '');
    await expect(creatorProfessionInput(page)).toHaveAttribute('required', '');
    await expect(creatorTopicAreaInput(page)).toHaveAttribute('required', '');
    await expect(creatorWhyCreateInput(page)).toHaveAttribute('required', '');
    await expect(creatorOrganisationInput(page)).not.toHaveAttribute('required', '');

    const submit = creatorSubmitButton(page);
    await expect(submit).toBeVisible();
    await expect(submit).toHaveText(/submit application|gửi đăng ký/i);

    let postAttempted = false;
    await page.route('**/api/creator-applications', async (route) => {
      postAttempted = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });

    await submit.click();

    expect(postAttempted).toBe(false);
    await expect(creatorFullNameInput(page)).toHaveJSProperty('validity.valid', false);
    await expect(creatorProfessionInput(page)).toHaveJSProperty('validity.valid', false);
    await expect(creatorTopicAreaInput(page)).toHaveJSProperty('validity.valid', false);
    await expect(creatorWhyCreateInput(page)).toHaveJSProperty('validity.valid', false);
  });
});
