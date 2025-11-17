'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Award, BookOpen, Star } from 'lucide-react';
import { Button } from '../../../../../../components/ui/Button';
import { Card } from '../../../../../../components/ui/Card';
import { TeacherProfileTabs } from '../../../../../../components/school/teachers/TeacherProfileTabs';
import { StatusBadge } from '../../../../../../components/school/shared/StatusBadge';
import { LoadingState } from '../../../../../../components/shared/LoadingState';
import { ErrorState } from '../../../../../../components/shared/ErrorState';
import { useI18n } from '../../../../../../contexts/I18nContext';

export default function AdminTeacherProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { t, lang } = useI18n();
  
  const schoolId = decodeURIComponent(params.schoolId as string);
  const teacherId = params.teacherId as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [teacher, setTeacher] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [teachingHours, setTeachingHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacher();
  }, [teacherId, schoolId]);

  useEffect(() => {
    if (activeTab === 'attendance' && attendance.length === 0) {
      fetchAttendance();
    } else if (activeTab === 'feedback' && feedback.length === 0) {
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

  async function fetchAttendance() {
    try {
      const response = await fetch(
        `/api/school/teachers/${teacherId}/attendance?schoolId=${encodeURIComponent(schoolId)}&days=90`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAttendance(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
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

  const fields = teacher.fields || {};
  const stats = teacher.stats || {};
  const name = fields['Teacher Name'] || 'Unnamed Teacher';
  const status = fields.Status || 'Active';
  const email = fields.Email || '';
  const phone = fields.Phone || '';
  const position = fields.Position || 'Teacher';
  const bio = fields.Bio || '';
  const education = fields.Education || '';
  const subjects = fields.Subjects || '';
  const hireDate = fields['Hire Date'];
  const experienceYears = fields['Experience Years'] || 0;
  const rating = fields.Rating || 0;
  const nationality = fields.Nationality || '';
  const hobbies = fields.Hobbies || '';

  // Calculate tenure
  const tenure = stats.tenure || 0;
  const absences = stats.absences || 0;
  const avgWorkload = stats.avgWorkload || 0;

  const tabs = [
    { id: 'overview', label: t('dashboard.teachers.profile.tabs.overview') },
    { id: 'classes', label: t('dashboard.teachers.profile.tabs.classes') },
    { id: 'attendance', label: t('dashboard.teachers.profile.tabs.attendance'), count: attendance.length },
    { id: 'feedback', label: t('dashboard.teachers.profile.tabs.feedback'), count: feedback.length },
    { id: 'profileInfo', label: t('dashboard.teachers.profile.tabs.profileInfo') },
  ];

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/teachers`)}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Teachers
      </Button>

      {/* Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-4xl font-bold">
              {name[0].toUpperCase()}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
                <StatusBadge status={status} />
              </div>
              <p className="text-lg text-gray-600 mb-3">{position}</p>

              {/* Contact */}
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
                {avgWorkload > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.teachers.profile.workload')}</p>
                    <p className="text-lg font-semibold text-gray-900">{avgWorkload} {t('dashboard.teachers.profile.hours')}</p>
                  </div>
                )}
                {absences >= 0 && (
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.teachers.profile.absences')}</p>
                    <p className="text-lg font-semibold text-gray-900">{absences}</p>
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

          {/* Edit Button */}
          <Button
            onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/teachers/${teacherId}/edit`)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            {t('common.edit')}
          </Button>
        </div>
      </Card>

      {/* Tabs */}
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
                    {subjects.split(/[,\n]/).map((subject: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {subject.trim()}
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
                {nationality && (
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.teachers.form.nationality')}</p>
                    <p className="text-gray-900 font-medium">{nationality}</p>
                  </div>
                )}
                {hobbies && (
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.teachers.form.hobbies')}</p>
                    <p className="text-gray-900 font-medium">{hobbies}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('dashboard.teachers.profile.tabs.classes')}</h3>
              <p className="text-gray-600">{t('dashboard.teachers.profile.noClasses')}</p>
              <p className="text-sm text-gray-500 mt-2">
                Class assignments feature coming in Phase 2
              </p>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('dashboard.teachers.profile.tabs.attendance')}</h3>
              
              {attendance.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">{t('dashboard.teachers.profile.noAttendance')}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Attendance records will appear here once the TutoSchoolTeacherAttendance table is created
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attendance.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(record.fields.Date).toLocaleDateString()}</p>
                        {record.fields.Notes && (
                          <p className="text-sm text-gray-600">{record.fields.Notes}</p>
                        )}
                      </div>
                      <StatusBadge status={record.fields.Status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('dashboard.teachers.profile.tabs.feedback')}</h3>
              
              {feedback.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">{t('dashboard.teachers.profile.noFeedback')}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Feedback will appear here once the TutoSchoolFeedback table is created
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

          {activeTab === 'profileInfo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.teacherName')}</label>
                    <p className="text-gray-900 mt-1">{name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.email')}</label>
                    <p className="text-gray-900 mt-1">{email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.phone')}</label>
                    <p className="text-gray-900 mt-1">{phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.status')}</label>
                    <p className="text-gray-900 mt-1">{status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.nationality')}</label>
                    <p className="text-gray-900 mt-1">{nationality || 'N/A'}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.position')}</label>
                    <p className="text-gray-900 mt-1">{position}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.hireDate')}</label>
                    <p className="text-gray-900 mt-1">
                      {hireDate ? new Date(hireDate).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.experienceYears')}</label>
                    <p className="text-gray-900 mt-1">{experienceYears} {t('dashboard.teachers.list.years')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.list.rating')}</label>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-900 font-medium">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.hobbies')}</label>
                    <p className="text-gray-900 mt-1">{hobbies || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Full Width Fields */}
              {education && (
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.education')}</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{education}</p>
                </div>
              )}
              
              {subjects && (
                <div>
                  <label className="text-sm font-medium text-gray-500">{t('dashboard.teachers.form.subjects')}</label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {subjects.split(/[,\n]/).map((subject: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full"
                      >
                        {subject.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

