import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { HomeworkCard } from "../HomeworkCard";
import { Button } from "../../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../../ui/sheet";
import { Plus, Filter, BookOpen } from "lucide-react";
import { Badge } from "../../ui/badge";

export function MobileHomeworkScreen() {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const homeworkData = [
    {
      id: 1,
      subject: t("Mathematics", "Toán"),
      className: "Grade 3A",
      dueDate: "2025-10-27",
      status: "pending" as const,
      description: t(
        "Complete exercises 1-10 from Chapter 5",
        "Hoàn thành bài tập 1-10 từ Chương 5"
      ),
    },
    {
      id: 2,
      subject: t("English", "Tiếng Anh"),
      className: "Grade 4B",
      dueDate: "2025-10-28",
      status: "pending" as const,
      description: t(
        "Write a short essay about your favorite season",
        "Viết một bài văn ngắn về mùa yêu thích của bạn"
      ),
    },
    {
      id: 3,
      subject: t("Science", "Khoa học"),
      className: "Grade 5A",
      dueDate: "2025-10-29",
      status: "completed" as const,
      description: t(
        "Complete the water cycle diagram",
        "Hoàn thành sơ đồ chu trình nước"
      ),
    },
    {
      id: 4,
      subject: t("History", "Lịch sử"),
      className: "Grade 3A",
      dueDate: "2025-10-25",
      status: "graded" as const,
      description: t(
        "Read Chapter 3 and answer questions",
        "Đọc Chương 3 và trả lời câu hỏi"
      ),
    },
    {
      id: 5,
      subject: t("Art", "Mỹ thuật"),
      className: "Grade 4B",
      dueDate: "2025-10-30",
      status: "pending" as const,
      description: t(
        "Create a landscape drawing using watercolors",
        "Vẽ tranh phong cảnh bằng màu nước"
      ),
    },
    {
      id: 6,
      subject: t("Mathematics", "Toán"),
      className: "Grade 5A",
      dueDate: "2025-10-26",
      status: "completed" as const,
      description: t(
        "Solve word problems on page 45",
        "Giải bài toán có lời văn trang 45"
      ),
    },
  ];

  const filteredData = homeworkData.filter((hw) => {
    const matchesClass = selectedClass === "all" || hw.className === selectedClass;
    const matchesStatus = statusFilter === "all" || hw.status === statusFilter;
    return matchesClass && matchesStatus;
  });

  const stats = {
    pending: homeworkData.filter((h) => h.status === "pending").length,
    completed: homeworkData.filter((h) => h.status === "completed").length,
    graded: homeworkData.filter((h) => h.status === "graded").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            {t("Homework", "Bài tập")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("Manage student assignments", "Quản lý bài tập học sinh")}
          </p>
        </div>
        <Button size="icon" className="rounded-full">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-4 text-center border border-orange-200 dark:border-orange-800">
          <p className="text-orange-600 dark:text-orange-400 mb-1">
            {stats.pending}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {t("Pending", "Đang chờ")}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
          <p className="text-green-600 dark:text-green-400 mb-1">
            {stats.completed}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {t("Done", "Hoàn thành")}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
          <p className="text-blue-600 dark:text-blue-400 mb-1">
            {stats.graded}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {t("Graded", "Đã chấm")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {/* Status Filter */}
        <div className="flex-1">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t("All", "Tất cả")}</TabsTrigger>
              <TabsTrigger value="pending">
                {t("Pending", "Chờ")}
                <Badge variant="secondary" className="ml-1">
                  {stats.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">{t("Done", "Xong")}</TabsTrigger>
              <TabsTrigger value="graded">{t("Graded", "Chấm")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Class Filter */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[300px]">
            <SheetHeader>
              <SheetTitle>{t("Filter by Class", "Lọc theo lớp")}</SheetTitle>
              <SheetDescription>
                {t("Select a class to filter homework", "Chọn lớp để lọc bài tập")}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {["all", "Grade 3A", "Grade 4B", "Grade 5A"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedClass === cls
                      ? "bg-[#0B5FFF] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  {cls === "all" ? t("All Classes", "Tất cả lớp") : cls}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Homework List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0B5FFF]" />
            <h3 className="text-gray-900 dark:text-white">
              {t("Assignments", "Danh sách bài tập")}
            </h3>
          </div>
          <span className="text-gray-600 dark:text-gray-400">
            {filteredData.length} {t("items", "mục")}
          </span>
        </div>

        {filteredData.length > 0 ? (
          <div className="space-y-3">
            {filteredData.map((hw) => (
              <HomeworkCard
                key={hw.id}
                subject={hw.subject}
                className={hw.className}
                dueDate={hw.dueDate}
                status={hw.status}
                description={hw.description}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("No homework found", "Không có bài tập nào")}
            </p>
            <p className="text-gray-500">
              {t("Try adjusting your filters", "Thử điều chỉnh bộ lọc")}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-gray-900 dark:text-white mb-3">
          {t("Quick Actions", "Thao tác nhanh")}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            {t("New Assignment", "Tạo mới")}
          </Button>
          <Button variant="outline" className="gap-2">
            <BookOpen className="w-4 h-4" />
            {t("Grade Work", "Chấm bài")}
          </Button>
        </div>
      </div>
    </div>
  );
}