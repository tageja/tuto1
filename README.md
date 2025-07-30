# TutoApp - React Native Educational Platform

A comprehensive React Native application built with Expo and TypeScript, designed to connect students, parents, and freelance teachers/coaches. The app features a professional, modern, and highly intuitive UI with bilingual support (English/Vietnamese).

## 🚀 **Project Overview**

TutoApp is a full-featured educational platform that enables:
- **Student-Parent-Teacher Connection**: Seamless communication between all stakeholders
- **Subject Discovery**: Browse academic subjects and extracurricular activities
- **Teacher Search & Booking**: Find and book qualified teachers
- **Bilingual Support**: Complete English and Vietnamese language support
- **Professional UI**: Modern, responsive design with consistent theming

## 📱 **Key Features**

### ✅ **Implemented Features**

#### **Authentication System**
- Complete login/register functionality
- Password reset with email verification
- Social login integration (Google/Facebook)
- Form validation and error handling
- Bilingual authentication screens

#### **Subjects & Activities**
- **12 Real Subject Icons**: Math, Physics, Chemistry, Biology, English, Literature, Piano, Guitar, Drawing, Swimming, Basketball, Football
- **Subject Categories**: Academic and Extracurricular
- **Subject Discovery**: Browse all subjects with search and filtering
- **Subject Results**: View teachers for specific subjects with sorting options
- **Home Screen Integration**: Scrollable subject pills below hero illustration

#### **User Interface**
- **Professional Design**: Modern, clean UI with consistent theming
- **Bilingual Support**: Complete English/Vietnamese translations
- **Responsive Layout**: Works perfectly on all screen sizes
- **Smooth Navigation**: Seamless flow between screens
- **Custom Components**: Reusable UI components with proper styling

#### **Navigation & Screens**
- **25+ Screens**: Comprehensive screen coverage
- **Tab Navigation**: Home, Search, Bookings, Profile
- **Stack Navigation**: Authentication, Subjects, Teacher Profiles
- **Professional Headers**: Custom headers with logo and language toggle

#### **Airtable Integration**
- **Backend Ready**: Complete Airtable service integration
- **CRUD Operations**: Full create, read, update, delete functionality
- **Data Models**: Comprehensive TypeScript interfaces
- **Error Handling**: Robust error management and loading states

### 🔄 **In Progress**
- Teacher Profile Screen (detailed implementation)
- Booking System (date/time selection)
- Payment Integration
- Real-time Chat
- Push Notifications

### 📋 **Planned Features**
- Maps Integration (Google Maps API)
- Advanced Search & Filters
- CRM Dashboard
- LMS Features
- AI-powered Adaptive Homework

## 🛠 **Tech Stack**

### **Frontend**
- **React Native**: Latest stable version
- **Expo**: Development platform and tools
- **TypeScript**: Static typing and improved code quality
- **React Navigation**: Navigation management
- **Expo Vector Icons**: MaterialIcons for consistent iconography

### **Backend & Data**
- **Airtable**: MVP backend solution
- **AsyncStorage**: Local data persistence
- **Environment Variables**: Secure configuration management

### **UI/UX**
- **Custom Theme System**: Centralized design tokens
- **Bilingual Support**: Complete translation system
- **Responsive Design**: Cross-platform compatibility
- **Professional Components**: Reusable UI components

## 📁 **Project Structure**

```
tuto/
├── assets/                    # Images, icons, videos
│   ├── subjects/             # Subject icons (12 icons)
│   ├── home-illustration.png # Hero image
│   ├── tuto-logo.png        # App logo
│   └── tuto-intro.mp4       # Splash video
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   └── subjects/        # Subject-specific components
│   ├── contexts/            # React contexts
│   ├── data/               # Data structures and constants
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components (25+ screens)
│   ├── services/           # API and external services
│   ├── theme/              # Design system and theming
│   ├── translations/       # Bilingual text content
│   └── types/              # TypeScript type definitions
├── scripts/                # Setup and utility scripts
├── docs/                   # Documentation
└── AIRTABLE_SETUP.md      # Airtable configuration guide
```

## 🎨 **Design System**

### **Colors**
- **Primary Blue**: #0B5FFF
- **Secondary White**: #FFFFFF
- **Accent Grey**: #F9FAFC
- **Status Colors**: Success, Warning, Error, Info

