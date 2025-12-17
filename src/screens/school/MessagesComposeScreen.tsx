import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { createThread, MessagePriority, fetchSchoolStudents } from '../../services/school/messages';
import { getClasses, getClassGrades } from '../../services/supabase-classes';
import SchoolHeader from '../../components/common/SchoolHeader';
import { MultiSelectModal, SelectOption } from '../../components/messages/MultiSelectModal';
import { useTheme } from '../../contexts/ThemeContext';

const MessagesComposeScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool, isSchoolMode } = useSchool();
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<MessagePriority>('Normal');
  const [messageBody, setMessageBody] = useState('');
  
  // Multi-select states
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  
  // Options
  const [studentOptions, setStudentOptions] = useState<SelectOption[]>([]);
  const [classOptions, setClassOptions] = useState<SelectOption[]>([]);
  const [gradeOptions, setGradeOptions] = useState<SelectOption[]>([]);
  
  // Modal visibility
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isSchoolMode || !currentSchool) {
      navigation.goBack();
      return;
    }
    loadOptions();
  }, [isSchoolMode, currentSchool]);

  const loadOptions = async () => {
    if (!currentSchool?.id) return;

    try {
      // Fetch students (store full data for filtering)
      const students = await fetchSchoolStudents(currentSchool.id);
      const studentOpts = students.map((s) => ({
        id: s.id,
        label: s.name,
        subtitle: s.class_name && s.grade ? `${s.class_name} (Grade ${s.grade})` : s.class_name || s.grade || undefined,
        class_id: s.class_id, // Store class_id for filtering
      }));
      setStudentOptions(studentOpts as any);

      // Fetch classes
      const { classes } = await getClasses(currentSchool.id, { limit: 200 });
      setClassOptions(
        classes.map((c) => ({
          id: c.id,
          label: c.name,
          subtitle: c.grade_level ? `Grade ${c.grade_level}` : undefined,
        }))
      );

      // Fetch grades
      const grades = await getClassGrades(currentSchool.id);
      setGradeOptions(
        grades.map((g) => ({
          id: g,
          label: `Grade ${g}`,
        }))
      );
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !messageBody.trim()) {
      Alert.alert('Error', 'Please fill in subject and message');
      return;
    }

    if (selectedClassIds.length === 0) {
      Alert.alert('Error', 'Please select at least one class');
      return;
    }

    if (selectedStudentIds.length === 0 && selectedClassIds.length === 0 && selectedGrades.length === 0) {
      Alert.alert('Error', 'Please select at least one student, class, or grade');
      return;
    }

    if (!currentSchool?.id) {
      Alert.alert('Error', 'School not found');
      return;
    }

    try {
      setSubmitting(true);

      const result = await createThread({
        schoolId: currentSchool.id,
        subject: subject.trim(),
        priority,
        recipients: {
          studentIds: selectedStudentIds,
          classIds: selectedClassIds,
          grades: selectedGrades,
        },
        messageBody: messageBody.trim(),
      });

      if (result) {
        Alert.alert('Success', 'Message sent successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              // Navigate to conversation
              navigation.navigate('MessagesConversation' as never, {
                threadId: result.threadId,
              } as never);
            },
          },
        ]);
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSchoolMode || !currentSchool) {
    return null;
  }


  // Styles with dynamic theme


  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: typography.fontFamily.semiBold,
  },
  sendButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    fontFamily: typography.fontFamily.semiBold,
  },
  sendButtonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.semiBold,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.sm,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
  },
  priorityButtonTextActive: {
    color: colors.white,
    fontFamily: typography.fontFamily.semiBold,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectButtonText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
  },
});


  return (
    <View style={styles.container}>
      <SchoolHeader />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={submitting || !subject.trim() || !messageBody.trim()}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text
              style={[
                styles.sendButtonText,
                (!subject.trim() || !messageBody.trim()) && styles.sendButtonTextDisabled,
              ]}
            >
              Send
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.field}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter subject"
            placeholderTextColor={colors.text.light}
            value={subject}
            onChangeText={setSubject}
            maxLength={200}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {(['Normal', 'High', 'N/A'] as MessagePriority[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonActive,
                ]}
                onPress={() => setPriority(p)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === p && styles.priorityButtonTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Classes *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowClassModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectButtonText}>
              {selectedClassIds.length > 0
                ? `${selectedClassIds.length} class${selectedClassIds.length > 1 ? 'es' : ''} selected`
                : 'Select classes'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {selectedClassIds.length > 0 && (
            <View style={styles.chipContainer}>
              {selectedClassIds.map((id) => {
                const classOption = classOptions.find((c) => c.id === id);
                return (
                  <View key={id} style={styles.chip}>
                    <Text style={styles.chipText}>{classOption?.label}</Text>
                    <TouchableOpacity
                      onPress={() => setSelectedClassIds((prev) => prev.filter((cid) => cid !== id))}
                    >
                      <MaterialIcons name="close" size={16} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Students (Optional)</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              if (selectedClassIds.length === 0) {
                Alert.alert('Please select classes first', 'You need to select at least one class before selecting students.');
                return;
              }
              setShowStudentModal(true);
            }}
            activeOpacity={0.7}
            disabled={selectedClassIds.length === 0}
          >
            <Text style={styles.selectButtonText}>
              {selectedStudentIds.length > 0
                ? `${selectedStudentIds.length} student${selectedStudentIds.length > 1 ? 's' : ''} selected`
                : 'Select students'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {selectedStudentIds.length > 0 && (
            <View style={styles.chipContainer}>
              {selectedStudentIds.slice(0, 3).map((id) => {
                const student = studentOptions.find((s) => s.id === id);
                return (
                  <View key={id} style={styles.chip}>
                    <Text style={styles.chipText}>{student?.label}</Text>
                    <TouchableOpacity
                      onPress={() => setSelectedStudentIds((prev) => prev.filter((sid) => sid !== id))}
                    >
                      <MaterialIcons name="close" size={16} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                );
              })}
              {selectedStudentIds.length > 3 && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>+{selectedStudentIds.length - 3} more</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Grades (Optional)</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowGradeModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectButtonText}>
              {selectedGrades.length > 0
                ? `${selectedGrades.length} grade${selectedGrades.length > 1 ? 's' : ''} selected`
                : 'Select grades'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {selectedGrades.length > 0 && (
            <View style={styles.chipContainer}>
              {selectedGrades.map((grade) => {
                const gradeOption = gradeOptions.find((g) => g.id === grade);
                return (
                  <View key={grade} style={styles.chip}>
                    <Text style={styles.chipText}>{gradeOption?.label}</Text>
                    <TouchableOpacity
                      onPress={() => setSelectedGrades((prev) => prev.filter((g) => g !== grade))}
                    >
                      <MaterialIcons name="close" size={16} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Type your message..."
            placeholderTextColor={colors.text.light}
            value={messageBody}
            onChangeText={setMessageBody}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={5000}
          />
        </View>
      </ScrollView>

      {/* Multi-select modals */}
      <MultiSelectModal
        visible={showStudentModal}
        title="Select Students"
        options={studentOptions.filter((student: any) =>
          selectedClassIds.length === 0 || selectedClassIds.includes(student.class_id)
        )}
        selectedIds={selectedStudentIds}
        onClose={() => setShowStudentModal(false)}
        onConfirm={setSelectedStudentIds}
        searchPlaceholder="Search students..."
      />

      <MultiSelectModal
        visible={showClassModal}
        title="Select Classes"
        options={classOptions}
        selectedIds={selectedClassIds}
        onClose={() => setShowClassModal(false)}
        onConfirm={setSelectedClassIds}
        searchPlaceholder="Search classes..."
      />

      <MultiSelectModal
        visible={showGradeModal}
        title="Select Grades"
        options={gradeOptions}
        selectedIds={selectedGrades}
        onClose={() => setShowGradeModal(false)}
        onConfirm={setSelectedGrades}
        searchPlaceholder="Search grades..."
      />
    </View>
  );
};

export default MessagesComposeScreen;

