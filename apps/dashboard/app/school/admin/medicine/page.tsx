import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function MedicineRemindersPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Reminders</h1>
          <p className="text-gray-600">Track medicine administration and schedules</p>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Add Reminder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-gray-600">Total Reminders</p><p className="text-2xl font-bold">8</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold text-green-600">5</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Due Today</p><p className="text-2xl font-bold text-yellow-600">3</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Completed Today</p><p className="text-2xl font-bold text-blue-600">2</p></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { student: 'David Lee', medicine: 'Asthma Inhaler', dosage: '2 puffs', frequency: 'As needed', time: '-', status: 'Active' },
                { student: 'Emma Wilson', medicine: 'Antibiotic', dosage: '5ml', frequency: 'Twice daily', time: '9:00 AM, 3:00 PM', status: 'Active' },
                { student: 'Lucas Brown', medicine: 'Allergy Medication', dosage: '1 tablet', frequency: 'Daily', time: '8:00 AM', status: 'Active' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{item.student}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.medicine}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.dosage}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.frequency}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.time}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
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

















