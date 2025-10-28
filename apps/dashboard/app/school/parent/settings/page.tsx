import { Card } from '../../../../components/ui/Card';

export default function ParentSettingsPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your profile and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-gray-200">
        <button className="pb-4 px-1 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
          Profile
        </button>
        <button className="pb-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
          Preferences
        </button>
        <button className="pb-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
          Notifications
        </button>
      </div>

      {/* Profile Tab Content */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm opacity-50 cursor-not-allowed"
            disabled
            title="Coming in Phase 2"
          >
            Edit Profile
          </button>
        </div>

        <div className="flex items-start gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
              PU
            </div>
            <button className="mt-4 text-sm text-blue-600 hover:underline opacity-50 cursor-not-allowed" disabled>
              Change Photo
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value="Parent User"
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value="parent@example.com"
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value="+1 (555) 987-6543"
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value="Parent"
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child Name</label>
              <input
                type="text"
                value="Emily Chen"
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child's Class</label>
              <input
                type="text"
                value="Grade 5A"
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                rows={3}
                disabled
                value="123 Main Street, Apt 4B, Hanoi, Vietnam"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Edit functionality will be available in Phase 2. Contact your school administrator for urgent profile updates.
          </p>
        </div>
      </Card>
    </div>
  );
}

