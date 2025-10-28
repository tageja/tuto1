import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { AIInsightPanel } from '../AIInsightPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const subjectProgress = [
  {
    subject: 'Mathematics',
    current: 'A',
    previous: 'A-',
    score: 92,
    previousScore: 88,
    trend: 'up' as const,
    color: '#0B5FFF',
  },
  {
    subject: 'Science',
    current: 'A-',
    previous: 'B+',
    score: 88,
    previousScore: 85,
    trend: 'up' as const,
    color: '#6366F1',
  },
  {
    subject: 'English',
    current: 'B+',
    previous: 'B+',
    score: 85,
    previousScore: 85,
    trend: 'stable' as const,
    color: '#3B82F6',
  },
  {
    subject: 'History',
    current: 'A',
    previous: 'A',
    score: 93,
    previousScore: 92,
    trend: 'up' as const,
    color: '#16A34A',
  },
  {
    subject: 'Art',
    current: 'A-',
    previous: 'A',
    score: 87,
    previousScore: 90,
    trend: 'down' as const,
    color: '#F59E0B',
  },
  {
    subject: 'Physical Education',
    current: 'A',
    previous: 'A-',
    score: 95,
    previousScore: 88,
    trend: 'up' as const,
    color: '#22C55E',
  },
];

const performanceData3Months = [
  { month: 'Aug', math: 85, science: 82, english: 80, history: 88 },
  { month: 'Sep', math: 88, science: 85, english: 83, history: 90 },
  { month: 'Oct', math: 92, science: 88, english: 85, history: 93 },
];

const performanceData6Months = [
  { month: 'May', math: 80, science: 78, english: 75, history: 82 },
  { month: 'Jun', math: 82, science: 80, english: 78, history: 85 },
  { month: 'Jul', math: 83, science: 81, english: 79, history: 86 },
  { month: 'Aug', math: 85, science: 82, english: 80, history: 88 },
  { month: 'Sep', math: 88, science: 85, english: 83, history: 90 },
  { month: 'Oct', math: 92, science: 88, english: 85, history: 93 },
];

const performanceData12Months = [
  { month: 'Nov 24', math: 75, science: 73, english: 70, history: 78 },
  { month: 'Dec 24', math: 77, science: 75, english: 72, history: 80 },
  { month: 'Jan', math: 78, science: 76, english: 73, history: 81 },
  { month: 'Feb', math: 79, science: 77, english: 74, history: 82 },
  { month: 'Mar', math: 80, science: 78, english: 75, history: 83 },
  { month: 'Apr', math: 81, science: 79, english: 76, history: 84 },
  { month: 'May', math: 82, science: 80, english: 78, history: 85 },
  { month: 'Jun', math: 83, science: 81, english: 79, history: 86 },
  { month: 'Jul', math: 84, science: 82, english: 80, history: 87 },
  { month: 'Aug', math: 85, science: 83, english: 81, history: 88 },
  { month: 'Sep', math: 88, science: 85, english: 83, history: 90 },
  { month: 'Oct', math: 92, science: 88, english: 85, history: 93 },
];

export function ProgressPage() {
  const { t } = useApp();
  const [period, setPeriod] = useState<'3' | '6' | '12'>('3');

  const performanceData = 
    period === '3' ? performanceData3Months :
    period === '6' ? performanceData6Months :
    performanceData12Months;

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-600" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-muted-foreground" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="m-0">{t('progressReports')}</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-gradient-to-r from-[#0B5FFF] to-[#6366F1] rounded-xl p-6 text-white">
        <h2 className="text-white m-0 mb-1">Emily Chen</h2>
        <p className="text-white/90 m-0">Grade 5A • Academic Year 2025-2026</p>
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
        <TabsList>
          <TabsTrigger value="3">3 Months</TabsTrigger>
          <TabsTrigger value="6">6 Months</TabsTrigger>
          <TabsTrigger value="12">12 Months</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjectProgress.map((subject) => (
          <div key={subject.subject} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="m-0 mb-1">{subject.subject}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{subject.current}</span>
                  <TrendIcon trend={subject.trend} />
                  <span className="text-sm text-muted-foreground">
                    from {subject.previous}
                  </span>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: subject.color }} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Score</span>
                <span>{subject.score}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${subject.score}%`,
                    backgroundColor: subject.color,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Previous: {subject.previousScore}%</span>
                <span className={subject.trend === 'up' ? 'text-green-600' : subject.trend === 'down' ? 'text-red-600' : ''}>
                  {subject.trend === 'up' ? '+' : subject.trend === 'down' ? '-' : ''}
                  {Math.abs(subject.score - subject.previousScore)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="m-0 mb-6">Performance Trend ({period} Months)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="math" stroke="#0B5FFF" strokeWidth={2} name="Mathematics" />
            <Line type="monotone" dataKey="science" stroke="#6366F1" strokeWidth={2} name="Science" />
            <Line type="monotone" dataKey="english" stroke="#3B82F6" strokeWidth={2} name="English" />
            <Line type="monotone" dataKey="history" stroke="#16A34A" strokeWidth={2} name="History" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsightPanel
          title="Performance Analysis"
          body="Emily shows exceptional improvement in Mathematics (+12% over 3 months) and maintains strong performance in History. Reading comprehension skills have improved significantly."
          metric={{ label: 'Overall Progress', value: '+8.5%', trend: 'up' }}
        />
        
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="m-0 mb-4">Strengths & Areas for Improvement</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Strengths
                </Badge>
              </div>
              <ul className="space-y-1 ml-4">
                <li className="text-sm">Strong analytical skills in Mathematics</li>
                <li className="text-sm">Excellent historical knowledge retention</li>
                <li className="text-sm">High engagement in Science experiments</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  Focus Areas
                </Badge>
              </div>
              <ul className="space-y-1 ml-4">
                <li className="text-sm">Creative expression in Art projects</li>
                <li className="text-sm">Time management for essay completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Comments */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="m-0 mb-4">Teacher Comments</h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-[#0B5FFF] pl-4">
            <div className="flex items-center gap-2 mb-1">
              <span>Ms. Sarah Johnson</span>
              <Badge variant="outline">Mathematics</Badge>
            </div>
            <p className="text-sm text-muted-foreground m-0">
              "Emily has shown remarkable improvement this term. Her problem-solving approach is methodical and she consistently helps peers understand complex concepts."
            </p>
          </div>
          
          <div className="border-l-4 border-[#6366F1] pl-4">
            <div className="flex items-center gap-2 mb-1">
              <span>Mr. David Chen</span>
              <Badge variant="outline">Science</Badge>
            </div>
            <p className="text-sm text-muted-foreground m-0">
              "Emily actively participates in lab activities and shows genuine curiosity about scientific phenomena. Her lab reports are detailed and well-structured."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
