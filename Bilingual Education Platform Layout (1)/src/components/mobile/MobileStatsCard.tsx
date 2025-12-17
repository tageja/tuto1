import { LucideIcon } from "lucide-react";

interface MobileStatsCardProps {
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

export function MobileStatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className = "",
}: MobileStatsCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-[#0B5FFF]" />
        </div>
        {trend && (
          <span
            className={`${
              trend.value >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-gray-900 dark:text-white">{value}</p>
      {subtitle && <p className="text-gray-500">{subtitle}</p>}
    </div>
  );
}
