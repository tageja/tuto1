'use client';

import { useState } from 'react';
import { X, AlertTriangle, ChevronRight, ChevronLeft, Check, Building2 } from 'lucide-react';

interface OffboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: {
    id: string;
    name: string;
    partnershipMonths?: number;
    students?: number;
    teachers?: number;
  };
  onConfirm: (data: OffboardingData) => Promise<void>;
}

interface OffboardingData {
  reason: string;
  reasonDetails: string;
  offboardDate: string;
  scheduledDate: string;
  outstandingBalanceCents: number;
  dataRetentionMonths: number;
  dataExportProvided: boolean;
  exitInterviewConducted: boolean;
  exitInterviewNotes: string;
  satisfactionRating: number | null;
  wouldRecommend: boolean | null;
  likelihoodToReturn: string;
}

const OFFBOARDING_REASONS = [
  { value: 'contract_ended', label: 'Contract Ended / Not Renewed' },
  { value: 'budget_constraints', label: 'Budget Constraints' },
  { value: 'service_dissatisfaction', label: 'Service Dissatisfaction' },
  { value: 'switching_competitor', label: 'Switching to Competitor' },
  { value: 'school_closure', label: 'School Closure' },
  { value: 'merger_acquisition', label: 'Merger / Acquisition' },
  { value: 'payment_issues', label: 'Payment Issues (Tuto Initiated)' },
  { value: 'other', label: 'Other' },
];

const DATA_RETENTION_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months (default)' },
  { value: 24, label: '24 months' },
  { value: 36, label: '36 months' },
];

export function OffboardingModal({ isOpen, onClose, school, onConfirm }: OffboardingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OffboardingData>({
    reason: '',
    reasonDetails: '',
    offboardDate: new Date().toISOString().split('T')[0],
    scheduledDate: '',
    outstandingBalanceCents: 0,
    dataRetentionMonths: 12,
    dataExportProvided: false,
    exitInterviewConducted: false,
    exitInterviewNotes: '',
    satisfactionRating: null,
    wouldRecommend: null,
    likelihoodToReturn: 'unknown',
  });

  const totalSteps = 4;

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(data);
      onClose();
    } catch (error) {
      console.error('Offboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!data.reason;
      case 2:
        return !!data.offboardDate;
      case 3:
        return true; // Exit interview is optional
      case 4:
        return true; // Confirmation step
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-xl mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text">Offboard School</h2>
              <p className="text-sm text-text-muted">{school.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s === step
                      ? 'bg-primary text-primary-foreground'
                      : s < step
                      ? 'bg-success text-white'
                      : 'bg-surface text-text-muted'
                  }`}
                >
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-full h-1 mx-2 ${s < step ? 'bg-success' : 'bg-surface'}`} style={{ width: '60px' }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>Reason</span>
            <span>Schedule</span>
            <span>Exit Interview</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Reason */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Reason for Offboarding <span className="text-danger">*</span>
                </label>
                <select
                  value={data.reason}
                  onChange={(e) => setData({ ...data, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Select a reason...</option>
                  {OFFBOARDING_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Additional Details
                </label>
                <textarea
                  value={data.reasonDetails}
                  onChange={(e) => setData({ ...data, reasonDetails: e.target.value })}
                  placeholder="Provide any additional context or details about the offboarding..."
                  rows={4}
                  className="w-full px-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Schedule & Financial */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Offboard Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={data.offboardDate}
                    onChange={(e) => setData({ ...data, offboardDate: e.target.value })}
                    className="w-full px-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Final Billing Date
                  </label>
                  <input
                    type="date"
                    value={data.scheduledDate}
                    onChange={(e) => setData({ ...data, scheduledDate: e.target.value })}
                    className="w-full px-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Outstanding Balance (VND)
                </label>
                <input
                  type="number"
                  value={data.outstandingBalanceCents / 1}
                  onChange={(e) => setData({ ...data, outstandingBalanceCents: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Data Retention Period
                </label>
                <select
                  value={data.dataRetentionMonths}
                  onChange={(e) => setData({ ...data, dataRetentionMonths: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {DATA_RETENTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.dataExportProvided}
                  onChange={(e) => setData({ ...data, dataExportProvided: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-text">Data export provided to school</span>
              </label>
            </div>
          )}

          {/* Step 3: Exit Interview */}
          {step === 3 && (
            <div className="space-y-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.exitInterviewConducted}
                  onChange={(e) => setData({ ...data, exitInterviewConducted: e.target.checked })}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-text font-medium">Exit interview conducted</span>
              </label>

              {data.exitInterviewConducted && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Satisfaction Rating (1-5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setData({ ...data, satisfactionRating: rating })}
                          className={`w-12 h-12 rounded-lg text-lg font-medium transition-colors ${
                            data.satisfactionRating === rating
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-surface text-text hover:bg-border'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Would they recommend Tuto?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recommend"
                          checked={data.wouldRecommend === true}
                          onChange={() => setData({ ...data, wouldRecommend: true })}
                          className="w-5 h-5"
                        />
                        <span className="text-text">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recommend"
                          checked={data.wouldRecommend === false}
                          onChange={() => setData({ ...data, wouldRecommend: false })}
                          className="w-5 h-5"
                        />
                        <span className="text-text">No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Likelihood to Return
                    </label>
                    <select
                      value={data.likelihoodToReturn}
                      onChange={(e) => setData({ ...data, likelihoodToReturn: e.target.value })}
                      className="w-full px-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Interview Notes
                    </label>
                    <textarea
                      value={data.exitInterviewNotes}
                      onChange={(e) => setData({ ...data, exitInterviewNotes: e.target.value })}
                      placeholder="Key feedback and insights from the exit interview..."
                      rows={4}
                      className="w-full px-4 py-3 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-danger">Confirm Offboarding</h3>
                    <p className="text-sm text-text-muted mt-1">
                      This action will mark <strong>{school.name}</strong> as offboarded. 
                      This cannot be easily undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-text">Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-text-muted">Reason</p>
                    <p className="text-text font-medium">
                      {OFFBOARDING_REASONS.find(r => r.value === data.reason)?.label || data.reason}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">Offboard Date</p>
                    <p className="text-text font-medium">{data.offboardDate}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Data Retention</p>
                    <p className="text-text font-medium">{data.dataRetentionMonths} months</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Exit Interview</p>
                    <p className="text-text font-medium">
                      {data.exitInterviewConducted ? 'Conducted' : 'Not conducted'}
                    </p>
                  </div>
                  {school.partnershipMonths !== undefined && (
                    <div>
                      <p className="text-text-muted">Partnership Duration</p>
                      <p className="text-text font-medium">{school.partnershipMonths} months</p>
                    </div>
                  )}
                  {school.students !== undefined && (
                    <div>
                      <p className="text-text-muted">Students Served</p>
                      <p className="text-text font-medium">{school.students}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-text hover:bg-surface rounded-lg transition-colors"
          >
            {step === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                Back
              </>
            )}
          </button>

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Offboarding
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



