import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function ParentAttendancePage() {
  const studentName = 'Emily Chen';
  const className = 'Grade 5A';
  
  const present = 19;
  const absent = 1;
  const late = 2;
  const total = 22;
  const rate = ((present / total) * 100).toFixed(1);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance</h1>
        <p className="text-gray-600">{studentName} • {className}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Present</p>
          <p className="text-2xl font-bold text-green-600">{present}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Absent</p>
          <p className="text-2xl font-bold text-red-600">{absent}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Late</p>
          <p className="text-2xl font-bold text-yellow-600">{late}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Days</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Attendance Rate</p>
          <p className="text-2xl font-bold text-blue-600">{rate}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">October 2025</h3>
          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="font-medium text-gray-600">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const isToday = day === 27;
              const isPast = day < 27;
              const status = isPast ? ['present', 'present', 'late', 'present', 'present', 'present', 'absent'][i % 7] : null;
              
              return (
                <button
                  key={day}
                  className={`p-2 rounded-lg relative ${
                    isToday ? 'bg-blue-600 text-white' : 
                    status === 'present' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    status === 'absent' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                    status === 'late' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                    'hover:bg-gray-100'
                  }`}
                  disabled={!isPast && !isToday}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Late</span>
            </div>
          </div>
        </Card>

        {/* Attendance History */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Last 2 Weeks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrival Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { date: 'Oct 24, 2025', day: 'Friday', status: 'Present', time: '8:05 AM', notes: '-' },
                    { date: 'Oct 23, 2025', day: 'Thursday', status: 'Present', time: '7:58 AM', notes: '-' },
                    { date: 'Oct 22, 2025', day: 'Wednesday', status: 'Late', time: '8:25 AM', notes: 'Doctor appointment' },
                    { date: 'Oct 21, 2025', day: 'Tuesday', status: 'Present', time: '8:02 AM', notes: '-' },
                    { date: 'Oct 20, 2025', day: 'Monday', status: 'Present', time: '7:55 AM', notes: '-' },
                    { date: 'Oct 17, 2025', day: 'Friday', status: 'Present', time: '8:00 AM', notes: '-' },
                    { date: 'Oct 16, 2025', day: 'Thursday', status: 'Absent', time: '-', notes: 'Sick leave (approved)' },
                    { date: 'Oct 15, 2025', day: 'Wednesday', status: 'Present', time: '8:03 AM', notes: '-' },
                    { date: 'Oct 14, 2025', day: 'Tuesday', status: 'Present', time: '7:59 AM', notes: '-' },
                    { date: 'Oct 13, 2025', day: 'Monday', status: 'Present', time: '8:01 AM', notes: '-' },
                  ].map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.day}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.time}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}












