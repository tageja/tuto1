import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import {
  User,
  Bell,
  Lock,
  Globe,
  Moon,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  GraduationCap,
  Shield,
  Smartphone,
} from "lucide-react";

export function MobileSettingsScreen() {
  const { t, language, toggleLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const settingsSections = [
    {
      id: "account",
      title: t("Account", "Tài khoản"),
      items: [
        {
          id: "profile",
          label: t("Profile Settings", "Cài đặt hồ sơ"),
          icon: User,
          action: "navigate",
        },
        {
          id: "school",
          label: t("School Information", "Thông tin trường"),
          icon: GraduationCap,
          action: "navigate",
          badge: "Sunrise School",
        },
        {
          id: "security",
          label: t("Security & Privacy", "Bảo mật & Riêng tư"),
          icon: Shield,
          action: "navigate",
        },
      ],
    },
    {
      id: "preferences",
      title: t("Preferences", "Tùy chọn"),
      items: [
        {
          id: "language",
          label: t("Language", "Ngôn ngữ"),
          icon: Globe,
          action: "toggle",
          value: language === "en" ? "English" : "Tiếng Việt",
          onToggle: toggleLanguage,
        },
        {
          id: "darkmode",
          label: t("Dark Mode", "Chế độ tối"),
          icon: Moon,
          action: "switch",
          value: darkMode,
          onToggle: () => {
            setDarkMode(!darkMode);
            document.documentElement.classList.toggle("dark");
          },
        },
        {
          id: "notifications",
          label: t("Notifications", "Thông báo"),
          icon: Bell,
          action: "switch",
          value: notifications,
          onToggle: () => setNotifications(!notifications),
        },
        {
          id: "push",
          label: t("Push Notifications", "Thông báo đẩy"),
          icon: Smartphone,
          action: "switch",
          value: pushNotifications,
          onToggle: () => setPushNotifications(!pushNotifications),
        },
      ],
    },
    {
      id: "support",
      title: t("Support", "Hỗ trợ"),
      items: [
        {
          id: "help",
          label: t("Help Center", "Trung tâm trợ giúp"),
          icon: HelpCircle,
          action: "navigate",
        },
        {
          id: "about",
          label: t("About Tuto", "Về Tuto"),
          icon: Info,
          action: "navigate",
          badge: "v2.0.1",
        },
        {
          id: "privacy",
          label: t("Privacy Policy", "Chính sách bảo mật"),
          icon: Lock,
          action: "navigate",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">
          {t("Settings", "Cài đặt")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("Manage your account and preferences", "Quản lý tài khoản và tùy chọn")}
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-[#0B5FFF] to-[#6366F1] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-white">
            <AvatarImage src="" />
            <AvatarFallback className="bg-white text-[#0B5FFF]">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="mb-1">Admin User</h3>
            <p className="opacity-90">admin@sunrise-school.edu</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-white/20 text-white border-white/30">
            {t("Administrator", "Quản trị viên")}
          </Badge>
          <Badge className="bg-white/20 text-white border-white/30">
            {t("Premium", "Cao cấp")}
          </Badge>
        </div>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <div key={section.id}>
          <h3 className="text-gray-900 dark:text-white mb-3">
            {section.title}
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {section.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`${
                    index !== section.items.length - 1
                      ? "border-b border-gray-200 dark:border-gray-700"
                      : ""
                  }`}
                >
                  {item.action === "switch" ? (
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-[#0B5FFF]" />
                        </div>
                        <span className="text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                      </div>
                      <Switch
                        checked={item.value as boolean}
                        onCheckedChange={item.onToggle}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={item.onToggle}
                      className="w-full flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-[#0B5FFF]" />
                        </div>
                        <span className="text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="text-gray-500">{item.badge}</span>
                        )}
                        {item.value && typeof item.value === "string" && (
                          <span className="text-gray-500">{item.value}</span>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <Button
        variant="destructive"
        className="w-full gap-2"
        size="lg"
      >
        <LogOut className="w-5 h-5" />
        {t("Logout", "Đăng xuất")}
      </Button>

      {/* App Info */}
      <div className="text-center text-gray-500 pb-4">
        <p className="mb-1">Tuto Education Platform</p>
        <p>learn • connect • grow</p>
        <p className="mt-2">© 2025 Tuto. All rights reserved.</p>
      </div>
    </div>
  );
}
