'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/Card';
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  User,
  Mail,
  Phone,
  MapPin,
  Crown,
  Zap,
  Star,
  Key,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingData {
  // School Info
  name: string;
  email: string;
  phone: string;
  address: string;
  
  // Contact Person
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Plan
  subscriptionPlan: 'basic' | 'advanced' | 'premium';
}

const PLANS = [
  {
    id: 'basic' as const,
    name: 'Basic',
    icon: Star,
    color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    selectedColor: 'bg-gray-600 text-white border-gray-600',
    description: 'Essential features for small schools',
    features: ['Up to 100 students', 'Basic analytics', 'Email support'],
  },
  {
    id: 'advanced' as const,
    name: 'Advanced',
    icon: Zap,
    color: 'bg-primary/10 text-primary border-primary/20',
    selectedColor: 'bg-primary text-white border-primary',
    description: 'Enhanced features for growing schools',
    features: ['Up to 500 students', 'Advanced analytics', 'Priority support', 'Custom branding'],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    icon: Crown,
    color: 'bg-warning/10 text-warning border-warning/20',
    selectedColor: 'bg-warning text-white border-warning',
    description: 'Full suite for established institutions',
    features: ['Unlimited students', 'Full analytics suite', 'Dedicated support', 'Custom integrations', 'API access'],
  },
];

export default function OnboardSchoolPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ schoolId: string; adminCode: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionPlan: 'premium',
  });

  const totalSteps = 4;

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!data.name.trim();
      case 2:
        return true; // Contact info is optional
      case 3:
        return !!data.subscriptionPlan;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tutoadmin/schools', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setResult({
          schoolId: responseData.school.id,
          adminCode: responseData.adminCode,
          expiresAt: responseData.expiresAt,
        });
        setStep(5); // Move to success step
      } else {
        setError(responseData.error || 'Failed to create school');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.adminCode) return;
    try {
      await navigator.clipboard.writeText(result.adminCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <Link
        href="/tutoadmin/schools"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Schools
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">Onboard New School</h1>
        <p className="text-text-muted">
          Add a new partner school to the Tuto platform
        </p>
      </div>

      {/* Progress */}
      {step <= 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[
              { num: 1, label: 'School Info' },
              { num: 2, label: 'Contact' },
              { num: 3, label: 'Plan' },
              { num: 4, label: 'Review' },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      s.num === step
                        ? 'bg-primary text-primary-foreground'
                        : s.num < step
                        ? 'bg-success text-white'
                        : 'bg-surface text-text-muted'
                    }`}
                  >
                    {s.num < step ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`mt-2 text-sm whitespace-nowrap ${
                    s.num === step ? 'text-primary font-medium' : 'text-text-muted'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 mb-6 ${s.num < step ? 'bg-success' : 'bg-surface'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <Card className="p-8">
        {/* Step 1: School Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text mb-4">School Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                School Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="Enter school name"
                  className="w-full pl-10 pr-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                School Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="school@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  placeholder="+84 xxx xxx xxx"
                  className="w-full pl-10 pr-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                <textarea
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  placeholder="Full address"
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact Person */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text mb-4">Primary Contact Person</h2>
            <p className="text-text-muted text-sm mb-6">
              This is the person who will receive the admin access code
            </p>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={data.contactName}
                  onChange={(e) => setData({ ...data, contactName: e.target.value })}
                  placeholder="Contact person's name"
                  className="w-full pl-10 pr-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={data.contactEmail}
                  onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
                  placeholder="contact@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="tel"
                  value={data.contactPhone}
                  onChange={(e) => setData({ ...data, contactPhone: e.target.value })}
                  placeholder="+84 xxx xxx xxx"
                  className="w-full pl-10 pr-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Plan Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text mb-4">Select Subscription Plan</h2>
            
            <div className="grid gap-4">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = data.subscriptionPlan === plan.id;
                
                return (
                  <button
                    key={plan.id}
                    onClick={() => setData({ ...data, subscriptionPlan: plan.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected ? plan.selectedColor : `${plan.color} hover:border-primary/40`
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-white/20' : ''
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          {isSelected && <Check className="w-5 h-5" />}
                        </div>
                        <p className={`text-sm mt-1 ${isSelected ? 'opacity-90' : 'text-text-muted'}`}>
                          {plan.description}
                        </p>
                        <ul className="mt-3 space-y-1">
                          {plan.features.map((feature) => (
                            <li key={feature} className={`text-sm flex items-center gap-2 ${isSelected ? 'opacity-90' : 'text-text-muted'}`}>
                              <Check className="w-4 h-4" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text mb-4">Review & Confirm</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-surface rounded-xl">
                <h3 className="font-medium text-text mb-3">School Information</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Name</dt>
                    <dd className="text-text font-medium">{data.name || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Email</dt>
                    <dd className="text-text">{data.email || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Phone</dt>
                    <dd className="text-text">{data.phone || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Address</dt>
                    <dd className="text-text text-right max-w-xs">{data.address || '-'}</dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 bg-surface rounded-xl">
                <h3 className="font-medium text-text mb-3">Primary Contact</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Name</dt>
                    <dd className="text-text">{data.contactName || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Email</dt>
                    <dd className="text-text">{data.contactEmail || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Phone</dt>
                    <dd className="text-text">{data.contactPhone || '-'}</dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 bg-surface rounded-xl">
                <h3 className="font-medium text-text mb-3">Subscription Plan</h3>
                <div className="flex items-center gap-3">
                  {(() => {
                    const plan = PLANS.find(p => p.id === data.subscriptionPlan);
                    const Icon = plan?.icon || Star;
                    return (
                      <>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          data.subscriptionPlan === 'premium' ? 'bg-warning/10 text-warning' :
                          data.subscriptionPlan === 'advanced' ? 'bg-primary/10 text-primary' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-text">{plan?.name}</p>
                          <p className="text-sm text-text-muted">{plan?.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && result && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-text mb-2">School Onboarded!</h2>
              <p className="text-text-muted">
                {data.name} has been successfully added to the platform
              </p>
            </div>

            {/* Admin Code */}
            <div className="p-6 bg-surface rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Key className="w-5 h-5 text-primary" />
                <span className="font-medium text-text">Admin Access Code</span>
              </div>
              
              <div className="relative">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-mono font-bold text-text tracking-wider">
                    {result.adminCode}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-primary transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              {copied && (
                <p className="text-sm text-success mt-2">Copied to clipboard!</p>
              )}

              {result.expiresAt && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-text-muted">
                  <Clock className="w-4 h-4" />
                  <span>Expires: {formatExpiryDate(result.expiresAt)}</span>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-left">
              <h3 className="font-medium text-text mb-2">Next Steps</h3>
              <ol className="space-y-2 text-sm text-text-muted list-decimal list-inside">
                <li>Share the admin code securely with {data.contactName || 'the school administrator'}</li>
                <li>Direct them to the admin onboarding page</li>
                <li>They will enter this code to claim admin access</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Link
                href="/tutoadmin/schools"
                className="flex-1 px-4 py-3 border border-border text-text rounded-lg hover:bg-surface transition-colors text-center"
              >
                View All Schools
              </Link>
              <Link
                href={`/tutoadmin/schools/${result.schoolId}`}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
              >
                View School Details
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step <= 4 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={step === 1 ? () => router.push('/tutoadmin/schools') : handleBack}
              className="flex items-center gap-2 px-4 py-2 text-text hover:bg-surface rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create School
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

