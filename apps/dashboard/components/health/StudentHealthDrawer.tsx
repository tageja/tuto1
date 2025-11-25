'use client';

import { useState, useEffect } from 'react';
import { X, Edit, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useI18n } from '../../contexts/I18nContext';
import { AddRecordModal } from './AddRecordModal';

interface StudentHealthDrawerProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function StudentHealthDrawer({
  studentId,
  isOpen,
  onClose,
  onRefresh,
}: StudentHealthDrawerProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showEditContacts, setShowEditContacts] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentData();
    }
  }, [isOpen, studentId]);

  const fetchStudentData = async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/health/student/${studentId}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching student health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAdded = () => {
    setShowAddRecord(false);
    fetchStudentData();
    onRefresh?.();
  };

  const handleContactsUpdate = async (contacts: any) => {
    if (!studentId) return;

    try {
      const response = await fetch(`/api/health/contacts/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contacts),
      });

      const result = await response.json();
      if (result.success) {
        setShowEditContacts(false);
        fetchStudentData();
        alert(t('dashboard.health.toasts.contactsUpdated'));
      }
    } catch (error) {
      console.error('Error updating contacts:', error);
      alert(t('dashboard.health.errors.updateFailed'));
    }
  };

  if (!isOpen || !studentId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center">
        <div className="bg-white w-full md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto rounded-t-lg md:rounded-lg shadow-xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {data?.student?.fullName || 'Loading...'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {data?.student?.className || ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddRecord(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('dashboard.health.buttons.addRecord')}
                </Button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </Card>
                ))}
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Allergies */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {t('dashboard.health.sections.allergies')}
                  </h3>
                  {data.allergies && data.allergies.length > 0 ? (
                    <div className="space-y-2">
                      {data.allergies.map((allergy: any) => (
                        <div key={allergy.id} className="flex items-start justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{allergy.name}</p>
                            <p className="text-sm text-gray-600">Severity: {allergy.severity}</p>
                            {allergy.notes && (
                              <p className="text-sm text-gray-500 mt-1">{allergy.notes}</p>
                            )}
                          </div>
                          <Badge variant="error">{allergy.severity}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">{t('dashboard.health.empty.noAllergies')}</p>
                  )}
                </Card>

                {/* Medications */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {t('dashboard.health.sections.medications')}
                  </h3>
                  {data.medications && data.medications.length > 0 ? (
                    <div className="space-y-2">
                      {data.medications.map((med: any) => (
                        <div key={med.id} className="p-3 bg-yellow-50 rounded-lg">
                          <p className="font-medium text-gray-900">{med.name}</p>
                          <p className="text-sm text-gray-600">
                            {med.dose && `Dose: ${med.dose}`}
                            {med.schedule && ` • Schedule: ${med.schedule}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">{t('dashboard.health.empty.noMedications')}</p>
                  )}
                </Card>

                {/* Emergency Contacts */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">
                      {t('dashboard.health.sections.emergencyContacts')}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditContacts(true)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {t('dashboard.health.buttons.editContacts')}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {data.emergencyContacts?.primaryName && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Primary Contact</p>
                        <p className="text-gray-900">{data.emergencyContacts.primaryName}</p>
                        <p className="text-sm text-gray-600">{data.emergencyContacts.primaryPhone}</p>
                      </div>
                    )}
                    {data.emergencyContacts?.altName && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Alternate Contact</p>
                        <p className="text-gray-900">{data.emergencyContacts.altName}</p>
                        <p className="text-sm text-gray-600">{data.emergencyContacts.altPhone}</p>
                      </div>
                    )}
                    {!data.emergencyContacts?.primaryName && (
                      <p className="text-gray-500 text-sm">No emergency contacts on file</p>
                    )}
                  </div>
                </Card>

                {/* Vaccinations */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {t('dashboard.health.drawer.vaccineTimeline')}
                  </h3>
                  {data.vaccinations && data.vaccinations.length > 0 ? (
                    <div className="space-y-2">
                      {data.vaccinations.map((vaccine: any) => (
                        <div key={vaccine.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{vaccine.vaccine}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(vaccine.date).toLocaleDateString()} • {vaccine.status}
                            </p>
                          </div>
                          <Badge variant={vaccine.status === 'done' ? 'success' : 'warning'}>
                            {vaccine.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">{t('dashboard.health.empty.noVaccinations')}</p>
                  )}
                </Card>

                {/* Vitals */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    {t('dashboard.health.drawer.vitalsLog')} ({t('dashboard.health.drawer.last12Entries')})
                  </h3>
                  {data.vitals && data.vitals.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">Date</th>
                            <th className="text-right py-2 px-3">Height (cm)</th>
                            <th className="text-right py-2 px-3">Weight (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.vitals.map((vital: any) => (
                            <tr key={vital.id} className="border-b">
                              <td className="py-2 px-3">
                                {new Date(vital.recordedAt).toLocaleDateString()}
                              </td>
                              <td className="text-right py-2 px-3">
                                {vital.heightCm || '—'}
                              </td>
                              <td className="text-right py-2 px-3">
                                {vital.weightKg || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">{t('dashboard.health.empty.noVitals')}</p>
                  )}
                </Card>
              </div>
            ) : (
              <p className="text-gray-500">Failed to load student data</p>
            )}
          </div>
        </div>
      </div>

      {showAddRecord && studentId && (
        <AddRecordModal
          isOpen={showAddRecord}
          onClose={() => setShowAddRecord(false)}
          onSuccess={handleRecordAdded}
          studentId={studentId}
        />
      )}

      {showEditContacts && data && (
        <EditContactsModal
          isOpen={showEditContacts}
          onClose={() => setShowEditContacts(false)}
          onSave={handleContactsUpdate}
          initialData={data.emergencyContacts}
        />
      )}
    </>
  );
}

// Simple Edit Contacts Modal
function EditContactsModal({ isOpen, onClose, onSave, initialData }: any) {
  const [primaryName, setPrimaryName] = useState(initialData?.primaryName || '');
  const [primaryPhone, setPrimaryPhone] = useState(initialData?.primaryPhone || '');
  const [altName, setAltName] = useState(initialData?.altName || '');
  const [altPhone, setAltPhone] = useState(initialData?.altPhone || '');

  const handleSave = () => {
    onSave({ primaryName, primaryPhone, altName, altPhone });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Edit Emergency Contacts</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Name</label>
              <input
                type="text"
                value={primaryName}
                onChange={(e) => setPrimaryName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Phone</label>
              <input
                type="text"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alternate Name</label>
              <input
                type="text"
                value={altName}
                onChange={(e) => setAltName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alternate Phone</label>
              <input
                type="text"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

