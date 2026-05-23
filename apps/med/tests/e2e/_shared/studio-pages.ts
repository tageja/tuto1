import { expect, test, type APIResponse, type Page } from '@playwright/test';
import { adminAuthFile } from './admin-pages';
import { AUTH_DISABLED } from './env';

export const BECOME_CREATOR_PATH = '/become-creator';
export const STUDIO_HOME = '/studio';
export const STUDIO_NEW = '/studio/new';

export const CREATOR_APPLICATIONS_API = '**/api/creator-applications';
export const STUDIO_CATEGORIES_API = '/api/studio/categories';
export const STUDIO_DRAFTS_API = '/api/studio/drafts';
export const STUDIO_BRAINSTORM_API = '/api/studio/brainstorm';
export const STUDIO_CHAT_API = '/api/studio/chat';
export const STUDIO_GENERATE_API = '/api/studio/generate';
export const STUDIO_MEDIA_PATCH_API = '/api/studio/media/some-fake-id';
export const ADMIN_MEDIA_QUEUE_PATH = '/admin/media-queue';
export const ADMIN_MEDIA_QUEUE_PATCH_API = '/api/admin/media-queue/some-fake-id';

export const MOCK_STUDIO_COURSE_ID = 'e2e-test-course-id';
export const MOCK_STUDIO_COURSE_VALIDATE_API = `/api/studio/courses/${MOCK_STUDIO_COURSE_ID}/validate`;
export const MOCK_STUDIO_COURSE_SUBMIT_API = `/api/studio/courses/${MOCK_STUDIO_COURSE_ID}/submit`;
export const ADMIN_COURSE_REVIEW_API = '/api/admin/courses/some-fake-id/review';
export const ADMIN_PENDING_COUNT_API = '/api/admin/courses/pending-count';
export const MOCK_VIDEO_QUEUE_ID = 'e2e-test-video-queue-id';

export const MOCK_GENERATE_COURSE_ID = 'test-course-id-123';

/** Full E2E flow generation complete id (bug-274). */
export const E2E_FLOW_GENERATE_COURSE_ID = 'test-course-id';

export const MOCK_E2E_FLOW_GENERATE_NDJSON =
  '{"type":"start","totalLessons":32,"totalModules":4}\n' +
  '{"type":"module_start","moduleIndex":1,"moduleTitle":"Module 1"}\n' +
  '{"type":"lesson_start","moduleIndex":1,"lessonIndex":1,"lessonTitle":"Lesson 1"}\n' +
  '{"type":"lesson_done","moduleIndex":1,"lessonIndex":1,"lessonTitle":"Lesson 1"}\n' +
  '{"type":"lesson_start","moduleIndex":1,"lessonIndex":2,"lessonTitle":"Lesson 2"}\n' +
  '{"type":"lesson_done","moduleIndex":1,"lessonIndex":2,"lessonTitle":"Lesson 2"}\n' +
  `{"type":"complete","courseId":"${E2E_FLOW_GENERATE_COURSE_ID}"}\n`;

export const E2E_OVERVIEW_COURSE_ID = 'test-course-id';

export const MOCK_PENDING_REVIEW_COURSE = {
  id: 'e2e-pending-review-course-id',
  slug: 'e2e-pending-review-course',
  title: 'E2E Pending Review Course',
  title_vi: 'Khóa học chờ duyệt E2E',
  submitted_at: '2026-05-23T12:00:00.000Z',
  creator_id: 'e2e-creator-id',
  creator_name: 'QA Creator',
  creator_email: 'creator@test.com',
  template_id: 'organisational_training',
  template_name: 'Organisational Training',
  modules_count: 3,
  lessons_count: 24,
};

/** NDJSON stream for mocked generation (no real Gemini). Uses 1-based module/lesson indices. */
export const MOCK_GENERATE_NDJSON =
  '{"type":"start","totalLessons":3,"totalModules":1}\n' +
  '{"type":"module_start","moduleIndex":1,"moduleTitle":"Updated Module 1"}\n' +
  '{"type":"lesson_start","moduleIndex":1,"lessonIndex":1,"lessonTitle":"Lesson 1"}\n' +
  '{"type":"lesson_done","moduleIndex":1,"lessonIndex":1,"lessonTitle":"Lesson 1"}\n' +
  '{"type":"lesson_start","moduleIndex":1,"lessonIndex":2,"lessonTitle":"Lesson 2"}\n' +
  '{"type":"lesson_done","moduleIndex":1,"lessonIndex":2,"lessonTitle":"Lesson 2"}\n' +
  '{"type":"lesson_start","moduleIndex":1,"lessonIndex":3,"lessonTitle":"Lesson 3"}\n' +
  '{"type":"lesson_done","moduleIndex":1,"lessonIndex":3,"lessonTitle":"Lesson 3"}\n' +
  `{"type":"complete","courseId":"${MOCK_GENERATE_COURSE_ID}"}\n`;

