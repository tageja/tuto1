/**
 * Add Student Modal
 * Modal for adding new students on mobile
 */

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSchool } from '../../contexts/SchoolContext';
import { getStudentClasses, getNextStudentCode, createStudent } from '../../services/supabase-students';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClassOption {
  id: string;
  name: string;
  grade_level: string | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      marginTop: 24,
      marginBottom: 16,
    },
    field: {
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 0,
    },
    halfWidth: {
      flex: 1,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border.medium,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text.primary,
      backgroundColor: colors.background.primary,
    },
    inputError: {
      borderColor: '#EF4444',
    },
    inputDisabled: {
      backgroundColor: colors.background.tertiary,
      color: colors.text.secondary,
    },
    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectButtonText: {
      fontSize: 14,
      color: colors.text.primary,
    },
    placeholder: {
      color: colors.text.light,
    },
    errorText: {
      fontSize: 12,
      color: '#EF4444',
      marginTop: 4,
    },
    helpText: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 4,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      backgroundColor: colors.background.primary,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonCancel: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.medium,
    },
    buttonSave: {
      backgroundColor: '#0B5FFF',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonTextCancel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
    },
    buttonTextSave: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    pickerModal: {
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      width: '100%',
      maxWidth: 400,
      maxHeight: 400,
    },
    pickerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    pickerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    pickerList: {
      maxHeight: 320,
    },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.tertiary,
    },
    pickerItemText: {
      fontSize: 16,
      color: colors.text.primary,
    },
  });

  const { t } = useLanguage();
  const { currentSchool } = useSchool();

  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [formData, setFormData] = useState({
    student_number: '',
    first_name: '',
    last_name: '',
    class_id: '',
    gender: '',
    date_of_birth: '',
    contact_phone: '',
    contact_email: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Load classes and next student code when modal opens
  useEffect(() => {
    if (visible && currentSchool?.id) {
      loadInitialData();
    }
  }, [visible, currentSchool]);

  const loadInitialData = async () => {
    if (!currentSchool?.id) return;

    console.log('🎓 AddStudentModal: Loading with school ID:', currentSchool.id);

    try {
      setLoadingClasses(true);
      
      // Load classes
      const classesData = await getStudentClasses(currentSchool.id);
      setClasses(classesData);

      // Load next student code
      const nextCode = await getNextStudentCode(currentSchool.id);
      console.log('🎓 AddStudentModal: Next student code:', nextCode);
      setFormData((prev) => ({ ...prev, student_number: nextCode }));
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert(
        t('common.error'),
        'Failed to load classes. Please try again.'
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_number.trim()) {
      newErrors.student_number = 'Student code is required';
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.class_id) {
      newErrors.class_id = 'Class is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !currentSchool?.id) return;

    try {
      setLoading(true);
      
      await createStudent(currentSchool.id, {
        student_number: formData.student_number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        class_id: formData.class_id,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        parent_name: formData.parent_name || null,
        parent_email: formData.parent_email || null,
        parent_phone: formData.parent_phone || null,
      });

      Alert.alert(
        t('common.success'),
        'Student added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onSuccess();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating student:', error);
      Alert.alert(
        t('common.error'),
        error.message || 'Failed to add student. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      student_number: '',
      first_name: '',
      last_name: '',
      class_id: '',
      gender: '',
      date_of_birth: '',
      contact_phone: '',
      contact_email: '',
      parent_name: '',
      parent_email: '',
      parent_phone: '',
    });
    setErrors({});
    onClose();
  };

  // Get grade from selected class
  const selectedClass = classes.find((cls) => cls.id === formData.class_id);
  const gradeDisplay = selectedClass?.grade_level || 'Auto-filled from class';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={loading}>
            <MaterialIcons name="close" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('school.students.add') || 'Add Student'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Student Code */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('school.students.add.studentCode') || 'Student Code'} *
            </Text>
            <TextInput
              style={[styles.input, errors.student_number && styles.inputError]}
              value={formData.student_number}
              onChangeText={(value) => {
                setFormData({ ...formData, student_number: value });
                setErrors({ ...errors, student_number: '' });
              }}
              placeholder="STU001"
              editable={!loading}
            />
            {errors.student_number && (
              <Text style={styles.errorText}>{errors.student_number}</Text>
            )}
          </View>

          {/* First Name & Last Name */}
          <View style={styles.row}>
            <View style={[styles.field, styles.halfWidth]}>
              <Text style={styles.label}>
                {t('school.students.add.firstName') || 'First Name'} *
              </Text>
              <TextInput
                style={[styles.input, errors.first_name && styles.inputError]}
                value={formData.first_name}
                onChangeText={(value) => {
                  setFormData({ ...formData, first_name: value });
                  setErrors({ ...errors, first_name: '' });
                }}
                placeholder="John"
                editable={!loading}
              />
              {errors.first_name && (
                <Text style={styles.errorText}>{errors.first_name}</Text>
              )}
            </View>

            <View style={[styles.field, styles.halfWidth]}>
              <Text style={styles.label}>
                {t('school.students.add.lastName') || 'Last Name'} *
              </Text>
              <TextInput
                style={[styles.input, errors.last_name && styles.inputError]}
                value={formData.last_name}
                onChangeText={(value) => {
                  setFormData({ ...formData, last_name: value });
                  setErrors({ ...errors, last_name: '' });
                }}
                placeholder="Smith"
                editable={!loading}
              />
              {errors.last_name && (
                <Text style={styles.errorText}>{errors.last_name}</Text>
              )}
            </View>
          </View>

          {/* Class & Grade */}
          <View style={styles.row}>
            <View style={[styles.field, styles.halfWidth]}>
              <Text style={styles.label}>
                {t('school.students.add.class') || 'Class'} *
              </Text>
              <TouchableOpacity
                style={[styles.input, styles.selectButton, errors.class_id && styles.inputError]}
                onPress={() => setShowClassPicker(true)}
                disabled={loading || loadingClasses}
              >
                <Text style={[styles.selectButtonText, !formData.class_id && styles.placeholder]}>
                  {formData.class_id
                    ? classes.find((c) => c.id === formData.class_id)?.name || 'Select Class'
                    : loadingClasses
                    ? 'Loading...'
                    : 'Select Class'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#6B7280" />
              </TouchableOpacity>
              {errors.class_id && (
                <Text style={styles.errorText}>{errors.class_id}</Text>
              )}
            </View>

            <View style={[styles.field, styles.halfWidth]}>
              <Text style={styles.label}>
                {t('school.students.add.grade') || 'Grade'}
              </Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={gradeDisplay}
                editable={false}
              />
              <Text style={styles.helpText}>Auto-filled from class</Text>
            </View>
          </View>

          {/* Gender & Date of Birth */}
          <View style={styles.row}>
            <View style={[styles.field, styles.halfWidth]}>
              <Text style={styles.label}>
                {t('school.students.add.gender') || 'Gender'}
              </Text>
              <TouchableOpacity
                style={[styles.input, styles.selectButton]}
                onPress={() => setShowGenderPicker(true)}
                disabled={loading}
              >
                <Text style={[styles.selectButtonText, !formData.gender && styles.placeholder]}>
                  {formData.gender || 'Select Gender'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={[styles.field, styles.halfWidth]}>
              <Text style={styles.label}>
                {t('school.students.add.dob') || 'Date of Birth'}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.date_of_birth}
                onChangeText={(value) =>
                  setFormData({ ...formData, date_of_birth: value })
                }
                placeholder="YYYY-MM-DD"
                editable={!loading}
              />
              <Text style={styles.helpText}>Format: YYYY-MM-DD</Text>
            </View>
          </View>

          {/* Parent Information Section */}
          <Text style={styles.sectionTitle}>
            {t('school.students.parentInfo') || 'Parent Information'}
          </Text>

          {/* Parent Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('school.students.add.parentName') || 'Parent Name'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.parent_name}
              onChangeText={(value) =>
                setFormData({ ...formData, parent_name: value })
              }
              placeholder="Parent Name"
              editable={!loading}
            />
          </View>

          {/* Parent Email & Phone */}
          <View style={styles.row}>
            <View style={[styles.field, styles.halfWidth]}>
              <Text style={styles.label}>
                {t('school.students.add.parentEmail') || 'Parent Email'}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.parent_email}
                onChangeText={(value) =>
                  setFormData({ ...formData, parent_email: value })
                }
                placeholder="parent@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={[styles.field, styles.halfWidth]}>
              <Text style={styles.label}>
                {t('school.students.add.parentPhone') || 'Parent Phone'}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.parent_phone}
                onChangeText={(value) =>
                  setFormData({ ...formData, parent_phone: value })
                }
                placeholder="+1234567890"
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.buttonTextCancel}>
              {t('common.cancel') || 'Cancel'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSave, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonTextSave}>
                {t('common.save') || 'Save'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Class Picker Modal */}
        <Modal
          visible={showClassPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowClassPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Class</Text>
                <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                  <MaterialIcons name="close" size={24} color="#333333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList}>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setFormData({ ...formData, class_id: cls.id });
                      setErrors({ ...errors, class_id: '' });
                      setShowClassPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>
                      {cls.name}{cls.grade_level ? ` (${cls.grade_level})` : ''}
                    </Text>
                    {formData.class_id === cls.id && (
                      <MaterialIcons name="check" size={20} color="#0B5FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Gender Picker Modal */}
        <Modal
          visible={showGenderPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Gender</Text>
                <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                  <MaterialIcons name="close" size={24} color="#333333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList}>
                {['Male', 'Female', 'Other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={styles.pickerItem}
                    onPress={() => {
                      setFormData({ ...formData, gender });
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{gender}</Text>
                    {formData.gender === gender && (
                      <MaterialIcons name="check" size={20} color="#0B5FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};


