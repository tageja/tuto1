import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface MessageThreadCardProps {
  id: number;
  sender: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  priority?: "Normal" | "Urgent";
  avatarColor?: string;
  role?: string;
  onClick?: () => void;
}

export function MessageThreadCard({
  sender,
  lastMessage,
  timestamp,
  unreadCount = 0,
  priority = "Normal",
  avatarColor = "#0B5FFF",
  role,
  onClick,
}: MessageThreadCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800 transition-colors cursor-pointer ${
        unreadCount > 0 ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarFallback
              className="text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(sender)}
            </AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
              <span className="text-xs">{unreadCount}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <p
                className={`truncate ${
                  unreadCount > 0
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {sender}
              </p>
              {role && (
                <p className="text-gray-500 text-xs">{role}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <p className="text-gray-500 whitespace-nowrap">
                {timestamp}
              </p>
            </div>
          </div>

          <p
            className={`line-clamp-2 mb-1 ${
              unreadCount > 0
                ? "text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {lastMessage}
          </p>

          {priority === "Urgent" && (
            <Badge variant="destructive" className="mt-1">
              Urgent
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
