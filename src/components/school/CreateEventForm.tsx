import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { EventCategory, EventStatus } from '../../types/school/events';

interface CreateEventFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    category: EventCategory;
    class_id?: string | null;
    starts_at: string;
    ends_at: string;
    location?: string;
    status: EventStatus;
    capacity?: number | null;
    parent_note?: string;
  }) => void;
  onCancel: () => void;
  classes?: Array<{ id: string; name: string }>;
  initialData?: {
    title?: string;
    description?: string;
    category?: EventCategory;
    class_id?: string | null;
    starts_at?: string;
    ends_at?: string;
    location?: string;
    status?: EventStatus;
    capacity?: number | null;
    parent_note?: string;
  };
}

const CATEGORIES: EventCategory[] = [
  'school',
  'class',
  'competition',
  'workshop',
  'outing',
  'practice',
  'celebration',
];

const STATUSES: EventStatus[] = ['draft', 'published'];

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onSubmit,
  onCancel,
  classes = [],
  initialData,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<EventCategory>(initialData?.category || 'school');
  const [classId, setClassId] = useState<string>(initialData?.class_id || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [status, setStatus] = useState<EventStatus>(initialData?.status || 'draft');
  const [capacity, setCapacity] = useState(initialData?.capacity?.toString() || '');
  const [parentNote, setParentNote] = useState(initialData?.parent_note || '');
  const [classPickerVisible, setClassPickerVisible] = useState(false);

  // Date/Time state - using string inputs for simplicity
  const getDefaultDateTime = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 5); // HH:MM
    return { dateStr, timeStr };
  };

  const defaultDateTime = getDefaultDateTime();
  const initialStart = initialData?.starts_at ? new Date(initialData.starts_at) : new Date();
  const initialEnd = initialData?.ends_at ? new Date(initialData.ends_at) : new Date();

  const [startDate, setStartDate] = useState(
    initialData?.starts_at 
      ? initialStart.toISOString().split('T')[0]
      : defaultDateTime.dateStr
  );
  const [startTime, setStartTime] = useState(
    initialData?.starts_at
      ? initialStart.toTimeString().slice(0, 5)
      : defaultDateTime.timeStr
  );
  const [endDate, setEndDate] = useState(
    initialData?.ends_at
      ? initialEnd.toISOString().split('T')[0]
      : defaultDateTime.dateStr
  );
  const [endTime, setEndTime] = useState(
    initialData?.ends_at
      ? initialEnd.toTimeString().slice(0, 5)
      : defaultDateTime.timeStr
  );

  const combineDateTime = (dateStr: string, timeStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const combined = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return combined;
  };

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('school.events.titleRequired'));
      return;
    }
    if (!category) {
      Alert.alert(t('common.error'), t('school.events.categoryRequired'));
      return;
    }
    if (category === 'class' && !classId) {
      Alert.alert(t('common.error'), t('school.events.classRequired'));
      return;
    }

    const startsAt = combineDateTime(startDate, startTime);
    const endsAt = combineDateTime(endDate, endTime);

    if (endsAt <= startsAt) {
      Alert.alert(t('common.error'), t('school.events.endDateAfterStart'));
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      class_id: category === 'class' ? classId : null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      location: location.trim() || undefined,
      status,
      capacity: capacity.trim() ? parseInt(capacity, 10) : null,
      parent_note: parentNote.trim() || undefined,
    });
  };


  // Styles with dynamic theme


  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  field: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.sm,
  },
  pickerText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  categoryRow: {
    marginTop: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateTimeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  dateTimeInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statusChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  statusChipTextActive: {
    color: colors.white,
  },
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  modalList: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalOptionActive: {
    backgroundColor: `${colors.primary}10`,
  },
  modalOptionText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  modalOptionTextActive: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  emptyModalContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  classList: {
    maxHeight: 200,
    marginTop: spacing.xs,
  },
  classOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  classOptionActive: {
    backgroundColor: `${colors.primary}20`,
    borderColor: colors.primary,
  },
  classOptionText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  classOptionTextActive: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  pickerTextPlaceholder: {
    color: colors.text.light,
  },
  noClassesText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  modalItemText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  modalItemTextSelected: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Title */}
      <View style={styles.field}>
        <Text style={styles.label}>
          {t('school.events.titleLabel')} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t('school.events.titlePlaceholder')}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('school.events.description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('school.events.descriptionPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>
          {t('school.events.category')} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerText}>
            {t(`school.events.${category}`)}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
              onPress={() => {
                setCategory(cat);
                if (cat !== 'class') {
                  setClassId('');
                }
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}
              >
                {t(`school.events.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Class Selector (when category is 'class') */}
      {category === 'class' && (
        <View style={styles.field}>
          <Text style={styles.label}>
            {t('school.classes.title')} <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity 
            style={styles.pickerContainer}
            onPress={() => setClassPickerVisible(true)}
          >
            <Text style={[styles.pickerText, !classId && styles.pickerTextPlaceholder]}>
              {classId ? classes.find(c => c.id === classId)?.name || t('school.events.selectClass') : t('school.events.selectClass')}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          {classes.length === 0 && (
            <Text style={styles.noClassesText}>{t('school.events.noClasses')}</Text>
          )}
        </View>
      )}

      {/* Start Date & Time */}
      <View style={styles.field}>
        <Text style={styles.label}>
          {t('school.events.startDateTime')} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeInputContainer}>
            <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.dateTimeInput}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              placeholderTextColor={colors.text.light}
            />
          </View>
          <View style={styles.dateTimeInputContainer}>
            <MaterialIcons name="access-time" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.dateTimeInput}
              placeholder="HH:MM"
              value={startTime}
              onChangeText={setStartTime}
              placeholderTextColor={colors.text.light}
            />
          </View>
        </View>
      </View>

      {/* End Date & Time */}
      <View style={styles.field}>
        <Text style={styles.label}>
          {t('school.events.endDateTime')} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeInputContainer}>
            <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.dateTimeInput}
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
              placeholderTextColor={colors.text.light}
            />
          </View>
          <View style={styles.dateTimeInputContainer}>
            <MaterialIcons name="access-time" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.dateTimeInput}
              placeholder="HH:MM"
              value={endTime}
              onChangeText={setEndTime}
              placeholderTextColor={colors.text.light}
            />
          </View>
        </View>
      </View>

      {/* Location */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('school.events.location')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('school.events.locationPlaceholder')}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Status */}
      <View style={styles.field}>
        <Text style={styles.label}>
          {t('school.events.statusLabel')} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerText}>
            {t(`school.events.${status}`)}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
        </View>
        <View style={styles.statusRow}>
          {STATUSES.map((stat) => (
            <TouchableOpacity
              key={stat}
              style={[
                styles.statusChip,
                status === stat && styles.statusChipActive,
              ]}
              onPress={() => setStatus(stat)}
            >
              <Text
                style={[
                  styles.statusChipText,
                  status === stat && styles.statusChipTextActive,
                ]}
              >
                {t(`school.events.${stat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Capacity */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('school.events.capacity')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('school.events.capacityPlaceholder')}
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
        />
      </View>

      {/* Parent Note */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('school.events.parentNote')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('school.events.parentNotePlaceholder')}
          value={parentNote}
          onChangeText={setParentNote}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>{t('school.events.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t('school.events.createEvent')}</Text>
        </TouchableOpacity>
      </View>

      {/* Class Picker Modal */}
      <Modal
        visible={classPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setClassPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('school.events.selectClass')}</Text>
              <TouchableOpacity onPress={() => setClassPickerVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={classes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    classId === item.id && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setClassId(item.id);
                    setClassPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      classId === item.id && styles.modalItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {classId === item.id && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>{t('school.events.noClasses')}</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

