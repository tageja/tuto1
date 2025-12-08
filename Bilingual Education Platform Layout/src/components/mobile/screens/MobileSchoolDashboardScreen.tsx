import { useLanguage } from "../../LanguageContext";
import { MobileStatsCard } from "../MobileStatsCard";
import { InsightSection } from "../InsightSection";
import { AnnouncementCard } from "../AnnouncementCard";
import { HomeworkCard } from "../HomeworkCard";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  DollarSign,
  Megaphone,
  BookOpen,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function MobileSchoolDashboardScreen() {
  const { t } = useLanguage();

  const attendanceData = [
    { name: t("Mon", "T2"), present: 240, absent: 10 },
    { name: t("Tue", "T3"), present: 235, absent: 15 },
    { name: t("Wed", "T4"), present: 245, absent: 5 },
    { name: t("Thu", "T5"), present: 238, absent: 12 },
    { name: t("Fri", "T6"), present: 242, absent: 8 },
  ];

  const announcements = [
    {
      id: 1,
      title: t("Parent-Teacher Meeting", "Họp phụ huynh - giáo viên"),
      description: t(
        "Scheduled for next week, Friday 3 PM",
        "Dự kiến vào tuần sau, Thứ 6 lúc 3 giờ chiều"
      ),
      date: "2025-10-26",
      author: "Principal Johnson",
      priority: "high" as const,
    },
    {
      id: 2,
      title: t("School Holiday Notice", "Thông báo nghỉ học"),
      description: t(
        "School will be closed on November 1st",
        "Trường nghỉ ngày 1 tháng 11"
      ),
      date: "2025-10-28",
      author: "Administration",
      priority: "medium" as const,
    },
  ];

  const upcomingHomework = [
    {
      id: 1,
      subject: t("Mathematics", "Toán"),
      className: "Grade 3A",
      dueDate: "2025-10-27",
      status: "pending" as const,
    },
    {
      id: 2,
      subject: t("English", "Tiếng Anh"),
      className: "Grade 4B",
      dueDate: "2025-10-28",
      status: "pending" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0B5FFF] to-[#6366F1] rounded-2xl p-6 text-white -mx-4">
        <h1 className="mb-2">
          {t("Sunrise International School", "Trường Quốc tế Sunrise")}
        </h1>
        <p className="opacity-90">
          {t("Friday, October 24, 2025", "Thứ Sáu, 24 tháng 10, 2025")}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Badge className="bg-white/20 text-white border-white/30">
            {t("Academic Year", "Năm học")} 2025-2026
          </Badge>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div>
        <h3 className="text-gray-900 dark:text-white mb-4">
          {t("Quick Overview", "Tổng quan nhanh")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <MobileStatsCard
            title={t("Total Students", "Tổng số học sinh")}
            value="1,245"
            icon={Users}
            trend={{ value: 5.2, label: t("vs last month", "so với tháng trước") }}
          />
          <MobileStatsCard
            title={t("Active Teachers", "Giáo viên")}
            value="87"
            icon={GraduationCap}
            trend={{ value: 2.1, label: t("vs last month", "so với tháng trước") }}
          />
          <MobileStatsCard
            title={t("Attendance Rate", "Tỷ lệ điểm danh")}
            value="96.2%"
            icon={ClipboardCheck}
            trend={{ value: 1.5, label: t("this week", "tuần này") }}
          />
          <MobileStatsCard
            title={t("Fee Collection", "Thu học phí")}
            value="92%"
            icon={DollarSign}
            subtitle={t("of total", "tổng số")}
          />
        </div>
      </div>

      {/* Weekly Attendance Chart */}
      <Card className="p-4">
        <h3 className="text-gray-900 dark:text-white mb-4">
          {t("Weekly Attendance", "Điểm danh tuần")}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Latest Announcements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#0B5FFF]" />
            <h3 className="text-gray-900 dark:text-white">
              {t("Latest Announcements", "Thông báo mới")}
            </h3>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            {t("View All", "Xem tất cả")}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} {...announcement} />
          ))}
        </div>
      </div>

      {/* Upcoming Homework */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0B5FFF]" />
            <h3 className="text-gray-900 dark:text-white">
              {t("Upcoming Homework", "Bài tập sắp tới")}
            </h3>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            {t("View All", "Xem tất cả")}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {upcomingHomework.map((hw) => (
            <HomeworkCard key={hw.id} {...hw} />
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#0B5FFF]" />
          <h3 className="text-gray-900 dark:text-white">
            {t("AI Insights", "Phân tích AI")}
          </h3>
        </div>
        <div className="space-y-3">
          <InsightSection
            title={t("AI Attendance Insights", "Phân tích điểm danh AI")}
            insights={[
              t(
                "Attendance rate increased by 2.3% this week",
                "Tỷ lệ điểm danh tăng 2.3% tuần này"
              ),
              t(
                "Grade 3A shows the highest attendance at 98.5%",
                "Lớp 3A có tỷ lệ cao nhất 98.5%"
              ),
              t(
                "Predicted attendance for next week: 96.8%",
                "Dự đoán điểm danh tuần sau: 96.8%"
              ),
            ]}
            defaultExpanded={true}
          />

          <InsightSection
            title={t("Adaptive Learning Summary", "Tổng quan học thích ứng")}
            insights={[
              t(
                "75% of students show improved performance",
                "75% học sinh cải thiện kết quả"
              ),
              t(
                "Math exercises need difficulty adjustment",
                "Bài tập toán cần điều chỉnh độ khó"
              ),
              t(
                "Personalized content ready for 120 students",
                "Nội dung cá nhân hóa cho 120 học sinh"
              ),
            ]}
            comingSoon
          />
        </div>
      </div>
    </div>
  );
}
