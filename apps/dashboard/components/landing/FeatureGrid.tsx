"use client";

import { useI18n } from "../../contexts/I18nContext";
import { motion } from "framer-motion";
import { 
  CalendarCheck, BookOpen, Trophy, TrendingUp, 
  HeartPulse, Pill, Image as ImageIcon, CreditCard 
} from "lucide-react";

export default function FeatureGrid() {
  const { t } = useI18n();

  const features = [
    { id: 'attendance', icon: CalendarCheck, label: t('landing.features.attendance'), color: 'text-blue-500 bg-blue-50' },
    { id: 'homework', icon: BookOpen, label: t('landing.features.homework'), color: 'text-indigo-500 bg-indigo-50' },
    { id: 'events', icon: Trophy, label: t('landing.features.events'), color: 'text-amber-500 bg-amber-50' },
    { id: 'progress', icon: TrendingUp, label: t('landing.features.progress'), color: 'text-purple-500 bg-purple-50' },
    { id: 'health', icon: HeartPulse, label: t('landing.features.health'), color: 'text-rose-500 bg-rose-50' },
    { id: 'medicine', icon: Pill, label: t('landing.features.medicine'), color: 'text-pink-500 bg-pink-50' },
    { id: 'photos', icon: ImageIcon, label: t('landing.features.photos'), color: 'text-cyan-500 bg-cyan-50' },
    { id: 'payments', icon: CreditCard, label: t('landing.features.payments'), color: 'text-emerald-500 bg-emerald-50' },
  ];

  return (
    <section className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("landing.features.title")}</h2>
          <p className="text-xl text-gray-600">{t("landing.features.subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center text-center group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{feature.label}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

