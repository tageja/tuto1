import { Search } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { getAnnouncements } from '../../../../lib/school/data';

export default async function AnnouncementsPage() {
  const schoolId = 'Sunrise International School';
  const announcements = await getAnnouncements(schoolId);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Announcements</h1>
        <p className="text-gray-600">Stay updated with school news and important notices</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">All</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Active</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Urgent</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Expired</button>
        <div className="ml-auto relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {[
          { title: 'Parent-Teacher Conference Schedule', category: 'School Event', date: 'Oct 25, 2025', priority: 'High', status: 'Active', content: 'Parent-teacher conferences will be held from November 1-5, 2025. Please sign up for your preferred time slot through the school portal.' },
          { title: 'School Closure - Public Holiday', category: 'Important Notice', date: 'Oct 20, 2025', priority: 'Urgent', status: 'Active', content: 'The school will be closed on November 10, 2025, in observance of National Day. Regular classes will resume on November 11.' },
          { title: 'Field Trip Permission Forms Due', category: 'Academic', date: 'Oct 18, 2025', priority: 'Normal', status: 'Active', content: 'Permission forms for the Science Museum field trip are due by October 27. Please submit signed forms to the class teacher.' },
          { title: 'Annual Sports Day Registration Open', category: 'Sports', date: 'Oct 15, 2025', priority: 'Normal', status: 'Active', content: 'Registration for Annual Sports Day is now open. Students can register for track and field events, team sports, and fun activities.' },
          { title: 'New Lunch Menu Available', category: 'Cafeteria', date: 'Oct 10, 2025', priority: 'Low', status: 'Active', content: 'An updated lunch menu with healthier options is now available. View the full menu on the school website.' },
        ].map((announcement, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <StatusBadge status={announcement.priority} />
                  <StatusBadge status={announcement.status} variant="success" />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    📁 {announcement.category}
                  </span>
                  <span className="flex items-center gap-1">
                    📅 {announcement.date}
                  </span>
                </div>
                <p className="text-gray-700">{announcement.content}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button className="text-sm text-blue-600 hover:underline">Read More</button>
              <button className="text-sm text-gray-600 hover:text-gray-900">Mark as Read</button>
            </div>
          </Card>
        ))}

        {announcements.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No announcements available</p>
          </Card>
        )}
      </div>
    </div>
  );
}



