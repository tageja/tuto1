'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card } from '../../../../components/ui/Card';
import { OffboardingModal } from '../../../../components/tutoadmin/OffboardingModal';
import { AdminCodeGenerator } from '../../../../components/tutoadmin/AdminCodeGenerator';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  Building2,
  ArrowLeft,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  Mail,
  Phone,
  MapPin,
  Crown,
  Zap,
  Star,
  Key,
  LogOut,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';

interface SchoolMetrics {
  students: number;
  teachers: number;
  classes: number;
  partnershipMonths: number;
}

interface AdminCode {
  id: string;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
  is_single_use: boolean;
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
  contact_phone: string;
  created_at: string;
  metrics: SchoolMetrics;
  adminCodes: AdminCode[];
  offboardingRecord: any | null;
}

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const schoolId = params.id as string;
  const initialAction = searchParams.get('action');

  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOffboardingModal, setShowOffboardingModal] = useState(initialAction === 'offboard');
  const [showAdminCodeModal, setShowAdminCodeModal] = useState(initialAction === 'generate-code');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadSchool();
  }, [schoolId]);

  async function loadSchool() {
    try {
      setLoading(true);
      const response = await fetch(`/api/tutoadmin/schools/${schoolId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSchool(data.school);
        }
      } else {
        console.error('Failed to load school');
      }
    } catch (error) {
      console.error('Error loading school:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateCode = async () => {
    const response = await fetch(`/api/tutoadmin/schools/${schoolId}/admin-code`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        loadSchool(); // Refresh to show new code
        return { code: data.code, expiresAt: data.expiresAt };
      }
    }
    return null;
  };

  const handleOffboard = async (offboardingData: any) => {
    const response = await fetch(`/api/tutoadmin/schools/${schoolId}/offboard`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...offboardingData,
        handledByEmail: user?.email,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        loadSchool(); // Refresh
        router.push('/tutoadmin/schools');
      } else {
        throw new Error(data.error);
      }
    } else {
      throw new Error('Failed to offboard school');
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCodeStatus = (code: AdminCode) => {
    const now = new Date();
    const expires = new Date(code.expires_at);
    
    if (code.status === 'used') return { label: 'Used', color: 'bg-success/10 text-success' };
    if (now > expires) return { label: 'Expired', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
    return { label: 'Active', color: 'bg-primary/10 text-primary' };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface rounded w-1/4"></div>
          <div className="h-48 bg-surface rounded-lg"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-surface rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text mb-2">School Not Found</h2>
          <p className="text-text-muted mb-4">The school you're looking for doesn't exist.</p>
          <Link
            href="/tutoadmin/schools"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schools
          </Link>
        </div>
      </div>
    );
  }

  const isOffboarded = !!school.offboarded_at;
  const PlanIcon = getPlanIcon(school.subscription_plan || 'premium');

  return (
    <div className="p-6">
      {/* Back Button */}
      <Link
        href="/tutoadmin/schools"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Schools
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text">{school.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPlanColor(school.subscription_plan || 'premium')}`}>
                <PlanIcon className="w-3.5 h-3.5" />
                {(school.subscription_plan || 'Premium').charAt(0).toUpperCase() + (school.subscription_plan || 'premium').slice(1)}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isOffboarded ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
              }`}>
                {isOffboarded ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {isOffboarded ? 'Offboarded' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {!isOffboarded && (
          <div className="flex gap-3">
            <Link
              href={`/tutoadmin/schools/${schoolId}/import`}
              className="flex items-center gap-2 px-4 py-2 border border-border text-text rounded-lg hover:bg-surface transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Import Data
            </Link>
            <button
              onClick={() => setShowAdminCodeModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border text-text rounded-lg hover:bg-surface transition-colors"
            >
              <Key className="w-4 h-4" />
              Generate Admin Code
            </button>
            <button
              onClick={() => setShowOffboardingModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Offboard
            </button>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{school.metrics.students}</p>
              <p className="text-sm text-text-muted">Students</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{school.metrics.teachers}</p>
              <p className="text-sm text-text-muted">Teachers</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{school.metrics.classes}</p>
              <p className="text-sm text-text-muted">Classes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{school.metrics.partnershipMonths}</p>
              <p className="text-sm text-text-muted">Months Partnership</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4">School Information</h3>
          <div className="space-y-4">
            {school.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-text-muted" />
                <div>
                  <p className="text-sm text-text-muted">Email</p>
                  <p className="text-text">{school.email}</p>
                </div>
              </div>
            )}

            {school.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-text-muted" />
                <div>
                  <p className="text-sm text-text-muted">Phone</p>
                  <p className="text-text">{school.phone}</p>
                </div>
              </div>
            )}

            {school.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-text-muted" />
                <div>
                  <p className="text-sm text-text-muted">Address</p>
                  <p className="text-text">{school.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-text-muted" />
              <div>
                <p className="text-sm text-text-muted">Partner Since</p>
                <p className="text-text">
                  {formatDate(school.partnership_start_date || school.created_at)}
                </p>
              </div>
            </div>
          </div>

          {(school.contact_name || school.contact_email) && (
            <>
              <hr className="my-4 border-border" />
              <h4 className="font-medium text-text mb-3">Primary Contact</h4>
              <div className="space-y-2">
                {school.contact_name && (
                  <p className="text-text">{school.contact_name}</p>
                )}
                {school.contact_email && (
                  <p className="text-text-muted text-sm">{school.contact_email}</p>
                )}
                {school.contact_phone && (
                  <p className="text-text-muted text-sm">{school.contact_phone}</p>
                )}
              </div>
            </>
          )}
        </Card>

        {/* Admin Codes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">Admin Codes</h3>
            {!isOffboarded && (
              <button
                onClick={() => setShowAdminCodeModal(true)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Key className="w-4 h-4" />
                Generate New
              </button>
            )}
          </div>

          {school.adminCodes.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">No admin codes generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {school.adminCodes.map((code) => {
                const status = getCodeStatus(code);
                return (
                  <div
                    key={code.id}
                    className="flex items-center justify-between p-3 bg-surface rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-sm text-text">{code.token}</code>
                      <button
                        onClick={() => handleCopyCode(code.token)}
                        className="p-1 text-text-muted hover:text-primary transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === code.token ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDateTime(code.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Offboarding Record */}
      {school.offboardingRecord && (
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text">Offboarding Record</h3>
              <p className="text-sm text-text-muted">
                Offboarded on {formatDate(school.offboardingRecord.offboard_date)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-text-muted">Reason</p>
              <p className="text-text font-medium capitalize">
                {school.offboardingRecord.reason?.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Partnership Duration</p>
              <p className="text-text font-medium">
                {school.offboardingRecord.partnership_duration_months} months
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Students Served</p>
              <p className="text-text font-medium">
                {school.offboardingRecord.total_students_served}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Exit Interview</p>
              <p className="text-text font-medium">
                {school.offboardingRecord.exit_interview_conducted ? 'Conducted' : 'Not conducted'}
              </p>
            </div>
          </div>

          {school.offboardingRecord.reason_details && (
            <div className="mt-4 p-3 bg-surface rounded-lg">
              <p className="text-sm text-text-muted mb-1">Additional Details</p>
              <p className="text-text text-sm">{school.offboardingRecord.reason_details}</p>
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <OffboardingModal
        isOpen={showOffboardingModal}
        onClose={() => setShowOffboardingModal(false)}
        school={{
          id: school.id,
          name: school.name,
          partnershipMonths: school.metrics.partnershipMonths,
          students: school.metrics.students,
          teachers: school.metrics.teachers,
        }}
        onConfirm={handleOffboard}
      />

      <AdminCodeGenerator
        isOpen={showAdminCodeModal}
        onClose={() => setShowAdminCodeModal(false)}
        school={{
          id: school.id,
          name: school.name,
          contact_email: school.contact_email || school.email,
        }}
        onGenerate={handleGenerateCode}
      />
    </div>
  );
}

