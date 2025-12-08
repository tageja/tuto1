import { ReactNode } from "react";
import {
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  ClipboardList,
  BookOpen,
  CreditCard,
  Settings,
  Bell,
  Menu,
  GraduationCap,
} from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { LanguageToggle } from "../LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Badge } from "../ui/badge";

interface MobileDashboardLayoutProps {
  children: ReactNode;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  userRole?: "admin" | "parent";
}

export function MobileDashboardLayout({
  children,
  currentScreen,
  onNavigate,
  userRole = "admin",
}: MobileDashboardLayoutProps) {
  const { t } = useLanguage();

  const bottomNavItems = [
    {
      id: "dashboard",
      label: t("Home", "Trang chủ"),
      icon: LayoutDashboard,
    },
    {
      id: "announcements",
      label: t("News", "Tin tức"),
      icon: Megaphone,
    },
    {
      id: "messages",
      label: t("Messages", "Tin nhắn"),
      icon: MessageSquare,
      badge: 2,
    },
    {
      id: "attendance",
      label: t("Attendance", "Điểm danh"),
      icon: ClipboardList,
    },
  ];

  const menuItems = [
    {
      id: "dashboard",
      label: t("Dashboard", "Tổng quan"),
      icon: LayoutDashboard,
    },
    {
      id: "announcements",
      label: t("Announcements", "Thông báo"),
      icon: Megaphone,
    },
    {
      id: "messages",
      label: t("Messages", "Tin nhắn"),
      icon: MessageSquare,
    },
    {
      id: "attendance",
      label: t("Attendance", "Điểm danh"),
      icon: ClipboardList,
    },
    {
      id: "homework",
      label: t("Homework", "Bài tập"),
      icon: BookOpen,
    },
    {
      id: "payments",
      label: t("Payments", "Thanh toán"),
      icon: CreditCard,
    },
    {
      id: "settings",
      label: t("Settings", "Cài đặt"),
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-[#0F172A] pb-16">
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#0B5FFF]" />
                  <span className="text-[#0B5FFF]">Tuto</span>
                </SheetTitle>
              </SheetHeader>
              
              {/* User Profile */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-[#0B5FFF]">
                      {userRole === "admin" ? "AD" : "PH"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-gray-900 dark:text-white">
                      {userRole === "admin" ? "Admin User" : t("Parent", "Phụ huynh")}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("Sunrise School", "Trường Sunrise")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="mt-6 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#0B5FFF] text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Bottom Branding */}
              <div className="absolute bottom-4 left-4 right-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-[#0B5FFF]">Tuto</p>
                  <p className="text-gray-500">learn • connect • grow</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Center: School Name */}
          <div className="flex-1 text-center">
            <p className="text-gray-900 dark:text-white truncate">
              {t("Sunrise School", "Trường Sunrise")}
            </p>
          </div>

          {/* Right: Notifications & Language */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <LanguageToggle />
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="px-4 pb-2">
          <Badge variant="secondary" className="gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {t("Synced 2 min ago", "Đã đồng bộ 2 phút trước")}
          </Badge>
        </div>
      </div>

      {/* Main Content with top padding */}
      <main className="pt-24 px-4 pb-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center min-w-[60px] h-full gap-1 active:scale-95 transition-transform"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-[#0B5FFF]"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  />
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <span>{item.badge}</span>
                    </div>
                  )}
                </div>
                <span
                  className={`${
                    isActive
                      ? "text-[#0B5FFF]"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}