export type Lang = 'vi' | 'en';

import en from './en.json' assert { type: 'json' };
import vi from './vi.json' assert { type: 'json' };
export { fullEn, fullVi } from './mobile';

const dict: Record<Lang, Record<string, any>> = { en, vi } as const;

export function createI18n(initial: Lang = 'vi') {
  let lang: Lang = initial;
  const get = () => lang;
  const set = (l: Lang) => (lang = l);
  const t = (key: string, fallback?: string): string => {
    const parts = key.split('.');
    let cur: any = dict[lang];
    for (const p of parts) {
      cur = cur?.[p];
      if (cur === undefined) break;
    }
    if (typeof cur === 'string') return cur;
    return fallback ?? key;
  };
  return { t, get, set };
}

// Browser/localStorage persistence helper (no RN dependency here)
export function loadPersistedLang(defaultLang: Lang = 'vi'): Lang {
  try {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('lang');
      if (saved === 'vi' || saved === 'en') return saved;
    }
  } catch {}
  return defaultLang;
}

export function persistLang(l: Lang) {
  try { if (typeof window !== 'undefined') window.localStorage.setItem('lang', l); } catch {}
}

export { en, vi };


