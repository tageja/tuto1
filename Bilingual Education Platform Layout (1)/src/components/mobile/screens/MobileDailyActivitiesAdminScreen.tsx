import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { MobileStatsCard } from "../MobileStatsCard";
import { ActivityCard } from "../ActivityCard";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";

export function MobileDailyActivitiesAdminScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [classFilter, setClassFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - empty state for now
  const activities: any[] = [];

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || activity.className === classFilter;
    const matchesType = typeFilter === "all" || activity.type === typeFilter;
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter;
    return matchesSearch && matchesClass && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-gray-900 dark:text-white">
              {t("Daily Activities", "Hoạt động hàng ngày")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("Track daily activities, meals, and learning progress", "Theo dõi hoạt động, bữa ăn và tiến độ học tập")}
            </p>
          </div>
          <Button size="icon" className="bg-[#0B5FFF] hover:bg-[#0949CC]">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatsCard
            title={t("Total Activities", "Tổng hoạt động")}
            value={0}
            icon={Activity}
          />
          <MobileStatsCard
            title={t("Completed", "Hoàn thành")}
            value={0}
            icon={CheckCircle}
          />
          <MobileStatsCard
            title={t("In Progress", "Đang thực hiện")}
            value={0}
            icon={Clock}
          />
          <MobileStatsCard
            title={t("Pending", "Chờ xử lý")}
            value={0}
            icon={AlertCircle}
          />
        </div>

        {/* Date Picker */}
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <SelectValue placeholder={t("Select Date", "Chọn ngày")} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t("Today", "Hôm nay")}</SelectItem>
            <SelectItem value="yesterday">{t("Yesterday", "Hôm qua")}</SelectItem>
            <SelectItem value="thisweek">{t("This Week", "Tuần này")}</SelectItem>
            <SelectItem value="custom">{t("Custom Date", "Chọn ngày")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder={t("Class", "Lớp học")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Classes", "Tất cả lớp")}</SelectItem>
              <SelectItem value="class-a">{t("Class A", "Lớp A")}</SelectItem>
              <SelectItem value="class-b">{t("Class B", "Lớp B")}</SelectItem>
              <SelectItem value="class-c">{t("Class C", "Lớp C")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder={t("Activity Type", "Loại hoạt động")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Types", "Tất cả")}</SelectItem>
              <SelectItem value="meal">{t("Meal", "Bữa ăn")}</SelectItem>
              <SelectItem value="nap">{t("Nap", "Ngủ trưa")}</SelectItem>
              <SelectItem value="learning">{t("Learning", "Học tập")}</SelectItem>
              <SelectItem value="play">{t("Play", "Chơi")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white dark:bg-gray-800">
            <SelectValue placeholder={t("Status", "Trạng thái")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Status", "Tất cả")}</SelectItem>
            <SelectItem value="completed">{t("Completed", "Hoàn thành")}</SelectItem>
            <SelectItem value="in-progress">{t("In Progress", "Đang thực hiện")}</SelectItem>
            <SelectItem value="pending">{t("Pending", "Chờ xử lý")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("Search activities...", "Tìm kiếm hoạt động...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-800"
          />
        </div>

        {/* Empty State */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 dark:text-white mb-2">
            {t("No Activities Found", "Không có hoạt động nào")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t(
              "There are no daily activities recorded for the selected filters. Start tracking activities to see them here.",
              "Không có hoạt động nào được ghi nhận với bộ lọc đã chọn. Bắt đầu theo dõi hoạt động để xem chúng ở đây."
            )}
          </p>
          <Button className="bg-[#0B5FFF] hover:bg-[#0949CC]">
            <Plus className="w-4 h-4 mr-2" />
            {t("Add Activity", "Thêm hoạt động")}
          </Button>
        </div>

        {/* Activities List (when data exists) */}
        {filteredActivities.length > 0 && (
          <div className="space-y-3 pb-20">
            {filteredActivities.map((activity: any) => (
              <ActivityCard
                key={activity.id}
                title={activity.title}
                type={activity.type}
                className={activity.className}
                date={activity.date}
                time={activity.time}
                status={activity.status}
                description={activity.description}
                onClick={() => console.log(`View activity: ${activity.title}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
