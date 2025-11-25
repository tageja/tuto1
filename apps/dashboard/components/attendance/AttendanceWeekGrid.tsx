'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../school/shared/StatusBadge';
import { getDaysInRange, fetchAttendanceRange, isFuture, statusConfig } from '../../lib/attendance';
import supabase from '../../lib/supabase';

interface AttendanceWeekGridProps {
  schoolId: string;
  weekStart: Date;
  weekEnd: Date;
  classId?: string;
  studentId?: string;
  includeWeekends: boolean;
  onRecordUpdate?: (recordId: string, status: string) => void;
  readOnly?: boolean;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  student_id: string;
  status: string;
  late_minutes: number;
}

export function AttendanceWeekGrid({
  schoolId,
  weekStart,
  weekEnd,
  classId,
  studentId,
  includeWeekends,
  onRecordUpdate,
  readOnly = false,
}: AttendanceWeekGridProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
  const [loading, setLoading] = useState(true);

  const days = getDaysInRange(weekStart, weekEnd, includeWeekends);

  useEffect(() => {
    fetchData();
  }, [schoolId, weekStart, weekEnd, classId, studentId]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch students
      let studentsQuery = supabase
        .from('school_students')
        .select('id, first_name, last_name, student_number')
        .eq('school_id', schoolId)
        .ilike('status', 'active')
        .order('first_name');

      if (classId) {
        studentsQuery = studentsQuery.eq('class_id', classId);
      }

      if (studentId) {
        studentsQuery = studentsQuery.eq('id', studentId);
      }

      const { data: studentsData, error: studentsError } = await studentsQuery;
      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }
      setStudents(studentsData || []);

      // Fetch attendance records
      const records = await fetchAttendanceRange(
        schoolId,
        weekStart,
        weekEnd,
        classId,
        studentId,
        supabase
      );

      // Create map for quick lookup
      const attMap = new Map<string, AttendanceRecord>();
      records.forEach((record) => {
        const key = `${record.student_id}-${record.date}`;
        attMap.set(key, record);
      });
      setAttendance(attMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  }

  function getAttendanceStatus(studentId: string, date: Date): string | null {
    const dateKey = date.toISOString().split('T')[0];
    const key = `${studentId}-${dateKey}`;
    return attendance.get(key)?.status || null;
  }

  function getAttendanceId(studentId: string, date: Date): string | null {
    const dateKey = date.toISOString().split('T')[0];
    const key = `${studentId}-${dateKey}`;
    return attendance.get(key)?.id || null;
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No students found</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Student
              </th>
              {days.map((day, index) => {
                const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = day.getDate();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <th
                    key={index}
                    className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isWeekend ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div>{dayName}</div>
                    <div className="text-lg font-bold text-gray-900">{dayNum}</div>
                  </th>
                );
              })}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => {
              const studentRecords = days.map((day) => getAttendanceStatus(student.id, day));
              const presentCount = studentRecords.filter((s) => s === 'present').length;
              const totalCount = studentRecords.filter((s) => s !== null).length;
              const studentRate =
                totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                    {student.first_name} {student.last_name}
                  </td>
                  {days.map((day, index) => {
                    const status = getAttendanceStatus(student.id, day);
                    const recordId = getAttendanceId(student.id, day);
                    const futureDay = isFuture(day);

                    return (
                      <td key={index} className="px-6 py-4 whitespace-nowrap text-center">
                        {futureDay ? (
                          <span className="text-xs text-gray-400">N/A</span>
                        ) : status ? (
                          <StatusBadge status={status} />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                    {studentRate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

