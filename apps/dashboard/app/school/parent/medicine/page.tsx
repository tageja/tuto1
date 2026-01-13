import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function ParentMedicinePage() {
  const studentName = 'Mai Nguyen';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medicine Reminders</h1>
        <p className="text-gray-600">{studentName} - Medicine schedule and administration tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-gray-600">Active Medications</p><p className="text-2xl font-bold text-green-600">1</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Due Today</p><p className="text-2xl font-bold text-yellow-600">2</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Administered Today</p><p className="text-2xl font-bold text-blue-600">1</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Compliance Rate</p><p className="text-2xl font-bold text-purple-600">98%</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Medications */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Medications</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Allergy Medication</h4>
                  <p className="text-sm text-gray-600">Cetirizine 5mg</p>
                </div>
                <StatusBadge status="Active" variant="success" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Dosage:</span><span>1 tablet</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Frequency:</span><span>Once daily</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Time:</span><span>8:00 AM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Duration:</span><span>Oct 15 - Nov 15, 2025</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-600">Prescribed by: Dr. Emily Johnson</p>
                <p className="text-xs text-gray-600">Notes: Take after breakfast</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {[
              { time: '8:00 AM', medicine: 'Allergy Medication', dosage: '1 tablet', status: 'Administered', by: 'School Nurse' },
              { time: '12:00 PM', medicine: 'Vitamin D', dosage: '1 capsule', status: 'Pending', by: '-' },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-lg border ${item.status === 'Administered' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{item.time}</p>
                    <p className="text-sm text-gray-700">{item.medicine}</p>
                    <p className="text-xs text-gray-600">{item.dosage}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.by !== '-' && (
                  <p className="text-xs text-gray-600">Administered by: {item.by}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Administration History */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold mb-4">Administration History (Last 7 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Administered By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Oct {24 - i}, 2025</td>
                  <td className="px-6 py-4 text-sm text-gray-500">8:00 AM</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Allergy Medication</td>
                  <td className="px-6 py-4 text-sm text-gray-500">1 tablet</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status="Administered" variant="success" /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">School Nurse</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

















