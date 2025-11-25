'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Card } from '../../../../../components/ui/Card';
import { HealthTrendCharts } from '../../../../../components/health/HealthTrendCharts';
import { useI18n } from '../../../../../contexts/I18nContext';
import supabase from '../../../../../lib/supabase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
}

export default function ParentHealthPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const schoolId = decodeURIComponent(params.schoolId as string);

  const childIdParam = searchParams.get('childId');

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(childIdParam || undefined);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch children
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!userData) return;

        const { data: mappings } = await supabase
          .from('school_parent_students')
          .select(
            `
            student_id,
            school_students!inner (
              id,
              first_name,
              last_name,
              school_classes (name)
            )
          `
          )
          .eq('school_id', schoolId)
          .eq('parent_user_id', userData.id);

        if (mappings) {
          const childrenList = mappings.map((m: any) => ({
            id: m.student_id,
            first_name: m.school_students.first_name,
            last_name: m.school_students.last_name,
            class_name: m.school_students.school_classes?.name || 'N/A',
          }));

          setChildren(childrenList);

          // Auto-select first child if none selected
          if (!selectedChildId && childrenList.length > 0) {
            setSelectedChildId(childrenList[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    };

    fetchChildren();
  }, [schoolId]);

  // Update URL when child changes
  useEffect(() => {
    if (selectedChildId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('childId', selectedChildId);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [selectedChildId, router, searchParams]);

  // Fetch health data for selected child
  useEffect(() => {
    if (selectedChildId) {
      fetchHealthData();
    }
  }, [selectedChildId]);

  const fetchHealthData = async () => {
    if (!selectedChildId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/health/student/${selectedChildId}`);
      const result = await response.json();

      if (result.success) {
        setHealthData(result.data);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.health.title')}
        </h1>
        <p className="text-gray-600">{t('dashboard.health.subtitle')}</p>
      </div>

      {/* Child Switcher */}
      {children.length > 1 && (
        <Card className="p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dashboard.health.parent.selectChild')}
          </label>
          <select
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name} ({child.class_name})
              </option>
            ))}
          </select>
        </Card>
      )}

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      ) : healthData ? (
        <div className="space-y-6">
          {/* Medical Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('dashboard.health.sections.medicalInfo')}
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Student:</span> {healthData.student.fullName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Class:</span> {healthData.student.className}
              </p>
              {healthData.student.dateOfBirth && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date of Birth:</span>{' '}
                  {new Date(healthData.student.dateOfBirth).toLocaleDateString()}
                </p>
              )}
            </div>
          </Card>

          {/* Allergies & Conditions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('dashboard.health.sections.allergies')}
            </h2>
            {healthData.allergies && healthData.allergies.length > 0 ? (
              <div className="space-y-2">
                {healthData.allergies.map((allergy: any) => (
                  <div key={allergy.id} className="p-3 bg-red-50 rounded-lg">
                    <p className="font-medium text-gray-900">{allergy.name}</p>
                    <p className="text-sm text-gray-600">Severity: {allergy.severity}</p>
                    {allergy.notes && (
                      <p className="text-sm text-gray-500 mt-1">{allergy.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                {t('dashboard.health.empty.noAllergies')}
              </p>
            )}
          </Card>

          {/* Medications */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('dashboard.health.sections.medications')}
            </h2>
            {healthData.medications && healthData.medications.length > 0 ? (
              <div className="space-y-2">
                {healthData.medications.map((med: any) => (
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
              <p className="text-gray-500 text-sm">
                {t('dashboard.health.empty.noMedications')}
              </p>
            )}
          </Card>

          {/* Emergency Contacts */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('dashboard.health.sections.emergencyContacts')}
            </h2>
            <div className="space-y-3">
              {healthData.emergencyContacts?.primaryName && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Primary Contact</p>
                  <p className="text-gray-900">{healthData.emergencyContacts.primaryName}</p>
                  <p className="text-sm text-gray-600">
                    {healthData.emergencyContacts.primaryPhone}
                  </p>
                </div>
              )}
              {healthData.emergencyContacts?.altName && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Alternate Contact</p>
                  <p className="text-gray-900">{healthData.emergencyContacts.altName}</p>
                  <p className="text-sm text-gray-600">
                    {healthData.emergencyContacts.altPhone}
                  </p>
                </div>
              )}
              {!healthData.emergencyContacts?.primaryName && (
                <p className="text-gray-500 text-sm">No emergency contacts on file</p>
              )}
            </div>
          </Card>

          {/* Vaccination Records */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('dashboard.health.sections.vaccinations')}
            </h2>
            {healthData.vaccinations && healthData.vaccinations.length > 0 ? (
              <div className="space-y-2">
                {healthData.vaccinations.map((vaccine: any) => (
                  <div
                    key={vaccine.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{vaccine.vaccine}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(vaccine.date).toLocaleDateString()} • {vaccine.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                {t('dashboard.health.empty.noVaccinations')}
              </p>
            )}
          </Card>

          {/* Growth Trends */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('dashboard.health.parent.trendCharts')}
            </h2>
            <HealthTrendCharts vitals={healthData.vitals || []} loading={false} />
          </Card>

          {/* Health Tips */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('dashboard.health.sections.healthTips')}
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>• Ensure your child gets adequate sleep (8-10 hours for school-age children)</p>
              <p>• Maintain a balanced diet with plenty of fruits and vegetables</p>
              <p>• Encourage regular physical activity and outdoor play</p>
              <p>• Keep vaccinations up to date</p>
              <p>• Notify the school immediately of any health concerns or medication changes</p>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            {selectedChildId
              ? t('dashboard.health.errors.loadFailed')
              : 'Please select a child'}
          </p>
        </Card>
      )}
    </div>
  );
}
