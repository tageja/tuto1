import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconColor = 'primary',
  trend,
  subtitle,
  loading = false,
}) => {
  const iconColorStyles = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-250 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-250 hover:shadow-md group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          
          {subtitle && (
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          )}
          
          {trend && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50">
              <svg 
                className={`w-4 h-4 ${trend.isPositive ? 'text-green-600 rotate-0' : 'text-red-600 rotate-180'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs tháng trước</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`flex-shrink-0 w-12 h-12 max-w-[48px] max-h-[48px] rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-250 group-hover:scale-110 ${iconColorStyles[iconColor]}`}>
            <div className="w-6 h-6 max-w-[24px] max-h-[24px] flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

