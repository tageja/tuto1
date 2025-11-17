import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function HomeworkPage() {
  const studentName = 'Emily Chen';
  const className = 'Grade 5A';

  const totalAssignments = 24;
  const pending = 6;
  const completed = 18;
  const completionRate = ((completed / totalAssignments) * 100).toFixed(0);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Homework</h1>
        <p className="text-gray-600">{studentName} • {className}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Assignments</p>
          <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tabs */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-4 mb-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">All Assignments</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Pending</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Completed</button>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { subject: 'Mathematics', title: 'Problem Set 3.2', class: 'Grade 5A', due: 'Oct 27, 2025', status: 'Pending', progress: 60 },
                    { subject: 'Science', title: 'Lab Report - Plant Growth', class: 'Grade 5A', due: 'Oct 28, 2025', status: 'Pending', progress: 30 },
                    { subject: 'English', title: 'Essay: My Favorite Book', class: 'Grade 5A', due: 'Oct 30, 2025', status: 'Pending', progress: 0 },
                    { subject: 'History', title: 'Timeline Project', class: 'Grade 5A', due: 'Nov 01, 2025', status: 'Pending', progress: 20 },
                    { subject: 'Mathematics', title: 'Problem Set 3.1', class: 'Grade 5A', due: 'Oct 24, 2025', status: 'Completed', progress: 100 },
                    { subject: 'Science', title: 'Chapter 5 Questions', class: 'Grade 5A', due: 'Oct 23, 2025', status: 'Completed', progress: 100 },
                    { subject: 'English', title: 'Reading Comprehension', class: 'Grade 5A', due: 'Oct 22, 2025', status: 'Completed', progress: 100 },
                  ].map((homework, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {homework.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{homework.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{homework.class}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{homework.due}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={homework.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${homework.progress === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                              style={{ width: `${homework.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{homework.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* AI Difficulty Analysis */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI Difficulty Analysis</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="12"
                  strokeDasharray="125.6"
                  strokeDashoffset="37.68"
                  transform="rotate(-90 50 50)"
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#eab308" 
                  strokeWidth="12"
                  strokeDasharray="125.6"
                  strokeDashoffset="87.92"
                  transform="rotate(30 50 50)"
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="12"
                  strokeDasharray="125.6"
                  strokeDashoffset="100.48"
                  transform="rotate(150 50 50)"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Easy</span>
              </div>
              <span className="font-medium">50%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Medium</span>
              </div>
              <span className="font-medium">30%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Hard</span>
              </div>
              <span className="font-medium">20%</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-900 font-medium mb-2">🚀 Coming Soon</p>
            <p className="text-xs text-purple-800">
              Adaptive exercises tailored to your child's learning pace and style.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}












