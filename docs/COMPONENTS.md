# TutoApp Component Documentation

## 🧩 **Component Overview**

This document provides detailed information about all reusable components in the TutoApp, including their props, usage examples, and styling guidelines.

## 📱 **Common Components**

### **Button Component**
**Location**: `src/components/common/Button.tsx`

A versatile button component with multiple variants and states.

#### **Props**
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

#### **Usage Examples**
```tsx
// Primary button
<Button 
  title="Login" 
  onPress={handleLogin} 
  variant="primary" 
/>

// Secondary button with loading state
<Button 
  title="Submit" 
  onPress={handleSubmit} 
  variant="secondary" 
  loading={isLoading} 
/>

// Outline button
<Button 
  title="Cancel" 
  onPress={handleCancel} 
  variant="outline" 
/>
```

#### **Styling**
- **Primary**: Blue background with white text
- **Secondary**: Grey background with dark text
- **Outline**: Transparent background with colored border
- **Loading State**: Shows spinner and disables interaction
- **Disabled State**: Reduced opacity and disabled interaction

### **Input Component**
**Location**: `src/components/common/Input.tsx`

A comprehensive input component with validation and custom styling.

#### **Props**
```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  rightIcon?: React.ReactNode;
}
```

#### **Usage Examples**
```tsx
// Basic text input
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
/>

// Password input with visibility toggle
<Input
  label="Password"
  placeholder="Enter your password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={!showPassword}
  rightIcon={
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} />
    </TouchableOpacity>
  }
/>

// Multiline input with error
<Input
  label="Description"
  placeholder="Enter description"
  value={description}
  onChangeText={setDescription}
  multiline
  numberOfLines={3}
  error={descriptionError}
/>
```

#### **Features**
- **Focus States**: Border color changes on focus
- **Error States**: Red border and error message display
- **Password Toggle**: Built-in visibility toggle for password fields
- **Custom Icons**: Support for right-side icons
- **Multiline Support**: Expandable text areas
- **Validation**: Real-time error display

## 🎨 **Subject Components**

### **SubjectCard Component**
**Location**: `src/components/subjects/SubjectCard.tsx`

A flexible card component for displaying subjects with different variants.

#### **Props**
```typescript
interface SubjectCardProps {
  subject: Subject;
  onPress: (subject: Subject) => void;
  variant?: 'default' | 'compact' | 'large';
  selected?: boolean;
}
```

#### **Usage Examples**
```tsx
// Compact variant for horizontal scrolling
<SubjectCard
  subject={subject}
  onPress={handleSubjectPress}
  variant="compact"
/>

// Large variant with description
<SubjectCard
  subject={subject}
  onPress={handleSubjectPress}
  variant="large"
  selected={selectedSubject?.id === subject.id}
/>
```

#### **Variants**
- **Compact**: Small cards for horizontal scrolling (32px icons)
- **Default**: Standard size cards (48px icons)
- **Large**: Detailed cards with descriptions (64px icons)

#### **Features**
- **Bilingual Support**: Automatic language switching
- **Icon Integration**: Real subject icons from assets
- **Selection State**: Visual feedback for selected subjects
- **Category Badges**: Academic/Extracurricular indicators
- **Responsive Design**: Adapts to different screen sizes

## 🎯 **Screen Components**

### **HomeScreen**
**Location**: `src/screens/HomeScreen.tsx`

The main home screen with hero section, subject pills, and promotional content.

#### **Key Features**
- **Hero Section**: Fixed illustration with overlay text
- **Subject Pills**: Horizontal scrolling subject cards
- **Search Bar**: Quick access to search functionality
- **Promotional Banner**: Call-to-action for trial booking
- **Responsive Layout**: Adapts to different screen sizes

#### **Navigation Integration**
```tsx
// Navigate to subject results
const handleSubjectPress = (subject: Subject) => {
  navigation.navigate('SubjectResults', { subject });
};

// Navigate to search
const handleSearchPress = () => {
  navigation.navigate('Search');
};
```

### **SubjectsScreen**
**Location**: `src/screens/SubjectsScreen.tsx`

A comprehensive screen for browsing all subjects with search and filtering.

#### **Key Features**
- **Search Functionality**: Real-time subject search
- **Category Filtering**: Academic vs Extracurricular tabs
- **Grid Layout**: 2-column responsive grid
- **Empty States**: Professional no-results display
- **Quick Actions**: Navigation shortcuts

#### **State Management**
```tsx
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState<'all' | 'academic' | 'extracurricular'>('all');
const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
```

### **SubjectResultsScreen**
**Location**: `src/screens/SubjectResultsScreen.tsx`

Displays teachers for a selected subject with sorting and filtering options.

#### **Key Features**
- **Teacher Cards**: Detailed teacher information display
- **Sorting Options**: Rating, price, distance, experience
- **Mock Data**: Demo teachers for testing
- **Booking Integration**: Direct booking from teacher cards
- **Professional Layout**: Clean, organized design

#### **Sorting Implementation**
```tsx
const sortTeachers = (teachersToSort: Teacher[], sortOption: SortOption) => {
  return [...teachersToSort].sort((a, b) => {
    switch (sortOption) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.hourlyRate - b.hourlyRate;
      case 'experience':
        return b.experience - a.experience;
      default:
        return 0;
    }
  });
};
```

