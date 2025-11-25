'use client';

import { Card } from '../ui/Card';
import { StudentTimelineItem, ProgressReportSnapshot } from './types';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface PRStudentPanelProps {
  studentId: string;
  studentName: string;
  timelineData: StudentTimelineItem[];
  latestReport: ProgressReportSnapshot | null;
  loading?: boolean;
}

export function PRStudentPanel({ studentName, timelineData, latestReport, loading }: PRStudentPanelProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Group timeline data by subject for the chart
  const chartDataMap = new Map<string, any>();
  const subjects = new Set<string>();

  timelineData.forEach(item => {
    const dateStr = format(new Date(item.d), 'MMM d');
    if (!chartDataMap.has(dateStr)) {
      chartDataMap.set(dateStr, { date: dateStr });
    }
    const entry = chartDataMap.get(dateStr);
    entry[item.subject] = item.score;
    subjects.add(item.subject);
  });

  const chartData = Array.from(chartDataMap.values());
  const subjectColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{studentName}</h2>
        {latestReport?.risk_flag && (
          <span className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            At Risk
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Chart */}
        <Card className="col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  {Array.from(subjects).map((subject, idx) => (
                    <Line
                      key={subject}
                      type="monotone"
                      dataKey={subject}
                      stroke={subjectColors[idx % subjectColors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No assessment data available for this period
            </div>
          )}
        </Card>

        {/* Right Col: Latest Report Snapshot */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Latest Report</h3>
          {latestReport ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm text-gray-500">Released</span>
                <span className="font-medium">{format(new Date(latestReport.released_at), 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm text-gray-500">Average Score</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{latestReport.avg_score?.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">{latestReport.avg_grade_letter}</div>
                </div>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm text-gray-500">Improvement</span>
                <span className={`font-medium ${latestReport.improvement_pct > 0 ? 'text-green-600' : latestReport.improvement_pct < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {latestReport.improvement_pct > 0 && '+'}
                  {latestReport.improvement_pct?.toFixed(1)}%
                </span>
              </div>

              {/* Strengths */}
              {latestReport.strengths && latestReport.strengths.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {latestReport.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm">
                        <span className="font-medium text-gray-900">{strength.label}:</span>
                        <span className="text-gray-600"> {strength.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Focus Areas */}
              {latestReport.focus_areas && latestReport.focus_areas.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    Focus Areas
                  </h4>
                  <ul className="space-y-2">
                    {latestReport.focus_areas.map((area, idx) => (
                      <li key={idx} className="text-sm">
                        <span className="font-medium text-gray-900">{area.label}:</span>
                        <span className="text-gray-600"> {area.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comments */}
              {latestReport.comments && latestReport.comments.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Teacher Comments</h4>
                  <div className="space-y-2">
                    {latestReport.comments.map((comment, idx) => (
                      <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                        <div className="font-medium text-gray-700">{comment.subject}</div>
                        <div className="text-gray-600">{comment.comment}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No released reports found in this period.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
