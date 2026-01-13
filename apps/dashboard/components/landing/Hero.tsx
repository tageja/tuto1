"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "../../contexts/I18nContext";
import { ArrowRight, School, Users, Search } from "lucide-react";

export default function Hero() {
  const { t } = useI18n();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-surface to-blue-50/50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.h1 
            variants={item}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight"
          >
            {t("landing.hero.title")}
          </motion.h1>
          <motion.p 
            variants={item}
            className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
          >
            {t("landing.hero.subtitle")}
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Families Card */}
          <motion.div
            variants={item}
            className="bg-white p-10 rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100 hover:border-primary/20 transition-all group"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("landing.hero.familiesTitle")}</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{t("landing.hero.familiesDesc")}</p>
            
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/find-teacher" 
                className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                {t("landing.cta.findTeachers")}
                <Search className="w-4 h-4" />
              </Link>
              <Link 
                href="/find-school" 
                className="flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                {t("landing.nav.findSchool")}
                <School className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Schools Card */}
          <motion.div
            variants={item}
            className="bg-white p-10 rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100 hover:border-primary/20 transition-all group"
          >
            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
              <School className="w-7 h-7 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("landing.hero.schoolsTitle")}</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{t("landing.hero.schoolsDesc")}</p>
            
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/school" 
                className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-semibold hover:border-primary hover:text-primary transition-all"
              >
                {t("landing.cta.openDashboard")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => document.getElementById('school-code-modal')?.showModal()}
                className="flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                {t("landing.cta.enterSchoolCode")}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

