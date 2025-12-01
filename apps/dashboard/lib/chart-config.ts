/**
 * Chart.js Configuration
 * Default settings for all charts in the app
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Default chart options
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
        },
        padding: 16,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      titleFont: {
        family: 'Inter, system-ui, sans-serif',
        size: 13,
        weight: '600' as const,
      },
      bodyFont: {
        family: 'Inter, system-ui, sans-serif',
        size: 12,
      },
      cornerRadius: 8,
    },
  },
};

// Colors matching the app theme
export const chartColors = {
  primary: '#0B5FFF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  
  // Chart-specific colors
  completed: '#10B981',
  pending: '#F59E0B',
  line: '#0B5FFF',
  lineGradientStart: 'rgba(11, 95, 255, 0.3)',
  lineGradientEnd: 'rgba(11, 95, 255, 0.0)',
};

// Doughnut chart options
export const doughnutChartOptions = {
  ...defaultChartOptions,
  cutout: '70%',
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      display: true,
    },
  },
};

// Line chart options
export const lineChartOptions = {
  ...defaultChartOptions,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11,
        },
        color: '#6B7280',
      },
    },
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11,
        },
        color: '#6B7280',
        callback: (value: number) => `${value}`,
      },
    },
  },
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      display: false,
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
};




