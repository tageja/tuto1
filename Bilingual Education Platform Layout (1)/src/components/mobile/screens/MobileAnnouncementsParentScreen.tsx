import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { AnnouncementParentCard } from "../AnnouncementParentCard";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Search, Megaphone, X } from "lucide-react";

export function MobileAnnouncementsParentScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [readIds, setReadIds] = useState<number[]>([]);

  // Mock data
  const announcements = [
    {
      id: 1,
      title: "Parent-Teacher Meeting This Friday",
      content: "Join us for our quarterly parent-teacher meeting. We'll discuss your child's progress and upcoming school events. All parents are encouraged to attend.",
      priority: "Urgent" as const,
      date: "Posted Dec 8, 2024",
      isExpired: false,
    },
    {
      id: 2,
      title: "Holiday Schedule Announcement",
      content: "Please note the updated holiday schedule for December. School will be closed from Dec 24-26 for winter break.",
      priority: "Normal" as const,
      date: "Posted Dec 7, 2024",
      isExpired: false,
    },
    {
      id: 3,
      title: "New After-School Program Available",
      content: "We're excited to announce a new robotics after-school program for grades 1-3. Registration opens next week.",
      priority: "Normal" as const,
      date: "Posted Dec 6, 2024",
      isExpired: false,
    },
    {
      id: 4,
      title: "Emergency Contact Update Required",
      content: "Please update your emergency contact information in the parent portal by the end of this week.",
      priority: "Urgent" as const,
      date: "Posted Dec 5, 2024",
      isExpired: false,
    },
    {
      id: 5,
      title: "Sports Day Registration Closed",
      content: "Thank you for your interest in Sports Day. Registration has now closed. We look forward to seeing you there!",
      priority: "Normal" as const,
      date: "Posted Nov 28, 2024",
      isExpired: true,
    },
  ];

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && !ann.isExpired) ||
      (activeFilter === "urgent" && ann.priority === "Urgent") ||
      (activeFilter === "expired" && ann.isExpired);
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = (id: number) => {
    setReadIds([...readIds, id]);
  };

  const handleMarkAllAsRead = () => {
    const allIds = filteredAnnouncements.map((ann) => ann.id);
    setReadIds(allIds);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-gray-900 dark:text-white">
              {t("Announcements", "Thông báo")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("Stay updated with school news and important notices", "Cập nhật tin tức và thông báo quan trọng")}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {[
            { id: "all", label: t("All", "Tất cả") },
            { id: "active", label: t("Active", "Hoạt động") },
            { id: "urgent", label: t("Urgent", "Khẩn cấp") },
            { id: "expired", label: t("Expired", "Hết hạn") },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? "bg-[#0B5FFF] text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("Search announcements...", "Tìm kiếm thông báo...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 bg-white dark:bg-gray-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mark All as Read */}
        {filteredAnnouncements.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t(`${filteredAnnouncements.length} announcements`, `${filteredAnnouncements.length} thông báo`)}
            </p>
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              {t("Mark All as Read", "Đánh dấu tất cả đã đọc")}
            </Button>
          </div>
        )}

        {/* Announcements List */}
        <div className="space-y-3 pb-20">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <AnnouncementParentCard
                key={announcement.id}
                title={announcement.title}
                content={announcement.content}
                priority={announcement.priority}
                date={announcement.date}
                isRead={readIds.includes(announcement.id)}
                onClick={() => console.log(`View announcement: ${announcement.title}`)}
                onMarkAsRead={() => handleMarkAsRead(announcement.id)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t("No announcements found", "Không tìm thấy thông báo")}
              </p>
              <p className="text-gray-500">
                {t("Try adjusting your search or filters", "Thử điều chỉnh tìm kiếm hoặc bộ lọc")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
