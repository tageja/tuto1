"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useI18n } from "../../contexts/I18nContext";
import { schoolLink } from "../../lib/routeBuilder";
import Link from "next/link";
import { ShieldCheck, GraduationCap, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function RoleGateway() {
  const { t } = useI18n();
  const { user } = useAuth();

  const roles = [
    {
      id: "admin",
      title: t("landing.roles.admin.title"),
      desc: t("landing.roles.admin.desc"),
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-600",
      action: () => document.getElementById('school-code-modal')?.showModal(),
      link: user?.schoolIds?.[0] ? schoolLink(undefined, user.schoolIds[0]) : undefined
    },
    {
      id: "teacher",
      title: t("landing.roles.teacher.title"),
      desc: t("landing.roles.teacher.desc"),
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-600",
      action: () => document.getElementById('teacher-request-modal')?.showModal(),
      // If teacher is logged in and assigned, could link directly
      link: undefined 
    },
    {
      id: "parent",
      title: t("landing.roles.parent.title"),
      desc: t("landing.roles.parent.desc"),
      icon: Users,
      color: "bg-green-50 text-green-600",
      link: user?.schoolIds?.[0] ? schoolLink('/parent/homework', user.schoolIds[0]) : '/login'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("landing.roles.title")}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("landing.roles.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-surface rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all text-center"
            >
              <div className={`w-16 h-16 rounded-2xl ${role.color} mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <role.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{role.title}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">{role.desc}</p>
              
              {role.link ? (
                <Link 
                  href={role.link}
                  className="inline-block w-full py-3 px-6 rounded-xl bg-white border-2 border-gray-200 text-gray-900 font-bold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm"
                >
                  {t("landing.roles.accessPortal")}
                </Link>
              ) : (
                <button
                  onClick={() => role.action && role.action()}
                  className="w-full py-3 px-6 rounded-xl bg-white border-2 border-gray-200 text-gray-900 font-bold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm"
                >
                  {t("landing.roles.getAccess")}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

