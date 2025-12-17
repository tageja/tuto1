import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface MessagesListItemProps {
  from: string;
  subject: string;
  preview: string;
  date: string;
  time: string;
  unread?: boolean;
  priority?: "high" | "normal";
  onClick?: () => void;
}

export function MessagesListItem({
  from,
  subject,
  preview,
  date,
  time,
  unread = false,
  priority = "normal",
  onClick,
}: MessagesListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800 transition-colors ${
        unread ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-[#0B5FFF]">
            {from.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <p className="text-gray-900 dark:text-white truncate">{from}</p>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {unread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
              {priority === "high" && (
                <Badge variant="destructive" className="text-xs">
                  !
                </Badge>
              )}
            </div>
          </div>

          <p className="text-gray-900 dark:text-white mb-1 truncate">
            {subject}
          </p>

          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
            {preview}
          </p>

          <p className="text-gray-500">
            {date} • {time}
          </p>
        </div>
      </div>
    </div>
  );
}
