import { Mail, Phone, User } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface TeacherCardProps {
  name: string;
  qualification: string;
  subjects: string[];
  email: string;
  phone: string;
  status?: "Active" | "On Leave";
  avatarColor?: string;
  onViewProfile?: () => void;
}

export function TeacherCard({
  name,
  qualification,
  subjects,
  email,
  phone,
  status,
  avatarColor = "#0B5FFF",
  onViewProfile,
}: TeacherCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          <span className="font-medium">{initials}</span>
        </div>

        {/* Name and Qualification */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-gray-900 dark:text-white truncate">
              {name}
            </h3>
            {status && (
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
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {qualification}
          </p>
        </div>
      </div>

      {/* Subjects */}
      <div className="flex flex-wrap gap-2 mb-3">
        {subjects.map((subject, index) => (
          <Badge
            key={index}
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
          >
            {subject}
          </Badge>
        ))}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{phone}</span>
        </div>
      </div>

      {/* View Profile Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onViewProfile}
      >
        View Profile
      </Button>
    </div>
  );
}