### **Typography**
- **Font Family**: Inter (Regular, Medium, SemiBold, Bold)
- **Font Sizes**: 12px to 32px scale
- **Line Heights**: Tight, Normal, Relaxed

### **Spacing & Layout**
- **Consistent Spacing**: 4px to 48px scale
- **Border Radius**: 4px to 16px scale
- **Shadows**: Subtle elevation system
- **Minimum Padding**: 16px around major UI elements

## 🌐 **Bilingual Support**

### **Languages**
- **English**: Primary interface language
- **Vietnamese**: Default language with complete translations

### **Translation System**
- **Centralized**: All text in `src/translations/index.ts`
- **Context-based**: React Context for language management
- **Persistent**: Language preference saved locally
- **Complete Coverage**: All UI text translated

## 📊 **Data Models**

### **Core Entities**
- **User**: Authentication and profile data
- **Teacher**: Professional information and availability
- **Student**: Academic profile and preferences
- **Parent**: Family information and children
- **Subject**: Academic and extracurricular activities
- **Booking**: Class scheduling and payment
- **Review**: Teacher ratings and feedback

### **Airtable Integration**
- **8 Tables**: Comprehensive data structure
- **Field Mapping**: TypeScript interfaces for type safety
- **CRUD Operations**: Full data management
- **Error Handling**: Robust error management

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tuto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   EXPO_PUBLIC_AIRTABLE_API_KEY=your_api_key_here
   EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npx expo run:ios
   
   # Android
   npx expo run:android
   ```

## 📋 **Airtable Setup**

### **Required Tables**
1. **Teachers**: Professional information and availability
2. **Students**: Academic profiles and preferences
3. **Parents**: Family information and children
4. **Bookings**: Class scheduling and payment
5. **Subjects**: Academic and extracurricular activities
6. **Reviews**: Teacher ratings and feedback
7. **Payments**: Financial transactions
8. **Homework**: Assignment tracking

### **Setup Instructions**
See `AIRTABLE_SETUP.md` for detailed configuration instructions.

## 🧪 **Testing**

### **Manual Testing**
- **Authentication Flow**: Login, Register, Password Reset
- **Subject Navigation**: Browse subjects and view teachers
- **Language Switching**: Toggle between English and Vietnamese
- **Responsive Design**: Test on different screen sizes

### **Component Testing**
- **SubjectCard**: Different variants and states
- **Input Components**: Validation and error states
- **Navigation**: Screen transitions and back navigation

## 📱 **Screens Overview**

### **Authentication (4 screens)**
- Splash Screen (video-based)
- Login Screen
- Register Screen
- Forgot Password Screen

### **Main App (21+ screens)**
- Home Screen (with subject pills)
- Subjects Screen (browse all subjects)
- Subject Results Screen (teachers for subject)
- Search Screen
- Teacher Profile Screen
- Booking Screen
- Profile Screen
- Dashboard Screen
- And many more...

## 🔧 **Development Guidelines**

### **Code Style**
- **TypeScript**: Strict typing throughout
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Component Structure**: Consistent file organization

### **Best Practices**
- **Reusable Components**: DRY principle
- **Custom Hooks**: Logic separation
- **Context Usage**: Global state management
- **Error Boundaries**: Graceful error handling

## 📈 **Performance**

### **Optimizations**
- **Image Optimization**: Proper sizing and formats
- **Lazy Loading**: Screen and component loading
- **Memory Management**: Proper cleanup and disposal
- **Bundle Size**: Efficient imports and tree shaking

### **Monitoring**
- **Performance Metrics**: Screen load times
- **Memory Usage**: Component memory footprint
- **Error Tracking**: Crash reporting and analytics

## 🔒 **Security**

### **Data Protection**
- **Environment Variables**: Secure API key management
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Secure error messages
- **Authentication**: Secure login and session management

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 **Support**

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 🎯 **Roadmap**

### **Phase 1 (Current)**
- ✅ Authentication System
- ✅ Subjects & Activities
- ✅ Basic UI Components
- ✅ Airtable Integration

### **Phase 2 (Next)**
- 🔄 Teacher Profile Screens
- 🔄 Booking System
- 🔄 Payment Integration
- 🔄 Advanced Search

### **Phase 3 (Future)**
- 📋 Maps Integration
- 📋 Real-time Chat
- 📋 Push Notifications
- 📋 AI Features

---

**Built with ❤️ using React Native, Expo, and TypeScript** 