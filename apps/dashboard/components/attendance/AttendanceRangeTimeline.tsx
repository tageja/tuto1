'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../school/shared/StatusBadge';
import { fetchAttendanceRange, formatDate, groupByStudent } from '../../lib/attendance';
import supabase from '../../lib/supabase';

interface AttendanceRangeTimelineProps {
  schoolId: string;
  from: Date;
  to: Date;
  classId?: string;
  studentId?: string;
  onRecordUpdate?: (recordId: string, status: string) => void;
  readOnly?: boolean;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  student_id: string;
  status: string;
  late_minutes: number;
  notes: string | null;
}

export function AttendanceRangeTimeline({
  schoolId,
  from,
  to,
  classId,
  studentId,
  onRecordUpdate,
  readOnly = false,
}: AttendanceRangeTimelineProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [schoolId, from, to, classId, studentId]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch students
      let studentsQuery = supabase
        .from('school_students')
        .select('id, first_name, last_name')
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
      const attendanceRecords = await fetchAttendanceRange(
        schoolId,
        from,
        to,
        classId,
        studentId,
        supabase
      );
      setRecords(attendanceRecords);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
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

  // Group records by student
  const recordsByStudent = groupByStudent(records);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
            <div className="flex items-center">
              <div className="w-48 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </div>
              <div className="flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance Records
              </div>
            </div>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-gray-200">
            {students.map((student) => {
              const studentRecords = recordsByStudent.get(student.id) || [];
              const presentCount = studentRecords.filter((r) => r.status === 'present').length;
              const totalCount = studentRecords.length;
              const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

              return (
                <div
                  key={student.id}
                  className="flex items-start py-4 px-6 hover:bg-gray-50"
                >
                  {/* Student Name (Sticky) */}
                  <div className="w-48 flex-shrink-0">
                    <p className="font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{rate}% attendance</p>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 overflow-x-auto">
                    {studentRecords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {studentRecords
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((record) => (
                            <div
                              key={record.id}
                              className="flex flex-col items-center p-2 bg-gray-50 rounded-lg min-w-[80px]"
                            >
                              <p className="text-xs text-gray-600 mb-1">
                                {formatDate(record.date, 'en')}
                              </p>
                              <StatusBadge status={record.status} />
                              {record.late_minutes > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +{record.late_minutes}min
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No attendance records</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