## 🔐 **Authentication Components**

### **LoginScreen**
**Location**: `src/screens/LoginScreen.tsx`

Complete login functionality with form validation and social login options.

#### **Key Features**
- **Form Validation**: Real-time email and password validation
- **Password Toggle**: Show/hide password functionality
- **Social Login**: Google and Facebook integration (placeholder)
- **Error Handling**: Comprehensive error display
- **Navigation**: Links to register and forgot password

#### **Form Validation**
```tsx
const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.email) {
    newErrors.email = t('auth.emailRequired');
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = t('auth.emailInvalid');
  }

  if (!formData.password) {
    newErrors.password = t('auth.passwordRequired');
  } else if (formData.password.length < 6) {
    newErrors.password = t('auth.passwordTooShort');
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### **RegisterScreen**
**Location**: `src/screens/RegisterScreen.tsx`

Comprehensive registration with role selection and form validation.

#### **Key Features**
- **Role Selection**: Parent vs Teacher registration
- **Form Validation**: Complete field validation
- **Password Confirmation**: Matching password validation
- **Terms Acceptance**: Legal agreement integration
- **Airtable Integration**: Real parent registration

#### **Role Selection**
```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  address: '',
  role: 'parent' as 'parent' | 'teacher',
});
```

### **ForgotPasswordScreen**
**Location**: `src/screens/ForgotPasswordScreen.tsx`

Password reset functionality with email validation.

#### **Key Features**
- **Email Validation**: Proper email format checking
- **Loading States**: Professional loading indicators
- **Success Feedback**: Clear success messages
- **Navigation**: Back to login functionality
- **Instructions**: Clear user guidance

## 🎨 **Styling Guidelines**

### **Theme System**
All components use the centralized theme system:

```typescript
// Colors
colors.primary        // #0B5FFF
colors.secondary      // #FFFFFF
colors.accent         // #F9FAFC
colors.text.primary   // #1A1A1A
colors.text.secondary // #666666

// Spacing
spacing.xs  // 4px
spacing.sm  // 8px
spacing.md  // 16px
spacing.lg  // 24px
spacing.xl  // 32px
spacing.xxl // 48px

// Typography
typography.fontSize.xs   // 12px
typography.fontSize.sm   // 14px
typography.fontSize.md   // 16px
typography.fontSize.lg   // 18px
typography.fontSize.xl   // 20px
typography.fontSize.xxl  // 24px
```

### **Component Styling Patterns**
```tsx
// Consistent styling approach
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
});
```

## 🌐 **Internationalization**

### **Translation Integration**
All components support bilingual text:

```tsx
const { t, language } = useLanguage();
const isVietnamese = language === 'vi';

// Dynamic text based on language
<Text style={styles.title}>
  {isVietnamese ? subject.nameVi : subject.name}
</Text>
```

### **Translation Keys**
```typescript
// Common translations
t('common.ok')
t('common.cancel')
t('common.loading')

// Auth translations
t('auth.login')
t('auth.register')
t('auth.emailRequired')

// Subject translations
t('subjects.title')
t('subjects.academic')
t('subjects.extracurricular')
```

## 🔧 **Component Best Practices**

### **Props Interface**
Always define clear TypeScript interfaces:

```tsx
interface ComponentProps {
  // Required props
  title: string;
  onPress: () => void;
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  
  // Style props
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

### **Error Handling**
Implement proper error states:

```tsx
// Error display pattern
{error && (
  <View style={styles.errorContainer}>
    <MaterialIcons name="error" size={16} color={colors.status.error} />
    <Text style={styles.errorText}>{error}</Text>
  </View>
)}
```

### **Loading States**
Provide clear loading feedback:

```tsx
// Loading state pattern
<Button
  title={t('auth.login')}
  onPress={handleLogin}
  loading={loading}
  disabled={loading}
/>
```

### **Accessibility**
Include accessibility features:

```tsx
// Accessibility props
<TouchableOpacity
  onPress={onPress}
  accessible={true}
  accessibilityLabel={accessibilityLabel}
  accessibilityHint={accessibilityHint}
>
  {/* Component content */}
</TouchableOpacity>
```

## 📱 **Responsive Design**

### **Screen Size Adaptation**
```tsx
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive sizing
const cardWidth = width < 375 ? width - 32 : 160;
const iconSize = width < 375 ? 24 : 32;
```

### **Orientation Handling**
```tsx
// Orientation-aware layouts
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
```

## 🧪 **Testing Guidelines**

### **Component Testing**
```tsx
// Example test structure
describe('Button Component', () => {
  it('renders correctly with primary variant', () => {
    const { getByText } = render(
      <Button title="Test" onPress={jest.fn()} variant="primary" />
    );
    expect(getByText('Test')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test" onPress={onPress} />
    );
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### **Accessibility Testing**
```tsx
// Accessibility test
it('has correct accessibility label', () => {
  const { getByLabelText } = render(
    <Button 
      title="Login" 
      onPress={jest.fn()} 
      accessibilityLabel="Login button" 
    />
  );
  expect(getByLabelText('Login button')).toBeTruthy();
});
```

---

This component documentation provides comprehensive guidance for using and extending the TutoApp component library, ensuring consistency and maintainability across the application. 