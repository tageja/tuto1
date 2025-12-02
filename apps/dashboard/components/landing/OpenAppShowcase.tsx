"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "../../contexts/I18nContext";
import { demoFeed, demoNearby } from "../../lib/demoData";
import FiltersBar from "./FiltersBar";
import { MapPin, Star, ArrowRight } from "lucide-react";

export default function OpenAppShowcase() {
  const { t } = useI18n();

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Public Feed */}
          <div className="lg:col-span-5 space-y-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t("landing.openApp.highlightsTitle")}</h2>
                <Link href="/feed" className="text-primary font-semibold flex items-center gap-1 hover:underline">
                  {t("landing.openApp.viewAll")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-gray-600">{t("landing.openApp.highlightsSubtitle")}</p>
            </div>
            
            <div className="space-y-6">
              {demoFeed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 w-full bg-gray-200">
                    {/* Placeholder for image if not exists */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                      [Image: {item.title}]
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-text mb-2">{item.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium">News</span>
                      <span>• 2h ago</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Nearby Teachers */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t("landing.openApp.nearbyTitle")}</h2>
                  <Link href="/find-teacher" className="text-primary font-semibold hover:underline">
                    {t("landing.cta.findTeachers")}
                  </Link>
                </div>
                <p className="text-gray-600">{t("landing.openApp.nearbySubtitle")}</p>
              </div>

              <FiltersBar />

              <div className="p-6 grid sm:grid-cols-2 gap-4">
                {demoNearby.map((tutor, i) => (
                  <motion.div
                    key={tutor.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="p-4 rounded-xl border border-gray-100 bg-surface hover:border-primary/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {tutor.name[0]}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                        <Star className="w-4 h-4 fill-current" />
                        4.9
                      </div>
                    </div>
                    <h3 className="font-bold text-text group-hover:text-primary transition-colors">{tutor.name}</h3>
                    <p className="text-sm text-text-muted mb-3">{tutor.subject}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {tutor.distanceKm}km
                      </div>
                      <div className="font-medium text-text">
                        {tutor.price.toLocaleString()}₫/h
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                 <Link href="/find-teacher" className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
                    {t("landing.openApp.viewMore")}
                 </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

