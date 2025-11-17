# Tuto Mobile App - React Native (TypeScript)

A modern, bilingual (Vietnamese/English) mobile application for the Tuto education platform, connecting teachers, parents, and schools.

Built with **React Native**, **TypeScript**, and **Expo**.

## Features

- 🎨 Beautiful gradient UI with brand colors (#0B5FFF, #6366F1)
- 🌐 Full bilingual support (English/Vietnamese)
- 🔐 Login and registration with role selection
- 📱 Fully responsive mobile design
- ✨ Smooth animations and transitions
- 🔵 Glass-morphism card design
- 🌟 Google Sign-In UI (ready for integration)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Expo Go app on your mobile device (for testing)

### Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npx expo start
```

4. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Project Structure

```
mobile/
├── App.tsx                # Main entry point (TypeScript)
├── LoginScreen.tsx        # Login/Register screen component (TypeScript)
├── LanguageContext.tsx    # Bilingual context provider (TypeScript)
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies
├── app.json             # Expo configuration
└── README.md            # This file
```

## Features Overview

### Authentication Screens

- **Sign In Tab**: Email/password login with "Remember me" and "Forgot password"
- **Register Tab**: Full name, email, password, and role selection
- **Role Options**: Parent, Student, Teacher, School Admin
- **Google Sign-In**: UI ready for OAuth integration

### Language Support

- Toggle between English and Vietnamese
- All text is localized
- Language preference persists during session

### Design Elements

- Gradient logo with Tuto branding
- Hero image with educational theme
- Glass-morphism card with blur effect
- Smooth tab transitions
- Custom dropdown for role selection
- Professional form validation ready

## Customization

### Colors

The app uses the Tuto brand colors defined in the styles:
- Primary Blue: `#0B5FFF`
- Accent Purple: `#6366F1`
- Background: `#F9FAFC`

### Adding Real Authentication

To integrate real authentication:

1. Install authentication library (e.g., Firebase, Supabase)
2. Update `handleSubmit` function in `LoginScreen.js`
3. Add proper form validation
4. Implement Google Sign-In OAuth flow

### Navigation

Currently shows a single screen. To add navigation:

```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
```

Then wrap the app with NavigationContainer and add screens.

## Testing

- **iOS Simulator**: `npm run ios` (requires macOS and Xcode)
- **Android Emulator**: `npm run android` (requires Android Studio)
- **Physical Device**: Use Expo Go app and scan QR code

## Notes

- Uses Expo SDK 51 (compatible with React Native 0.74)
- Requires `expo-blur` and `expo-linear-gradient` for visual effects
- Form validation is basic - add proper validation before production
- Google Sign-In button is UI only - needs OAuth integration

## Next Steps

1. ✅ Test on your device with Expo Go
2. 🔐 Integrate real authentication (Firebase/Supabase)
3. 📱 Add navigation to other screens
4. ✅ Implement form validation
5. 🎨 Customize styling as needed
6. 📤 Add splash screen and app icons

## Support

For questions or issues, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

---

Built with ❤️ for Tuto Education Platform
