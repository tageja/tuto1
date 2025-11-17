import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function AdminHomeworkPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homework Assignments</h1>
          <p className="text-gray-600">Create and manage homework for all classes</p>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Create Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-gray-600">Total Assignments</p><p className="text-2xl font-bold">32</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold text-blue-600">12</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Due This Week</p><p className="text-2xl font-bold text-yellow-600">8</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Avg Completion</p><p className="text-2xl font-bold text-green-600">88%</p></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Submitted/Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">Assignment {i + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Math</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Grade 5A</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Oct {20 + i}, 2025</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">18/24</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status="Active" /></td>
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












