// Bridge that re-exports the mobile app translations so the web dashboard
// can share the exact same dictionary without duplication.
// This file has no React Native dependency; it only re-exports JSON objects.

// Relative import to the mobile app's source translations
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { translations } from '../../../src/translations/index.ts';

export const fullEn = translations.en;
export const fullVi = translations.vi;








