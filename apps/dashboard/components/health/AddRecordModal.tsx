'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { useI18n } from '../../contexts/I18nContext';

interface VaccineEntry {
  name: string;
  status: string;
  date: string;
}

const MAX_VACCINE_ENTRIES = 10;

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentId?: string | null;
  schoolId?: string;
}

export function AddRecordModal({
  isOpen,
  onClose,
  onSuccess,
  studentId: preSelectedStudentId,
  schoolId,
}: AddRecordModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // Student selection state (when not pre-selected)
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(preSelectedStudentId || '');
  const [availableClasses, setAvailableClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [availableStudents, setAvailableStudents] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // General fields
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  // Allergy/Condition fields
  const [allergyName, setAllergyName] = useState('');
  const [allergySeverity, setAllergySeverity] = useState('low');
  const [allergyNotes, setAllergyNotes] = useState('');

  // Medication fields
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medSchedule, setMedSchedule] = useState('');

  // Vaccination fields - Now supports multiple entries
  const [vaccineEntries, setVaccineEntries] = useState<VaccineEntry[]>([
    { name: '', status: 'done', date: '' }
  ]);

  // Vitals fields
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().split('T')[0]);

  // Fetch classes when modal opens and no student is pre-selected
  useEffect(() => {
    if (isOpen && !preSelectedStudentId && schoolId) {
      fetch(`/api/school/classes?schoolId=${encodeURIComponent(schoolId)}&status=active&limit=100`)
        .then(r => r.json())
        .then(result => {
          if (result.success && result.data?.records) {
            setAvailableClasses(result.data.records.map((c: any) => ({
              id: c.id,
              name: c.name,
            })));
          }
        })
        .catch(console.error);
    }
  }, [isOpen, preSelectedStudentId, schoolId]);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClassId && schoolId) {
      setLoadingStudents(true);
      fetch(`/api/health/students?schoolId=${encodeURIComponent(schoolId)}&classId=${selectedClassId}`)
        .then(r => r.json())
        .then(result => {
          if (result.success) {
            setAvailableStudents(result.data || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingStudents(false));
    } else {
      setAvailableStudents([]);
      setSelectedStudentId('');
    }
  }, [selectedClassId, schoolId]);

  // Update selected student when pre-selected changes
  useEffect(() => {
    if (preSelectedStudentId) {
      setSelectedStudentId(preSelectedStudentId);
    }
  }, [preSelectedStudentId]);

  // Vaccine entry management
  const addVaccineEntry = () => {
    if (vaccineEntries.length < MAX_VACCINE_ENTRIES) {
      setVaccineEntries([...vaccineEntries, { name: '', status: 'done', date: '' }]);
    }
  };

  const removeVaccineEntry = (index: number) => {
    if (vaccineEntries.length > 1) {
      setVaccineEntries(vaccineEntries.filter((_, i) => i !== index));
    }
  };

  const updateVaccineEntry = (index: number, field: keyof VaccineEntry, value: string) => {
    const updated = [...vaccineEntries];
    updated[index] = { ...updated[index], [field]: value };
    setVaccineEntries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate student selection
    const studentIdToUse = preSelectedStudentId || selectedStudentId;
    if (!studentIdToUse) {
      alert(t('dashboard.health.errors.selectStudent') || 'Please select a student');
      return;
    }

    setLoading(true);

    try {
      // Handle vaccination separately since it supports multiple entries
      if (activeTab === 'vaccination') {
        // Filter out empty entries
        const validEntries = vaccineEntries.filter(entry => entry.name.trim());
        
        if (validEntries.length === 0) {
          throw new Error('At least one vaccine name is required');
        }

        // Create all vaccine records
        const promises = validEntries.map(entry =>
          fetch('/api/health/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: studentIdToUse,
              record_type: 'vaccination',
              title: entry.name,
              details: {
                vaccine: entry.name,
                status: entry.status,
                date: entry.date || new Date().toISOString().split('T')[0],
              },
              recorded_at: entry.date ? new Date(entry.date).toISOString() : undefined,
            }),
          }).then(res => res.json())
        );

        const results = await Promise.all(promises);
        const failed = results.filter(r => !r.success);
        
        if (failed.length > 0) {
          throw new Error(`Failed to create ${failed.length} vaccine record(s)`);
        }
      } else {
        // Handle other record types (single entry)
        let recordType = 'general';
        let details: any = {};

        switch (activeTab) {
          case 'general':
            recordType = 'note';
            details = { notes };
            break;
          case 'allergies':
            recordType = 'general';
            details = {
              type: 'allergy',
              name: allergyName,
              severity: allergySeverity,
              notes: allergyNotes,
            };
            break;
          case 'medications':
            recordType = 'general';
            details = {
              type: 'medication',
              name: medName,
              dose: medDose,
              schedule: medSchedule,
            };
            break;
          case 'vitals':
            recordType = 'vitals';
            details = {
              height_cm: height ? parseFloat(height) : null,
              weight_kg: weight ? parseFloat(weight) : null,
            };
            break;
        }

        const response = await fetch('/api/health/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: studentIdToUse,
            record_type: recordType,
            title: title || null,
            details,
            recorded_at: recordedAt ? new Date(recordedAt).toISOString() : undefined,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to create record');
        }
      }

      // Reset form
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating health record:', error);
      alert(error.message || t('dashboard.health.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab('general');
    setTitle('');
    setNotes('');
    setAllergyName('');
    setAllergySeverity('low');
    setAllergyNotes('');
    setMedName('');
    setMedDose('');
    setMedSchedule('');
    setVaccineEntries([{ name: '', status: 'done', date: '' }]);
    setHeight('');
    setWeight('');
    setRecordedAt(new Date().toISOString().split('T')[0]);
    setSelectedClassId('');
    setSelectedStudentId('');
    setAvailableStudents([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t('dashboard.health.addRecord.title')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Student Selection - Show only when no student is pre-selected */}
          {!preSelectedStudentId && schoolId && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {t('dashboard.health.addRecord.selectStudent') || 'Select Student'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.class') || 'Class'} *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="">{t('common.select') || 'Select...'}</option>
                    {availableClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.student') || 'Student'} *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    disabled={!selectedClassId || loadingStudents || loading}
                  >
                    <option value="">
                      {loadingStudents 
                        ? (t('common.loading') || 'Loading...') 
                        : (t('common.select') || 'Select...')
                      }
                    </option>
                    {availableStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">
                {t('dashboard.health.addRecord.tabs.general')}
              </TabsTrigger>
              <TabsTrigger value="allergies">
                {t('dashboard.health.addRecord.tabs.allergies')}
              </TabsTrigger>
              <TabsTrigger value="medications">
                {t('dashboard.health.addRecord.tabs.medications')}
              </TabsTrigger>
              <TabsTrigger value="vaccination">
                {t('dashboard.health.addRecord.tabs.vaccination')}
              </TabsTrigger>
              <TabsTrigger value="vitals">
                {t('dashboard.health.addRecord.tabs.vitals')}
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Tab */}
              <TabsContent value="general">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.title')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.notes')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </TabsContent>

              {/* Allergies Tab */}
              <TabsContent value="allergies">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={allergyName}
                    onChange={(e) => setAllergyName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Peanut"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.severity')}
                  </label>
                  <select
                    value={allergySeverity}
                    onChange={(e) => setAllergySeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.notes')}
                  </label>
                  <textarea
                    value={allergyNotes}
                    onChange={(e) => setAllergyNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </TabsContent>

              {/* Medications Tab */}
              <TabsContent value="medications">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Asthma inhaler"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.dose')}
                  </label>
                  <input
                    type="text"
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2 puffs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.schedule')}
                  </label>
                  <input
                    type="text"
                    value={medSchedule}
                    onChange={(e) => setMedSchedule(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., PRN, Daily, Twice daily"
                  />
                </div>
              </TabsContent>

              {/* Vaccination Tab - Supports Multiple Entries */}
              <TabsContent value="vaccination">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {t('dashboard.health.addRecord.vaccineCount', { count: vaccineEntries.length, max: MAX_VACCINE_ENTRIES })}
                    </p>
                    {vaccineEntries.length < MAX_VACCINE_ENTRIES && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVaccineEntry}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        {t('dashboard.health.addRecord.addMore')}
                      </Button>
                    )}
                  </div>

                  {vaccineEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {t('dashboard.health.addRecord.vaccineEntry', { number: index + 1 })}
                        </span>
                        {vaccineEntries.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVaccineEntry(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title={t('dashboard.health.buttons.remove')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('dashboard.health.addRecord.fields.vaccine')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={entry.name}
                          onChange={(e) => updateVaccineEntry(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., MMR, Hepatitis B, DTP"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('dashboard.health.addRecord.fields.status')}
                          </label>
                          <select
                            value={entry.status}
                            onChange={(e) => updateVaccineEntry(index, 'status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="done">Done</option>
                            <option value="pending">Pending</option>
                            <option value="due">Due</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('dashboard.health.addRecord.fields.date')}
                          </label>
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateVaccineEntry(index, 'date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Vitals Tab */}
              <TabsContent value="vitals">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.height')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="cm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.weight')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboard.health.addRecord.fields.recordedAt')}
                  </label>
                  <input
                    type="date"
                    value={recordedAt}
                    onChange={(e) => setRecordedAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </TabsContent>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t('dashboard.health.buttons.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('common.loading') : t('dashboard.health.buttons.save')}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}

