/**
 * Create Homework Assignment Screen
 * Form for creating new homework assignments with validation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import {
  createHomeworkAssignment,
  fetchClassesForSchool,
  fetchSubjectsForSchool,
} from '../../services/school/homework';
import type { ClassOption, SubjectOption } from '../../services/school/homework';

const CreateHomeworkAssignmentScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalTasks, setTotalTasks] = useState('1');
  const [targetScope, setTargetScope] = useState<'school' | 'classes'>('school');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [subjectDropdownVisible, setSubjectDropdownVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.primary,
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.xs,
    },
    headerBackText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.primary,
      marginLeft: spacing.xs,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      padding: spacing.md,
    },
    formGroup: {
      marginBottom: spacing.md,
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
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      minHeight: 44,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
      paddingTop: spacing.sm,
    },
    dropdown: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdownText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    dropdownModal: {
      position: 'absolute',
      top: 100,
      left: spacing.md,
      right: spacing.md,
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      maxHeight: 200,
      zIndex: 1000,
      elevation: 5,
      ...shadows.md,
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
    scopeButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    scopeButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
    },
    scopeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    scopeButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.primary,
    },
    scopeButtonTextActive: {
      color: colors.white,
    },
    classChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    classChipText: {
      color: colors.white,
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      marginRight: spacing.xs,
    },
    selectedClassesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spacing.sm,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xl,
      paddingBottom: spacing.xl,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      alignItems: 'center',
      backgroundColor: colors.background.primary,
    },
    cancelButtonText: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
    },
    submitButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    submitButtonText: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.white,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const loadData = useCallback(async () => {
    if (!currentSchool?.id) return;

    try {
      setLoadingData(true);
      const [classesData, subjectsData] = await Promise.all([
        fetchClassesForSchool(currentSchool.id),
        fetchSubjectsForSchool(currentSchool.id),
      ]);

      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('common.error'), 'Failed to load classes and subjects');
    } finally {
      setLoadingData(false);
    }
  }, [currentSchool?.id, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (!currentSchool?.id) {
      Alert.alert(t('common.error'), 'No school selected');
      return;
    }

    // Validation
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('school.homework.createModal.fillAllFields'));
      return;
    }

    if (!subject) {
      Alert.alert(t('common.error'), t('school.homework.createModal.fillAllFields'));
      return;
    }

    if (!dueDate) {
      Alert.alert(t('common.error'), t('school.homework.createModal.fillAllFields'));
      return;
    }

    // Validate due date >= today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      Alert.alert(t('common.error'), 'Due date must be today or later');
      return;
    }

    if (targetScope === 'classes' && selectedClassIds.length === 0) {
      Alert.alert(t('common.error'), t('school.homework.createModal.selectAtLeastOneClass'));
      return;
    }

    setLoading(true);
    try {
      await createHomeworkAssignment({
        schoolId: currentSchool.id,
        classId: targetScope === 'classes' && selectedClassIds.length === 1 ? selectedClassIds[0] : undefined,
        subject,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        totalTasks: parseInt(totalTasks, 10) || 1,
        targetClassIds: targetScope === 'classes' ? selectedClassIds : undefined,
      });

      Alert.alert(
        t('common.success'),
        t('school.homework.createModal.success'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('school.homework.createModal.error')
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const removeClass = (classId: string) => {
    setSelectedClassIds((prev) => prev.filter((id) => id !== classId));
  };

  if (loadingData) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.headerBackText}>{t('school.homework.title')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('school.homework.createModal.title')}</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('school.homework.createModal.titleLabel')} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('school.homework.createModal.titlePlaceholder')}
            placeholderTextColor={colors.text.secondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Subject */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('school.homework.createModal.subjectLabel')} <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setSubjectDropdownVisible(!subjectDropdownVisible)}
          >
            <Text style={styles.dropdownText}>
              {subject || t('school.homework.createModal.subjectPlaceholder')}
            </Text>
            <MaterialIcons name={subjectDropdownVisible ? 'expand-less' : 'expand-more'} size={24} color={colors.text.primary} />
          </TouchableOpacity>
          {subjectDropdownVisible && (
            <View style={styles.dropdownModal}>
              {subjects.map((subj) => (
                <TouchableOpacity
                  key={subj.name}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSubject(subj.name);
                    setSubjectDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{subj.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('school.homework.createModal.descriptionLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('school.homework.createModal.descriptionPlaceholder')}
            placeholderTextColor={colors.text.secondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Due Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('school.homework.createModal.dueDateLabel')} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.text.secondary}
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>

        {/* Total Tasks */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('school.homework.createModal.totalTasksLabel')} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={colors.text.secondary}
            value={totalTasks}
            onChangeText={setTotalTasks}
            keyboardType="numeric"
          />
        </View>

        {/* Target Scope */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('school.homework.createModal.targetScopeLabel')} <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.scopeButtons}>
            <TouchableOpacity
              style={[styles.scopeButton, targetScope === 'school' && styles.scopeButtonActive]}
              onPress={() => {
                setTargetScope('school');
                setSelectedClassIds([]);
              }}
            >
              <Text
                style={[
                  styles.scopeButtonText,
                  targetScope === 'school' && styles.scopeButtonTextActive,
                ]}
              >
                {t('school.homework.createModal.schoolWide')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scopeButton, targetScope === 'classes' && styles.scopeButtonActive]}
              onPress={() => setTargetScope('classes')}
            >
              <Text
                style={[
                  styles.scopeButtonText,
                  targetScope === 'classes' && styles.scopeButtonTextActive,
                ]}
              >
                {t('school.homework.createModal.specificClasses')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class Selection (if specific classes) */}
        {targetScope === 'classes' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('school.homework.createModal.selectClassesLabel')} <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setClassDropdownVisible(!classDropdownVisible)}
            >
              <Text style={styles.dropdownText}>
                {selectedClassIds.length > 0
                  ? `${selectedClassIds.length} ${t('common.selected')}`
                  : t('school.homework.createModal.selectClassesLabel')}
              </Text>
              <MaterialIcons name={classDropdownVisible ? 'expand-less' : 'expand-more'} size={24} color={colors.text.primary} />
            </TouchableOpacity>
            {classDropdownVisible && (
              <View style={styles.dropdownModal}>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      toggleClassSelection(cls.id);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.dropdownItemText}>{cls.name}</Text>
                      {selectedClassIds.includes(cls.id) && (
                        <MaterialIcons name="check" size={20} color={colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {selectedClassIds.length > 0 && (
              <View style={styles.selectedClassesContainer}>
                {selectedClassIds.map((classId) => {
                  const cls = classes.find((c) => c.id === classId);
                  return (
                    <TouchableOpacity
                      key={classId}
                      style={styles.classChip}
                      onPress={() => removeClass(classId)}
                    >
                      <Text style={styles.classChipText}>{cls?.name}</Text>
                      <MaterialIcons name="close" size={16} color={colors.white} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>{t('school.homework.createModal.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {t('school.homework.createModal.create')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateHomeworkAssignmentScreen;
