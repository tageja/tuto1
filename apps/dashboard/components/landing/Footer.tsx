"use client";

import { useI18n } from "../../contexts/I18nContext";
import { useAuth } from "../../contexts/AuthContext";
import { schoolLink } from "../../lib/routeBuilder";
import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";

export default function Footer() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();

  const isSchoolUser = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'parent';
  const schoolId = user?.schoolIds?.[0];

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Image src="/images/tuto-logo.png" alt="tuto." width={100} height={34} className="mb-6" />
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {t("landing.hero.subtitle")}
            </p>
            
            <div className="flex items-center gap-4">
               {/* Lang Switcher */}
              <button 
                onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
              >
                <Globe className="w-4 h-4" />
                {lang === 'vi' ? 'Tiếng Việt' : 'English'}
              </button>
            </div>
          </div>

          {/* Links 1: Platform */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">{t("landing.footer.platform")}</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link href="/find-teacher" className="hover:text-primary transition-colors">{t("landing.nav.findTeacher")}</Link></li>
              <li><Link href="/feed" className="hover:text-primary transition-colors">{t("landing.footer.communityFeed")}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">{t("landing.footer.aboutUs")}</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">{t("landing.footer.careers")}</Link></li>
            </ul>
          </div>

          {/* Links 2: For Schools (or Quick Access if Logged in) */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">
              {isSchoolUser ? t("landing.footer.quickAccess") : t("landing.hero.schoolsTitle")}
            </h4>
            <ul className="space-y-4 text-sm text-gray-600">
              {isSchoolUser && schoolId ? (
                <>
                  <li><Link href={schoolLink(undefined, schoolId)} className="hover:text-primary transition-colors font-semibold text-primary">{t("landing.nav.dashboard")}</Link></li>
                  <li><Link href={schoolLink('/schedule', schoolId)} className="hover:text-primary transition-colors">{t("landing.nav.mySchedule")}</Link></li>
                  <li><Link href={schoolLink('/messages', schoolId)} className="hover:text-primary transition-colors">{t("landing.nav.messages")}</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/schools" className="hover:text-primary transition-colors">{t("landing.footer.features")}</Link></li>
                  <li><Link href="/pricing" className="hover:text-primary transition-colors">{t("landing.footer.pricing")}</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition-colors">{t("landing.footer.contactSales")}</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Links 3: Legal & Help */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">{t("landing.footer.support")}</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link href="/help" className="hover:text-primary transition-colors">{t("landing.footer.helpCenter")}</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-primary transition-colors">{t("landing.footer.privacyPolicy")}</Link></li>
              <li><Link href="/legal/terms" className="hover:text-primary transition-colors">{t("landing.footer.termsOfService")}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t("landing.footer.contactUs")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} tuto. Education. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Facebook</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Twitter</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

