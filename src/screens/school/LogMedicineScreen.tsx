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
  logMedicineAdministration,
  fetchMedicineReminders,
  type LogAdministrationData,
  type MedicineReminder,
} from '../../services/supabase-medicine';
import { supabase } from '../../config/supabase';

const LogMedicineScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const routeParams = route.params as { reminderId: string } | undefined;
  const reminderId = routeParams?.reminderId;

  const [loading, setLoading] = useState(false);
  const [reminder, setReminder] = useState<MedicineReminder | null>(null);
  const [administeredAt, setAdministeredAt] = useState(
    new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
  );
  const [status, setStatus] = useState<'completed' | 'missed' | 'skipped'>('completed');
  const [note, setNote] = useState('');
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [dateTimeMode, setDateTimeMode] = useState<'date' | 'time'>('date');

  useEffect(() => {
    if (reminderId && currentSchool) {
      loadReminder();
    }
  }, [reminderId, currentSchool]);

  const loadReminder = async () => {
    if (!currentSchool || !reminderId) return;
    try {
      const reminders = await fetchMedicineReminders(
        currentSchool.id || currentSchool.name,
        {} // No filters, get all reminders
      );
      const foundReminder = reminders.find(r => r.id === reminderId);
      if (foundReminder) {
        setReminder(foundReminder);
      } else {
        Alert.alert(
          t('common.error') || 'Error',
          t('school.medicine.log.loadError') || 'Reminder not found'
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading reminder:', error);
      Alert.alert(
        t('common.error') || 'Error',
        t('school.medicine.log.loadError') || 'Failed to load reminder details'
      );
    }
  };

  const handleSubmit = async () => {
    if (!currentSchool || !reminder) return;

    setLoading(true);
    try {
      // Get current user for administered_by
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let administeredBy = null;
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', authUser.id)
          .single();
        administeredBy = userData?.id || null;
      }

      // Parse the datetime input as local time
      // administeredAt format: "YYYY-MM-DDTHH:mm"
      // Split and create date in local timezone explicitly
      const [datePart, timePart] = administeredAt.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      // Create date in local timezone
      const localDate = new Date(year, month - 1, day, hour, minute);
      
      const logData: LogAdministrationData = {
        school_id: currentSchool.id || currentSchool.name,
        student_id: reminder.student_id,
        reminder_id: reminder.id,
        administered_at: localDate.toISOString(),
        administered_by: administeredBy,
        status,
        note: note || null,
      };

      await logMedicineAdministration(logData);

      Alert.alert(
        t('common.success') || 'Success',
        t('school.medicine.log.loggedSuccessfully') || 'Medicine administration logged successfully',
        [
          {
            text: t('common.ok') || 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error logging administration:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error.message || t('school.medicine.log.logError') || 'Failed to log administration'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      once: t('school.medicine.frequency.once') || 'Once',
      daily: t('school.medicine.frequency.daily') || 'Daily',
      twice_daily: t('school.medicine.frequency.twiceDaily') || 'Twice Daily',
      as_needed: t('school.medicine.frequency.asNeeded') || 'As Needed',
    };
    return labels[freq] || freq;
  };

  if (!reminder) {

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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  field: {
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
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  statusButtonSelected: {
    borderWidth: 2,
  },
  statusButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  statusButtonTextSelected: {
    fontWeight: '600',
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
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 48,
  },
  dateTimeText: {
    fontSize: typography.fontSize.md,
    color: colors.onSurface,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
});

    return (
      <View style={styles.container}>
        <DashboardHeader
          schoolName={currentSchool?.name || 'Log Medicine'}
          onNotificationPress={() => navigation.navigate('Notifications' as never)}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading') || 'Loading...'}</Text>
        </View>
      </View>
    );
  }

  const student = reminder.school_students;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <DashboardHeader
        schoolName={currentSchool?.name || 'Log Medicine'}
        onNotificationPress={() => navigation.navigate('Notifications' as never)}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.form}>
          {/* Reminder Details (Read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('school.medicine.log.reminderDetails') || 'Reminder Details'}
            </Text>
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t('school.medicine.log.student') || 'Student'}:
                </Text>
                <Text style={styles.detailValue}>
                  {student ? `${student.first_name} ${student.last_name}` : 'Unknown'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t('school.medicine.log.medicine') || 'Medicine'}:
                </Text>
                <Text style={styles.detailValue}>{reminder.medicine_name}</Text>
              </View>
              {reminder.dosage && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {t('school.medicine.log.dosage') || 'Dosage'}:
                  </Text>
                  <Text style={styles.detailValue}>{reminder.dosage}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t('school.medicine.log.frequency') || 'Frequency'}:
                </Text>
                <Text style={styles.detailValue}>{getFrequencyLabel(reminder.frequency)}</Text>
              </View>
              {reminder.time_of_day && reminder.time_of_day.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {t('school.medicine.log.time') || 'Time'}:
                  </Text>
                  <Text style={styles.detailValue}>
                    {reminder.time_of_day.map(formatTime).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Administration Time */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('school.medicine.log.administeredAt') || 'Administered At'} <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[styles.dateTimeButton, { flex: 1 }]}
                onPress={() => {
                  setDateTimeMode('date');
                  setShowDateTimePicker(true);
                }}
              >
                <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>
                  {administeredAt ? new Date(administeredAt).toLocaleDateString() : 'Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateTimeButton, { flex: 1 }]}
                onPress={() => {
                  setDateTimeMode('time');
                  setShowDateTimePicker(true);
                }}
              >
                <MaterialIcons name="access-time" size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>
                  {administeredAt ? new Date(administeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time'}
                </Text>
              </TouchableOpacity>
            </View>
            {showDateTimePicker && (
              <DateTimePicker
                value={administeredAt ? new Date(administeredAt) : new Date()}
                mode={dateTimeMode}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDateTimePicker(false);
                  if (event.type === 'set' && selectedDate) {
                    const currentDate = administeredAt ? new Date(administeredAt) : new Date();
                    if (dateTimeMode === 'date') {
                      currentDate.setFullYear(selectedDate.getFullYear());
                      currentDate.setMonth(selectedDate.getMonth());
                      currentDate.setDate(selectedDate.getDate());
                    } else {
                      currentDate.setHours(selectedDate.getHours());
                      currentDate.setMinutes(selectedDate.getMinutes());
                    }
                    setAdministeredAt(currentDate.toISOString().slice(0, 16));
                  }
                }}
              />
            )}
          </View>

          {/* Status */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('school.medicine.log.status') || 'Status'} <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.statusContainer}>
              {(['completed', 'missed', 'skipped'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusButton,
                    status === s && styles.statusButtonSelected,
                    status === s && s === 'completed' && { backgroundColor: '#D1FAE5', borderColor: '#10B981', borderWidth: 2 },
                    status === s && s === 'missed' && { backgroundColor: '#FEE2E2', borderColor: '#EF4444', borderWidth: 2 },
                    status === s && s === 'skipped' && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', borderWidth: 2 },
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === s && styles.statusButtonTextSelected,
                      status === s && s === 'completed' && { color: '#10B981', fontWeight: '600' },
                      status === s && s === 'missed' && { color: '#EF4444', fontWeight: '600' },
                      status === s && s === 'skipped' && { color: '#F59E0B', fontWeight: '600' },
                    ]}
                  >
                    {s === 'completed' && (t('school.medicine.logStatus.completed') || 'Completed')}
                    {s === 'missed' && (t('school.medicine.logStatus.missed') || 'Missed')}
                    {s === 'skipped' && (t('school.medicine.logStatus.skipped') || 'Skipped')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('school.medicine.log.notes') || 'Notes'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={note}
              onChangeText={setNote}
              placeholder={t('school.medicine.log.notesPlaceholder') || 'Additional notes (optional)...'}
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
                {t('school.medicine.log.submit') || 'Log Administration'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LogMedicineScreen;

