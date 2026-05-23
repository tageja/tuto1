import { expect, test } from '@playwright/test';
import {
  buildMockPendingVideoItem,
  buildMockStudioCoursePayload,
  configureStudioAccess,
  gotoStudioCourse,
  MOCK_STUDIO_COURSE_ID,
  skipIfStudioAuthExpired,
  studioCourseMediaTab,
  studioVideoRequestCharacterField,
  studioVideoRequestSceneField,
  studioVideoRequestSubmitButton,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #241 — Video request card form validation', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.state, bugTag(241)],
}, () => {
  configureStudioAccess();

  test('blocks submit until character and scene are filled', async ({ page }) => {
    await gotoStudioCourse(page, MOCK_STUDIO_COURSE_ID, {
      payload: buildMockStudioCoursePayload({
        videoItems: [buildMockPendingVideoItem()],
      }),
    });
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await studioCourseMediaTab(page).click();
    const submit = studioVideoRequestSubmitButton(page);
    await expect(submit).toBeVisible({ timeout: 15_000 });

    await submit.click();
    const emptyFormInvalid = await page.evaluate(() => {
      const fields = Array.from(document.querySelectorAll('textarea[required]')) as HTMLTextAreaElement[];
      return fields.length >= 2 && fields.every((field) => !field.checkValidity());
    });
    expect(emptyFormInvalid).toBe(true);

    const patchWhileEmpty = await page
      .waitForRequest((req) => req.method() === 'PATCH' && /\/api\/studio\/media\//.test(req.url()), {
        timeout: 1_500,
      })
      .catch(() => null);
    expect(patchWhileEmpty).toBeNull();

    await studioVideoRequestCharacterField(page).fill('Professional nurse in blue scrubs');
    await studioVideoRequestSceneField(page).fill('Hospital corridor, bright lighting');
    await expect(submit).toBeEnabled();

    await page.route('**/api/studio/media/**', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
        return;
      }
      await route.continue();
    });

    await submit.click();
    await expect(page.getByText(/your request has been received|yêu cầu của bạn đã được tiếp nhận/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
