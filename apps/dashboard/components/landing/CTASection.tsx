"use client";

import { useI18n } from "../../contexts/I18nContext";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";

export default function CTASection() {
  const { t } = useI18n();

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left: Open App */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">{t("landing.ctaSection.openApp")}</h2>
              <p className="text-blue-100 mb-8 max-w-md text-lg leading-relaxed">
                {t("landing.ctaSection.openAppDesc")}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/feed"
                  className="px-6 py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                  {t("landing.cta.exploreNow")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/find-teacher"
                  className="px-6 py-3 bg-blue-500/30 border-2 border-blue-400/50 text-white rounded-xl font-bold hover:bg-blue-500/40 transition-colors"
                >
                  {t("landing.cta.findTeachers")}
                </Link>
              </div>
            </div>
          </div>

          {/* Right: School PaaS */}
          <div className="bg-gray-900 rounded-3xl p-10 text-white relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">{t("landing.ctaSection.runSchool")}</h2>
              <p className="text-gray-300 mb-8 max-w-md text-lg leading-relaxed">
                {t("landing.ctaSection.runSchoolDesc")}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/school"
                  className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg"
                >
                  {t("landing.cta.openDashboard")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/contact"
                  className="px-6 py-3 bg-gray-800 border-2 border-gray-700 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t("landing.cta.talkToSales")}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

