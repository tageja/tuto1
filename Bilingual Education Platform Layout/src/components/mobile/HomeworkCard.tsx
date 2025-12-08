import { Badge } from "../ui/badge";
import { Calendar, BookOpen } from "lucide-react";

interface HomeworkCardProps {
  subject: string;
  className: string;
  dueDate: string;
  status: "pending" | "completed" | "graded";
  description?: string;
  onClick?: () => void;
}

export function HomeworkCard({
  subject,
  className: hwClass,
  dueDate,
  status,
  description,
  onClick,
}: HomeworkCardProps) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case "completed":
        return {
          variant: "default" as const,
          label: "Done / Hoàn thành",
          color: "text-green-600",
        };
      case "graded":
        return {
          variant: "default" as const,
          label: "Graded / Đã chấm",
          color: "text-blue-600",
        };
      case "pending":
        return {
          variant: "secondary" as const,
          label: "Pending / Đang chờ",
          color: "text-orange-600",
        };
      default:
        return {
          variant: "secondary" as const,
          label: "Unknown",
          color: "text-gray-600",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-98 transition-transform"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <BookOpen className="w-4 h-4 text-[#0B5FFF]" />
          </div>
          <div>
            <p className="text-gray-900 dark:text-white">{subject}</p>
            <p className="text-gray-600 dark:text-gray-400">{hwClass}</p>
          </div>
        </div>
        <Badge variant={config.variant}>{config.label.split(" / ")[0]}</Badge>
      </div>

      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {description}
        </p>
      )}

      <div className="flex items-center gap-1 text-gray-500">
        <Calendar className="w-3.5 h-3.5" />
        <span>Due: {dueDate}</span>
      </div>
    </div>
  );
}