export const MOCK_GENERATE_ERROR_NDJSON = '{"type":"error","error":"Generation failed"}\n';

/** Schema-valid synopsis for mocked brainstorm/chat streams. */
export function buildE2eValidSynopsis(overrides?: {
  courseTitle?: string;
  module1Title?: string;
}): Record<string, unknown> {
  const makeLesson = (orderIndex: number) => ({
    orderIndex,
    title: `Lesson ${orderIndex}`,
    stage:
      orderIndex <= 2
        ? 'heads_up'
        : orderIndex <= 5
          ? 'heads_down'
          : orderIndex <= 7
            ? 'heads_together'
            : 'assessment',
    objective: 'Learn basics for emergency communication.',
    keyPhrases: ['phrase 1', 'phrase 2', 'phrase 3', 'phrase 4', 'phrase 5'],
    scenarioContext: 'Emergency department arrival scenario.',
    ...(orderIndex === 1
      ? { videoScript: 'Video script for lesson one about emergency communication basics.' }
      : {}),
  });

  const makeModule = (orderIndex: number, title: string) => ({
    orderIndex,
    title,
    titleVi: title,
    rationale: 'Foundation module for the course outline.',
    lessons: Array.from({ length: 8 }, (_, index) => makeLesson(index + 1)),
  });

  return {
    courseTitle: overrides?.courseTitle ?? 'Updated Test Course',
    courseTitleVi: 'Khóa học cập nhật',
    courseDescription: 'Updated description for E2E chat refinement testing.',
    level: 'A1',
    templateId: 'professional_communication',
    totalModules: 3,
    estimatedHours: 4,
    modules: [
      makeModule(1, overrides?.module1Title ?? 'Updated Module 1'),
      makeModule(2, 'Module 2'),
      makeModule(3, 'Module 3'),
    ],
  };
}

const MOCK_BRAINSTORM_COMPLETE_SYNOPSIS = buildE2eValidSynopsis({
  courseTitle: 'Test Course',
  module1Title: 'Module 1',
});

/** NDJSON stream for mocked brainstorm (no real Gemini). */
export const MOCK_BRAINSTORM_NDJSON =
  '{"type":"partial","synopsis":{"courseTitle":"Test Course","modules":[]}}\n' +
  `{"type":"complete","synopsis":${JSON.stringify(MOCK_BRAINSTORM_COMPLETE_SYNOPSIS)}}\n`;

export const MOCK_STUDIO_CATEGORY = {
  id: '00000000-0000-0000-0000-000000000099',
  name: 'Healthcare',
  slug: 'healthcare',
  parent_id: null as string | null,
};

export const MOCK_STUDIO_DRAFT_ID = 'e2e-test-draft-id';

export const VALID_STUDIO_GENERATE_BODY = { draftId: MOCK_STUDIO_DRAFT_ID };

const NOT_FOUND_RE = /404|not found|không tìm thấy/i;

/** super_admin session — studio allows course_creator and super_admin (see app/studio/layout.tsx). */
export const studioAuthFile = adminAuthFile;

/** Always attach admin storage; server may still enforce roles when AUTH_DISABLED is false in .env.local. */
export function configureStudioAccess(): void {
  test.use({ storageState: studioAuthFile });
}

export function skipIfStudioAuthExpired(page: Page, reason: string): void {
  if (page.url().includes('/auth/login')) {
    test.skip(true, reason);
  }
  if (!AUTH_DISABLED && page.url().includes('/become-creator')) {
    test.skip(true, `${reason} — use super_admin session (admin.setup)`);
  }
}

// ─── Become-creator helpers (bugs 207–209) ───────────────────────────────────

export async function gotoBecomeCreator(page: Page): Promise<APIResponse | null> {
  return page.goto(BECOME_CREATOR_PATH, { waitUntil: 'domcontentloaded', timeout: 120_000 });
}

export async function assertBecomeCreatorDocumentTitle(page: Page): Promise<void> {
  await expect(page).toHaveTitle(/become a course creator|trở thành người tạo khóa học|tuto/i);
}

