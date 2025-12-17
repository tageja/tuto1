import { useState } from "react";
import { useLanguage } from "../../LanguageContext";
import { MessageThreadCard } from "../MessageThreadCard";
import { Input } from "../../ui/input";
import { Search, MessageSquare } from "lucide-react";

interface MobileMessagesListParentScreenProps {
  onSelectThread?: (threadId: number) => void;
}

export function MobileMessagesListParentScreen({
  onSelectThread,
}: MobileMessagesListParentScreenProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - parent sees only relevant threads
  const messageThreads = [
    {
      id: 1,
      sender: "Ms. Nguyen",
      lastMessage: "Your child did great in today's art class!",
      timestamp: "2:30 PM",
      unreadCount: 1,
      priority: "Normal" as const,
      avatarColor: "#6366F1",
      role: "Teacher - Class 2A",
    },
    {
      id: 2,
      sender: "Mr. Tran",
      lastMessage: "Parent-teacher meeting scheduled for Friday",
      timestamp: "11:45 AM",
      unreadCount: 0,
      priority: "Normal" as const,
      avatarColor: "#0B5FFF",
      role: "Homeroom Teacher",
    },
    {
      id: 3,
      sender: "School Administration",
      lastMessage: "Reminder: School fee payment due next week",
      timestamp: "Yesterday",
      unreadCount: 0,
      priority: "Normal" as const,
      avatarColor: "#8B5CF6",
      role: "Admin Office",
    },
    {
      id: 4,
      sender: "Ms. Pham",
      lastMessage: "Please sign the field trip permission form",
      timestamp: "Dec 7",
      unreadCount: 0,
      priority: "Urgent" as const,
      avatarColor: "#EC4899",
      role: "Teacher - Music",
    },
    {
      id: 5,
      sender: "Nurse Office",
      lastMessage: "Health check-up scheduled for next month",
      timestamp: "Dec 5",
      unreadCount: 0,
      priority: "Normal" as const,
      avatarColor: "#10B981",
      role: "School Nurse",
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
        <div className="mb-3">
          <h1 className="text-gray-900 dark:text-white">
            {t("Messages", "Tin nhắn")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalUnread > 0
              ? t(`${totalUnread} unread`, `${totalUnread} chưa đọc`)
              : t("All caught up", "Đã đọc hết")}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t("Search messages...", "Tìm kiếm tin nhắn...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-gray-700"
          />
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
              {t("Try adjusting your search", "Thử điều chỉnh tìm kiếm")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
