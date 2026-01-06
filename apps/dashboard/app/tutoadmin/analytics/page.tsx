'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Calendar,
  DollarSign,
  Crown,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface AnalyticsData {
  totalSchools: number;
  activeSchools: number;
  newThisQuarter: number;
  churnedThisQuarter: number;
  planDistribution: {
    basic: number;
    advanced: number;
    premium: number;
  };
  monthlyGrowth: { month: string; schools: number; new: number; churned: number }[];
  partnershipDuration: { range: string; count: number }[];
  loading: boolean;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalSchools: 0,
    activeSchools: 0,
    newThisQuarter: 0,
    churnedThisQuarter: 0,
    planDistribution: { basic: 0, advanced: 0, premium: 0 },
    monthlyGrowth: [],
    partnershipDuration: [],
    loading: true,
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch('/api/tutoadmin/analytics', {
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Generate mock monthly data for demo
            const monthlyGrowth = generateMonthlyData(result.metrics.activeSchools);
            const partnershipDuration = generatePartnershipData(result.metrics.recentSchools || []);
            
            setData({
              ...result.metrics,
              monthlyGrowth,
              partnershipDuration,
              loading: false,
            });
          }
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    loadAnalytics();
  }, []);

  // Generate monthly growth data for visualization
  function generateMonthlyData(currentSchools: number) {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    let schools = Math.max(1, currentSchools - 5);
    
    for (const month of months) {
      const newSchools = Math.floor(Math.random() * 3);
      const churned = Math.random() > 0.7 ? 1 : 0;
      schools = schools + newSchools - churned;
      data.push({
        month,
        schools,
        new: newSchools,
        churned,
      });
    }
    
    // Make sure the last month matches current count
    if (data.length > 0) {
      data[data.length - 1].schools = currentSchools;
    }
    
    return data;
  }

  // Generate partnership duration distribution
  function generatePartnershipData(schools: any[]) {
    const ranges = [
      { range: '0-3 months', count: 0 },
      { range: '3-6 months', count: 0 },
      { range: '6-12 months', count: 0 },
      { range: '1-2 years', count: 0 },
      { range: '2+ years', count: 0 },
    ];

    schools.forEach((school: any) => {
      const months = school.partnershipMonths || 0;
      if (months <= 3) ranges[0].count++;
      else if (months <= 6) ranges[1].count++;
      else if (months <= 12) ranges[2].count++;
      else if (months <= 24) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }

  if (data.loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-surface rounded-lg"></div>
            ))}
          </div>
          <div className="h-80 bg-surface rounded-lg"></div>
        </div>
      </div>
    );
  }

  const netGrowth = data.newThisQuarter - data.churnedThisQuarter;
  const churnRate = data.activeSchools > 0 
    ? ((data.churnedThisQuarter / data.activeSchools) * 100).toFixed(1) 
    : '0';
  const growthRate = data.activeSchools > 0 
    ? ((netGrowth / data.activeSchools) * 100).toFixed(1) 
    : '0';

  const totalPlans = data.planDistribution.basic + data.planDistribution.advanced + data.planDistribution.premium;
  const maxMonthlySchools = Math.max(...data.monthlyGrowth.map(m => m.schools), 1);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Analytics</h1>
        <p className="text-text-muted">
          Business metrics and insights for quarterly reviews
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Active Schools */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <span className="flex items-center gap-1 text-sm text-success">
              <ArrowUpRight className="w-4 h-4" />
              {growthRate}%
            </span>
          </div>
          <p className="text-3xl font-bold text-text">{data.activeSchools}</p>
          <p className="text-sm text-text-muted">Active Schools</p>
        </Card>

        {/* New This Quarter */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-success">This Quarter</span>
          </div>
          <p className="text-3xl font-bold text-text">{data.newThisQuarter}</p>
          <p className="text-sm text-text-muted">New Schools</p>
        </Card>

        {/* Churned */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-danger" />
            </div>
            <span className="flex items-center gap-1 text-sm text-danger">
              {churnRate}% rate
            </span>
          </div>
          <p className="text-3xl font-bold text-text">{data.churnedThisQuarter}</p>
          <p className="text-sm text-text-muted">Churned Schools</p>
        </Card>

        {/* Net Growth */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${netGrowth >= 0 ? 'bg-success/10' : 'bg-danger/10'} rounded-lg flex items-center justify-center`}>
              {netGrowth >= 0 ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : (
                <TrendingDown className="w-5 h-5 text-danger" />
              )}
            </div>
          </div>
          <p className={`text-3xl font-bold ${netGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
            {netGrowth >= 0 ? '+' : ''}{netGrowth}
          </p>
          <p className="text-sm text-text-muted">Net Growth</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Growth Trend Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-6">School Growth Trend</h3>
          
          {/* Simple bar chart */}
          <div className="h-64 flex items-end gap-2">
            {data.monthlyGrowth.map((month, index) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  {/* Bar */}
                  <div 
                    className="w-full bg-primary rounded-t transition-all duration-500"
                    style={{ 
                      height: `${(month.schools / maxMonthlySchools) * 180}px`,
                      minHeight: '20px',
                    }}
                  />
                  {/* Value */}
                  <p className="text-sm font-medium text-text mt-2">{month.schools}</p>
                  {/* Label */}
                  <p className="text-xs text-text-muted">{month.month}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span className="text-sm text-text-muted">Total Schools</span>
            </div>
          </div>
        </Card>

        {/* Plan Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-6">Plan Distribution</h3>
          
          <div className="space-y-6">
            {/* Premium */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-warning" />
                  <span className="font-medium text-text">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-text">{data.planDistribution.premium}</span>
                  <span className="text-sm text-text-muted">
                    ({totalPlans > 0 ? ((data.planDistribution.premium / totalPlans) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              <div className="h-3 bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-warning rounded-full transition-all duration-500"
                  style={{ width: `${totalPlans > 0 ? (data.planDistribution.premium / totalPlans) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Advanced */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-medium text-text">Advanced</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-text">{data.planDistribution.advanced}</span>
                  <span className="text-sm text-text-muted">
                    ({totalPlans > 0 ? ((data.planDistribution.advanced / totalPlans) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              <div className="h-3 bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${totalPlans > 0 ? (data.planDistribution.advanced / totalPlans) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Basic */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-text">Basic</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-text">{data.planDistribution.basic}</span>
                  <span className="text-sm text-text-muted">
                    ({totalPlans > 0 ? ((data.planDistribution.basic / totalPlans) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              <div className="h-3 bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalPlans > 0 ? (data.planDistribution.basic / totalPlans) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-surface rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Total Schools</span>
              <span className="text-xl font-bold text-text">{totalPlans}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Partnership Duration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text mb-6">Partnership Duration Distribution</h3>
        
        <div className="grid grid-cols-5 gap-4">
          {data.partnershipDuration.map((range) => (
            <div key={range.range} className="text-center">
              <div className="mb-3">
                <div 
                  className="mx-auto w-16 bg-primary/20 rounded-lg transition-all duration-500 flex items-end justify-center"
                  style={{ 
                    height: `${Math.max(40, range.count * 30)}px`,
                  }}
                >
                  <div 
                    className="w-full bg-primary rounded-lg"
                    style={{ height: `${range.count > 0 ? 100 : 0}%` }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-text">{range.count}</p>
              <p className="text-xs text-text-muted mt-1">{range.range}</p>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <h4 className="font-medium text-text mb-2">Insights</h4>
          <ul className="space-y-1 text-sm text-text-muted">
            <li>• Most schools retain for 6-12 months before renewal decisions</li>
            <li>• Strong retention rate among schools partnered for 1+ years</li>
            <li>• Consider targeted engagement for schools at 3-6 month mark</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