export function becomeCreatorHeading(page: Page) {
  return page.getByRole('heading', { name: /become a course creator|trở thành người tạo khóa học/i }).first();
}

export function creatorLoginCta(page: Page) {
  return page.getByRole('link', { name: /sign in to apply|đăng nhập để đăng ký/i });
}

export function creatorRegisterCta(page: Page) {
  return page.getByRole('link', { name: /create account|tạo tài khoản|register/i });
}

export function creatorApplicationForm(page: Page) {
  return page.locator('form').filter({ has: page.locator('input[name="full_name"]') });
}

export function creatorFullNameInput(page: Page) {
  return page.locator('input[name="full_name"]');
}

export function creatorProfessionInput(page: Page) {
  return page.locator('input[name="profession"]');
}

export function creatorTopicAreaInput(page: Page) {
  return page.locator('input[name="topic_area"]');
}

export function creatorWhyCreateInput(page: Page) {
  return page.locator('textarea[name="why_create"]');
}

export function creatorOrganisationInput(page: Page) {
  return page.locator('input[name="organisation"]');
}

export function creatorSubmitButton(page: Page) {
  return creatorApplicationForm(page).getByRole('button', { name: /submit application|gửi đăng ký/i });
}

/** Skip when saved learner session expired and the page shows login/register CTAs. */
export async function skipIfBecomeCreatorRequiresLogin(page: Page, reason: string): Promise<void> {
  if (page.url().includes('/auth/login')) {
    test.skip(true, reason);
  }
  const loginGate = page.getByRole('heading', {
    name: /please sign in|vui lòng đăng nhập/i,
  });
  if (await loginGate.isVisible({ timeout: 5_000 }).catch(() => false)) {
    test.skip(true, `${reason} — /become-creator shows login/register CTAs`);
  }
}

export async function assertBecomeCreatorApplicationReady(page: Page): Promise<void> {
  const loginGate = page.getByRole('heading', {
    name: /please sign in|vui lòng đăng nhập/i,
  });
  const form = creatorApplicationForm(page);

  await expect(loginGate.or(form)).toBeVisible({ timeout: 20_000 });

  if (await loginGate.isVisible().catch(() => false)) {
    test.skip(true, 'learner session expired — /become-creator shows login/register CTAs');
  }

  await expect(page.getByText(/applying as|đang đăng ký bằng tài khoản/i)).toBeVisible({ timeout: 30_000 });
  await expect(creatorTopicAreaInput(page)).toBeVisible({ timeout: 15_000 });
  await expect(creatorSubmitButton(page)).toBeEnabled({ timeout: 60_000 });
}

export async function fillCreatorApplicationForm(page: Page): Promise<void> {
  await assertBecomeCreatorApplicationReady(page);

  await creatorFullNameInput(page).fill('QA Creator');
  await creatorProfessionInput(page).fill('Registered Nurse');
  await creatorTopicAreaInput(page).fill('Emergency communication');
  await creatorWhyCreateInput(page).fill('I want to help nurses practise shift-ready English.');

  await expect(creatorFullNameInput(page)).toHaveValue('QA Creator');
  await expect(creatorProfessionInput(page)).toHaveValue('Registered Nurse');
  await expect(creatorTopicAreaInput(page)).toHaveValue('Emergency communication');
}

// ─── Studio route helpers (bugs 212–219) ─────────────────────────────────────

export async function mockStudioApis(page: Page): Promise<void> {
  await page.route('**/api/studio/drafts', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/studio/categories', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });
}

export async function gotoStudio(
  page: Page,
  path: string,
  options?: { mockApis?: boolean },
): Promise<void> {
  if (options?.mockApis !== false) {
    await mockStudioApis(page);
  }
  const response = await page.goto(path, {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });
  expect(response?.status() ?? 200).toBeLessThan(500);
  await assertNoStudioNotFound(page);
}

export async function assertNoStudioNotFound(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: NOT_FOUND_RE })).toHaveCount(0);
  await expect(page.getByText(NOT_FOUND_RE)).toHaveCount(0);
}

/** Track POST /api/studio/drafts from the intake form. */
export function trackStudioDraftPosts(page: Page): string[] {
  const posts: string[] = [];
  page.on('request', (req) => {
    if (req.method() === 'POST' && /\/api\/studio\/drafts/.test(req.url())) {
      posts.push(req.url());
    }
  });
  return posts;
}

export function studioMainForm(page: Page) {
  return page
    .locator('main form')
    .filter({ has: page.locator('input[placeholder*="Registered Nurse" i]') })
    .first();
}

