import { Plus, Search, Download } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { getSchoolStudents } from '../../../../lib/school/data';

export default async function StudentsPage() {
  const schoolId = 'Sunrise International School';
  const students = await getSchoolStudents(schoolId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student profiles and enrollment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" disabled title="Coming in Phase 2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2" disabled title="Coming in Phase 2">
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-gray-600">Total Students</p><p className="text-2xl font-bold">{students.length}</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold text-green-600">140</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Inactive</p><p className="text-2xl font-bold text-gray-600">4</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Avg Attendance</p><p className="text-2xl font-bold text-blue-600">94.5%</p></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.slice(0, 20).map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.fields['Student Name'] || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.fields['Class Name'] || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.fields['Grade Level'] || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.fields['Parent Name'] || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.fields['Parent Email'] || 'N/A'}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={student.fields.Status || 'Active'} /></td>
                  <td className="px-6 py-4 text-center"><Button variant="outline" size="sm">View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}



