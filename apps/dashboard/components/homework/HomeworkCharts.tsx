'use client';

import { useEffect, useRef } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Card } from '../ui/Card';
import { chartColors, doughnutChartOptions, lineChartOptions } from '../../lib/chart-config';
import type { HomeworkChartsProps } from './types';

export function HomeworkCharts({
  completionRate,
  scoresData,
  loading = false,
  showCharts,
}: HomeworkChartsProps) {
  if (!showCharts) {
    return (
      <Card className="p-8 text-center text-gray-500">
        <p>Select a class or subject to view charts</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  // Completion Donut Chart Data
  const completedPercent = completionRate;
  const pendingPercent = 100 - completionRate;

  const doughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completedPercent, pendingPercent],
        backgroundColor: [chartColors.completed, chartColors.pending],
        borderWidth: 0,
      },
    ],
  };

  // Scores Line Chart Data
  const lineData = {
    labels: scoresData.map((point) =>
      new Date(point.d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Average Score',
        data: scoresData.map((point) => point.avg_score),
        borderColor: chartColors.line,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, chartColors.lineGradientStart);
          gradient.addColorStop(1, chartColors.lineGradientEnd);
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: chartColors.line,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const hasScoresData = scoresData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Completion Rate Donut */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
        <div className="h-64 relative flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutChartOptions} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Scores Trend Line Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Score Trends</h3>
        {hasScoresData ? (
          <div className="h-64">
            <Line data={lineData} options={lineChartOptions} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>No score data available for this selection</p>
          </div>
        )}
      </Card>
    </div>
  );
}




