'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';
import supabase from '../../lib/supabase';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  classes: Array<{ id: string; name: string }>;
  students: Array<{ id: string; first_name: string; last_name: string; class_id?: string }>;
}

export function CreatePaymentModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  classes,
  students,
}: CreatePaymentModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'tuition' | 'trip' | 'club' | 'misc'>('tuition');
  const [amount, setAmount] = useState('');
  const [target, setTarget] = useState<'school' | 'class' | 'students'>('school');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [enableLateFee, setEnableLateFee] = useState(false);
  const [lateFeeMode, setLateFeeMode] = useState<'flat' | '%'>('flat');
  const [lateFeeAmount, setLateFeeAmount] = useState('');
  const [lateFeePercent, setLateFeePercent] = useState('');
  const [lateFeeAfterDays, setLateFeeAfterDays] = useState('3');

  // Format number with thousand separators (e.g., 200000 -> 200,000)
  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    // Add commas as thousand separators
    return parseInt(numericValue, 10).toLocaleString('en-US');
  };

  // Parse formatted number back to raw value (e.g., 200,000 -> 200000)
  const parseFormattedNumber = (value: string): number => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue ? parseInt(numericValue, 10) : 0;
  };

  // Handle amount input change with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithCommas(e.target.value);
    setAmount(formatted);
  };

  // Handle late fee amount input change with formatting
  const handleLateFeeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithCommas(e.target.value);
    setLateFeeAmount(formatted);
  };

  // Filter students by selected class (students should have class_id when loaded for a class)
  const availableStudents = selectedClassId
    ? students
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title || !type || !amount || !dueDate) {
      alert(t('dashboard.payments.createPayment.validation.titleRequired') || 'Please fill in all required fields');
      return;
    }

    if (target === 'class' && !selectedClassId) {
      alert(t('dashboard.payments.createPayment.validation.classRequired') || 'Please select a class');
      return;
    }

    if (target === 'students' && selectedStudentIds.length === 0) {
      alert(t('dashboard.payments.createPayment.validation.studentsRequired') || 'Please select at least one student');
      return;
    }

    // VND doesn't use cents, store full amount directly (parse formatted value)
    const amountCents = parseFormattedNumber(amount);
    if (amountCents <= 0) {
      alert(t('dashboard.payments.createPayment.validation.amountPositive') || 'Amount must be positive');
      return;
    }

    setLoading(true);

    try {
      // Get current user for created_by
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError || !userData) {
        throw new Error('User profile not found. Please contact support.');
      }

      // Prepare late fee rule if enabled
      let lateFeeRule = null;
      let lateFeeCents = null;

      if (enableLateFee) {
        if (lateFeeMode === 'flat') {
          // VND doesn't use cents, store full amount directly (parse formatted value)
          lateFeeCents = parseFormattedNumber(lateFeeAmount);
          lateFeeRule = {
            after_days: parseInt(lateFeeAfterDays) || 3,
            mode: 'flat',
            amount: lateFeeCents,
          };
        } else {
          lateFeeRule = {
            after_days: parseInt(lateFeeAfterDays) || 3,
            mode: '%',
            percent: parseFloat(lateFeePercent) || 5,
          };
        }
      }

      console.log('Creating payment with data:', {
        schoolId,
        title,
        target,
        amount_cents: amountCents,
        due_date: dueDate,
        created_by: userData.id,
      });

      const response = await fetch('/api/school/payments/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          title,
          description: notes || null,
          target,
          classId: target === 'class' ? selectedClassId : null,
          studentIds: target === 'students' ? selectedStudentIds : null,
          type,
          amount_cents: amountCents,
          currency: 'VND',
          due_date: dueDate,
          late_fee_cents: lateFeeCents,
          late_fee_rule: lateFeeRule,
          notes: notes || null,
          created_by: userData.id,
        }),
      });

      console.log('Payment API response status:', response.status);
      const data = await response.json();
      console.log('Payment API response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to create payment');
      }

      alert(t('dashboard.payments.createPayment.success') || 'Payment created successfully!');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      alert(error.message || t('dashboard.payments.createPayment.error') || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setType('tuition');
    setAmount('');
    setTarget('school');
    setSelectedClassId('');
    setSelectedStudentIds([]);
    setDueDate('');
    setNotes('');
    setEnableLateFee(false);
    setLateFeeMode('flat');
    setLateFeeAmount('');
    setLateFeePercent('');
    setLateFeeAfterDays('3');
    onClose();
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t('dashboard.payments.createPayment.title') || 'Create Payment'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.payments.createPayment.fields.title') || 'Title'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('dashboard.payments.createPayment.fields.titlePlaceholder') || 'e.g., Tuition Fee - December'}
              />
            </div>

            {/* Type and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dashboard.payments.createPayment.fields.type') || 'Type'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="tuition">{t('dashboard.payments.type.tuition') || 'Tuition'}</option>
                  <option value="trip">{t('dashboard.payments.type.trip') || 'Trip'}</option>
                  <option value="club">{t('dashboard.payments.type.club') || 'Club'}</option>
                  <option value="misc">{t('dashboard.payments.type.misc') || 'Miscellaneous'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dashboard.payments.createPayment.fields.amount') || 'Amount (VND)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50,000"
                />
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.payments.createPayment.fields.target') || 'Target'} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="school"
                    checked={target === 'school'}
                    onChange={(e) => {
                      setTarget(e.target.value as any);
                      setSelectedClassId('');
                      setSelectedStudentIds([]);
                    }}
                    className="mr-2"
                  />
                  <span>{t('dashboard.payments.createPayment.fields.school') || 'All School'}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="class"
                    checked={target === 'class'}
                    onChange={(e) => {
                      setTarget(e.target.value as any);
                      setSelectedStudentIds([]);
                    }}
                    className="mr-2"
                  />
                  <span>{t('dashboard.payments.createPayment.fields.class') || 'Class'}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="students"
                    checked={target === 'students'}
                    onChange={(e) => setTarget(e.target.value as any)}
                    className="mr-2"
                  />
                  <span>{t('dashboard.payments.createPayment.fields.students') || 'Selected Students'}</span>
                </label>
              </div>
            </div>

            {/* Class Selection */}
            {target === 'class' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dashboard.payments.createPayment.fields.classLabel') || 'Class'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('dashboard.payments.createPayment.fields.selectClass') || 'Select a class'}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Student Selection */}
            {target === 'students' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dashboard.payments.createPayment.fields.studentsLabel') || 'Students'} <span className="text-red-500">*</span>
                </label>
                {selectedClassId && (
                  <div className="mb-2">
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('dashboard.payments.createPayment.fields.selectClass') || 'Select a class'}</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {selectedClassId ? (
                    availableStudents.length > 0 ? (
                      availableStudents.map((student: any) => (
                        <label
                          key={student.id}
                          className="flex items-center py-1 cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => handleStudentToggle(student.id)}
                            className="mr-2"
                          />
                          <span>
                            {student.first_name} {student.last_name}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No students in this class</p>
                    )
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t('dashboard.payments.createPayment.fields.selectClass') || 'Select a class first'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.payments.createPayment.fields.dueDate') || 'Due Date'} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Late Fee */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableLateFee}
                  onChange={(e) => setEnableLateFee(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('dashboard.payments.createPayment.fields.enableLateFee') || 'Enable Late Fee'}
                </span>
              </label>

              {enableLateFee && (
                <div className="mt-3 space-y-3 pl-6 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.payments.createPayment.fields.lateFeeMode') || 'Fee Mode'}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="flat"
                          checked={lateFeeMode === 'flat'}
                          onChange={(e) => setLateFeeMode(e.target.value as any)}
                          className="mr-2"
                        />
                        <span>{t('dashboard.payments.createPayment.fields.flat') || 'Flat Amount'}</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="%"
                          checked={lateFeeMode === '%'}
                          onChange={(e) => setLateFeeMode(e.target.value as any)}
                          className="mr-2"
                        />
                        <span>{t('dashboard.payments.createPayment.fields.percentage') || 'Percentage'}</span>
                      </label>
                    </div>
                  </div>

                  {lateFeeMode === 'flat' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('dashboard.payments.createPayment.fields.lateFeeAmount') || 'Late Fee Amount (VND)'}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={lateFeeAmount}
                        onChange={handleLateFeeAmountChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10,000"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('dashboard.payments.createPayment.fields.lateFeePercent') || 'Late Fee Percentage (%)'}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={lateFeePercent}
                        onChange={(e) => setLateFeePercent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="5"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.payments.createPayment.fields.lateFeeAfterDays') || 'Apply After (days)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={lateFeeAfterDays}
                      onChange={(e) => setLateFeeAfterDays(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="3"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.payments.createPayment.fields.notes') || 'Notes'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('dashboard.payments.createPayment.fields.notesPlaceholder') || 'Optional notes...'}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                {t('dashboard.payments.createPayment.buttons.cancel') || 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? t('dashboard.payments.createPayment.buttons.creating') || 'Creating...'
                  : t('dashboard.payments.createPayment.buttons.create') || 'Create Payment'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

