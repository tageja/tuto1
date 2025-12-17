import { Users, MapPin, User } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface ClassCardProps {
  grade: number;
  className: string;
  teacher?: string;
  studentsCount: number;
  studentsCapacity: number;
  room: string;
  status: "Active" | "Inactive";
  onViewDetails?: () => void;
}

export function ClassCard({
  grade,
  className,
  teacher,
  studentsCount,
  studentsCapacity,
  room,
  status,
  onViewDetails,
}: ClassCardProps) {
  const capacityPercentage = Math.round((studentsCount / studentsCapacity) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Header with Grade Badge and Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900/30 text-[#0B5FFF] px-3 py-1 rounded-lg">
            <span className="font-medium">{grade}</span>
          </div>
          <h3 className="text-gray-900 dark:text-white">
            Class {className}
          </h3>
        </div>
        <Badge
          variant={status === "Active" ? "default" : "secondary"}
          className={
            status === "Active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : ""
          }
        >
          {status}
        </Badge>
      </div>

      {/* Class Details */}
      <div className="space-y-2 mb-4">
        {/* Teacher */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Teacher</span>
          </div>
          <span className="text-gray-900 dark:text-white text-right">
            {teacher || "Not assigned"}
          </span>
        </div>

        {/* Students */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Students</span>
          </div>
          <div className="text-right">
            <span className="text-gray-900 dark:text-white">
              {studentsCount}/{studentsCapacity}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              ({capacityPercentage}%)
            </span>
          </div>
        </div>

        {/* Room */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Room</span>
          </div>
          <span className="text-gray-900 dark:text-white">
            {room}
          </span>
        </div>
      </div>

      {/* View Details Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onViewDetails}
      >
        View Details
      </Button>
    </div>
  );
}
