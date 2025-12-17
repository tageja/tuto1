import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Calendar } from "../../ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export function AttendanceScreen() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState("all");

  const attendanceData = [
    {
      id: 1,
      studentName: "Nguyen Van A",
      class: "Grade 3A",
      status: "present",
      time: "08:15",
      date: "2025-10-24",
    },
    {
      id: 2,
      studentName: "Tran Thi B",
      class: "Grade 3A",
      status: "present",
      time: "08:10",
      date: "2025-10-24",
    },
    {
      id: 3,
      studentName: "Le Van C",
      class: "Grade 3A",
      status: "late",
      time: "08:45",
      date: "2025-10-24",
    },
    {
      id: 4,
      studentName: "Pham Thi D",
      class: "Grade 4B",
      status: "absent",
      time: "-",
      date: "2025-10-24",
    },
    {
      id: 5,
      studentName: "Hoang Van E",
      class: "Grade 4B",
      status: "present",
      time: "08:05",
      date: "2025-10-24",
    },
    {
      id: 6,
      studentName: "Vo Thi F",
      class: "Grade 5A",
      status: "present",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {t("Present", "Có mặt")}
          </Badge>
        );
      case "absent":
        return (
          <Badge variant="destructive">{t("Absent", "Vắng")}</Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            {t("Late", "Muộn")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredData =
    selectedClass === "all"
      ? attendanceData
      : attendanceData.filter((a) => a.class === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            {t("Attendance", "Điểm danh")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("Track student attendance", "Theo dõi điểm danh học sinh")}
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          {t("Export Report", "Xuất báo cáo")}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {t("Total Students", "Tổng số học sinh")}
          </p>
          <p className="text-gray-900 dark:text-white">{stats.total}</p>
        </Card>
        <Card className="p-6 bg-green-50 dark:bg-green-950/30">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {t("Present", "Có mặt")}
          </p>
          <p className="text-gray-900 dark:text-white">
            {stats.present} ({((stats.present / stats.total) * 100).toFixed(1)}%)
          </p>
        </Card>
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/30">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {t("Late", "Muộn")}
          </p>
          <p className="text-gray-900 dark:text-white">
            {stats.late} ({((stats.late / stats.total) * 100).toFixed(1)}%)
          </p>
        </Card>
        <Card className="p-6 bg-red-50 dark:bg-red-950/30">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {t("Absent", "Vắng")}
          </p>
          <p className="text-gray-900 dark:text-white">
            {stats.absent} ({((stats.absent / stats.total) * 100).toFixed(1)}%)
          </p>
        </Card>
      </div>

      {/* Calendar and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-[#0B5FFF]" />
            <h3 className="text-gray-900 dark:text-white">
              {t("Select Date", "Chọn ngày")}
            </h3>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 dark:text-white">
              {t("Class Filter", "Lọc theo lớp")}
            </h3>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("Select class", "Chọn lớp")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Classes", "Tất cả lớp")}</SelectItem>
                <SelectItem value="Grade 3A">Grade 3A</SelectItem>
                <SelectItem value="Grade 4B">Grade 4B</SelectItem>
                <SelectItem value="Grade 5A">Grade 5A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attendance Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Student Name", "Tên học sinh")}</TableHead>
                  <TableHead>{t("Class", "Lớp")}</TableHead>
                  <TableHead>{t("Status", "Trạng thái")}</TableHead>
                  <TableHead>{t("Check-in Time", "Giờ vào")}</TableHead>
                  <TableHead>{t("Date", "Ngày")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-gray-900 dark:text-white">
                      {record.studentName}
                    </TableCell>
                    <TableCell>{record.class}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>{record.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
