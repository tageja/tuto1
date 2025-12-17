import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { AttendanceListItem } from "../AttendanceListItem";
import { MobileStatsCard } from "../MobileStatsCard";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Calendar } from "../../ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Calendar as CalendarIcon,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export function MobileAttendanceScreen() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState("all");

  const attendanceData = [
    {
      id: 1,
      studentName: "Nguyen Van A",
      class: "Grade 3A",
      status: "present" as const,
      time: "08:15",
      date: "2025-10-24",
    },
    {
      id: 2,
      studentName: "Tran Thi B",
      class: "Grade 3A",
      status: "present" as const,
      time: "08:10",
      date: "2025-10-24",
    },
    {
      id: 3,
      studentName: "Le Van C",
      class: "Grade 3A",
      status: "late" as const,
      time: "08:45",
      date: "2025-10-24",
    },
    {
      id: 4,
      studentName: "Pham Thi D",
      class: "Grade 4B",
      status: "absent" as const,
      time: "-",
      date: "2025-10-24",
    },
    {
      id: 5,
      studentName: "Hoang Van E",
      class: "Grade 4B",
      status: "present" as const,
      time: "08:05",
      date: "2025-10-24",
    },
    {
      id: 6,
      studentName: "Vo Thi F",
      class: "Grade 5A",
      status: "present" as const,
      time: "08:20",
      date: "2025-10-24",
    },
  ];

  const stats = {
    present: attendanceData.filter((a) => a.status === "present").length,
    absent: attendanceData.filter((a) => a.status === "absent").length,
    late: attendanceData.filter((a) => a.status === "late").length,
    total: attendanceData.length,
  };

  const filteredData =
    selectedClass === "all"
      ? attendanceData
      : attendanceData.filter((a) => a.class === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">
          {t("Attendance", "Điểm danh")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("Track student attendance", "Theo dõi điểm danh học sinh")}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <MobileStatsCard
          title={t("Present", "Có mặt")}
          value={`${stats.present} (${((stats.present / stats.total) * 100).toFixed(0)}%)`}
          icon={CheckCircle2}
          className="bg-green-50 dark:bg-green-950/30"
        />
        <MobileStatsCard
          title={t("Late", "Muộn")}
          value={`${stats.late} (${((stats.late / stats.total) * 100).toFixed(0)}%)`}
          icon={Clock}
          className="bg-yellow-50 dark:bg-yellow-950/30"
        />
        <MobileStatsCard
          title={t("Absent", "Vắng")}
          value={`${stats.absent} (${((stats.absent / stats.total) * 100).toFixed(0)}%)`}
          icon={XCircle}
          className="bg-red-50 dark:bg-red-950/30"
        />
        <MobileStatsCard
          title={t("Total Students", "Tổng số HS")}
          value={stats.total}
          icon={CheckCircle2}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        {/* Date Filter */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1 gap-2">
              <CalendarIcon className="w-4 h-4" />
              {selectedDate
                ? selectedDate.toLocaleDateString()
                : t("Select Date", "Chọn ngày")}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[400px]">
            <SheetHeader>
              <SheetTitle>{t("Select Date", "Chọn ngày")}</SheetTitle>
              <SheetDescription>
                {t("Choose a date to view attendance", "Chọn ngày để xem điểm danh")}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Class Filter */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1 gap-2">
              <Filter className="w-4 h-4" />
              {selectedClass === "all"
                ? t("All Classes", "Tất cả lớp")
                : selectedClass}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[300px]">
            <SheetHeader>
              <SheetTitle>{t("Filter by Class", "Lọc theo lớp")}</SheetTitle>
              <SheetDescription>
                {t("Select a class to filter attendance", "Chọn lớp để lọc điểm danh")}
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

        {/* Export Button */}
        <Button variant="outline" size="icon">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Attendance List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 dark:text-white">
            {t("Attendance Records", "Danh sách điểm danh")}
          </h3>
          <span className="text-gray-600 dark:text-gray-400">
            {filteredData.length} {t("students", "học sinh")}
          </span>
        </div>
        
        <div className="space-y-3">
          {filteredData.map((record) => (
            <AttendanceListItem
              key={record.id}
              studentName={record.studentName}
              className={record.class}
              status={record.status}
              time={record.time}
              date={record.date}
            />
          ))}
        </div>
      </div>

      {/* Mark Attendance Button */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <h4 className="text-gray-900 dark:text-white mb-2">
            {t("Quick Attendance Marking", "Điểm danh nhanh")}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t(
              "Mark attendance for today's classes",
              "Điểm danh cho các lớp hôm nay"
            )}
          </p>
          <Button className="w-full gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {t("Mark Attendance", "Bắt đầu điểm danh")}
          </Button>
        </div>
      </Card>
    </div>
  );
}