export function studioSuggestionForm(page: Page) {
  return page.locator('aside form');
}

export function studioTemplateSelect(page: Page) {
  return studioMainForm(page).locator('select').filter({
    has: page.locator('option[value="professional_communication"]'),
  });
}

/** Categories + draft POST for Step 1 → Step 2 flows (brainstorm specs). */
export async function mockStudioNewWizardApis(
  page: Page,
  options?: { draftId?: string },
): Promise<void> {
  const draftId = options?.draftId ?? MOCK_STUDIO_DRAFT_ID;

  await page.route('**/api/studio/categories', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [MOCK_STUDIO_CATEGORY] }),
    });
  });

  await page.route('**/api/studio/drafts', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: draftId } }),
      });
      return;
    }
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
      return;
    }
    await route.continue();
  });
}

export async function mockStudioBrainstorm(
  page: Page,
  options?: { delayMs?: number; body?: string; status?: number },
): Promise<void> {
  const body = options?.body ?? MOCK_BRAINSTORM_NDJSON;
  const status = options?.status ?? 200;
  const delayMs = options?.delayMs ?? 0;

  const handler = async (route: import('@playwright/test').Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    await route.fulfill({
      status,
      headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
      body,
    });
  };

  await page.route('**/api/studio/brainstorm', handler);
}

export async function fillStudioIntakeForm(page: Page): Promise<void> {
  const form = studioMainForm(page);
  await form.getByPlaceholder(/registered nurse/i).fill('Registered Nurse');
  await form.getByPlaceholder(/healthcare/i).fill('Healthcare');
  await form.getByPlaceholder(/emergency communication/i).fill('Emergency communication');
  await form.getByPlaceholder(/22-35 working professionals/i).fill('22-35 working professionals');

  const categorySelect = form.locator('select').filter({ hasText: /select category/i });
  await categorySelect.selectOption(MOCK_STUDIO_CATEGORY.id);
}

/** Fills every intake field including template, course size, and optional subtopic/context. */
export async function fillFullStudioIntakeForm(page: Page): Promise<void> {
  const form = studioMainForm(page);
  await form.getByPlaceholder(/registered nurse/i).fill('HR Manager');
  await form.getByPlaceholder(/healthcare/i).fill('Corporate');
  await form.getByPlaceholder(/emergency communication/i).fill('Workplace Onboarding');
  await form.getByPlaceholder(/triage language/i).fill('Compliance basics');
  await form.getByPlaceholder(/22-35 working professionals/i).fill('25-45 professionals');
  await form.getByPlaceholder(/struggle with short emergency/i).fill('New hires need policy refreshers.');

  const categorySelect = form.locator('select').filter({ hasText: /select category/i });
  await categorySelect.selectOption(MOCK_STUDIO_CATEGORY.id);

  await studioTemplateSelect(page).selectOption('organisational_training');

  await form
    .getByRole('button')
    .filter({ hasText: /starter|khởi đầu/i })
    .first()
    .click();

  await form.locator('select').filter({ has: page.locator('option[value="intermediate"]') }).selectOption('intermediate');

  const minutesInput = form.locator('input[type="number"]');
  await minutesInput.fill('15');
}

export function studioReferenceMaterialsHeading(page: Page) {
  return page.getByRole('heading', { name: /reference materials|tài liệu tham khảo/i });
}

export function studioReferenceFileInput(page: Page) {
  return studioMainForm(page).locator('input[type="file"]');
}

export async function saveStudioDraftFromIntake(page: Page): Promise<void> {
  await fillStudioIntakeForm(page);
  await studioMainForm(page).getByRole('button', { name: /save draft|lưu bản nháp/i }).click();
}

export function studioSynopsisSkeleton(page: Page) {
  return page.locator('.animate-pulse').first();
}

export function studioLooksGoodButton(page: Page) {
  return page.getByRole('button', { name: /this looks good|ổn rồi — tiếp tục/i });
}

export function studioRefineWithAiButton(page: Page) {
  return page.getByRole('button', { name: /refine with ai|tinh chỉnh bằng ai/i });
}

export function studioSynopsisHeading(page: Page) {
  return page.getByRole('heading', { name: /^test course$/i }).first();
}

export function studioUpdatedSynopsisHeading(page: Page) {
  return page.getByRole('heading', { name: /^updated test course$/i }).first();
}

