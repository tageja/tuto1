import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { MessageThreadCard } from "../MessageThreadCard";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Search, Plus, MessageSquare } from "lucide-react";

interface MobileMessagesListAdminScreenProps {
  onSelectThread?: (threadId: number) => void;
}

export function MobileMessagesListAdminScreen({
  onSelectThread,
}: MobileMessagesListAdminScreenProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");

  // Mock data
  const messageThreads = [
    {
      id: 1,
      sender: "hello",
      lastMessage: "We are Berena Republic",
      timestamp: "11:19",
      unreadCount: 13,
      priority: "Normal" as const,
      avatarColor: "#6366F1",
      role: "Parent",
    },
    {
      id: 2,
      sender: "test3",
      lastMessage: "given",
      timestamp: "12:23",
      unreadCount: 0,
      priority: "Normal" as const,
      avatarColor: "#0B5FFF",
      role: "Teacher",
    },
    {
      id: 3,
      sender: "test2",
      lastMessage: "This is a test",
      timestamp: "11:18",
      unreadCount: 0,
      priority: "Normal" as const,
      avatarColor: "#8B5CF6",
      role: "Parent",
    },
    {
      id: 4,
      sender: "school fee",
      lastMessage: "Hi! How r you?!",
      timestamp: "Oct 10",
      unreadCount: 0,
      priority: "Normal" as const,
      avatarColor: "#EC4899",
      role: "Admin",
    },
    {
      id: 5,
      sender: "test",
      lastMessage: "test",
      timestamp: "Oct 9",
      unreadCount: 0,
      priority: "Normal" as const,
      avatarColor: "#10B981",
      role: "Parent",
    },
    {
      id: 6,
      sender: "n",
      lastMessage: "hello",
      timestamp: "Oct 8",
      unreadCount: 0,
      priority: "Normal" as const,
      avatarColor: "#F59E0B",
      role: "Teacher",
    },
  ];

  const filteredThreads = messageThreads.filter((thread) => {
    const matchesSearch =
      thread.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalUnread = messageThreads.reduce(
    (sum, thread) => sum + thread.unreadCount,
    0
  );

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-gray-900 dark:text-white">
              {t("Messages", "Tin nhắn")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {totalUnread > 0
                ? t(`${totalUnread} unread`, `${totalUnread} chưa đọc`)
                : t("All caught up", "Đã đọc hết")}
            </p>
          </div>
          <Button size="icon" className="bg-[#0B5FFF] hover:bg-[#0949CC] rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("Search messages...", "Tìm kiếm tin nhắn...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-gray-700"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="bg-gray-50 dark:bg-gray-700">
              <SelectValue placeholder={t("Class", "Lớp")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All classes", "Tất cả lớp")}</SelectItem>
              <SelectItem value="class-a">{t("Class A", "Lớp A")}</SelectItem>
              <SelectItem value="class-b">{t("Class B", "Lớp B")}</SelectItem>
              <SelectItem value="class-c">{t("Class C", "Lớp C")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="bg-gray-50 dark:bg-gray-700">
              <SelectValue placeholder={t("Grade", "Khối")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All grades", "Tất cả khối")}</SelectItem>
              <SelectItem value="grade-1">{t("Grade 1", "Khối 1")}</SelectItem>
              <SelectItem value="grade-2">{t("Grade 2", "Khối 2")}</SelectItem>
              <SelectItem value="grade-3">{t("Grade 3", "Khối 3")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Message Threads */}
      <div className="bg-white dark:bg-gray-800">
        {filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <MessageThreadCard
              key={thread.id}
              id={thread.id}
              sender={thread.sender}
              lastMessage={thread.lastMessage}
              timestamp={thread.timestamp}
              unreadCount={thread.unreadCount}
              priority={thread.priority}
              avatarColor={thread.avatarColor}
              role={thread.role}
              onClick={() => onSelectThread?.(thread.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("No messages found", "Không tìm thấy tin nhắn")}
            </p>
            <p className="text-gray-500">
              {t("Try adjusting your search or filters", "Thử điều chỉnh tìm kiếm hoặc bộ lọc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
