import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { AIInsightPanel } from "../AIInsightPanel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Plus, Calendar, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function HomeworkScreen() {
  const { t } = useLanguage();
  const [selectedHomework, setSelectedHomework] = useState<any>(null);

  const homeworkData = [
    {
      id: 1,
      subject: t("Mathematics", "Toán"),
      class: "Grade 3A",
      title: t("Chapter 5 Exercises", "Bài tập Chương 5"),
      dueDate: "2025-10-27",
      assignedDate: "2025-10-20",
      status: "pending",
      submissions: 12,
      totalStudents: 25,
      description: t(
        "Complete exercises 1-10 from textbook page 45",
        "Hoàn thành bài tập 1-10 từ sách giáo khoa trang 45"
      ),
      difficulty: "medium",
    },
    {
      id: 2,
      subject: t("English", "Tiếng Anh"),
      class: "Grade 4B",
      title: t("Reading Comprehension", "Đọc hiểu"),
      dueDate: "2025-10-28",
      assignedDate: "2025-10-21",
      status: "pending",
      submissions: 18,
      totalStudents: 22,
      description: t(
        "Read the story and answer questions 1-5",
        "Đọc câu chuyện và trả lời câu hỏi 1-5"
      ),
      difficulty: "easy",
    },
    {
      id: 3,
      subject: t("Science", "Khoa học"),
      class: "Grade 5A",
      title: t("Plant Cell Diagram", "Sơ đồ tế bào thực vật"),
      dueDate: "2025-10-29",
      assignedDate: "2025-10-22",
      status: "pending",
      submissions: 8,
      totalStudents: 20,
      description: t(
        "Draw and label the parts of a plant cell",
        "Vẽ và ghi tên các bộ phận của tế bào thực vật"
      ),
      difficulty: "hard",
    },
    {
      id: 4,
      subject: t("History", "Lịch sử"),
      class: "Grade 3A",
      title: t("Ancient Vietnam Quiz", "Kiểm tra Việt Nam cổ đại"),
      dueDate: "2025-10-24",
      assignedDate: "2025-10-17",
      status: "completed",
      submissions: 25,
      totalStudents: 25,
      description: t(
        "Complete the online quiz about ancient Vietnamese dynasties",
        "Hoàn thành bài kiểm tra trực tuyến về các triều đại Việt Nam cổ đại"
      ),
      difficulty: "medium",
    },
  ];

  const difficultyData = [
    { name: t("Easy", "Dễ"), count: 15, color: "#10b981" },
    { name: t("Medium", "Trung bình"), count: 22, color: "#f59e0b" },
    { name: t("Hard", "Khó"), count: 8, color: "#ef4444" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {t("Completed", "Hoàn thành")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            {t("Pending", "Đang chờ")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {t("Easy", "Dễ")}
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            {t("Medium", "Trung bình")}
          </Badge>
        );
      case "hard":
        return (
          <Badge variant="destructive">{t("Hard", "Khó")}</Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            {t("Homework & Assignments", "Bài tập về nhà")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t(
              "Manage homework assignments and track submissions",
              "Quản lý bài tập và theo dõi nộp bài"
            )}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t("Create Assignment", "Tạo bài tập")}
        </Button>
      </div>

      {/* Stats and AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-gray-900 dark:text-white mb-4">
            {t("AI Difficulty Analysis", "Phân tích độ khó AI")}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={difficultyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0B5FFF" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="lg:col-span-2">
          <AIInsightPanel
            title={t("Homework Insights", "Phân tích bài tập")}
            insights={[
              t(
                "Average submission rate: 78% across all classes",
                "Tỷ lệ nộp bài trung bình: 78% trên tất cả các lớp"
              ),
              t(
                "Grade 3A shows highest completion rate at 92%",
                "Lớp 3A có tỷ lệ hoàn thành cao nhất 92%"
              ),
              t(
                "Recommended: Adjust difficulty for Math assignments",
                "Đề xuất: Điều chỉnh độ khó cho bài tập Toán"
              ),
              t(
                "Students spend average 45 minutes per assignment",
                "Học sinh dành trung bình 45 phút cho mỗi bài tập"
              ),
            ]}
          />
        </div>
      </div>

      {/* Homework Table */}
      <Card className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">
          {t("All Assignments", "Tất cả bài tập")}
        </h3>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Subject", "Môn học")}</TableHead>
                <TableHead>{t("Class", "Lớp")}</TableHead>
                <TableHead>{t("Title", "Tiêu đề")}</TableHead>
                <TableHead>{t("Due Date", "Hạn nộp")}</TableHead>
                <TableHead>{t("Submissions", "Đã nộp")}</TableHead>
                <TableHead>{t("Difficulty", "Độ khó")}</TableHead>
                <TableHead>{t("Status", "Trạng thái")}</TableHead>
                <TableHead>{t("Actions", "Thao tác")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {homeworkData.map((hw) => (
                <TableRow key={hw.id}>
                  <TableCell className="text-gray-900 dark:text-white">
                    {hw.subject}
                  </TableCell>
                  <TableCell>{hw.class}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">
                    {hw.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {hw.dueDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    {hw.submissions}/{hw.totalStudents}
                  </TableCell>
                  <TableCell>{getDifficultyBadge(hw.difficulty)}</TableCell>
                  <TableCell>{getStatusBadge(hw.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedHomework(hw)}
                    >
                      {t("View", "Xem")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Adaptive Homework - Coming Soon */}
      <Card className="p-6 border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-gray-900 dark:text-white">
                {t("Adaptive Homework Engine", "Hệ thống bài tập thích ứng")}
              </h3>
              <Badge variant="secondary">{t("Coming Soon", "Sắp ra mắt")}</Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t(
                "AI-powered personalized homework assignments based on student performance and learning pace",
                "Bài tập cá nhân hóa dựa trên hiệu suất và tốc độ học tập của học sinh"
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              {t("Learn More", "Tìm hiểu thêm")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedHomework}
        onOpenChange={() => setSelectedHomework(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedHomework?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                <Badge>{selectedHomework?.subject}</Badge>
                <Badge variant="outline">{selectedHomework?.class}</Badge>
                {getDifficultyBadge(selectedHomework?.difficulty)}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {t("Description:", "Mô tả:")}
              </p>
              <p className="text-gray-900 dark:text-white">
                {selectedHomework?.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {t("Assigned Date:", "Ngày giao:")}
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedHomework?.assignedDate}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {t("Due Date:", "Hạn nộp:")}
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedHomework?.dueDate}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {t("Submission Progress:", "Tiến độ nộp bài:")}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#0B5FFF] h-2 rounded-full"
                    style={{
                      width: `${(selectedHomework?.submissions / selectedHomework?.totalStudents) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-gray-900 dark:text-white">
                  {selectedHomework?.submissions}/{selectedHomework?.totalStudents}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button>{t("View Submissions", "Xem bài nộp")}</Button>
              <Button variant="outline">{t("Edit Assignment", "Sửa bài tập")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
