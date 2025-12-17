import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { TeacherCard } from "../TeacherCard";
import { Search } from "lucide-react";
import { Input } from "../../ui/input";

export function MobileTeachersParentScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - parent view shows only their child's teachers
  const teachers = [
    {
      id: 1,
      name: "Mr. Hoang Van Tuan",
      qualification: "Bachelor of History",
      subjects: ["History", "Geography"],
      email: "tuan.hoang@tutodemo.edu.vn",
      phone: "+84 98 777 8888",
      avatarColor: "#6366F1",
    },
    {
      id: 2,
      name: "Mr. Le Van Minh",
      qualification: "Bachelor of Arts in English",
      subjects: ["English", "Literature"],
      email: "minh.le@tutodemo.edu.vn",
      phone: "+84 98 333 4444",
      avatarColor: "#0B5FFF",
    },
    {
      id: 3,
      name: "Mrs. Tran Thi Lan",
      qualification: "Master of Education",
      subjects: ["Math", "Science"],
      email: "lan.tran@tutodemo.edu.vn",
      phone: "+84 98 111 2222",
      avatarColor: "#8B5CF6",
    },
    {
      id: 4,
      name: "Ms. Pham Thi Hoa",
      qualification: "PhD in Mathematics Education",
      subjects: ["Math", "Physics"],
      email: "hoa.pham@tutodemo.edu.vn",
      phone: "+84 98 555 6666",
      avatarColor: "#EC4899",
    },
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-4 pb-4">
        <h1 className="text-gray-900 dark:text-white mb-1">
          {t("Teachers", "Giáo viên")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("View your child's teachers", "Xem giáo viên của con bạn")}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
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
              avatarColor={teacher.avatarColor}
              onViewProfile={() => console.log(`View profile: ${teacher.name}`)}
            />
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t("No teachers found", "Không tìm thấy giáo viên")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
