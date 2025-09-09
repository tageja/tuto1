# TutoApp - React Native EdTech Platform

A comprehensive React Native application for educational technology, featuring both general learning features and school-specific functionality.

## 🚀 Features

### Core Features
- **Multi-language Support**: English and Vietnamese
- **Role-based Access**: Parent, Student, Teacher
- **Real-time Feed**: Community posts with media support
- **Learning Dashboard**: Progress tracking and achievements
- **Teacher Booking**: Session scheduling and management
- **Payment Integration**: Token-based economy
- **Store**: Digital and physical rewards

### School Integration Features ✨
- **Multi-School Support**: Join multiple schools/institutions
- **School Dashboard**: Centralized school management
- **Daily Activities**: Track school events and activities
- **Announcements**: School-wide communication
- **Messages**: Internal messaging system
- **Photo Albums**: Event documentation and sharing
- **Invitation System**: Secure school joining via codes
- **Data Isolation**: Complete privacy between schools

## 🏗️ Architecture

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS) for styling
- **React Navigation** for routing
- **React Context** for state management

### Backend
- **Firebase** Authentication & Firestore
- **Airtable** as primary database
- **Cloudinary** for media storage
- **AsyncStorage** for local persistence

### School System
- **20 Airtable Tables** for school data management
- **Role-based Access Control** (RBAC)
- **Multi-tenant Architecture** with data isolation
- **Real-time Updates** via Firebase

## 📱 Screens

### General Screens
- Login/Register
- Home Dashboard
- Feed
- Teacher Profiles
- Booking System
- Store
- Progress Tracking

### School Screens
- School Invitation
- School Selection (Multi-school)
- School Dashboard
- Daily Activities
- Announcements
- Messages
- Photo Albums

## 🔧 Recent Updates (Latest)

### ✅ Translation System Fixes
- Fixed critical translation errors causing app crashes
- Updated all screens to use proper `useLanguage` hook
- Added missing translation keys for school features
- Resolved `TypeError: t is not a function` errors

### ✅ School Integration Enhancements
- **Multi-School Persistence**: Users can join multiple schools
- **School Selection Screen**: Manage multiple school memberships
- **Dynamic Home Screen**: Adapts based on school membership
- **Improved Navigation**: Proper flow between general and school features

### ✅ UI/UX Improvements
- **Tuto Branding**: Consistent branding across school screens
- **Quick Actions**: Restored original home screen actions
- **Smart Banners**: Dynamic school joining prompts
- **Error Handling**: Better error messages and recovery

### ✅ Technical Fixes
- **Analytics**: Added `expo-firebase-analytics` (lazy) + Sentry breadcrumbs; screen tracking via `NavigationContainer`
- **Type Safety**: `tsc --noEmit` clean (0 errors); excluded `functions/**` from root tsconfig
- **Docs**: Production release checklist in `docs/DEPLOYMENT.md`
- **Cleanup**: Removed obsolete `dataconnect/` and debug scripts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Airtable account
- Firebase project

### Installation
```bash
git clone <repository>
cd tuto
npm install
```

### Environment Setup
Create `.env` file:
```env
EXPO_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key
EXPO_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id
```

### Running the App
```bash
npm start
```

## 📊 Database Schema

### School Tables (20 tables)
- `TutoSchools` - School information
- `TutoSchoolInvitations` - Invitation codes
- `TutoSchoolUsers` - User-school relationships
- `TutoDailyActivities` - School activities
- `TutoAnnouncements` - School announcements
- `TutoMessages` - Internal messaging
- `TutoPhotoAlbums` - Event photos
- And 13 more specialized tables...

## 🔐 Security

- **Firebase Security Rules** for data protection
- **School-level Data Isolation** via `schoolId` fields
- **Role-based Permissions** for different user types
- **Secure Invitation System** with expiry dates

## 🌐 Internationalization

- **English** and **Vietnamese** support
- **Dynamic Language Switching**
- **Contextual Translations** for all features
- **School-specific Translations**

## 📈 Performance

- **React Query** for efficient data caching
- **Optimized Images** with lazy loading
- **Background Data Sync** for offline support
- **Memory Management** for large datasets

## 🧪 Testing

The app includes comprehensive testing for:
- School joining flow
- Multi-school management
- Translation system
- Navigation logic
- Data persistence

## 📝 Recent Bug Fixes

### Critical Issues Resolved
1. **Translation System Crashes**: Fixed `TypeError: Cannot read property 'dashboard' of undefined`
2. **School Joining Errors**: Resolved Airtable field access issues
3. **Navigation Problems**: Fixed screen routing and state management
4. **UI Inconsistencies**: Restored proper home screen layout
5. **Data Loading Issues**: Optimized Airtable queries and error handling

### Performance Improvements
- Reduced app crashes during school operations
- Improved translation loading speed
- Enhanced error recovery mechanisms
- Better user feedback for failed operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review recent fixes in the issues
- Contact the development team

---

**Last Updated**: August 27, 2025
**Version**: 1.0.0
**Status**: Production Ready with School Integration 