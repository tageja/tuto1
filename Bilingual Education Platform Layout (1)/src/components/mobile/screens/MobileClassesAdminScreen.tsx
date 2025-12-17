import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { MobileStatsCard } from "../MobileStatsCard";
import { ClassCard } from "../ClassCard";
import { School, Users, PieChart, TrendingUp, Search, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export function MobileClassesAdminScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  // Mock data
  const classes = [
    {
      id: 1,
      grade: 5,
      className: "5A",
      teacher: undefined,
      studentsCount: 0,
      studentsCapacity: 25,
      room: "R402",
      status: "Active" as const,
    },
    {
      id: 2,
      grade: 5,
      className: "5B",
      teacher: undefined,
      studentsCount: 0,
      studentsCapacity: 25,
      room: "R403",
      status: "Active" as const,
    },
    {
      id: 3,
      grade: 6,
      className: "6A",
      teacher: undefined,
      studentsCount: 0,
      studentsCapacity: 30,
      room: "R404",
      status: "Active" as const,
    },
    {
      id: 4,
      grade: 6,
      className: "6B",
      teacher: undefined,
      studentsCount: 7,
      studentsCapacity: 30,
      room: "R302",
      status: "Active" as const,
    },
    {
      id: 5,
      grade: 7,
      className: "7A",
      teacher: undefined,
      studentsCount: 7,
      studentsCapacity: 28,
      room: "R401",
      status: "Active" as const,
    },
    {
      id: 6,
      grade: 8,
      className: "8A",
      teacher: undefined,
      studentsCount: 5,
      studentsCapacity: 28,
      room: "R401",
      status: "Active" as const,
    },
  ];

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.teacher &&
        cls.teacher.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGrade =
      gradeFilter === "all" || cls.grade.toString() === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  // Calculate total students
  const totalStudents = classes.reduce(
    (sum, cls) => sum + cls.studentsCount,
    0
  );
  const totalCapacity = classes.reduce(
    (sum, cls) => sum + cls.studentsCapacity,
    0
  );
  const capacityPercentage = Math.round((totalStudents / totalCapacity) * 100);

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-gray-900 dark:text-white">
              {t("Classes", "Lớp học")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t(
                "Manage classes, view student rosters, and track class performance",
                "Quản lý lớp học, xem danh sách học sinh và theo dõi hiệu suất lớp"
              )}
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
            title={t("Total Classes", "Tổng lớp học")}
            value={classes.length}
            icon={School}
          />
          <MobileStatsCard
            title={t("Total Students", "Tổng học sinh")}
            value={totalStudents}
            icon={Users}
          />
          <MobileStatsCard
            title={t("Capacity", "Công suất")}
            value={`${capacityPercentage}%`}
            icon={PieChart}
          />
          <MobileStatsCard
            title={t("Avg Attendance", "Điểm danh TB")}
            value="0%"
            icon={TrendingUp}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder={t("All Grades", "Tất cả khối")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Grades", "Tất cả khối")}</SelectItem>
              <SelectItem value="5">{t("Grade 5", "Khối 5")}</SelectItem>
              <SelectItem value="6">{t("Grade 6", "Khối 6")}</SelectItem>
              <SelectItem value="7">{t("Grade 7", "Khối 7")}</SelectItem>
              <SelectItem value="8">{t("Grade 8", "Khối 8")}</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <Input
              placeholder={t("Search classes...", "Tìm lớp học...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 dark:text-gray-400">
          {t(
            `Showing ${filteredClasses.length} classes`,
            `Hiển thị ${filteredClasses.length} lớp học`
          )}
        </p>

        {/* Class Cards */}
        <div className="space-y-3 pb-20">
          {filteredClasses.map((cls) => (
            <ClassCard
              key={cls.id}
              grade={cls.grade}
              className={cls.className}
              teacher={cls.teacher}
              studentsCount={cls.studentsCount}
              studentsCapacity={cls.studentsCapacity}
              room={cls.room}
              status={cls.status}
              onViewDetails={() => console.log(`View details: ${cls.className}`)}
            />
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t("No classes found", "Không tìm thấy lớp học")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
