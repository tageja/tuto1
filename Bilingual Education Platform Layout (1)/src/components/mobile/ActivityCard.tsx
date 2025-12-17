import { Badge } from "../ui/badge";
import { Calendar, Clock, Users } from "lucide-react";

interface ActivityCardProps {
  title: string;
  type: string;
  className: string;
  date: string;
  time: string;
  status: "Completed" | "In Progress" | "Pending";
  description?: string;
  onClick?: () => void;
}

export function ActivityCard({
  title,
  type,
  className,
  date,
  time,
  status,
  description,
  onClick,
}: ActivityCardProps) {
  const getStatusColor = (s: string) => {
    switch (s) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "In Progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
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
        <div className="flex-1">
          <h4 className="text-gray-900 dark:text-white mb-1">{title}</h4>
          <p className="text-gray-600 dark:text-gray-400">{type}</p>
        </div>
        <span className={`px-2 py-1 rounded-md whitespace-nowrap ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{className}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{time}</span>
        </div>
      </div>

      {description && (
        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
}