export const MOCK_CHAT_RESPONSE_TEXT =
  'Here is the updated course synopsis with your changes applied.\n\n' +
  `${JSON.stringify(buildE2eValidSynopsis())}\n\n` +
  'I moved the pronunciation module to position 2 and updated the key phrases in Module 1 as requested.';

export const VALID_STUDIO_CHAT_BODY = {
  messages: [{ role: 'user' as const, content: 'Move Module 2 to position 3' }],
  currentSynopsis: buildE2eValidSynopsis({ courseTitle: 'Test Course', module1Title: 'Module 1' }),
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

/** AI SDK UI message stream (SSE) for mocked POST /api/studio/chat. */
export function buildMockChatUiMessageSse(text: string): string {
  const textPartId = 'text-e2e-1';
  const chunks = [
    { type: 'start' },
    { type: 'start-step' },
    { type: 'text-start', id: textPartId },
    { type: 'text-delta', id: textPartId, delta: text },
    { type: 'text-end', id: textPartId },
    { type: 'finish-step' },
    { type: 'finish', finishReason: 'stop' },
  ];
  return chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('');
}

export async function mockStudioChat(
  page: Page,
  options?: { delayMs?: number; text?: string; status?: number },
): Promise<void> {
  const text = options?.text ?? MOCK_CHAT_RESPONSE_TEXT;
  const status = options?.status ?? 200;
  const body = buildMockChatUiMessageSse(text);
  const delayMs = options?.delayMs ?? 0;

  await page.route('**/api/studio/chat', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    await route.fulfill({
      status,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'x-vercel-ai-ui-message-stream': 'v1',
      },
      body,
    });
  });
}

export async function reachStudioSynopsisStep(page: Page): Promise<void> {
  await mockStudioNewWizardApis(page);
  await mockStudioBrainstorm(page);
  await gotoStudio(page, STUDIO_NEW, { mockApis: false });
  skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');
  await saveStudioDraftFromIntake(page);
  await expect(studioLooksGoodButton(page)).toBeEnabled({ timeout: 25_000 });
}

export function studioRefinementChatPanel(page: Page) {
  return page.getByRole('heading', { name: /refinement chat|chat tinh chỉnh/i });
}

export function studioRefinementChatInput(page: Page) {
  return page.locator('#refinement-chat-input');
}

export function studioRefinementChatSendButton(page: Page) {
  return page.getByRole('button', { name: /^send$|^gửi$/i });
}

export function studioRefinementTypingIndicator(page: Page) {
  return page.getByText(/ai is refining|ai đang tinh chỉnh/i);
}

/** @deprecated Step 3 is now GenerationProgress — use studioGenerationHeading */
export function studioStep3Placeholder(page: Page) {
  return studioGenerationHeading(page);
}

export function studioGenerationHeading(page: Page) {
  return page.getByRole('heading', { name: /generating your course|đang tạo khóa học/i });
}

export function studioGenerationProgressBar(page: Page) {
  return page.locator('.h-3.rounded-full.bg-surface').first();
}

export function studioGenerationViewCourseLink(page: Page) {
  return page.getByRole('link', { name: /view course|xem khóa học/i });
}

export function studioGenerationTryAgainButton(page: Page) {
  return page.getByRole('button', { name: /try again|thử lại/i });
}

export function studioLessonDoneCheckmarks(page: Page) {
  return page.locator('.bg-success.text-white').filter({ hasText: '✓' });
}

export function studioLessonSpinners(page: Page) {
  return page.locator('.border-primary.border-t-transparent.animate-spin');
}

/** Track POST /api/studio/generate from the wizard. */
export function trackStudioGeneratePosts(page: Page): string[] {
  const posts: string[] = [];
  page.on('request', (req) => {
    if (req.method() === 'POST' && /\/api\/studio\/generate/.test(req.url())) {
      posts.push(req.url());
    }
  });
  return posts;
}

export async function mockStudioGenerate(
  page: Page,
  options?: { body?: string; status?: number; delayMs?: number },
): Promise<void> {
  const body = options?.body ?? MOCK_GENERATE_NDJSON;
  const status = options?.status ?? 200;
  const delayMs = options?.delayMs ?? 0;

  await page.route('**/api/studio/generate', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    await route.fulfill({
      status,
      headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
      body,
    });
  });
}

