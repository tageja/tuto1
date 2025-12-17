import { Badge } from "../ui/badge";
import { Clock } from "lucide-react";

interface AttendanceListItemProps {
  studentName: string;
  className: string;
  status: "present" | "absent" | "late";
  time: string;
  date: string;
}

export function AttendanceListItem({
  studentName,
  className: studentClass,
  status,
  time,
  date,
}: AttendanceListItemProps) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case "present":
        return {
          badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          label: "Present / Có mặt",
          dot: "bg-green-500",
        };
      case "absent":
        return {
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          label: "Absent / Vắng",
          dot: "bg-red-500",
        };
      case "late":
        return {
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          label: "Late / Muộn",
          dot: "bg-yellow-500",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-800",
          label: "Unknown",
          dot: "bg-gray-500",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <p className="text-gray-900 dark:text-white">{studentName}</p>
        </div>
        <Badge className={config.badge}>{config.label.split(" / ")[0]}</Badge>
      </div>
      
      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
        <span>{studentClass}</span>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
