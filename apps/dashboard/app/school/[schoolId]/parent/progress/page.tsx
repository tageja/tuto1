import { Card } from '../../../../../components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const decodedSchoolId = decodeURIComponent(schoolId);

  const studentName = 'Emily Chen';
  const className = 'Grade 5A';
  const academicYear = '2025-2026';

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Progress Reports</h1>
        <p className="text-gray-600">{studentName} • {className} • {academicYear} • {decodedSchoolId}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">3 Months</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">6 Months</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">12 Months</button>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { subject: 'Mathematics', current: 'A', currentScore: 92, previous: 88, trend: 'up', color: 'blue', icon: '📐' },
          { subject: 'Science', current: 'A-', currentScore: 89, previous: 90, trend: 'down', color: 'green', icon: '🔬' },
          { subject: 'English', current: 'B+', currentScore: 87, previous: 85, trend: 'up', color: 'purple', icon: '📚' },
          { subject: 'History', current: 'A', currentScore: 91, previous: 89, trend: 'up', color: 'yellow', icon: '📜' },
          { subject: 'Geography', current: 'B', currentScore: 82, previous: 80, trend: 'up', color: 'orange', icon: '🌍' },
          { subject: 'Physical Education', current: 'A', currentScore: 94, previous: 92, trend: 'up', color: 'red', icon: '⚽' },
        ].map((subject, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{subject.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-900">{subject.current}</span>
                  {subject.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">{subject.icon}</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current</span>
                <span className="font-medium text-gray-900">{subject.currentScore}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Previous</span>
                <span className="font-medium text-gray-600">{subject.previous}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Change</span>
                <span className={`font-medium ${subject.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {subject.trend === 'up' ? '+' : ''}{subject.currentScore - subject.previous}%
                </span>
              </div>
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600"
                style={{ width: `${subject.currentScore}%` }}
              ></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Strengths</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Excellent Problem Solving</p>
                <p className="text-sm text-gray-600">Shows strong analytical skills in Mathematics and Science</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Active Participation</p>
                <p className="text-sm text-gray-600">Consistently engages in class discussions and activities</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Homework Completion</p>
                <p className="text-sm text-gray-600">Timely submission with high quality work</p>
              </div>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-600 text-sm">!</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Reading Comprehension</p>
                <p className="text-sm text-gray-600">Practice more with complex passages and inference questions</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-600 text-sm">!</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Time Management</p>
                <p className="text-sm text-gray-600">Work on completing tests within allocated time</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-600 text-sm">!</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Written Expression</p>
                <p className="text-sm text-gray-600">Continue developing essay writing and grammar skills</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>

      {/* Teacher Comments */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Teacher Comments</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">Mrs. Emily Johnson - Mathematics</p>
              <span className="text-sm text-gray-500">November 2025</span>
            </div>
            <p className="text-gray-700">
              Emily demonstrates exceptional understanding of mathematical concepts. Her problem-solving approach is systematic and thorough. Keep up the excellent work!
            </p>
          </div>
          
          <div className="border-l-4 border-green-600 pl-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">Mr. David Chen - Science</p>
              <span className="text-sm text-gray-500">November 2025</span>
            </div>
            <p className="text-gray-700">
              Shows great curiosity and enthusiasm during lab experiments. Emily asks insightful questions and demonstrates strong scientific thinking.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-600 pl-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">Ms. Sarah Wilson - English</p>
              <span className="text-sm text-gray-500">November 2025</span>
            </div>
            <p className="text-gray-700">
              Emily's writing has improved significantly. She would benefit from more reading practice to further enhance vocabulary and comprehension skills.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}





