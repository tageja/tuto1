import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Search, Plus, Calendar, User } from "lucide-react";

export function AnnouncementsScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const announcements = [
    {
      id: 1,
      title: t("Parent-Teacher Meeting", "Họp phụ huynh - giáo viên"),
      description: t(
        "All parents are invited to attend the quarterly parent-teacher meeting. We will discuss student progress, upcoming events, and answer any questions you may have.",
        "Mời tất cả phụ huynh tham dự họp phụ huynh - giáo viên hàng quý. Chúng ta sẽ thảo luận về tiến độ học sinh, sự kiện sắp tới và trả lời mọi câu hỏi."
      ),
      date: "2025-10-26",
      author: "Principal Johnson",
      priority: "high",
      status: "active",
      attachments: ["meeting-agenda.pdf"],
    },
    {
      id: 2,
      title: t("School Holiday Notice", "Thông báo nghỉ học"),
      description: t(
        "School will be closed on November 1st for National Day. Classes resume on November 2nd.",
        "Trường nghỉ ngày 1 tháng 11 nhân Ngày Quốc khánh. Lớp học tiếp tục vào ngày 2 tháng 11."
      ),
      date: "2025-10-28",
      author: "Administration",
      priority: "medium",
      status: "active",
      attachments: [],
    },
    {
      id: 3,
      title: t("New Lunch Menu Available", "Thực đơn mới có sẵn"),
      description: t(
        "We've updated our lunch menu with more healthy options. View the full menu on our website.",
        "Chúng tôi đã cập nhật thực đơn với nhiều lựa chọn lành mạnh hơn. Xem thực đơn đầy đủ trên website."
      ),
      date: "2025-10-25",
      author: "Cafeteria Staff",
      priority: "low",
      status: "active",
      attachments: ["lunch-menu-nov.pdf"],
    },
    {
      id: 4,
      title: t("Sports Day Registration", "Đăng ký Ngày hội thể thao"),
      description: t(
        "Annual sports day is coming! Register your child for their favorite events by October 30th.",
        "Ngày hội thể thao thường niên sắp tới! Đăng ký cho con em các sự kiện yêu thích trước ngày 30 tháng 10."
      ),
      date: "2025-10-23",
      author: "PE Department",
      priority: "high",
      status: "active",
      attachments: [],
    },
    {
      id: 5,
      title: t("Library Book Fair", "Hội chợ sách thư viện"),
      description: t(
        "Book fair happening next week! Great discounts on children's books and educational materials.",
        "Hội chợ sách diễn ra tuần sau! Giảm giá lớn cho sách thiếu nhi và tài liệu giáo dục."
      ),
      date: "2025-10-20",
      author: "Librarian",
      priority: "low",
      status: "expired",
      attachments: [],
    },
  ];

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && ann.status === "active") ||
      (filter === "urgent" && ann.priority === "high") ||
      (filter === "expired" && ann.status === "expired");
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            {t("Announcements", "Thông báo")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t(
              "View and manage school announcements",
              "Xem và quản lý thông báo nhà trường"
            )}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t("New Announcement", "Thông báo mới")}
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t("Search announcements...", "Tìm kiếm thông báo...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">{t("All", "Tất cả")}</TabsTrigger>
              <TabsTrigger value="active">{t("Active", "Đang hoạt động")}</TabsTrigger>
              <TabsTrigger value="urgent">{t("Urgent", "Khẩn cấp")}</TabsTrigger>
              <TabsTrigger value="expired">{t("Expired", "Đã hết hạn")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card
            key={announcement.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedAnnouncement(announcement)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-gray-900 dark:text-white">
                    {announcement.title}
                  </h3>
                  <Badge variant={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                  {announcement.status === "expired" && (
                    <Badge variant="outline">{t("Expired", "Đã hết hạn")}</Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {announcement.description.substring(0, 150)}
                  {announcement.description.length > 150 && "..."}
                </p>
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{announcement.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{announcement.author}</span>
                  </div>
                  {announcement.attachments.length > 0 && (
                    <Badge variant="secondary">
                      {announcement.attachments.length}{" "}
                      {t("attachment(s)", "tệp đính kèm")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedAnnouncement}
        onOpenChange={() => setSelectedAnnouncement(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAnnouncement?.title}
              <Badge variant={getPriorityColor(selectedAnnouncement?.priority)}>
                {selectedAnnouncement?.priority}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedAnnouncement?.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{selectedAnnouncement?.author}</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {selectedAnnouncement?.description}
            </p>
            {selectedAnnouncement?.attachments.length > 0 && (
              <div>
                <p className="text-gray-900 dark:text-white mb-2">
                  {t("Attachments:", "Tệp đính kèm:")}
                </p>
                <div className="space-y-2">
                  {selectedAnnouncement.attachments.map((file: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded"
                    >
                      <span>{file}</span>
                      <Button variant="link" size="sm" className="ml-auto">
                        {t("Download", "Tải xuống")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
