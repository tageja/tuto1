'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import {
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Crown,
  Zap,
  Star,
} from 'lucide-react';
import Link from 'next/link';

interface SchoolSummary {
  id: string;
  name: string;
  plan: string;
  status: string;
  students: number;
  teachers: number;
  partnershipMonths: number;
}

interface DashboardMetrics {
  totalSchools: number;
  activeSchools: number;
  newThisQuarter: number;
  churnedThisQuarter: number;
  planDistribution: {
    basic: number;
    advanced: number;
    premium: number;
  };
  recentSchools: SchoolSummary[];
  loading: boolean;
}

export default function TutoAdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSchools: 0,
    activeSchools: 0,
    newThisQuarter: 0,
    churnedThisQuarter: 0,
    planDistribution: { basic: 0, advanced: 0, premium: 0 },
    recentSchools: [],
    loading: true,
  });

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await fetch('/api/tutoadmin/analytics', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMetrics({
              ...data.metrics,
              loading: false,
            });
          } else {
            setMetrics(prev => ({ ...prev, loading: false }));
          }
        } else {
          setMetrics(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    }

    loadMetrics();
  }, []);

  if (metrics.loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-surface rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-surface rounded-lg"></div>
        </div>
      </div>
    );
  }

  const netGrowth = metrics.newThisQuarter - metrics.churnedThisQuarter;
  const growthRate = metrics.activeSchools > 0 
    ? ((netGrowth / metrics.activeSchools) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Tuto Admin Dashboard</h1>
        <p className="text-text-muted">
          Overview of all partner schools and business metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Schools */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-2">Total Partner Schools</p>
              <h3 className="text-3xl font-bold text-text">{metrics.activeSchools}</h3>
              <p className="text-sm text-text-muted mt-1">
                {metrics.totalSchools} total registered
              </p>
            </div>
            <div className="bg-primary p-3 rounded-xl text-primary-foreground">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* New This Quarter */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-2">New This Quarter</p>
              <h3 className="text-3xl font-bold text-text">{metrics.newThisQuarter}</h3>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm text-success">Onboarded</span>
              </div>
            </div>
            <div className="bg-success p-3 rounded-xl text-white">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Churned This Quarter */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-2">Churned This Quarter</p>
              <h3 className="text-3xl font-bold text-text">{metrics.churnedThisQuarter}</h3>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-4 h-4 text-danger" />
                <span className="text-sm text-danger">Offboarded</span>
              </div>
            </div>
            <div className="bg-danger p-3 rounded-xl text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Net Growth */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-2">Net Growth</p>
              <h3 className={`text-3xl font-bold ${netGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                {netGrowth >= 0 ? '+' : ''}{netGrowth}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {netGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span className={`text-sm ${netGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                  {growthRate}% this quarter
                </span>
              </div>
            </div>
            <div className={`${netGrowth >= 0 ? 'bg-success' : 'bg-danger'} p-3 rounded-xl text-white`}>
              {netGrowth >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
          </div>
        </Card>
      </div>

      {/* Plan Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Plan Distribution */}
        <Card className="p-6 col-span-2">
          <h3 className="text-lg font-semibold text-text mb-6">Schools by Plan</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Basic */}
            <div className="text-center p-4 bg-surface rounded-xl">
              <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-text">{metrics.planDistribution.basic}</p>
              <p className="text-sm text-text-muted">Basic</p>
            </div>

            {/* Advanced */}
            <div className="text-center p-4 bg-surface rounded-xl">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-text">{metrics.planDistribution.advanced}</p>
              <p className="text-sm text-text-muted">Advanced</p>
            </div>

            {/* Premium */}
            <div className="text-center p-4 bg-surface rounded-xl">
              <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-text">{metrics.planDistribution.premium}</p>
              <p className="text-sm text-text-muted">Premium</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-4 bg-surface rounded-full overflow-hidden flex">
              {metrics.activeSchools > 0 && (
                <>
                  <div 
                    className="bg-gray-500 h-full" 
                    style={{ width: `${(metrics.planDistribution.basic / metrics.activeSchools) * 100}%` }}
                  />
                  <div 
                    className="bg-primary h-full" 
                    style={{ width: `${(metrics.planDistribution.advanced / metrics.activeSchools) * 100}%` }}
                  />
                  <div 
                    className="bg-warning h-full" 
                    style={{ width: `${(metrics.planDistribution.premium / metrics.activeSchools) * 100}%` }}
                  />
                </>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-text-muted">
              <span>Basic: {metrics.activeSchools > 0 ? ((metrics.planDistribution.basic / metrics.activeSchools) * 100).toFixed(0) : 0}%</span>
              <span>Advanced: {metrics.activeSchools > 0 ? ((metrics.planDistribution.advanced / metrics.activeSchools) * 100).toFixed(0) : 0}%</span>
              <span>Premium: {metrics.activeSchools > 0 ? ((metrics.planDistribution.premium / metrics.activeSchools) * 100).toFixed(0) : 0}%</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/tutoadmin/schools/onboard"
              className="flex items-center justify-between p-4 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-primary" />
                <span className="font-medium text-text">Onboard New School</span>
              </div>
              <ArrowRight className="w-5 h-5 text-primary" />
            </Link>

            <Link
              href="/tutoadmin/schools"
              className="flex items-center justify-between p-4 bg-surface hover:bg-border rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-text-muted" />
                <span className="font-medium text-text">View All Schools</span>
              </div>
              <ArrowRight className="w-5 h-5 text-text-muted" />
            </Link>

            <Link
              href="/tutoadmin/analytics"
              className="flex items-center justify-between p-4 bg-surface hover:bg-border rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-text-muted" />
                <span className="font-medium text-text">View Analytics</span>
              </div>
              <ArrowRight className="w-5 h-5 text-text-muted" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Schools */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text">Recent Partner Schools</h3>
          <Link 
            href="/tutoadmin/schools"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {metrics.recentSchools.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">No schools yet</p>
            <Link 
              href="/tutoadmin/schools/onboard"
              className="text-primary hover:underline text-sm mt-2 inline-block"
            >
              Onboard your first school
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">School</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Students</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Teachers</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Partnership</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentSchools.map((school) => (
                  <tr key={school.id} className="border-b border-border hover:bg-surface/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-text">{school.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        school.plan === 'premium' ? 'bg-warning/10 text-warning' :
                        school.plan === 'advanced' ? 'bg-primary/10 text-primary' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {school.plan === 'premium' && <Crown className="w-3 h-3" />}
                        {school.plan === 'advanced' && <Zap className="w-3 h-3" />}
                        {school.plan === 'basic' && <Star className="w-3 h-3" />}
                        {school.plan.charAt(0).toUpperCase() + school.plan.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        school.status === 'active' ? 'bg-success/10 text-success' :
                        school.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                        'bg-danger/10 text-danger'
                      }`}>
                        {school.status === 'active' && <CheckCircle className="w-3 h-3" />}
                        {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-text">{school.students}</td>
                    <td className="py-4 px-4 text-text">{school.teachers}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-text-muted">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {school.partnershipMonths} {school.partnershipMonths === 1 ? 'month' : 'months'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/tutoadmin/schools/${school.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

