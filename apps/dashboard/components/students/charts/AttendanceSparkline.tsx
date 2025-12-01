'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface AttendanceSparklineProps {
  data: Array<{ month: string; percentage: number }>;
}

export function AttendanceSparkline({ data }: AttendanceSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  // Format month labels (show only month abbreviation)
  const formattedData = data.map((item) => ({
    ...item,
    monthLabel: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <XAxis
          dataKey="monthLabel"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10 }}
          width={30}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, 'Attendance']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}








