import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { getDailyActivities } from '../../../../lib/school/data';

export default async function DailyActivitiesPage() {
  const schoolId = 'Sunrise International School';
  const activities = await getDailyActivities(schoolId);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Activities</h1>
          <p className="text-gray-600">Track daily activities, meals, and learning progress</p>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Add Activity
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>
        
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Classes</option>
            <option>Grade 1A</option>
            <option>Grade 1B</option>
            <option>Grade 2A</option>
          </select>
        </Card>

        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
          <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Types</option>
            <option>Meal</option>
            <option>Learning</option>
            <option>Play</option>
            <option>Rest</option>
          </select>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Activities</p>
          <p className="text-2xl font-bold text-gray-900">8</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">3</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">1</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">4</p>
        </Card>
      </div>

      {/* Today's Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Today's Timeline</h3>
        
        <div className="space-y-6">
          {/* Sample Activities */}
          {[
            { time: '08:30 AM', title: 'Breakfast', class: 'Grade 1A', status: 'Completed', icon: '🍳', description: 'Oatmeal with fruits and milk' },
            { time: '09:00 AM', title: 'Math Class', class: 'Grade 1A', status: 'Completed', icon: '📐', description: 'Counting and basic addition' },
            { time: '10:15 AM', title: 'Outdoor Play', class: 'Grade 1A', status: 'In Progress', icon: '⚽', description: 'Playground activities and games' },
            { time: '11:00 AM', title: 'Art & Craft', class: 'Grade 1A', status: 'Pending', icon: '🎨', description: 'Paper folding and coloring' },
            { time: '12:00 PM', title: 'Lunch Time', class: 'Grade 1A', status: 'Pending', icon: '🍱', description: 'Rice, vegetables, chicken, and soup' },
            { time: '01:00 PM', title: 'Afternoon Nap', class: 'Grade 1A', status: 'Pending', icon: '😴', description: 'Rest time after lunch' },
            { time: '02:30 PM', title: 'Story Time', class: 'Grade 1A', status: 'Pending', icon: '📚', description: 'Reading stories and storytelling' },
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 text-sm text-gray-600 font-medium">
                {activity.time}
              </div>
              <div className="flex-shrink-0 text-2xl">
                {activity.icon}
              </div>
              <div className="flex-1 pb-6 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <StatusBadge status={activity.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span>👥 {activity.class}</span>
                  <span>📍 Mrs. Johnson</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <p className="text-center text-gray-500 py-12">No activities scheduled for today</p>
        )}
      </Card>
    </div>
  );
}


