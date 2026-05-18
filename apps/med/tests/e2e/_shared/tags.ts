/**
 * Test tag taxonomy.
 *
 * Every spec should declare ONE layer tag, ONE module tag, and N concern tags.
 * Use tags in test names: test('...', { tag: [TAG.smoke, TAG.module1, TAG.nav] })
 *
 * Run filtered:  npm run test:e2e -- --grep @smoke
 *                npm run test:e2e -- --grep "@module-1.*@i18n"
 */

export const TAG = {
  // ---- Layer (pick exactly one) ----
  smoke: '@smoke',
  regression: '@regression',
  happyPath: '@happy-path',
  exploration: '@exploration',

  // ---- Concern (pick all that apply) ----
  a11y: '@a11y',
  content: '@content',
  state: '@state',
  nav: '@nav',
  i18n: '@i18n',
  visual: '@visual',
  data: '@data',
  auth: '@auth',
  audio: '@audio',

  // ---- Module scope (pick exactly one) ----
  module1: '@module-1',
  module2: '@module-2',
  module3: '@module-3',
  module4: '@module-4',
  module5: '@module-5',
  module6: '@module-6',
  module7: '@module-7',
  module8: '@module-8',
  module9: '@module-9',
  module10: '@module-10',
  module11: '@module-11',
  module12: '@module-12',
  crossCutting: '@cross-cutting',
} as const;

/** Helper to build a per-bug tag like @bug-11 */
export const bugTag = (id: number | string): string => `@bug-${id}`;
