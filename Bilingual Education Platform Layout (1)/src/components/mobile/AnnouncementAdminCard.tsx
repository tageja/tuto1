import { Badge } from "../ui/badge";
import { Calendar, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface AnnouncementAdminCardProps {
  title: string;
  category: string;
  targetAudience: string;
  priority: "Normal" | "High" | "Urgent";
  status: "Draft" | "Published" | "Archived";
  date: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
}

export function AnnouncementAdminCard({
  title,
  category,
  targetAudience,
  priority,
  status,
  date,
  onClick,
  onEdit,
  onDelete,
  onArchive,
}: AnnouncementAdminCardProps) {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "Urgent":
      case "High":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Normal":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Published":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Draft":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Archived":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-98 transition-transform"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-gray-900 dark:text-white flex-1 pr-2">{title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
            {onArchive && <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="font-medium">Category:</span>
          <span>{category}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="font-medium">Audience:</span>
          <span>{targetAudience}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={`px-2 py-1 rounded-md ${getPriorityColor(priority)}`}>
          {priority}
        </span>
        <span className={`px-2 py-1 rounded-md ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center gap-1 text-gray-500">
        <Calendar className="w-3.5 h-3.5" />
        <span>{date}</span>
      </div>
    </div>
  );
}
