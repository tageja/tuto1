import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  createHealthRecord,
  fetchHealthStudents,
  type CreateHealthRecordData,
} from '../../services/supabase-health';
import { fetchClassesForSchool } from '../../services/school/attendance';
import type { ClassOption } from '../../types/school/attendance';
import type { StudentHealthSummary } from '../../types/school';

interface VaccineEntry {
  name: string;
  status: 'done' | 'pending' | 'due' | 'scheduled';
  date: string;
}

const MAX_VACCINE_ENTRIES = 10;

const AddHealthRecordScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const preSelectedStudentId = route.params?.studentId;

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'allergies' | 'medications' | 'vaccination' | 'vitals'>('general');

  // Student selection
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preSelectedStudentId || '');
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [availableStudents, setAvailableStudents] = useState<StudentHealthSummary[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [studentDropdownVisible, setStudentDropdownVisible] = useState(false);

  // General fields
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  // Allergy fields
  const [allergyName, setAllergyName] = useState('');
  const [allergySeverity, setAllergySeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [allergyNotes, setAllergyNotes] = useState('');

  // Medication fields
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medSchedule, setMedSchedule] = useState('');

  // Vaccination fields
  const [vaccineEntries, setVaccineEntries] = useState<VaccineEntry[]>([
    { name: '', status: 'done', date: '' },
  ]);

  // Vitals fields
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().split('T')[0]);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'recordedAt' | 'vaccine'>('recordedAt');
  const [datePickerIndex, setDatePickerIndex] = useState(0);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [statusPickerIndex, setStatusPickerIndex] = useState(0);

  // Load classes
  useEffect(() => {
    if (currentSchool && !preSelectedStudentId) {
      loadClasses();
    }
  }, [currentSchool, preSelectedStudentId]);

  // Load students when class changes
  useEffect(() => {
    if (selectedClassId && currentSchool) {
      loadStudents();
    } else {
      setAvailableStudents([]);
    }
  }, [selectedClassId, currentSchool]);

  // Update selected student when pre-selected changes
  useEffect(() => {
    if (preSelectedStudentId) {
      setSelectedStudentId(preSelectedStudentId);
    }
  }, [preSelectedStudentId]);

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
    if (!currentSchool || !selectedClassId) return;
    setLoadingStudents(true);
    try {
      const studentsData = await fetchHealthStudents(
        currentSchool.id || currentSchool.name,
        { classId: selectedClassId }
      );
      setAvailableStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const addVaccineEntry = () => {
    if (vaccineEntries.length < MAX_VACCINE_ENTRIES) {
      setVaccineEntries([...vaccineEntries, { name: '', status: 'done', date: '' }]);
    }
  };

  const removeVaccineEntry = (index: number) => {
    if (vaccineEntries.length > 1) {
      setVaccineEntries(vaccineEntries.filter((_, i) => i !== index));
    }
  };

  const updateVaccineEntry = (index: number, field: keyof VaccineEntry, value: string) => {
    const updated = [...vaccineEntries];
    updated[index] = { ...updated[index], [field]: value };
    setVaccineEntries(updated);
  };

  const openDatePicker = (type: 'recordedAt' | 'vaccine', index?: number) => {
    setDatePickerType(type);
    if (index !== undefined) setDatePickerIndex(index);
    setDatePickerVisible(true);
  };

  const handleDateSelect = (day: any) => {
    const dateStr = day.dateString;
    if (datePickerType === 'recordedAt') {
      setRecordedAt(dateStr);
    } else {
      updateVaccineEntry(datePickerIndex, 'date', dateStr);
    }
    setDatePickerVisible(false);
  };

  const handleSubmit = async () => {
    const studentIdToUse = preSelectedStudentId || selectedStudentId;
    if (!studentIdToUse) {
      Alert.alert(
        t('common.error') || 'Error',
        t('school.health.errors.selectStudent') || 'Please select a student'
      );
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'vaccination') {
        // Handle multiple vaccine entries
        const validEntries = vaccineEntries.filter((entry) => entry.name.trim());
        if (validEntries.length === 0) {
          throw new Error('At least one vaccine name is required');
        }

        const promises = validEntries.map((entry) => {
          const data: CreateHealthRecordData = {
            studentId: studentIdToUse,
            recordType: 'vaccination',
            title: entry.name,
            details: {
              vaccine: entry.name,
              status: entry.status,
              date: entry.date || new Date().toISOString().split('T')[0],
            },
            recordedAt: entry.date ? new Date(entry.date).toISOString() : undefined,
          };
          return createHealthRecord(data);
        });

        await Promise.all(promises);
      } else {
        // Handle single record types
        let recordType: 'general' | 'vaccination' | 'vitals' | 'note' = 'general';
        let details: any = {};

        switch (activeTab) {
          case 'general':
            recordType = 'note';
            details = { notes };
            break;
          case 'allergies':
            if (!allergyName.trim()) {
              throw new Error('Allergy name is required');
            }
            recordType = 'general';
            details = {
              type: 'allergy',
              name: allergyName,
              severity: allergySeverity,
              notes: allergyNotes,
            };
            break;
          case 'medications':
            if (!medName.trim()) {
              throw new Error('Medication name is required');
            }
            recordType = 'general';
            details = {
              type: 'medication',
              name: medName,
              dose: medDose,
              schedule: medSchedule,
            };
            break;
          case 'vitals':
            recordType = 'vitals';
            details = {
              height_cm: height ? parseFloat(height) : null,
              weight_kg: weight ? parseFloat(weight) : null,
            };
            break;
        }

        const data: CreateHealthRecordData = {
          studentId: studentIdToUse,
          recordType,
          title: title || null,
          details,
          recordedAt: recordedAt ? new Date(recordedAt).toISOString() : undefined,
        };

        await createHealthRecord(data);
      }

      Alert.alert(
        t('common.success') || 'Success',
        t('school.health.toasts.recordAdded') || 'Health record created successfully',
        [
          {
            text: t('common.ok') || 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating health record:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error.message || t('school.health.errors.createFailed') || 'Failed to create record'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get selected student info
  const selectedStudent = preSelectedStudentId
    ? availableStudents.find((s) => s.id === preSelectedStudentId)
    : availableStudents.find((s) => s.id === selectedStudentId);

  const tabs = [
    { key: 'general', label: t('school.health.addRecord.tabs.general') || 'General' },
    { key: 'allergies', label: t('school.health.addRecord.tabs.allergies') || 'Allergies/Conditions' },
    { key: 'medications', label: t('school.health.addRecord.tabs.medications') || 'Medications' },
    { key: 'vaccination', label: t('school.health.addRecord.tabs.vaccination') || 'Vaccination' },
    { key: 'vitals', label: t('school.health.addRecord.tabs.vitals') || 'Vitals' },
  ];


  // Styles with dynamic theme


  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  studentChip: {
    backgroundColor: '#E8F2FF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    margin: spacing.md,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  studentChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  studentSelection: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  dropdownTextDisabled: {
    color: colors.disabled,
  },
  dropdownModal: {
    position: 'absolute',
    top: 100,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownItemText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    maxHeight: 40,
  },
  tabsContent: {
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 50,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  tabContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.disabled,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  severityButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  severityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  severityButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '500',
  },
  severityButtonTextActive: {
    color: colors.white,
  },
  select: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  vaccineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  vaccineHeaderText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  addMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  vaccineEntry: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  vaccineEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  vaccineEntryTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  removeButton: {
    padding: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusOptions: {
    padding: spacing.md,
  },
  statusOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  statusOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
});


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('school.health.addRecord.title') || 'Add Health Record'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

      {/* Student Selection Chip */}
      {selectedStudent && (
        <View style={styles.studentChip}>
          <Text style={styles.studentChipText}>
            Student: {selectedStudent.fullName} - {selectedStudent.className}
          </Text>
        </View>
      )}

      {/* Student Selection (if not pre-selected) */}
      {!preSelectedStudentId && (
        <View style={styles.studentSelection}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setClassDropdownVisible(!classDropdownVisible)}
            >
              <Text style={styles.dropdownText}>
                {selectedClassId
                  ? classes.find((c) => c.id === selectedClassId)?.name || 'Select Class'
                  : 'Select Class'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdown, !selectedClassId && styles.dropdownDisabled]}
              onPress={() => selectedClassId && setStudentDropdownVisible(!studentDropdownVisible)}
              disabled={!selectedClassId}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedClassId && styles.dropdownTextDisabled,
                ]}
              >
                {selectedStudentId
                  ? availableStudents.find((s) => s.id === selectedStudentId)?.fullName ||
                    'Select Student'
                  : 'Select Student'}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={20}
                color={selectedClassId ? colors.text.secondary : colors.disabled}
              />
            </TouchableOpacity>
          </View>

          {/* Dropdown Modals */}
          {classDropdownVisible && (
            <View style={styles.dropdownModal}>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedClassId(cls.id);
                    setClassDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{cls.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {studentDropdownVisible && selectedClassId && (
            <View style={styles.dropdownModal}>
              {availableStudents.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedStudentId(student.id);
                    setStudentDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{student.fullName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'general' && (
          <View style={styles.tabContent}>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.title') || 'Title'}
              </Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={t('school.health.addRecord.fields.titlePlaceholder') || 'Enter title'}
                placeholderTextColor={colors.disabled}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.notes') || 'Notes'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('school.health.addRecord.fields.notesPlaceholder') || 'Enter notes'}
                placeholderTextColor={colors.disabled}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        )}

        {activeTab === 'allergies' && (
          <View style={styles.tabContent}>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.name') || 'Name'} *
              </Text>
              <TextInput
                style={styles.input}
                value={allergyName}
                onChangeText={setAllergyName}
                placeholder="e.g., Peanut"
                placeholderTextColor={colors.disabled}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.severity') || 'Severity'}
              </Text>
              <View style={styles.severityButtons}>
                {(['low', 'medium', 'high'] as const).map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.severityButton,
                      allergySeverity === severity && styles.severityButtonActive,
                    ]}
                    onPress={() => setAllergySeverity(severity)}
                  >
                    <Text
                      style={[
                        styles.severityButtonText,
                        allergySeverity === severity && styles.severityButtonTextActive,
                      ]}
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.notes') || 'Notes'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={allergyNotes}
                onChangeText={setAllergyNotes}
                placeholder={t('school.health.addRecord.fields.notesPlaceholder') || 'Enter additional notes'}
                placeholderTextColor={colors.disabled}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {activeTab === 'medications' && (
          <View style={styles.tabContent}>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.name') || 'Name'} *
              </Text>
              <TextInput
                style={styles.input}
                value={medName}
                onChangeText={setMedName}
                placeholder="e.g., Asthma inhaler"
                placeholderTextColor={colors.disabled}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.dose') || 'Dose'}
              </Text>
              <TextInput
                style={styles.input}
                value={medDose}
                onChangeText={setMedDose}
                placeholder="e.g., 2 puffs"
                placeholderTextColor={colors.disabled}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.schedule') || 'Schedule'}
              </Text>
              <TextInput
                style={styles.input}
                value={medSchedule}
                onChangeText={setMedSchedule}
                placeholder="e.g., PRN, Daily, Twice daily"
                placeholderTextColor={colors.disabled}
              />
            </View>
          </View>
        )}

        {activeTab === 'vaccination' && (
          <View style={styles.tabContent}>
            <View style={styles.vaccineHeader}>
              <Text style={styles.vaccineHeaderText}>
                {t('school.health.addRecord.vaccineCount', {
                  count: vaccineEntries.length,
                  max: MAX_VACCINE_ENTRIES,
                }) || `Vaccination - ${vaccineEntries.length} of ${MAX_VACCINE_ENTRIES} entries`}
              </Text>
              {vaccineEntries.length < MAX_VACCINE_ENTRIES && (
                <TouchableOpacity style={styles.addMoreButton} onPress={addVaccineEntry}>
                  <MaterialIcons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addMoreText}>
                    {t('school.health.addRecord.addMore') || '+ Add More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {vaccineEntries.map((entry, index) => (
              <View key={index} style={styles.vaccineEntry}>
                <View style={styles.vaccineEntryHeader}>
                  <Text style={styles.vaccineEntryTitle}>
                    {t('school.health.addRecord.vaccineEntry', { number: index + 1 }) ||
                      `Vaccine #${index + 1}`}
                  </Text>
                  {vaccineEntries.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeVaccineEntry(index)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="delete" size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>
                    {t('school.health.addRecord.fields.vaccine') || 'Vaccine'} *
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={entry.name}
                    onChangeText={(value) => updateVaccineEntry(index, 'name', value)}
                    placeholder="e.g., MMR, Hepatitis B, DTP"
                    placeholderTextColor={colors.disabled}
                  />
                </View>
                <View style={styles.fieldRow}>
                  <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
                    <Text style={styles.label}>
                      {t('school.health.addRecord.fields.status') || 'Status'}
                    </Text>
                    <TouchableOpacity
                      style={styles.select}
                      onPress={() => {
                        setStatusPickerIndex(index);
                        setStatusPickerVisible(true);
                      }}
                    >
                      <Text style={styles.selectText}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </Text>
                      <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>
                      {t('school.health.addRecord.fields.date') || 'Date'}
                    </Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => openDatePicker('vaccine', index)}
                    >
                      <Text style={entry.date ? styles.inputText : styles.inputPlaceholder}>
                        {entry.date || 'mm/dd/yyyy'}
                      </Text>
                      <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'vitals' && (
          <View style={styles.tabContent}>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.height') || 'Height (cm)'}
              </Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="Enter height"
                placeholderTextColor={colors.disabled}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.weight') || 'Weight (kg)'}
              </Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter weight"
                placeholderTextColor={colors.disabled}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('school.health.addRecord.fields.recordedAt') || 'Recorded At'}
              </Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => openDatePicker('recordedAt')}
              >
                <Text style={recordedAt ? styles.inputText : styles.inputPlaceholder}>
                  {recordedAt || 'mm/dd/yyyy'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>
              {t('school.health.buttons.cancel') || 'Cancel'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                {t('school.health.buttons.save') || 'Save'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={datePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [datePickerType === 'recordedAt' ? recordedAt : vaccineEntries[datePickerIndex]?.date || '']: {
                  selected: true,
                  selectedColor: colors.primary,
                },
              }}
              theme={{
                todayTextColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                arrowColor: colors.primary,
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Status Picker Modal */}
      <Modal
        visible={statusPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Status</Text>
              <TouchableOpacity onPress={() => setStatusPickerVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.statusOptions}>
              {(['done', 'pending', 'due', 'scheduled'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.statusOption}
                  onPress={() => {
                    updateVaccineEntry(statusPickerIndex, 'status', status);
                    setStatusPickerVisible(false);
                  }}
                >
                  <Text style={styles.statusOptionText}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddHealthRecordScreen;

