import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { MobileStatsCard } from "../MobileStatsCard";
import { TeacherCard } from "../TeacherCard";
import { Users, UserCheck, UserX, Star, Search, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export function MobileTeachersAdminScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Mock data
  const teachers = [
    {
      id: 1,
      name: "Mr. Hoang Van Tuan",
      qualification: "Bachelor of History",
      subjects: ["History"],
      email: "tuan.hoang@tutodemo.edu.vn",
      phone: "+84 98 777 8888",
      status: "Active" as const,
      avatarColor: "#6366F1",
    },
    {
      id: 2,
      name: "Mr. Le Van Minh",
      qualification: "Bachelor of Arts in English",
      subjects: ["English"],
      email: "minh.le@tutodemo.edu.vn",
      phone: "+84 98 333 4444",
      status: "Active" as const,
      avatarColor: "#0B5FFF",
    },
    {
      id: 3,
      name: "Mrs. Tran Thi Lan",
      qualification: "Master of Education",
      subjects: ["Math", "Science"],
      email: "lan.tran@tutodemo.edu.vn",
      phone: "+84 98 111 2222",
      status: "Active" as const,
      avatarColor: "#8B5CF6",
    },
    {
      id: 4,
      name: "Ms. Pham Thi Hoa",
      qualification: "PhD in Mathematics Education",
      subjects: ["Math", "Physics"],
      email: "hoa.pham@tutodemo.edu.vn",
      phone: "+84 98 555 6666",
      status: "Active" as const,
      avatarColor: "#EC4899",
    },
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || teacher.status.toLowerCase() === statusFilter;
    const matchesSubject =
      subjectFilter === "all" ||
      teacher.subjects.some((s) => s.toLowerCase() === subjectFilter);
    return matchesSearch && matchesStatus && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-gray-900 dark:text-white">
              {t("Teachers", "Giáo viên")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("Manage teacher profiles and assignments", "Quản lý hồ sơ giáo viên và phân công")}
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
            title={t("Total Teachers", "Tổng giáo viên")}
            value={4}
            icon={Users}
          />
          <MobileStatsCard
            title={t("Active", "Đang hoạt động")}
            value={4}
            icon={UserCheck}
          />
          <MobileStatsCard
            title={t("On Leave", "Nghỉ phép")}
            value={0}
            icon={UserX}
          />
          <MobileStatsCard
            title={t("Average Rating", "Đánh giá TB")}
            value="N/A"
            icon={Star}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("Search teachers by name...", "Tìm giáo viên theo tên...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-800"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder={t("Status", "Trạng thái")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All", "Tất cả")}</SelectItem>
              <SelectItem value="active">{t("Active", "Đang hoạt động")}</SelectItem>
              <SelectItem value="on leave">{t("On Leave", "Nghỉ phép")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder={t("Subject", "Môn học")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Subjects", "Tất cả môn")}</SelectItem>
              <SelectItem value="history">{t("History", "Lịch sử")}</SelectItem>
              <SelectItem value="english">{t("English", "Tiếng Anh")}</SelectItem>
              <SelectItem value="math">{t("Math", "Toán")}</SelectItem>
              <SelectItem value="science">{t("Science", "Khoa học")}</SelectItem>
              <SelectItem value="physics">{t("Physics", "Vật lý")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 dark:text-gray-400">
          {t(`Showing ${filteredTeachers.length} results`, `Hiển thị ${filteredTeachers.length} kết quả`)}
        </p>

        {/* Teacher Cards */}
        <div className="space-y-3 pb-20">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              name={teacher.name}
              qualification={teacher.qualification}
              subjects={teacher.subjects}
              email={teacher.email}
              phone={teacher.phone}
              status={teacher.status}
              avatarColor={teacher.avatarColor}
              onViewProfile={() => console.log(`View profile: ${teacher.name}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
