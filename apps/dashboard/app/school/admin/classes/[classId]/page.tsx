'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Card } from '../../../../../components/ui/Card';
import { StatusBadge } from '../../../../../components/school/shared/StatusBadge';
import { useI18n } from '../../../../../contexts/I18nContext';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useI18n();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>({ presentToday: 0, last7Days: 0 });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    async function loadClassDetail() {
      setLoading(true);
      try {
        // Fetch class details
        const classResponse = await fetch(`/api/school/classes/${classId}`);
        if (classResponse.ok) {
          const classResult = await classResponse.json();
          setClassData(classResult);
        }

        // Fetch students roster
        const studentsResponse = await fetch(`/api/school/classes/${classId}/students`);
        if (studentsResponse.ok) {
          const studentsResult = await studentsResponse.json();
          setStudents(studentsResult.students || []);
        }

        // Fetch attendance summary
        const attendanceResponse = await fetch(`/api/school/classes/${classId}/attendance`);
        if (attendanceResponse.ok) {
          const attendanceResult = await attendanceResponse.json();
          setAttendance(attendanceResult);
        }
      } catch (error) {
        console.error('Error loading class detail:', error);
      } finally {
        setLoading(false);
      }
    }

    loadClassDetail();
  }, [classId]);

  const sortedStudents = [...students].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'vi' ? 'Quay lại' : 'Back'}
        </Button>
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {lang === 'vi' ? 'Không tìm thấy lớp học' : 'Class not found'}
          </h3>
          <p className="text-gray-600">
            {lang === 'vi' ? 'Lớp học này không tồn tại hoặc đã bị xóa' : 'This class does not exist or has been deleted'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'vi' ? 'Quay lại' : 'Back'}
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
              <StatusBadge status={classData.status} />
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="font-medium">{lang === 'vi' ? 'Khối:' : 'Grade:'}</span>
                {classData.grade}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-medium">{lang === 'vi' ? 'Phòng:' : 'Room:'}</span>
                {classData.roomNumber || lang === 'vi' ? 'Chưa gán' : 'Not assigned'}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-medium">{lang === 'vi' ? 'Sức chứa:' : 'Capacity:'}</span>
                {students.length}/{classData.capacity || 25}
              </span>
            </div>
          </div>

          <Button variant="outline" className="gap-2" disabled title={lang === 'vi' ? 'Sắp ra mắt trong Giai đoạn 2' : 'Coming in Phase 2'}>
            <Download className="w-4 h-4" />
            {lang === 'vi' ? 'Xuất CSV' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">{lang === 'vi' ? 'Học sinh' : 'Students'}</p>
          <p className="text-2xl font-bold text-gray-900">{students.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">{lang === 'vi' ? 'Có mặt hôm nay' : 'Present Today'}</p>
          <p className="text-2xl font-bold text-green-600">{attendance.presentToday || '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">{lang === 'vi' ? 'Điểm danh 7 ngày' : 'Last 7-Day Attendance'}</p>
          <p className="text-2xl font-bold text-blue-600">{attendance.last7Days || 0}%</p>
        </Card>
      </div>

      {/* Roster Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{lang === 'vi' ? 'Danh sách học sinh' : 'Student Roster'}</h3>
          <p className="text-sm text-gray-600">
            {students.length} {lang === 'vi' ? 'học sinh' : students.length === 1 ? 'student' : 'students'}
          </p>
        </div>
        
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">
              {lang === 'vi' ? 'Chưa có học sinh nào trong lớp này' : 'No students in this class yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('code')}
                  >
                    {lang === 'vi' ? 'Mã HS' : 'Student Code'} {sortField === 'code' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    {lang === 'vi' ? 'Họ tên' : 'Name'} {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lang === 'vi' ? 'Ngày sinh / Tuổi' : 'DoB / Age'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lang === 'vi' ? 'Giới tính' : 'Gender'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lang === 'vi' ? 'Trạng thái' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/school/admin/students/${student.id}`)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {student.code || student.id.slice(-6)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {student.name ? student.name[0].toUpperCase() : '?'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.dob ? (
                        <>
                          {new Date(student.dob).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          <span className="text-gray-400 ml-2">({calculateAge(student.dob)} {lang === 'vi' ? 'tuổi' : 'y.o.'})</span>
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {student.gender || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <StatusBadge status={student.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

