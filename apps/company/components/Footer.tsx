'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-on-surface text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <span className="font-bold text-lg text-white">tuto.</span>
          <p className="text-gray-400 mt-2">{t('footer.tagline')}</p>
        </div>
        <div>
          <p className="font-semibold mb-3 text-gray-300">{t('footer.products')}</p>
          <ul className="space-y-2 text-gray-400">
            <li><a href="https://tuto.asia" className="hover:text-white transition-colors">tuto.asia</a></li>
            <li><a href="https://school.tuto.asia" className="hover:text-white transition-colors">school.tuto.asia</a></li>
            <li><a href="https://pro.tuto.asia" className="hover:text-white transition-colors">pro.tuto.asia</a></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3 text-gray-300">{t('footer.company')}</p>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/terms"   className="hover:text-white transition-colors">{t('nav.terms')}</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">{t('nav.privacy')}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3 text-gray-300">{t('nav.contact')}</p>
          <a href="mailto:hello@tuto.asia" className="text-gray-400 hover:text-white transition-colors">hello@tuto.asia</a>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} Tuto Global. All rights reserved.
      </div>
    </footer>
  );
}