/** Stream generate NDJSON with delay between events (browser fetch stub — incremental UI). */
export async function mockStudioGenerateStreaming(
  page: Page,
  options?: { delayBetweenEventsMs?: number; includeComplete?: boolean },
): Promise<void> {
  const delayBetweenEventsMs = options?.delayBetweenEventsMs ?? 100;
  const includeComplete = options?.includeComplete !== false;

  const events: Record<string, unknown>[] = [
    { type: 'start', totalLessons: 3, totalModules: 1 },
    { type: 'module_start', moduleIndex: 1, moduleTitle: 'Updated Module 1' },
    { type: 'lesson_start', moduleIndex: 1, lessonIndex: 1 },
    { type: 'lesson_done', moduleIndex: 1, lessonIndex: 1 },
    { type: 'lesson_start', moduleIndex: 1, lessonIndex: 2 },
    { type: 'lesson_done', moduleIndex: 1, lessonIndex: 2 },
    { type: 'lesson_start', moduleIndex: 1, lessonIndex: 3 },
    { type: 'lesson_done', moduleIndex: 1, lessonIndex: 3 },
  ];
  if (includeComplete) {
    events.push({ type: 'complete', courseId: MOCK_GENERATE_COURSE_ID });
  }

  await page.addInitScript(
    ({ serializedEvents, delayMs }) => {
      const generateEvents = JSON.parse(serializedEvents) as Record<string, unknown>[];
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (url.includes('/api/studio/generate') && init?.method === 'POST') {
          const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
              const encoder = new TextEncoder();
              for (const event of generateEvents) {
                if (delayMs > 0) {
                  await new Promise((resolve) => setTimeout(resolve, delayMs));
                }
                controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
              }
              controller.close();
            },
          });
          return new Response(stream, {
            status: 200,
            headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
          });
        }
        return originalFetch(input, init);
      };
    },
    { serializedEvents: JSON.stringify(events), delayMs: delayBetweenEventsMs },
  );
}

export async function mockStudioWizardApis(page: Page): Promise<void> {
  await mockStudioNewWizardApis(page);
  await mockStudioBrainstorm(page);
  await mockStudioChat(page);
  await mockStudioGenerate(page);
}

export async function reachStudioGenerationStep(
  page: Page,
  options?: {
    streamingGenerate?: boolean;
    streamDelayMs?: number;
    streamIncludeComplete?: boolean;
  },
): Promise<void> {
  await mockStudioNewWizardApis(page);
  await mockStudioBrainstorm(page);
  await mockStudioChat(page);
  if (options?.streamingGenerate) {
    await mockStudioGenerateStreaming(page, {
      delayBetweenEventsMs: options.streamDelayMs ?? 100,
      includeComplete: options.streamIncludeComplete ?? true,
    });
  } else {
    await mockStudioGenerate(page);
  }
  await gotoStudio(page, STUDIO_NEW, { mockApis: false });
  skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');
  await saveStudioDraftFromIntake(page);
  await expect(studioLooksGoodButton(page)).toBeEnabled({ timeout: 25_000 });
  await studioLooksGoodButton(page).click();
  await expect(studioGenerationHeading(page)).toBeVisible({ timeout: 15_000 });
}

export async function advanceStudioToGenerationStep(page: Page): Promise<void> {
  await reachStudioSynopsisStep(page);
  await studioLooksGoodButton(page).click();
  await expect(studioGenerationHeading(page)).toBeVisible({ timeout: 15_000 });
}

// ─── Studio course + media queue (bugs 239–248) ─────────────────────────────

export type MockStudioVideoQueueItem = {
  id: string;
  creator_id: string | null;
  course_id: string | null;
  step_id: string | null;
  media_type: 'video_request';
  script: string;
  provider: 'manual';
  status: 'pending' | 'submitted' | 'complete';
  provider_job_id: string | null;
  output_url: string | null;
  error: string | null;
  creator_notes: string | null;
  created_at: string;
  updated_at: string;
  step_title: string | null;
  step_order_index: number | null;
  lesson_title: string | null;
  lesson_order_index: number | null;
  module_title: string | null;
  module_order_index: number | null;
};

export function buildMockPendingVideoItem(
  overrides?: Partial<MockStudioVideoQueueItem>,
): MockStudioVideoQueueItem {
  return {
    id: MOCK_VIDEO_QUEUE_ID,
    creator_id: 'e2e-creator-id',
    course_id: MOCK_STUDIO_COURSE_ID,
    step_id: 'e2e-step-id',
    media_type: 'video_request',
    script: 'E2E AI script for manual video production request.',
    provider: 'manual',
    status: 'pending',
    provider_job_id: null,
    output_url: null,
    error: null,
    creator_notes: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    step_title: 'Video step',
    step_order_index: 1,
    lesson_title: 'Lesson 1',
    lesson_order_index: 1,
    module_title: 'Module 1',
    module_order_index: 1,
    ...overrides,
  };
}

