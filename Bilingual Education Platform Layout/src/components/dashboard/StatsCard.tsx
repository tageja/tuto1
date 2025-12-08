import { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className = "",
}: StatsCardProps) {
  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-gray-900 dark:text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`${
                  trend.value >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-[#0B5FFF]" />
        </div>
      </div>
    </Card>
  );
}
