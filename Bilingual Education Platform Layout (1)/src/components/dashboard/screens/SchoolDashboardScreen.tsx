import { useLanguage } from "../../LanguageContext";
import { StatsCard } from "../StatsCard";
import { AIInsightPanel } from "../AIInsightPanel";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  CalendarDays,
  DollarSign,
  Star,
  TrendingUp,
  Megaphone,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

export function SchoolDashboardScreen() {
  const { t } = useLanguage();
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  const attendanceData = [
    { name: t("Mon", "T2"), present: 240, absent: 10 },
    { name: t("Tue", "T3"), present: 235, absent: 15 },
    { name: t("Wed", "T4"), present: 245, absent: 5 },
    { name: t("Thu", "T5"), present: 238, absent: 12 },
    { name: t("Fri", "T6"), present: 242, absent: 8 },
  ];

  const pieData = [
    { name: t("Present", "Có mặt"), value: 1200, color: "#10b981" },
    { name: t("Absent", "Vắng"), value: 50, color: "#ef4444" },
  ];

  const announcements = [
    {
      id: 1,
      title: t(
        "Parent-Teacher Meeting",
        "Họp phụ huynh - giáo viên"
      ),
      date: "2025-10-26",
      priority: "high",
      description: t(
        "Scheduled for next week, Friday 3 PM",
        "Dự kiến vào tuần sau, Thứ 6 lúc 3 giờ chiều"
      ),
    },
    {
      id: 2,
      title: t("School Holiday Notice", "Thông báo nghỉ học"),
      date: "2025-10-28",
      priority: "medium",
      description: t(
        "School will be closed on November 1st",
        "Trường nghỉ ngày 1 tháng 11"
      ),
    },
    {
      id: 3,
      title: t("New Lunch Menu", "Thực đơn mới"),
      date: "2025-10-25",
      priority: "low",
      description: t(
        "Updated menu available on website",
        "Thực đơn cập nhật trên website"
      ),
    },
  ];

  const messages = [
    {
      id: 1,
      from: "Ms. Nguyen",
      subject: t("Grade 3 Field Trip", "Chuyến đi thực tế lớp 3"),
      preview: t(
        "Permission slips due by Friday...",
        "Giấy phép cần nộp trước thứ 6..."
      ),
      unread: true,
    },
    {
      id: 2,
      from: "Mr. Tran",
      subject: t("Math Competition Results", "Kết quả thi toán"),
      preview: t(
        "Congratulations to all participants...",
        "Chúc mừng các em đã tham gia..."
      ),
      unread: true,
    },
  ];

  const upcomingHomework = [
    {
      id: 1,
      subject: t("Mathematics", "Toán"),
      class: "Grade 3A",
      dueDate: "2025-10-27",
      status: "pending",
    },
    {
      id: 2,
      subject: t("English", "Tiếng Anh"),
      class: "Grade 4B",
      dueDate: "2025-10-28",
      status: "pending",
    },
    {
      id: 3,
      subject: t("Science", "Khoa học"),
      class: "Grade 5A",
      dueDate: "2025-10-29",
      status: "completed",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0B5FFF] to-[#6366F1] rounded-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2">
              {t("Sunrise International School", "Trường Quốc tế Sunrise")}
            </h1>
            <p className="opacity-90">
              {t(
                "Friday, October 24, 2025",
                "Thứ Sáu, 24 tháng 10, 2025"
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="opacity-90 mb-1">
              {t("Academic Year", "Năm học")}
            </p>
            <p>2025-2026</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title={t("Total Students", "Tổng số học sinh")}
          value="1,245"
          icon={Users}
          trend={{ value: 5.2, label: t("vs last month", "so với tháng trước") }}
        />
        <StatsCard
          title={t("Active Teachers", "Giáo viên")}
          value="87"
          icon={GraduationCap}
          trend={{ value: 2.1, label: t("vs last month", "so với tháng trước") }}
        />
        <StatsCard
          title={t("Attendance Rate", "Tỷ lệ điểm danh")}
          value="96.2%"
          icon={ClipboardCheck}
          trend={{ value: 1.5, label: t("this week", "tuần này") }}
        />
        <StatsCard
          title={t("Upcoming Events", "Sự kiện sắp tới")}
          value="12"
          icon={CalendarDays}
        />
        <StatsCard
          title={t("Fee Collection", "Thu học phí")}
          value="92%"
          icon={DollarSign}
          subtitle={t("of total", "tổng số")}
        />
        <StatsCard
          title={t("Average Rating", "Đánh giá TB")}
          value="4.7"
          icon={Star}
          subtitle={t("out of 5.0", "trên 5.0")}
        />
      </div>

      {/* Chart Area */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 dark:text-white">
            {t("Weekly Attendance Overview", "Tổng quan điểm danh tuần")}
          </h3>
          <div className="flex gap-2">
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
            >
              {t("Bar", "Cột")}
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
            >
              {t("Line", "Đường")}
            </Button>
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("pie")}
            >
              {t("Pie", "Tròn")}
            </Button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartType === "bar" && (
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name={t("Present", "Có mặt")} />
              <Bar dataKey="absent" fill="#ef4444" name={t("Absent", "Vắng")} />
            </BarChart>
          )}
          {chartType === "line" && (
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="present"
                stroke="#10b981"
                strokeWidth={2}
                name={t("Present", "Có mặt")}
              />
              <Line
                type="monotone"
                dataKey="absent"
                stroke="#ef4444"
                strokeWidth={2}
                name={t("Absent", "Vắng")}
              />
            </LineChart>
          )}
          {chartType === "pie" && (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </Card>

      {/* 3-Column Layout: Announcements, Messages, Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements Widget */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#0B5FFF]" />
              <h3 className="text-gray-900 dark:text-white">
                {t("Latest Announcements", "Thông báo mới")}
              </h3>
            </div>
            <Button variant="ghost" size="sm">
              {t("View All", "Xem tất cả")}
            </Button>
          </div>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-gray-900 dark:text-white flex-1">
                    {announcement.title}
                  </p>
                  <Badge
                    variant={
                      announcement.priority === "high"
                        ? "destructive"
                        : announcement.priority === "medium"
                          ? "default"
                          : "secondary"
                    }
                    className="ml-2"
                  >
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {announcement.description}
                </p>
                <p className="text-gray-500">{announcement.date}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Messages Widget */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0B5FFF]" />
              <h3 className="text-gray-900 dark:text-white">
                {t("Messages", "Tin nhắn")}
              </h3>
              <Badge variant="destructive">2</Badge>
            </div>
            <Button variant="ghost" size="sm">
              {t("View All", "Xem tất cả")}
            </Button>
          </div>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 border rounded-lg cursor-pointer ${
                  message.unread
                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-gray-900 dark:text-white">
                    {message.from}
                  </p>
                  {message.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                <p className="text-gray-900 dark:text-white mb-1">
                  {message.subject}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {message.preview}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Homework */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0B5FFF]" />
              <h3 className="text-gray-900 dark:text-white">
                {t("Upcoming Homework", "Bài tập sắp tới")}
              </h3>
            </div>
            <Button variant="ghost" size="sm">
              {t("View All", "Xem tất cả")}
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingHomework.map((hw) => (
              <div
                key={hw.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-gray-900 dark:text-white">{hw.subject}</p>
                  <Badge
                    variant={hw.status === "completed" ? "default" : "secondary"}
                  >
                    {hw.status === "completed"
                      ? t("Done", "Hoàn thành")
                      : t("Pending", "Đang chờ")}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {hw.class}
                </p>
                <p className="text-gray-500">
                  {t("Due:", "Hạn:")} {hw.dueDate}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsightPanel
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
        />

        <AIInsightPanel
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
  );
}
