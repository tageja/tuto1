import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { AnnouncementAdminCard } from "../AnnouncementAdminCard";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { Search, Plus, Megaphone, X } from "lucide-react";

export function MobileAnnouncementsAdminScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("published");

  // Mock data
  const announcements = [
    {
      id: 1,
      title: "Parent-Teacher Meeting Scheduled",
      category: "Meeting",
      targetAudience: "School-wide",
      priority: "High" as const,
      status: "Published" as const,
      date: "Published on 2024-12-08",
    },
    {
      id: 2,
      title: "Holiday Schedule Update",
      category: "General",
      targetAudience: "All Parents",
      priority: "Normal" as const,
      status: "Published" as const,
      date: "Published on 2024-12-07",
    },
    {
      id: 3,
      title: "New After-School Program",
      category: "Program",
      targetAudience: "Grade 1-3",
      priority: "Normal" as const,
      status: "Published" as const,
      date: "Published on 2024-12-06",
    },
    {
      id: 4,
      title: "Emergency Contact Update Request",
      category: "Administrative",
      targetAudience: "School-wide",
      priority: "Urgent" as const,
      status: "Draft" as const,
      date: "Created on 2024-12-05",
    },
    {
      id: 5,
      title: "Sports Day Event Details",
      category: "Event",
      targetAudience: "All Students",
      priority: "High" as const,
      status: "Draft" as const,
      date: "Created on 2024-12-04",
    },
    {
      id: 6,
      title: "Summer Camp Registration Closed",
      category: "Program",
      targetAudience: "School-wide",
      priority: "Normal" as const,
      status: "Archived" as const,
      date: "Archived on 2024-11-30",
    },
  ];

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "published" ? ann.status === "Published" :
      activeTab === "draft" ? ann.status === "Draft" :
      ann.status === "Archived";
    return matchesSearch && matchesTab;
  });

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
          <Button size="icon" className="bg-[#0B5FFF] hover:bg-[#0949CC]">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Tab Switcher */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draft">{t("Draft", "Nháp")}</TabsTrigger>
            <TabsTrigger value="published">{t("Published", "Đã xuất bản")}</TabsTrigger>
            <TabsTrigger value="archived">{t("Archived", "Lưu trữ")}</TabsTrigger>
          </TabsList>
        </Tabs>

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

        {/* Results Count */}
        <p className="text-gray-600 dark:text-gray-400">
          {t(`Showing ${filteredAnnouncements.length} results`, `Hiển thị ${filteredAnnouncements.length} kết quả`)}
        </p>

        {/* Announcements List */}
        <div className="space-y-3 pb-20">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <AnnouncementAdminCard
                key={announcement.id}
                title={announcement.title}
                category={announcement.category}
                targetAudience={announcement.targetAudience}
                priority={announcement.priority}
                status={announcement.status}
                date={announcement.date}
                onClick={() => console.log(`View announcement: ${announcement.title}`)}
                onEdit={() => console.log(`Edit: ${announcement.title}`)}
                onArchive={() => console.log(`Archive: ${announcement.title}`)}
                onDelete={() => console.log(`Delete: ${announcement.title}`)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t("No announcements found", "Không tìm thấy thông báo")}
              </p>
              <p className="text-gray-500">
                {t("Try adjusting your search", "Thử điều chỉnh tìm kiếm")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
