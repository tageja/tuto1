import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { Button } from '../../../../components/ui/Button';

export default function ParentEventsPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-600">Upcoming school events and activities for Grade 5A</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">All Events</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Registered</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Upcoming</button>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            title: 'Grade 5A Field Trip - Science Museum', 
            type: 'Class', 
            date: 'Oct 28, 2025', 
            time: '8:00 AM - 2:00 PM', 
            location: 'National Science Museum', 
            registered: true, 
            spots: '42/45',
            description: 'Explore interactive science exhibits and participate in hands-on workshops.',
            color: 'purple'
          },
          { 
            title: 'Parent-Teacher Conference', 
            type: 'School', 
            date: 'Nov 1-5, 2025', 
            time: '2:00 PM - 6:00 PM', 
            location: 'Individual Classrooms', 
            registered: true, 
            spots: '180/200',
            description: 'One-on-one meetings with teachers to discuss student progress.',
            color: 'blue'
          },
          { 
            title: 'Annual Sports Day', 
            type: 'School', 
            date: 'Nov 15, 2025', 
            time: '9:00 AM - 3:00 PM', 
            location: 'Main Sports Field', 
            registered: false, 
            spots: '245/300',
            description: 'Annual athletics competition featuring track and field events.',
            color: 'blue'
          },
          { 
            title: 'Halloween Celebration', 
            type: 'School', 
            date: 'Oct 31, 2025', 
            time: '2:00 PM - 4:00 PM', 
            location: 'School Courtyard', 
            registered: true, 
            spots: '320/400',
            description: 'Costume parade, games, and Halloween festivities for all grades.',
            color: 'blue'
          },
          { 
            title: 'Science Fair', 
            type: 'Competition', 
            date: 'Dec 10, 2025', 
            time: '10:00 AM - 4:00 PM', 
            location: 'School Auditorium', 
            registered: false, 
            spots: '85/100',
            description: 'Students showcase science projects and compete for prizes.',
            color: 'green'
          },
          { 
            title: 'Art Workshop - Watercolor Techniques', 
            type: 'Workshop', 
            date: 'Nov 8, 2025', 
            time: '1:00 PM - 3:00 PM', 
            location: 'Art Room 2', 
            registered: false, 
            spots: '20/25',
            description: 'Learn watercolor painting techniques from professional artists.',
            color: 'yellow'
          },
        ].map((event, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <StatusBadge status={event.type} variant={event.color as any} />
              <span className="text-sm text-gray-500">{event.spots}</span>
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
            </div>

            <p className="text-sm text-gray-700 mb-4">{event.description}</p>

            {event.registered ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm font-medium text-green-800">Registered</span>
              </div>
            ) : (
              <Button className="w-full" size="sm" disabled title="Coming in Phase 2">
                Register
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}



