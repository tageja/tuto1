# TutoApp Deployment Guide

## 🚀 **Deployment Overview**

This guide covers the complete deployment process for TutoApp, from development to production release on both iOS and Android platforms.

## 📋 **Prerequisites**

### **Development Environment**
- **Node.js**: Version 16 or higher
- **npm or yarn**: Package manager
- **Expo CLI**: Latest version
- **Git**: Version control
- **Code Editor**: VS Code recommended

### **Platform Requirements**
- **iOS Development**: macOS with Xcode
- **Android Development**: Android Studio with SDK
- **Airtable Account**: For backend services
- **App Store Connect**: For iOS distribution
- **Google Play Console**: For Android distribution

## 🔧 **Environment Setup**

### **1. Install Dependencies**
```bash
# Clone the repository
git clone <repository-url>
cd tuto

# Install dependencies
npm install

# Install Expo CLI globally
npm install -g @expo/cli
```

### **2. Environment Variables**
Create a `.env` file in the root directory:

```env
# Airtable Configuration
EXPO_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key_here
EXPO_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id_here

# App Configuration
EXPO_PUBLIC_APP_NAME=TutoApp
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_ENVIRONMENT=production
```

### **3. Airtable Setup**
Follow the `AIRTABLE_SETUP.md` guide to configure your Airtable base with the required tables and fields.

## 🏗 **Build Configuration**

### **app.json Configuration**
```json
{
  "expo": {
    "name": "TutoApp",
    "slug": "tuto-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0B5FFF"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tutoapp.mobile",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0B5FFF"
      },
      "package": "com.tutoapp.mobile",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-av"
    ]
  }
}
```

### **EAS Build Configuration**
Create `eas.json` for EAS Build:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 🔄 **Development Workflow**

### **1. Local Development**
```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### **2. Testing**
```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### **3. Code Quality**
```bash
# Format code
npm run format

# Check for issues
npm run lint:fix
```

## 📱 **Platform-Specific Builds**

### **iOS Build**

#### **Prerequisites**
- macOS with Xcode 13+
- Apple Developer Account
- App Store Connect access

#### **Build Process**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for internal testing
eas build --platform ios --profile preview
```

#### **App Store Submission**
```bash
# Submit to App Store
eas submit --platform ios
```

### **Android Build**

#### **Prerequisites**
- Android Studio with SDK
- Google Play Console account
- Keystore for signing

#### **Build Process**
```bash
# Build for Android
eas build --platform android

# Build for internal testing
eas build --platform android --profile preview
```

#### **Play Store Submission**
```bash
# Submit to Play Store
eas submit --platform android
```

## 🧪 **Testing Strategy**

### **Manual Testing Checklist**

#### **Authentication Flow**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Registration with valid data
- [ ] Registration with invalid data
- [ ] Password reset functionality
- [ ] Social login (placeholder)

#### **Subject Navigation**
- [ ] Browse all subjects
- [ ] Search subjects
- [ ] Filter by category
- [ ] Select subject and view teachers
- [ ] Sort teachers by different criteria

#### **Language Support**
- [ ] Switch between English and Vietnamese
- [ ] All text displays correctly in both languages
- [ ] Language preference persists

#### **UI/UX**
- [ ] Responsive design on different screen sizes
- [ ] Proper navigation flow
- [ ] Loading states and error handling
- [ ] Accessibility features

### **Automated Testing**
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📊 **Performance Optimization**

### **Bundle Optimization**
```bash
# Analyze bundle size
npx expo export --platform ios
npx expo export --platform android

# Optimize images
npx expo install expo-image-optimizer
```

### **Performance Monitoring**
- **Screen Load Times**: Monitor component render times
- **Memory Usage**: Track memory consumption
- **Network Requests**: Optimize API calls
- **Image Loading**: Implement lazy loading

## 🔒 **Security Considerations**

### **API Security**
- **Environment Variables**: Secure API key storage
- **Input Validation**: Sanitize all user inputs
- **Error Handling**: Secure error messages
- **Rate Limiting**: Implement request throttling

### **App Security**
- **Code Obfuscation**: Protect source code
- **Certificate Pinning**: Secure network communication
- **Data Encryption**: Encrypt sensitive data
- **App Signing**: Proper app signing for distribution

## 📈 **Analytics and Monitoring**

### **Crash Reporting**
```bash
# Install Sentry
npx expo install @sentry/react-native

# Configure Sentry
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

### **Analytics Integration**
```bash
# Install analytics
npx expo install expo-analytics

# Configure analytics
import Analytics from 'expo-analytics';

Analytics.initialize('your-analytics-key');
```

## 🚀 **Production Deployment**

### **1. Pre-deployment Checklist**
- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Environment variables configured

### **2. Build Production App**
```bash
# Build for production
eas build --platform all --profile production

# Wait for build completion
eas build:list
```

### **3. Submit to Stores**
```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

### **4. Post-deployment**
- [ ] Monitor crash reports
- [ ] Track user analytics
- [ ] Monitor app store reviews
- [ ] Plan next release

## 🔄 **Continuous Integration**

### **GitHub Actions Workflow**
Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: eas build --platform all --non-interactive
```

## 📱 **OTA Updates**

### **Configure OTA Updates**
```bash
# Publish update
expo publish

# Configure update channel
expo publish --release-channel production
```

### **Update Strategy**
- **Critical Updates**: Force update for security fixes
- **Feature Updates**: Optional updates for new features
- **Bug Fixes**: Automatic updates for minor fixes

## 🔧 **Troubleshooting**

### **Common Build Issues**

#### **iOS Build Failures**
```bash
# Clean build cache
npx expo run:ios --clear

# Reset Metro cache
npx expo start --clear
```

#### **Android Build Failures**
```bash
# Clean Android build
cd android && ./gradlew clean
cd ..

# Reset Metro cache
npx expo start --clear
```

#### **EAS Build Issues**
```bash
# Check build status
eas build:list

# View build logs
eas build:view

# Retry failed build
eas build --platform ios --clear-cache
```

### **Performance Issues**
- **Bundle Size**: Analyze with `expo export`
- **Memory Leaks**: Use React DevTools
- **Network Issues**: Implement proper error handling
- **Image Loading**: Optimize image sizes

## 📚 **Resources**

### **Documentation**
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

### **Tools**
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/)
- [EAS CLI](https://docs.expo.dev/eas/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)

### **Community**
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://reactnative.dev/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

This deployment guide provides comprehensive instructions for deploying TutoApp to production, ensuring a smooth and secure release process. 