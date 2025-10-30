import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';

export default function HealthRecordsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600">Student health monitoring and medical information</p>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Add Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-gray-600">Total Records</p><p className="text-2xl font-bold">144</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Allergies</p><p className="text-2xl font-bold text-red-600">12</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Medications</p><p className="text-2xl font-bold text-yellow-600">8</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Updated This Month</p><p className="text-2xl font-bold text-blue-600">45</p></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allergies</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emergency Contact</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">Student {i + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Grade {Math.floor(i / 3) + 1}A</td>
                  <td className="px-6 py-4 text-sm text-gray-500">General</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{i % 3 === 0 ? 'Peanuts' : 'None'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{i % 4 === 0 ? 'Asthma inhaler' : 'None'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">+1 555-000-{1000 + i}</td>
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



