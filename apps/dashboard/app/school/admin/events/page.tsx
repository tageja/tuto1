import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { getSchoolEvents } from '../../../../lib/school/data';

export default async function EventsPage() {
  const schoolId = 'Sunrise International School';
  const events = await getSchoolEvents(schoolId);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Events</p>
          <p className="text-2xl font-bold text-gray-900">8</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">6</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">2</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Participants</p>
          <p className="text-2xl font-bold text-gray-900">972</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">All Events</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">School</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Class</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Competitions</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Workshops</button>
        <input
          type="text"
          placeholder="Search..."
          className="ml-auto px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Annual Sports Day', type: 'School', date: 'Nov 15, 2025', time: '9:00 AM - 3:00 PM', location: 'Main Sports Field', participants: '245/300', badge: 'School', color: 'blue' },
          { title: 'Parent-Teacher Conference', type: 'School', date: 'Nov 1-5, 2025', time: '2:00 PM - 6:00 PM', location: 'Individual Classrooms', participants: '180/200', badge: 'School', color: 'blue' },
          { title: 'Science Fair', type: 'Competition', date: 'Dec 10, 2025', time: '10:00 AM - 4:00 PM', location: 'School Auditorium', participants: '85/100', badge: 'Competition', color: 'green' },
          { title: 'Grade 5A Field Trip - Science Museum', type: 'Class', date: 'Oct 28, 2025', time: '8:00 AM - 2:00 PM', location: 'National Science Museum', participants: '42/45', badge: 'Class', color: 'purple' },
          { title: 'Art Workshop - Watercolor Techniques', type: 'Workshop', date: 'Nov 8, 2025', time: '1:00 PM - 3:00 PM', location: 'Art Room 2', participants: '20/25', badge: 'Workshop', color: 'yellow' },
          { title: 'Halloween Celebration', type: 'School', date: 'Oct 31, 2025', time: '2:00 PM - 4:00 PM', location: 'School Courtyard', participants: '320/400', badge: 'School', color: 'blue' },
        ].map((event, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <StatusBadge status={event.badge} variant={event.color as any} />
              <span className="text-sm text-gray-500">{event.participants}</span>
            </div>

            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕐</span>
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>{event.participants} participants</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">View Details</Button>
              <Button size="sm" className="flex-1" disabled title="Coming in Phase 2">Register</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Event Schedule Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Event Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Participants</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { event: 'Annual Sports Day', type: 'School', date: 'Nov 15, 2025\n9:00 AM - 3:00 PM', location: 'Main Sports Field', participants: '245/300' },
                { event: 'Parent-Teacher Conference', type: 'School', date: 'Nov 1-5, 2025\n2:00 PM - 6:00 PM', location: 'Individual Classrooms', participants: '180/200' },
                { event: 'Science Fair', type: 'Competition', date: 'Dec 10, 2025\n10:00 AM - 4:00 PM', location: 'School Auditorium', participants: '85/100' },
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.event}</div>
                    <div className="text-xs text-gray-500">Annual athletics competition featuring track and field events, team sports, and award ceremonies.</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.type} />
                  </td>
                  <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">📍 {item.location}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-medium">{item.participants}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="outline" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


