export function buildMockStudioCourseTwoModulesPayload(options?: {
  courseId?: string;
  courseTitle?: string;
  videoItems?: MockStudioVideoQueueItem[];
  reviewStatus?: string;
  reviewNotes?: string | null;
  slug?: string | null;
  submittedAt?: string | null;
}) {
  const courseId = options?.courseId ?? E2E_OVERVIEW_COURSE_ID;
  const modules = [1, 2].map((orderIndex) => ({
    id: `e2e-module-${orderIndex}`,
    course_id: courseId,
    title: `Module ${orderIndex}`,
    order_index: orderIndex,
    nursed_lessons: Array.from({ length: 8 }, (_, lessonIdx) => ({
      id: `e2e-lesson-m${orderIndex}-${lessonIdx + 1}`,
      module_id: `e2e-module-${orderIndex}`,
      title: `Lesson ${lessonIdx + 1}`,
      order_index: lessonIdx + 1,
    })),
  }));

  const videoItems =
    options?.videoItems ??
    [
      buildMockPendingVideoItem({
        id: 'e2e-video-1',
        course_id: courseId,
        script: 'First video script for E2E media production.',
        module_title: 'Module 1',
        lesson_title: 'Lesson 1',
      }),
      buildMockPendingVideoItem({
        id: 'e2e-video-2',
        course_id: courseId,
        script: 'Second video script for E2E media production.',
        module_title: 'Module 2',
        lesson_title: 'Lesson 2',
        module_order_index: 2,
        lesson_order_index: 2,
      }),
    ];

  return {
    course: {
      id: courseId,
      title: options?.courseTitle ?? 'E2E Two-Module Course',
      creator_id: 'e2e-creator-id',
      review_status: options?.reviewStatus ?? 'draft',
      review_notes: options?.reviewNotes ?? null,
      slug: options?.slug ?? null,
      submitted_at: options?.submittedAt ?? null,
      nursed_modules: modules,
    },
    stats: { totalModules: 2, totalLessons: 16, totalSteps: 32 },
    videoItems,
    statusCounts: {
      pending: videoItems.filter((item) => item.status === 'pending').length,
      submitted: videoItems.filter((item) => item.status === 'submitted').length,
      complete: videoItems.filter((item) => item.status === 'complete').length,
    },
  };
}

export function buildMockStudioCoursePayload(options?: {
  courseId?: string;
  courseTitle?: string;
  videoItems?: MockStudioVideoQueueItem[];
  reviewStatus?: string;
  reviewNotes?: string | null;
  slug?: string | null;
  submittedAt?: string | null;
}) {
  const courseId = options?.courseId ?? MOCK_STUDIO_COURSE_ID;
  const videoItems = options?.videoItems ?? [];
  return {
    course: {
      id: courseId,
      title: options?.courseTitle ?? 'E2E Studio Course',
      creator_id: 'e2e-creator-id',
      review_status: options?.reviewStatus ?? 'draft',
      review_notes: options?.reviewNotes ?? null,
      slug: options?.slug ?? null,
      submitted_at: options?.submittedAt ?? null,
      nursed_modules: [
        {
          id: 'e2e-module-id',
          course_id: courseId,
          title: 'Module 1',
          order_index: 1,
          nursed_lessons: [
            {
              id: 'e2e-lesson-id',
              module_id: 'e2e-module-id',
              title: 'Lesson 1',
              order_index: 1,
            },
          ],
        },
      ],
    },
    stats: { totalModules: 1, totalLessons: 1, totalSteps: 3 },
    videoItems,
    statusCounts: {
      pending: videoItems.filter((item) => item.status === 'pending').length,
      submitted: videoItems.filter((item) => item.status === 'submitted').length,
      complete: videoItems.filter((item) => item.status === 'complete').length,
    },
  };
}

export async function mockStudioCourseApi(
  page: Page,
  options?: {
    courseId?: string;
    status?: number;
    error?: string;
    payload?: ReturnType<typeof buildMockStudioCoursePayload>;
  },
): Promise<void> {
  const courseId = options?.courseId ?? MOCK_STUDIO_COURSE_ID;
  await page.route(`**/api/studio/courses/${courseId}`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    const status = options?.status ?? 200;
    if (status !== 200) {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: options?.error ?? 'Not found' }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: options?.payload ?? buildMockStudioCoursePayload({ courseId }),
      }),
    });
  });
}

