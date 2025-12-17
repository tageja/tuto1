import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DashboardHeader } from '../../components/school/DashboardHeader';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  createMedicineReminder,
  fetchParentChildren,
  type CreateReminderData,
  type ParentChild,
} from '../../services/supabase-medicine';
import { fetchClassesForSchool } from '../../services/school/attendance';
import type { ClassOption } from '../../types/school/attendance';
import { supabase } from '../../config/supabase';
import { resolveSchoolId } from '../../services/school-id';

const AddMedicineReminderScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const routeParams = route.params as { studentId?: string } | undefined;
  const preSelectedStudentId = routeParams?.studentId;

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<Array<{
    id: string;
    first_name: string;
    last_name: string;
    class_id: string | null;
  }>>([]);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>>([]);

  // Form state
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState(preSelectedStudentId || '');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'twice_daily' | 'as_needed'>('daily');
  const [timeOfDay, setTimeOfDay] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [studentDropdownVisible, setStudentDropdownVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Check if user is parent (has pre-selected student)
  const isParent = !!preSelectedStudentId;

  useEffect(() => {
    if (currentSchool) {
      if (isParent) {
        loadChildren();
      } else {
        loadClasses();
        loadStudents();
      }
    }
  }, [currentSchool, isParent]);

  useEffect(() => {
    if (preSelectedStudentId) {
      setStudentId(preSelectedStudentId);
    }
  }, [preSelectedStudentId]);

  useEffect(() => {
    if (classId) {
      const filtered = students.filter(s => s.class_id === classId);
      setFilteredStudents(filtered);
      setStudentId(''); // Reset student selection when class changes
    } else {
      setFilteredStudents([]);
    }
  }, [classId, students]);

  const loadClasses = async () => {
    if (!currentSchool) return;
    try {
      const classesData = await fetchClassesForSchool(
        currentSchool.id || currentSchool.name
      );
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    if (!currentSchool) return;
    try {
      // Resolve school ID to UUID format
      const schoolId = await resolveSchoolId(currentSchool.id || currentSchool.name);
      if (!schoolId) {
        console.error('School ID could not be resolved');
        return;
      }

      const { data, error } = await supabase
        .from('school_students')
        .select('id, first_name, last_name, class_id')
        .eq('school_id', schoolId)
        .in('status', ['active', 'Active']);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadChildren = async () => {
    if (!currentSchool) return;
    try {
      const childrenData = await fetchParentChildren(currentSchool.id || currentSchool.name);
      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const handleAddTime = () => {
    setTimeOfDay([...timeOfDay, '13:30']);
  };

  const handleRemoveTime = (index: number) => {
    setTimeOfDay(timeOfDay.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    const updated = [...timeOfDay];
    updated[index] = value;
    setTimeOfDay(updated);
  };

  const handleSubmit = async () => {
    if (!currentSchool) return;

    // Validation
    if (!studentId || !medicineName || !frequency || !startDate) {
      Alert.alert(
        t('common.error') || 'Error',
        t('school.medicine.form.requiredFields') || 'Please fill in all required fields'
      );
      return;
    }

    setLoading(true);
    try {
      // Get current user for created_by
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let createdBy = null;
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', authUser.id)
          .single();
        createdBy = userData?.id || null;
      }

      const reminderData: CreateReminderData = {
        school_id: currentSchool.id || currentSchool.name,
        student_id: studentId,
        medicine_name: medicineName,
        dosage: dosage || null,
        frequency,
        time_of_day: timeOfDay.length > 0 ? timeOfDay : null,
        start_date: startDate,
        end_date: endDate || null,
        notes: notes || null,
        created_by: createdBy,
      };

      await createMedicineReminder(reminderData);

      Alert.alert(
        t('common.success') || 'Success',
        t('school.medicine.form.reminderCreated') || 'Reminder created successfully',
        [
          {
            text: t('common.ok') || 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error.message || t('school.medicine.form.createError') || 'Failed to create reminder'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedChild = children.find(c => c.id === studentId);


  // Styles with dynamic theme


  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 100,
  },
  form: {
    padding: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  dropdownDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  dropdownText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    flex: 1,
  },
  dropdownTextDisabled: {
    color: colors.disabled,
  },
  dropdownModal: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    maxHeight: 200,
    zIndex: 1000,
    ...shadows.medium,
  },
  dropdownItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownItemText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  selectedStudent: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  selectedStudentText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequencyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.white,
  },
  frequencyButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  frequencyButtonTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  timeInput: {
    flex: 1,
  },
  removeTimeButton: {
    padding: spacing.sm,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  addTimeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 48,
  },
  datePickerText: {
    fontSize: typography.fontSize.md,
    color: colors.onSurface,
    flex: 1,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
});


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <DashboardHeader
        schoolName={currentSchool?.name || 'Add Reminder'}
        onNotificationPress={() => navigation.navigate('Notifications' as never)}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.form}>
          {/* Class & Student (admin only) */}
          {!isParent && (
            <>
              {/* Class Selector */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t('school.medicine.form.class') || 'Class'} <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setClassDropdownVisible(!classDropdownVisible)}
                >
                  <Text style={styles.dropdownText}>
                    {classId
                      ? classes.find((c) => c.id === classId)?.name || 'Select class'
                      : 'Select class'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
                </TouchableOpacity>

                {classDropdownVisible && (
                  <View style={styles.dropdownModal}>
                    <ScrollView nestedScrollEnabled>
                      {classes.map((cls) => (
                        <TouchableOpacity
                          key={cls.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setClassId(cls.id);
                            setClassDropdownVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{cls.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Student Selector */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t('school.medicine.form.student') || 'Student'} <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dropdown, !classId && styles.dropdownDisabled]}
                  onPress={() => classId && setStudentDropdownVisible(!studentDropdownVisible)}
                  disabled={!classId}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !classId && styles.dropdownTextDisabled,
                    ]}
                  >
                    {!classId
                      ? t('school.medicine.form.selectClassFirst') || 'Select a class first'
                      : studentId
                      ? filteredStudents.find((s) => s.id === studentId)
                        ? `${filteredStudents.find((s) => s.id === studentId)?.first_name} ${filteredStudents.find((s) => s.id === studentId)?.last_name}`
                        : 'Select student'
                      : 'Select student'}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={20}
                    color={classId ? colors.text.secondary : colors.disabled}
                  />
                </TouchableOpacity>

                {studentDropdownVisible && classId && (
                  <View style={styles.dropdownModal}>
                    <ScrollView nestedScrollEnabled>
                      {filteredStudents.map((student) => (
                        <TouchableOpacity
                          key={student.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setStudentId(student.id);
                            setStudentDropdownVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>
                            {student.first_name} {student.last_name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Pre-selected student (parent) */}
          {isParent && selectedChild && (
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.medicine.form.student') || 'Student'}
              </Text>
              <View style={styles.selectedStudent}>
                <Text style={styles.selectedStudentText}>
                  {selectedChild.firstName} {selectedChild.lastName} - {selectedChild.className}
                </Text>
              </View>
            </View>
          )}

          {/* Medicine Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('school.medicine.form.medicineName') || 'Medicine Name'} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={medicineName}
              onChangeText={setMedicineName}
              placeholder={t('school.medicine.form.medicineNamePlaceholder') || 'e.g., Cough syrup'}
              placeholderTextColor={colors.disabled}
            />
          </View>

          {/* Dosage */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('school.medicine.form.dosage') || 'Dosage'}
            </Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder={t('school.medicine.form.dosagePlaceholder') || 'e.g., 5 ml'}
              placeholderTextColor={colors.disabled}
            />
          </View>

          {/* Frequency */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('school.medicine.form.frequency') || 'Frequency'} <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.frequencyContainer}>
              {(['once', 'daily', 'twice_daily', 'as_needed'] as const).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    frequency === freq && styles.frequencyButtonSelected,
                  ]}
                  onPress={() => setFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      frequency === freq && styles.frequencyButtonTextSelected,
                    ]}
                  >
                    {freq === 'once' && (t('school.medicine.frequency.once') || 'Once')}
                    {freq === 'daily' && (t('school.medicine.frequency.daily') || 'Daily')}
                    {freq === 'twice_daily' && (t('school.medicine.frequency.twiceDaily') || 'Twice Daily')}
                    {freq === 'as_needed' && (t('school.medicine.frequency.asNeeded') || 'As Needed')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time of Day (optional for PRN) */}
          {frequency !== 'as_needed' && (
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.medicine.form.timeOfDay') || 'Time of Day'}
              </Text>
              {timeOfDay.map((time, index) => (
                <View key={index} style={styles.timeRow}>
                  <TextInput
                    style={[styles.input, styles.timeInput]}
                    value={time}
                    onChangeText={(value) => handleTimeChange(index, value)}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.disabled}
                  />
                  <TouchableOpacity
                    style={styles.removeTimeButton}
                    onPress={() => handleRemoveTime(index)}
                  >
                    <MaterialIcons name="close" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addTimeButton} onPress={handleAddTime}>
                <MaterialIcons name="add" size={20} color={colors.primary} />
                <Text style={styles.addTimeButtonText}>
                  {t('school.medicine.form.addTime') || '+ Add Time'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Date Range */}
          <View style={styles.fieldRow}>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.label}>
                {t('school.medicine.form.startDate') || 'Start Date'} <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                <Text style={styles.datePickerText}>
                  {startDate ? new Date(startDate).toLocaleDateString() : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate ? new Date(startDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setStartDate(selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
            </View>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.label}>
                {t('school.medicine.form.endDate') || 'End Date'}
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                <Text style={styles.datePickerText}>
                  {endDate ? new Date(endDate).toLocaleDateString() : 'Select Date (Optional)'}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate ? new Date(endDate) : (startDate ? new Date(startDate) : new Date())}
                  mode="date"
                  display="default"
                  minimumDate={startDate ? new Date(startDate) : undefined}
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setEndDate(selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('school.medicine.form.notes') || 'Notes'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('school.medicine.form.notesPlaceholder') || 'Additional notes...'}
              placeholderTextColor={colors.disabled}
              multiline
              numberOfLines={4}
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
              <Text style={styles.submitButtonText}>
                {t('school.medicine.form.save') || 'Save'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddMedicineReminderScreen;

