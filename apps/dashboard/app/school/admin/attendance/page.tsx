import { Download } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { getAttendanceRecords } from '../../../../lib/school/data';

export default async function AttendancePage() {
  const schoolId = 'Sunrise International School';
  const attendance = await getAttendanceRecords(schoolId);

  // Calculate stats
  const present = attendance.filter(a => a.fields.Status === 'Present').length;
  const absent = attendance.filter(a => a.fields.Status === 'Absent').length;
  const late = attendance.filter(a => a.fields.Status === 'Late').length;
  const total = 40;
  const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        </div>
        <Button variant="outline" className="gap-2" disabled title="Coming in Phase 2">
          <Download className="w-4 h-4" />
          Export
        </Button>
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
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Attendance Rate</p>
          <p className="text-2xl font-bold text-blue-600">{rate}%</p>
        </Card>
      </div>

      {/* Main Content */}
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
              return (
                <button
                  key={day}
                  className={`p-2 rounded-lg hover:bg-gray-100 ${isToday ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
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

        {/* Attendance Table */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Oct 20</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Oct 21</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Oct 22</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Oct 23</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Oct 24</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { name: 'Emily Chen', class: 'Grade 5A', days: ['Present', 'Late', 'Present', 'Present', 'Present'], rate: '96%' },
                    { name: 'Michael Brown', class: 'Grade 5A', days: ['Present', 'Present', 'Absent', 'Present', 'Present'], rate: '92%' },
                    { name: 'Sarah Wilson', class: 'Grade 5A', days: ['Present', 'Present', 'Present', 'Late', 'Present'], rate: '96%' },
                    { name: 'David Lee', class: 'Grade 5A', days: ['Present', 'Present', 'Present', 'Present', 'Absent'], rate: '92%' },
                    { name: 'Jessica Martinez', class: 'Grade 5A', days: ['Present', 'Present', 'Present', 'Present', 'Present'], rate: '100%' },
                    { name: 'Ryan Taylor', class: 'Grade 5A', days: ['Late', 'Present', 'Present', 'Present', 'Present'], rate: '96%' },
                    { name: 'Amanda Garcia', class: 'Grade 5A', days: ['Present', 'Present', 'Present', 'Present', 'Late'], rate: '96%' },
                  ].map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                      {student.days.map((status, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-center">
                          <StatusBadge status={status} />
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{student.rate}</td>
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