export async function gotoStudioCourse(
  page: Page,
  courseId: string,
  options?: {
    mockCourse?: boolean;
    payload?: ReturnType<typeof buildMockStudioCoursePayload>;
    courseStatus?: number;
    courseError?: string;
  },
): Promise<void> {
  if (options?.mockCourse !== false) {
    await mockStudioCourseApi(page, {
      courseId,
      payload: options?.payload,
      status: options?.courseStatus,
      error: options?.courseError,
    });
  }
  await gotoStudio(page, `/studio/${courseId}`, { mockApis: true });
}

export function studioCourseOverviewTab(page: Page) {
  return page.getByRole('button', { name: /^overview$|^tổng quan$/i });
}

export function studioCourseMediaTab(page: Page) {
  return page.getByRole('button', { name: /media production|sản xuất media/i });
}

export function studioCourseBackLink(page: Page) {
  return page.getByRole('link', { name: /back to studio|về studio|quay lại studio/i });
}

export function studioVideoRequestSubmitButton(page: Page) {
  return page.getByRole('button', { name: /submit video request|gửi yêu cầu video/i });
}

export function studioVideoRequestCharacterField(page: Page) {
  return page.getByPlaceholder(/professional nurse in blue scrubs|điều dưỡng mặc áo xanh|vd:.*điều dưỡng/i);
}

export function studioVideoRequestSceneField(page: Page) {
  return page.getByPlaceholder(/hospital corridor|hành lang bệnh viện|vd:.*hành lang/i);
}

// ─── Studio review workflow (bugs 259–266) ───────────────────────────────────

export function studioReviewValidateButton(page: Page) {
  return page.getByRole('button', { name: /validate content|kiểm tra nội dung/i });
}

export function studioReviewSubmitButton(page: Page) {
  return page.getByRole('button', { name: /submit for review|gửi duyệt/i });
}

export function studioReviewDraftHeading(page: Page) {
  return page.getByRole('heading', {
    name: /your course is ready for review|khóa học đã sẵn sàng để gửi duyệt/i,
  });
}

export async function mockStudioCourseValidate(
  page: Page,
  options: {
    courseId?: string;
    data?: {
      valid: boolean;
      issueCount: number;
      issues?: Array<{
        stepId: string;
        stepType: string;
        lessonTitle: string;
        moduleTitle: string;
        field: string;
        reason: string;
      }>;
      totalSteps?: number;
    };
    status?: number;
    error?: string;
  },
): Promise<void> {
  const courseId = options.courseId ?? MOCK_STUDIO_COURSE_ID;
  const data = options.data ?? { valid: true, issueCount: 0, issues: [], totalSteps: 3 };
  await page.route(`**/api/studio/courses/${courseId}/validate`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    const status = options.status ?? 200;
    if (status !== 200) {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: options.error ?? 'Forbidden' }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data }),
    });
  });
}

export async function mockStudioCourseSubmit(
  page: Page,
  options?: {
    courseId?: string;
    status?: number;
    body?: Record<string, unknown>;
    onPost?: () => void;
  },
): Promise<void> {
  const courseId = options?.courseId ?? MOCK_STUDIO_COURSE_ID;
  await page.route(`**/api/studio/courses/${courseId}/submit`, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    options?.onPost?.();
    await route.fulfill({
      status: options?.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(options?.body ?? { success: true }),
    });
  });
}

export async function mockAdminReviewQueue(
  page: Page,
  courses: typeof MOCK_PENDING_REVIEW_COURSE[] = [MOCK_PENDING_REVIEW_COURSE],
): Promise<void> {
  await page.route('**/api/admin/courses/review-queue', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: courses }),
    });
  });
}

export async function mockAdminCourseReview(
  page: Page,
  courseId: string,
  options?: {
    onPost?: (body: { action?: string; review_notes?: string }) => void;
    response?: Record<string, unknown>;
    status?: number;
  },
): Promise<void> {
  await page.route(`**/api/admin/courses/${courseId}/review`, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    const body = route.request().postDataJSON() as { action?: string; review_notes?: string };
    options?.onPost?.(body);
    await route.fulfill({
      status: options?.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(
        options?.response ?? { success: true, reviewStatus: 'published' },
      ),
    });
  });
}

export async function mockAdminPendingCount(
  page: Page,
  count: number,
  options?: { status?: number },
): Promise<void> {
  await page.route('**/api/admin/courses/pending-count', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: options?.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({ count }),
    });
  });
}
