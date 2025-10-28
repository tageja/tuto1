import { Plus, Search } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { getSchoolTeachers } from '../../../../lib/school/data';

export default async function TeachersPage() {
  const schoolId = 'Sunrise International School';
  const teachers = await getSchoolTeachers(schoolId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600">Manage teacher profiles and assignments</p>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Add Teacher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-gray-600">Total Teachers</p><p className="text-2xl font-bold">{teachers.length}</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold text-green-600">12</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">On Leave</p><p className="text-2xl font-bold text-yellow-600">1</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Avg Rating</p><p className="text-2xl font-bold text-blue-600">4.7</p></Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search teachers..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.slice(0, 12).map((teacher) => (
          <Card key={teacher.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
                {(teacher.fields.Name || 'T')[0]}
              </div>
              <StatusBadge status={teacher.fields.Status || 'Active'} />
            </div>
            <h3 className="font-semibold text-lg mb-1">{teacher.fields['Teacher Name'] || teacher.fields.Name || 'Unnamed Teacher'}</h3>
            <p className="text-sm text-gray-600 mb-3">{teacher.fields.Position || 'Teacher'}</p>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <div>📧 {teacher.fields.Email || 'N/A'}</div>
              <div>📞 {teacher.fields.Phone || 'N/A'}</div>
              <div>⭐ Rating: {teacher.fields.Rating || 'N/A'}</div>
            </div>
            <Button variant="outline" className="w-full" size="sm">View Profile</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

