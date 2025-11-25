'use client';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useI18n } from '../../contexts/I18nContext';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  classId: string;
  className: string;
  hasAllergy: boolean;
  hasMedication: boolean;
}

interface StudentListProps {
  students: Student[];
  loading?: boolean;
  onViewStudent: (studentId: string) => void;
}

export function StudentList({ students, loading, onViewStudent }: StudentListProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">{t('dashboard.health.empty.noStudents')}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Health Flags
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {student.fullName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{student.className}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {student.hasAllergy && (
                      <Badge variant="error" className="text-xs">
                        Allergy
                      </Badge>
                    )}
                    {student.hasMedication && (
                      <Badge variant="warning" className="text-xs">
                        Medication
                      </Badge>
                    )}
                    {!student.hasAllergy && !student.hasMedication && (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewStudent(student.id)}
                  >
                    {t('dashboard.health.buttons.view')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

