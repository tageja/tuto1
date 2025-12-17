"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../../contexts/I18nContext";
import { motion } from "framer-motion";
import { School, CheckCircle2, Users, Clock } from "lucide-react";
import { getPlatformStats } from "../../lib/homeData";

export default function LiveKpis() {
  const { t } = useI18n();
  const [data, setData] = useState({
    schools_count: 120,
    homework_completion_rate: 94,
    parent_engagement_rate: 88,
    attendance_rate: 98.5
  });

  useEffect(() => {
    getPlatformStats().then(stats => {
      if (stats) setData(stats);
    });
  }, []);

  const stats = [
    { 
      label: t("landing.kpis.schoolsTrusted"), 
      value: `${data.schools_count}+`, 
      icon: School,
      color: "text-blue-600"
    },
    { 
      label: t("landing.kpis.homeworkCompletion"), 
      value: `${data.homework_completion_rate}%+`, 
      icon: CheckCircle2,
      color: "text-green-600"
    },
    { 
      label: t("landing.kpis.parentEngagement"), 
      value: `${data.parent_engagement_rate}%+`, 
      icon: Users,
      color: "text-purple-600"
    },
    { 
      label: t("landing.kpis.attendanceRate"), 
      value: `${data.attendance_rate}%`, 
      icon: Clock,
      color: "text-amber-600"
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-3 text-gray-600 text-sm font-medium">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.label}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {t("landing.kpis.liveUpdate")}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
