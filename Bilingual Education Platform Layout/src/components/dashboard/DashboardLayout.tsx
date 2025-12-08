import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  MessageSquare,
  Image,
  Users,
  GraduationCap,
  ClipboardList,
  BookOpen,
  TrendingUp,
  CalendarDays,
  CreditCard,
  Heart,
  Trophy,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { LanguageToggle } from "../LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

interface DashboardLayoutProps {
  children: ReactNode;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  userRole?: "admin" | "parent";
  onRoleSwitch?: () => void;
}

export function DashboardLayout({
  children,
  currentScreen,
  onNavigate,
  userRole = "admin",
}: DashboardLayoutProps) {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
  };

  const adminMenuItems = [
    {
      id: "dashboard",
      label: t("Dashboard", "Tổng quan"),
      icon: LayoutDashboard,
    },
    {
      id: "activities",
      label: t("Daily Activities", "Hoạt động hàng ngày"),
      icon: Calendar,
    },
    {
      id: "announcements",
      label: t("Announcements", "Thông báo"),
      icon: Megaphone,
    },
    { id: "messages", label: t("Messages", "Tin nhắn"), icon: MessageSquare },
    {
      id: "albums",
      label: t("Photo Albums", "Album ảnh"),
      icon: Image,
    },
    { id: "classes", label: t("Classes", "Lớp học"), icon: Users },
    {
      id: "teachers",
      label: t("Teachers", "Giáo viên"),
      icon: GraduationCap,
    },
    {
      id: "attendance",
      label: t("Attendance", "Điểm danh"),
      icon: ClipboardList,
    },
    { id: "homework", label: t("Homework", "Bài tập"), icon: BookOpen },
    {
      id: "progress",
      label: t("Progress Reports", "Báo cáo tiến độ"),
      icon: TrendingUp,
    },
    { id: "events", label: t("Events", "Sự kiện"), icon: CalendarDays },
    { id: "payments", label: t("Payments", "Thanh toán"), icon: CreditCard },
    { id: "health", label: t("Health", "Sức khỏe"), icon: Heart },
    {
      id: "extracurricular",
      label: t("Extracurricular", "Ngoại khóa"),
      icon: Trophy,
    },
    { id: "settings", label: t("Settings", "Cài đặt"), icon: Settings },
  ];

  const parentMenuItems = [
    {
      id: "dashboard",
      label: t("Dashboard", "Tổng quan"),
      icon: LayoutDashboard,
    },
    {
      id: "messages",
      label: t("Messages & Announcements", "Tin nhắn & Thông báo"),
      icon: MessageSquare,
    },
    {
      id: "attendance",
      label: t("Attendance", "Điểm danh"),
      icon: ClipboardList,
    },
    { id: "progress", label: t("Progress", "Tiến độ"), icon: TrendingUp },
    {
      id: "homework",
      label: t("Homework & Exercises", "Bài tập"),
      icon: BookOpen,
    },
    { id: "payments", label: t("Payments", "Thanh toán"), icon: CreditCard },
    { id: "health", label: t("Health", "Sức khỏe"), icon: Heart },
    { id: "settings", label: t("Settings", "Cài đặt"), icon: Settings },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : parentMenuItems;

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-[#0F172A]">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-700 z-30">
        <div className="flex items-center justify-between h-full px-4 gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            {/* School Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("Sunrise International School", "Trường Quốc tế Sunrise")}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  {t("Sunrise International School", "Trường Quốc tế Sunrise")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t("Join Another School", "Tham gia trường khác")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Airtable Sync Badge */}
            <Badge variant="secondary" className="hidden md:flex gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t("Synced 2 min ago", "Đã đồng bộ 2 phút trước")}
            </Badge>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t("Search...", "Tìm kiếm...")}
                className="pl-10"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            <LanguageToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">
                    {userRole === "admin" ? "Admin" : t("Parent", "Phụ huynh")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  {t("Profile", "Hồ sơ")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t("Switch to", "Chuyển sang")}{" "}
                  {userRole === "admin"
                    ? t("Parent View", "Chế độ phụ huynh")
                    : t("Admin View", "Chế độ quản trị")}
                </DropdownMenuItem>
                <DropdownMenuItem>{t("Logout", "Đăng xuất")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-[#1E293B] border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-20 transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-1">
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

        {/* Tuto Logo & Tagline at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E293B]">
          <div className="text-center">
            <p className="text-[#0B5FFF]">Tuto</p>
            <p className="text-gray-500">learn • connect • grow</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all ${
          sidebarOpen ? "lg:pl-64" : "pl-0"
        }`}
      >
        <div className="p-6">{children}</div>
      </main>

      {/* Footer */}
      <footer
        className={`bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-700 py-4 transition-all ${
          sidebarOpen ? "lg:pl-64" : "pl-0"
        }`}
      >
        <div className="px-6 text-center text-gray-600 dark:text-gray-400">
          © 2025 Tuto Education Platform • learn • connect • grow
        </div>
      </footer>
    </div>
  );
}
