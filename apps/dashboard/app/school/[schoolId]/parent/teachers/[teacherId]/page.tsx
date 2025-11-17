'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Star, Calendar } from 'lucide-react';
import { Button } from '../../../../../../components/ui/Button';
import { Card } from '../../../../../../components/ui/Card';
import { TeacherProfileTabs } from '../../../../../../components/school/teachers/TeacherProfileTabs';
import { StatusBadge } from '../../../../../../components/school/shared/StatusBadge';
import { LoadingState } from '../../../../../../components/shared/LoadingState';
import { ErrorState } from '../../../../../../components/shared/ErrorState';
import { useI18n } from '../../../../../../contexts/I18nContext';

export default function ParentTeacherProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { t, lang } = useI18n();
  
  const schoolId = decodeURIComponent(params.schoolId as string);
  const teacherId = params.teacherId as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [teacher, setTeacher] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacher();
  }, [teacherId, schoolId]);

  useEffect(() => {
    if (activeTab === 'feedback' && feedback.length === 0) {
      fetchFeedback();
    }
  }, [activeTab]);

  async function fetchTeacher() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/school/teachers/${teacherId}?schoolId=${encodeURIComponent(schoolId)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch teacher');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setTeacher(data.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeedback() {
    try {
      const response = await fetch(
        `/api/school/teachers/${teacherId}/feedback?schoolId=${encodeURIComponent(schoolId)}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // TODO: Backend should filter to only show this parent's feedback
          setFeedback(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    }
  }

  if (loading) {
    return <LoadingState message="Loading teacher profile..." />;
  }

  if (error || !teacher) {
    return (
      <ErrorState
        title="Error Loading Teacher"
        message={error || 'Teacher not found'}
        onRetry={fetchTeacher}
      />
    );
  }

  // Support both Supabase (flat) and Airtable (nested fields) structures
  const isSupabaseStructure = !teacher.fields;
  
  const name = isSupabaseStructure 
    ? (teacher.name || 'Unnamed Teacher')
    : (teacher.fields?.['Teacher Name'] || 'Unnamed Teacher');
    
  const status = isSupabaseStructure 
    ? (teacher.status || 'active')
    : (teacher.fields?.Status || 'Active');
    
  const email = isSupabaseStructure 
    ? (teacher.email || '')
    : (teacher.fields?.Email || '');
    
  const phone = isSupabaseStructure 
    ? (teacher.phone || '')
    : (teacher.fields?.Phone || '');
    
  const position = isSupabaseStructure 
    ? (teacher.qualifications || 'Teacher')
    : (teacher.fields?.Position || 'Teacher');
    
  const bio = isSupabaseStructure 
    ? (teacher.bio || '')
    : (teacher.fields?.Bio || '');
    
  const education = isSupabaseStructure 
    ? (teacher.qualifications || '')
    : (teacher.fields?.Education || '');
    
  // Handle subjects - array (Supabase) or string (Airtable)
  // Keep as array for Supabase, string for Airtable
  const subjects = isSupabaseStructure
    ? (Array.isArray(teacher.subjects) ? teacher.subjects : (typeof teacher.subjects === 'string' ? teacher.subjects.split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []))
    : (teacher.fields?.Subjects || '');
    
  const hireDate = isSupabaseStructure 
    ? (teacher.hire_date || null)
    : (teacher.fields?.['Hire Date'] || null);
    
  const experienceYears = isSupabaseStructure 
    ? 0 // Not available in Supabase schema yet
    : (teacher.fields?.['Experience Years'] || 0);
    
  const rating = isSupabaseStructure 
    ? 0 // Not available in Supabase schema yet
    : (teacher.fields?.Rating || 0);

  const stats = teacher.stats || {};
  const tenure = stats.tenure || 0;
  
  // Get first letter for avatar (safely)
  const initials = name && name.length > 0 ? name[0].toUpperCase() : '?';

  // Parent only sees limited tabs
  const tabs = [
    { id: 'overview', label: t('dashboard.teachers.profile.tabs.overview') },
    { id: 'classes', label: t('dashboard.teachers.profile.tabs.classes') },
    { id: 'feedback', label: t('dashboard.teachers.profile.tabs.feedback'), count: feedback.length },
  ];

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/parent/teachers`)}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Teachers
      </Button>

      {/* Profile Header (Read-Only) */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-4xl font-bold">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-lg text-gray-600 mb-3">{position}</p>

            {/* Contact (for parent to reach out) */}
            <div className="space-y-2">
              {email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${email}`} className="hover:text-blue-600">{email}</a>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${phone}`} className="hover:text-blue-600">{phone}</a>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 mt-4">
              {tenure > 0 && (
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.teachers.profile.tenure')}</p>
                  <p className="text-lg font-semibold text-gray-900">{tenure} {t('dashboard.teachers.list.years')}</p>
                </div>
              )}
              {experienceYears > 0 && (
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.teachers.list.experience')}</p>
                  <p className="text-lg font-semibold text-gray-900">{experienceYears} {t('dashboard.teachers.list.years')}</p>
                </div>
              )}
              {rating > 0 && (
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.teachers.list.rating')}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <p className="text-lg font-semibold text-gray-900">{rating.toFixed(1)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs (Read-Only) */}
      <Card className="p-6">
        <TeacherProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Biography */}
              {bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('dashboard.teachers.profile.bio')}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{bio}</p>
                </div>
              )}

              {/* Education */}
              {education && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('dashboard.teachers.profile.education')}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{education}</p>
                </div>
              )}

              {/* Subjects */}
              {subjects && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('dashboard.teachers.list.subjects')}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {(typeof subjects === 'string' 
                      ? subjects.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean)
                      : (Array.isArray(subjects) ? subjects : [])
                    ).map((subject: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                {hireDate && (
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.teachers.profile.dateJoined')}</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(hireDate).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {experienceYears > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.teachers.list.experience')}</p>
                    <p className="text-gray-900 font-medium">{experienceYears} {t('dashboard.teachers.list.years')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('dashboard.teachers.profile.tabs.classes')}</h3>
              <p className="text-gray-600">Your child's classes taught by this teacher will appear here</p>
              <p className="text-sm text-gray-500 mt-2">
                Coming in Phase 2
              </p>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('dashboard.teachers.feedback.recentFeedback')}</h3>
              
              {feedback.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">{t('dashboard.teachers.profile.noFeedback')}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your feedback and other parents' feedback will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((record: any) => (
                    <Card key={record.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{record.fields['Parent Name'] || 'Anonymous'}</p>
                          <p className="text-sm text-gray-500">
                            {record.fields['Student Name'] && `Student: ${record.fields['Student Name']}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{record.fields.Rating}</span>
                        </div>
                      </div>
                      {record.fields.Comment && (
                        <p className="text-gray-700 mt-2">{record.fields.Comment}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(record.fields['Created At']).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

