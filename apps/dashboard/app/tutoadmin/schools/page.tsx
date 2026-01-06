'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Key,
  LogOut,
  Eye,
  Clock,
  Users,
  GraduationCap,
  Crown,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

interface SchoolMetrics {
  students: number;
  teachers: number;
  classes: number;
  adminCodes: number;
  partnershipMonths: number;
}

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  subscription_plan: string;
  partnership_start_date: string;
  offboarded_at: string | null;
  contact_name: string;
  contact_email: string;
  metrics: SchoolMetrics;
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'offboarded';
type PlanFilter = 'all' | 'basic' | 'advanced' | 'premium';

export default function SchoolsListPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadSchools();
  }, [statusFilter, planFilter]);

  async function loadSchools() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (planFilter !== 'all') params.set('plan', planFilter);

      const response = await fetch(`/api/tutoadmin/schools?${params.toString()}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSchools(data.schools);
        }
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter schools by search query
  const filteredSchools = schools.filter(school => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      school.name?.toLowerCase().includes(query) ||
      school.email?.toLowerCase().includes(query) ||
      school.address?.toLowerCase().includes(query) ||
      school.contact_name?.toLowerCase().includes(query)
    );
  });

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium': return Crown;
      case 'advanced': return Zap;
      default: return Star;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-warning/10 text-warning';
      case 'advanced': return 'bg-primary/10 text-primary';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string, offboarded: boolean) => {
    if (offboarded) return 'bg-danger/10 text-danger';
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-success/10 text-success';
      case 'inactive': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string, offboarded: boolean) => {
    if (offboarded) return XCircle;
    switch (status?.toLowerCase()) {
      case 'active': return CheckCircle;
      case 'inactive': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Schools</h1>
          <p className="text-text-muted">
            Manage all partner schools and their subscriptions
          </p>
        </div>
        <Link
          href="/tutoadmin/schools/onboard"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Onboard School
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search schools by name, email, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text hover:bg-surface'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Status</label>
              <div className="flex gap-2">
                {(['all', 'active', 'inactive', 'offboarded'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      statusFilter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface text-text hover:bg-border'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Filter */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Plan</label>
              <div className="flex gap-2">
                {(['all', 'basic', 'advanced', 'premium'] as PlanFilter[]).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setPlanFilter(plan)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      planFilter === plan
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface text-text hover:bg-border'
                    }`}
                  >
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Schools Table */}
      <Card className="overflow-visible" padding="none">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-surface rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text mb-2">No schools found</h3>
            <p className="text-text-muted mb-4">
              {searchQuery || statusFilter !== 'all' || planFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by onboarding your first school'}
            </p>
            {!searchQuery && statusFilter === 'all' && planFilter === 'all' && (
              <Link
                href="/tutoadmin/schools/onboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Onboard School
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-text-muted">School</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-text-muted">Plan</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-text-muted">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-text-muted">Students</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-text-muted">Teachers</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-text-muted">Partnership</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSchools.map((school) => {
                  const PlanIcon = getPlanIcon(school.subscription_plan || 'premium');
                  const StatusIcon = getStatusIcon(school.status, !!school.offboarded_at);
                  const isOffboarded = !!school.offboarded_at;

                  return (
                    <tr key={school.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-text truncate">{school.name}</p>
                            <p className="text-sm text-text-muted truncate">{school.email || school.contact_email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPlanColor(school.subscription_plan || 'premium')}`}>
                          <PlanIcon className="w-3.5 h-3.5" />
                          {(school.subscription_plan || 'Premium').charAt(0).toUpperCase() + (school.subscription_plan || 'premium').slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(school.status, isOffboarded)}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {isOffboarded ? 'Offboarded' : (school.status?.charAt(0).toUpperCase() + school.status?.slice(1) || 'Active')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-text">
                          <Users className="w-4 h-4 text-text-muted" />
                          {school.metrics?.students || 0}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-text">
                          <GraduationCap className="w-4 h-4 text-text-muted" />
                          {school.metrics?.teachers || 0}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-text-muted">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {school.metrics?.partnershipMonths || 0} {school.metrics?.partnershipMonths === 1 ? 'month' : 'months'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/tutoadmin/schools/${school.id}`}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          
                          {/* Dropdown Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === school.id ? null : school.id)}
                              className="p-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            {activeDropdown === school.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-40" 
                                  onClick={() => setActiveDropdown(null)}
                                />
                                <div className="absolute right-0 bottom-full mb-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-50">
                                  <Link
                                    href={`/tutoadmin/schools/${school.id}`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface transition-colors"
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </Link>
                                  {!isOffboarded && (
                                    <>
                                      <Link
                                        href={`/tutoadmin/schools/${school.id}?action=generate-code`}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface transition-colors"
                                        onClick={() => setActiveDropdown(null)}
                                      >
                                        <Key className="w-4 h-4" />
                                        Generate Admin Code
                                      </Link>
                                      <Link
                                        href={`/tutoadmin/schools/${school.id}?action=offboard`}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                                        onClick={() => setActiveDropdown(null)}
                                      >
                                        <LogOut className="w-4 h-4" />
                                        Offboard School
                                      </Link>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Results count */}
        {!loading && filteredSchools.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-surface/50">
            <p className="text-sm text-text-muted">
              Showing {filteredSchools.length} of {schools.length} schools
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

