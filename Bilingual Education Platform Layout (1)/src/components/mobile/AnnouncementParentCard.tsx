import { Badge } from "../ui/badge";
import { Calendar } from "lucide-react";
import { Button } from "../ui/button";

interface AnnouncementParentCardProps {
  title: string;
  content: string;
  priority: "Normal" | "Urgent";
  date: string;
  isRead?: boolean;
  onClick?: () => void;
  onMarkAsRead?: () => void;
}

export function AnnouncementParentCard({
  title,
  content,
  priority,
  date,
  isRead = false,
  onClick,
  onMarkAsRead,
}: AnnouncementParentCardProps) {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "Urgent":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Normal":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-98 transition-transform ${
        isRead ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-gray-900 dark:text-white flex-1 pr-2">{title}</h4>
        <span className={`px-2 py-1 rounded-md whitespace-nowrap ${getPriorityColor(priority)}`}>
          {priority}
        </span>
      </div>

      <div className="flex items-center gap-1 text-gray-500 mb-3">
        <Calendar className="w-3.5 h-3.5" />
        <span>{date}</span>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {content}
      </p>

      {!isRead && onMarkAsRead && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead();
          }}
        >
          Mark as Read
        </Button>
      )}
    </div>
  );
}
