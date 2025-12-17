import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DashboardHeader } from '../../components/school/DashboardHeader';
import {
  fetchClassesForSchool,
  createHomeworkAssignment,
} from '../../services/school/homework';
import type { ClassOption } from '../../types/school/homework';

const CreateHomeworkAssignmentScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // Form state
  const [classId, setClassId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [totalTasks, setTotalTasks] = useState('1');

  useEffect(() => {
    if (currentSchool) {
      loadClasses();
    }
  }, [currentSchool]);

  const loadClasses = async () => {
    if (!currentSchool) return;

    try {
      const classesData = await fetchClassesForSchool(
        currentSchool.id || currentSchool.name
      );
      setClasses(classesData);
      if (classesData.length > 0 && !classId) {
        setClassId(classesData[0].id);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert(
        t('school.homework.createModal.required', { defaultValue: 'Required' }),
        t('school.homework.createModal.fillAllFields', { defaultValue: 'Please fill in all required fields' })
      );
      return;
    }
    if (!classId) {
      Alert.alert(
        t('school.homework.createModal.required', { defaultValue: 'Required' }),
        t('school.homework.createModal.selectAtLeastOneClass', { defaultValue: 'Please select at least one class' })
      );
      return;
    }
    if (!subject.trim()) {
      Alert.alert(
        t('school.homework.createModal.required', { defaultValue: 'Required' }),
        t('school.homework.createModal.fillAllFields', { defaultValue: 'Please fill in all required fields' })
      );
      return;
    }

    // Validate due date >= today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) {
      Alert.alert(
        t('school.homework.createModal.error', { defaultValue: 'Error' }),
        'Due date must be today or later'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await createHomeworkAssignment(
        currentSchool!.id || currentSchool!.name,
        classId,
        subject.trim(),
        title.trim(),
        description.trim() || null,
        dueDate.toISOString().split('T')[0],
        parseInt(totalTasks) || 1
      );

      if (result.success) {
        Alert.alert(
          t('school.common.success', { defaultValue: 'Success' }),
          t('school.homework.createModal.success', { defaultValue: 'Assignment created successfully!' }),
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          t('school.homework.createModal.error', { defaultValue: 'Error' }),
          result.error || t('school.homework.createModal.error', { defaultValue: 'Failed to create assignment' })
        );
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      Alert.alert(
        t('school.homework.createModal.error', { defaultValue: 'Error' }),
        error.message || t('school.homework.createModal.error', { defaultValue: 'Failed to create assignment' })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications' as never);
  };

  const handleMenuPress = () => {
    navigation.goBack();
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const selectedClass = classes.find((c) => c.id === classId);

  if (!currentSchool) {

    // Styles with dynamic theme

    const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    marginBottom: spacing.lg,
  },
  formField: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.sm,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
  },
  dropdownText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    flex: 1,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
  },
  dateText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    marginLeft: spacing.sm,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    fontFamily: typography.fontFamily.semiBold,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: 'center',
    margin: spacing.xl,
  },
  calendarModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    width: '90%',
    maxWidth: 400,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calendarModalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
  dropdownModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownModalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  dropdownItemText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
    fontFamily: typography.fontFamily.semiBold,
  },
});

    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {t('school.common.noSchool', { defaultValue: 'No school selected' })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DashboardHeader
        schoolName={currentSchool.name || 'School'}
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {t('school.homework.createModal.title', { defaultValue: 'Create Assignment' })}
          </Text>

          {/* Class */}
          <View style={styles.formField}>
            <Text style={styles.label}>
              {t('school.homework.filters.class', { defaultValue: 'Class' })}{' '}
              <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setClassDropdownVisible(true)}
            >
              <Text style={styles.dropdownText}>
                {selectedClass
                  ? selectedClass.name
                  : t('school.homework.filters.allClasses', { defaultValue: 'Select Class' })}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Subject */}
          <View style={styles.formField}>
            <Text style={styles.label}>
              {t('school.homework.createModal.subjectLabel', { defaultValue: 'Subject' })}{' '}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t('school.homework.createModal.subjectPlaceholder', { defaultValue: 'e.g., Mathematics' })}
              placeholderTextColor={colors.text.light}
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          {/* Title */}
          <View style={styles.formField}>
            <Text style={styles.label}>
              {t('school.homework.createModal.titleLabel', { defaultValue: 'Title' })}{' '}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t('school.homework.createModal.titlePlaceholder', { defaultValue: 'e.g., Algebra Problem Set' })}
              placeholderTextColor={colors.text.light}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.formField}>
            <Text style={styles.label}>
              {t('school.homework.createModal.descriptionLabel', { defaultValue: 'Description' })}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('school.homework.createModal.descriptionPlaceholder', { defaultValue: 'Instructions for students...' })}
              placeholderTextColor={colors.text.light}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Due Date */}
          <View style={styles.formField}>
            <Text style={styles.label}>
              {t('school.homework.createModal.dueDateLabel', { defaultValue: 'Due Date' })}{' '}
              <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setCalendarVisible(true)}
            >
              <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
              <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* Total Tasks */}
          <View style={styles.formField}>
            <Text style={styles.label}>
              {t('school.homework.createModal.totalTasks', { defaultValue: 'Total Tasks' })}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              placeholderTextColor={colors.text.light}
              value={totalTasks}
              onChangeText={(text) => {
                // Only allow numbers
                if (text === '' || /^\d+$/.test(text)) {
                  setTotalTasks(text);
                }
              }}
              keyboardType="numeric"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="check" size={20} color={colors.white} />
                <Text style={styles.submitButtonText}>
                  {t('school.homework.createModal.create', { defaultValue: 'Create Assignment' })}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Class Dropdown Modal */}
      <Modal
        visible={classDropdownVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setClassDropdownVisible(false)}
      >
        <View style={styles.dropdownModal}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>
                {t('school.attendance.selectClass', { defaultValue: 'Select Class' })}
              </Text>
              <TouchableOpacity onPress={() => setClassDropdownVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {classes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    classId === item.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setClassId(item.id);
                    setClassDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      classId === item.id && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {classId === item.id && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.calendarModal}>
          <View style={styles.calendarModalContent}>
            <View style={styles.calendarModalHeader}>
              <Text style={styles.calendarModalTitle}>
                {t('school.homework.createModal.dueDateLabel', { defaultValue: 'Select Due Date' })}
              </Text>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <Calendar
              current={dueDate.toISOString().split('T')[0]}
              minDate={new Date().toISOString().split('T')[0]}
              onDayPress={(day) => {
                setDueDate(new Date(day.dateString));
                setCalendarVisible(false);
              }}
              markedDates={{
                [dueDate.toISOString().split('T')[0]]: {
                  selected: true,
                  selectedColor: colors.primary,
                },
              }}
              theme={{
                todayTextColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.white,
                textDayFontFamily: typography.fontFamily.regular,
                textMonthFontFamily: typography.fontFamily.semiBold,
                textDayHeaderFontFamily: typography.fontFamily.medium,
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CreateHomeworkAssignmentScreen;

