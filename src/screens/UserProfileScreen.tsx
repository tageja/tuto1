import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

interface UserProfileScreenProps {
  navigation: any;
}

type UserType = 'parent' | 'student' | 'teacher';

interface UserData {
  id: string;
  type: UserType;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address: string;
  // Parent specific
  children?: string[];
  paymentMethod?: string;
  // Student specific
  age?: number;
  grade?: string;
  studentSubjects?: string[];
  learningPreferences?: string[];
  // Teacher specific
  teacherSubjects?: string[];
  experience?: number;
  hourlyRate?: number;
  qualifications?: string[];
  languages?: string[];
  availability?: string;
  description?: string;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsButton: {
      padding: spacing.xs,
      marginRight: spacing.xs,
    },
    editButton: {
      padding: spacing.xs,
    },
    content: {
      flex: 1,
    },
    photoSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      position: 'relative',
    },
    profilePhoto: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    changePhotoButton: {
      position: 'absolute',
      bottom: 0,
      right: '50%',
      marginRight: -20,
      backgroundColor: colors.background.primary,
      borderRadius: 20,
      padding: spacing.xs,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    userTypeContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    userTypeBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 20,
    },
    userTypeText: {
      color: colors.background.primary,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      textTransform: 'uppercase',
    },
    section: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    fieldContainer: {
      marginBottom: spacing.md,
    },
    fieldLabel: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    fieldValue: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
      paddingVertical: spacing.xs,
    },
    textInput: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.medium,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background.secondary,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      gap: spacing.md,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      paddingVertical: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.medium,
      color: colors.background.primary,
    },
  }); 

  const { language, t } = useLanguage();
  const { userType, userData: contextUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  
  // Get user data based on user type — real name/email from auth context
  const getUserData = (): UserData => {
    const realName = contextUser?.name || '';
    const realEmail = contextUser?.email || '';
    const realId = contextUser?.id || '1';
    switch (userType) {
      case 'parent':
        return {
          id: realId,
          type: 'parent',
          name: realName,
          email: realEmail,
          phone: '',
          address: '',
          children: [],
          paymentMethod: '',
        };
      case 'student':
        return {
          id: realId,
          type: 'student',
          name: realName,
          email: realEmail,
          phone: '',
          address: '',
          age: undefined,
          grade: '',
          studentSubjects: [],
          learningPreferences: [],
        };
      case 'teacher':
        return {
          id: realId,
          type: 'teacher',
          name: realName,
          email: realEmail,
          phone: '',
          address: '',
          teacherSubjects: [],
          experience: 0,
          hourlyRate: 0,
          qualifications: [],
          languages: [],
          availability: '',
        };
      default:
        return {
          id: realId,
          type: 'parent',
          name: realName,
          email: realEmail,
          phone: '',
          address: '',
          children: [],
          paymentMethod: '',
        };
    }
  };

  const [userData, setUserData] = useState<UserData>(getUserData());

  const [editedData, setEditedData] = useState<UserData>(userData);

  useEffect(() => {
    // Load user data from auth context or storage
    // For now using dummy data
  }, []);

  const handleSave = () => {
    setUserData(editedData);
    setIsEditing(false);
    Alert.alert(
      t('profile.saveSuccess'),
      t('profile.profileUpdated'),
      [{ text: t('common.ok') }]
    );
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const renderParentProfile = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.fullName')}</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={editedData.name}
            onChangeText={(text) => setEditedData({...editedData, name: text})}
            placeholder={t('profile.fullNamePlaceholder')}
          />
        ) : (
          <Text style={styles.fieldValue}>{userData.name}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.email')}</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={editedData.email}
            onChangeText={(text) => setEditedData({...editedData, email: text.toLowerCase()})}
            placeholder={t('profile.emailPlaceholder')}
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.fieldValue}>{userData.email}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.phone')}</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={editedData.phone}
            onChangeText={(text) => setEditedData({...editedData, phone: text})}
            placeholder={t('profile.phonePlaceholder')}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.fieldValue}>{userData.phone}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.address')}</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={editedData.address}
            onChangeText={(text) => setEditedData({...editedData, address: text})}
            placeholder={t('profile.addressPlaceholder')}
            multiline
          />
        ) : (
          <Text style={styles.fieldValue}>{userData.address}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.children')}</Text>
        <Text style={styles.fieldValue}>
          {userData.children?.join(', ')}
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.paymentMethod')}</Text>
        <Text style={styles.fieldValue}>{userData.paymentMethod}</Text>
      </View>
    </View>
  );

  const renderStudentProfile = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('profile.academicInfo')}</Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.fullName')}</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={editedData.name}
            onChangeText={(text) => setEditedData({...editedData, name: text})}
            placeholder={t('profile.fullNamePlaceholder')}
          />
        ) : (
          <Text style={styles.fieldValue}>{userData.name}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.age')}</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={editedData.age?.toString() || ''}
            onChangeText={(text) => setEditedData({...editedData, age: parseInt(text) || 0})}
            placeholder={t('profile.agePlaceholder')}
            keyboardType="numeric"
          />
        ) : (
          <Text style={styles.fieldValue}>{userData.age} {t('profile.years')}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.grade')}</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={editedData.grade || ''}
            onChangeText={(text) => setEditedData({...editedData, grade: text})}
            placeholder={t('profile.gradePlaceholder')}
          />
        ) : (
          <Text style={styles.fieldValue}>{userData.grade}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.subjects')}</Text>
        <Text style={styles.fieldValue}>
          {userData.studentSubjects?.join(', ')}
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.learningPreferences')}</Text>
        <Text style={styles.fieldValue}>
          {userData.learningPreferences?.join(', ')}
        </Text>
      </View>
    </View>
  );

  const renderTeacherProfile = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('profile.professionalInfo')}</Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.fullName')}</Text>
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            value={editedData.name}
            onChangeText={(text) => setEditedData({...editedData, name: text})}
            placeholder={t('profile.fullNamePlaceholder')}
          />
        ) : (
          <Text style={styles.fieldValue}>{userData.name}</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.subjects')}</Text>
        <Text style={styles.fieldValue}>
          {userData.teacherSubjects?.join(', ')}
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.experience')}</Text>
        <Text style={styles.fieldValue}>
          {userData.experience} {t('profile.years')}
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.hourlyRate')}</Text>
        <Text style={styles.fieldValue}>
          ${userData.hourlyRate?.toLocaleString()}/hour
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.qualifications')}</Text>
        <Text style={styles.fieldValue}>
          {userData.qualifications?.join(', ')}
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.languages')}</Text>
        <Text style={styles.fieldValue}>
          {userData.languages?.join(', ')}
        </Text>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t('profile.availability')}</Text>
        <Text style={styles.fieldValue}>{userData.availability}</Text>
      </View>
    </View>
  );

  const renderProfileContent = () => {
    switch (userData.type) {
      case 'parent':
        return renderParentProfile();
      case 'student':
        return renderStudentProfile();
      case 'teacher':
        return renderTeacherProfile();
      default:
        return renderParentProfile();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('SettingsStack' as never)}
          >
            <MaterialIcons name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <MaterialIcons 
              name={isEditing ? "close" : "edit"} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <Image
            source={
              userData.avatar 
                ? { uri: userData.avatar }
                : require('../../assets/images/default-teacher.png.png')
            }
            style={styles.profilePhoto}
          />
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <MaterialIcons name="camera-alt" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* User Type Badge */}
        <View style={styles.userTypeContainer}>
          <View style={styles.userTypeBadge}>
            <Text style={styles.userTypeText}>
              {t(`profile.${userData.type}`)}
            </Text>
          </View>
        </View>

        {/* Profile Content */}
        {renderProfileContent()}

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
