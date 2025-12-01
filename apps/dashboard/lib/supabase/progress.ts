/**
 * Progress Reports Utility Functions
 * Co-located helpers for grade calculation and data formatting
 */

export function getGradeLetter(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
}

export function calculateImprovement(current: number, previous: number): number {
  if (!previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export function isAtRisk(avgScore: number, recentScores: number[]): boolean {
  // Risk if average below 60 OR at least 2 scores below 60
  if (avgScore < 60) return true;
  const lowScores = recentScores.filter(s => s < 60);
  return lowScores.length >= 2;
}

export function calculateDateRange(range: '3m' | '6m' | '12m'): { from: string; to: string } {
  const toDate = new Date();
  const fromDate = new Date();
  
  if (range === '3m') {
    fromDate.setMonth(toDate.getMonth() - 3);
  } else if (range === '6m') {
    fromDate.setMonth(toDate.getMonth() - 6);
  } else if (range === '12m') {
    fromDate.setFullYear(toDate.getFullYear() - 1);
  }
  
  return {
    from: fromDate.toISOString().split('T')[0],
    to: toDate.toISOString().split('T')[0],
  };
}

export function formatReportData(report: any) {
  return {
    ...report,
    strengths: report.strengths || [],
    focus_areas: report.focus_areas || [],
    comments: report.comments || [],
  };
}


