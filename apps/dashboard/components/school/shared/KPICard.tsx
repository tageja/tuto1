import { LucideIcon } from 'lucide-react';
import { Card } from '../../ui/Card';

interface KPICardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: string;
}

export function KPICard({ icon: Icon, title, value, trend, color = 'blue' }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  };

  const bgColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`${bgColorClass} p-3 rounded-xl text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}


















