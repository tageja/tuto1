import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { AnnouncementCard } from "../AnnouncementCard";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../../ui/sheet";
import { Search, Plus, Megaphone, Calendar, User, X } from "lucide-react";

export function MobileAnnouncementsScreen() {
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
      priority: "high" as const,
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
      priority: "medium" as const,
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
      priority: "low" as const,
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
      priority: "high" as const,
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
      priority: "low" as const,
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            {t("Announcements", "Thông báo")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredAnnouncements.length} {t("announcements", "thông báo")}
          </p>
        </div>
        <Button size="icon" className="rounded-full">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={t("Search announcements...", "Tìm kiếm thông báo...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t("All", "Tất cả")}</TabsTrigger>
          <TabsTrigger value="active">{t("Active", "Hoạt động")}</TabsTrigger>
          <TabsTrigger value="urgent">{t("Urgent", "Khẩn")}</TabsTrigger>
          <TabsTrigger value="expired">{t("Expired", "Hết hạn")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Announcements Feed */}
      <div className="space-y-3">
        {filteredAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            title={announcement.title}
            description={announcement.description}
            date={announcement.date}
            author={announcement.author}
            priority={announcement.priority}
            status={announcement.status}
            onClick={() => setSelectedAnnouncement(announcement)}
          />
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("No announcements found", "Không có thông báo nào")}
            </p>
            <p className="text-gray-500">
              {t("Try adjusting your search or filters", "Thử điều chỉnh tìm kiếm hoặc bộ lọc")}
            </p>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet
        open={!!selectedAnnouncement}
        onOpenChange={() => setSelectedAnnouncement(null)}
      >
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <SheetTitle className="flex items-center gap-2 flex-1">
                {selectedAnnouncement?.title}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAnnouncement(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getPriorityColor(selectedAnnouncement?.priority)}>
                {selectedAnnouncement?.priority}
              </Badge>
              {selectedAnnouncement?.status === "expired" && (
                <Badge variant="outline">{t("Expired", "Đã hết hạn")}</Badge>
              )}
            </div>
            <SheetDescription className="mt-4">
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedAnnouncement?.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{selectedAnnouncement?.author}</span>
                </div>
              </div>
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-gray-900 dark:text-white mb-3">
                {t("Description", "Mô tả")}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {selectedAnnouncement?.description}
              </p>
            </div>

            {selectedAnnouncement?.attachments &&
              selectedAnnouncement.attachments.length > 0 && (
                <div>
                  <h4 className="text-gray-900 dark:text-white mb-3">
                    {t("Attachments", "Tệp đính kèm")}
                  </h4>
                  <div className="space-y-2">
                    {selectedAnnouncement.attachments.map(
                      (file: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <span className="text-gray-900 dark:text-white">
                            {file}
                          </span>
                          <Button variant="link" size="sm">
                            {t("Download", "Tải xuống")}
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            <div className="pt-4">
              <Button className="w-full">
                {t("Mark as Read", "Đánh dấu đã đọc")}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
