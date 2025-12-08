import { Badge } from "../ui/badge";
import { Calendar, User } from "lucide-react";

interface AnnouncementCardProps {
  title: string;
  description: string;
  date: string;
  author: string;
  priority: "high" | "medium" | "low";
  status?: string;
  onClick?: () => void;
}

export function AnnouncementCard({
  title,
  description,
  date,
  author,
  priority,
  status,
  onClick,
}: AnnouncementCardProps) {
  const getPriorityColor = (p: string) => {
    switch (p) {
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
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-98 transition-transform"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-gray-900 dark:text-white flex-1">{title}</h4>
        <Badge variant={getPriorityColor(priority)} className="ml-2">
          {priority}
        </Badge>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {description}
      </p>
      
      <div className="flex items-center gap-3 text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          <span>{author}</span>
        </div>
      </div>
      
      {status === "expired" && (
        <Badge variant="outline" className="mt-2">
          Expired
        </Badge>
      )}
    </div>
  );
}
