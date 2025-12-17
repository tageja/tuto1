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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useTheme } from '../../contexts/ThemeContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import { FilterChip } from '../../components/school/FilterChip';
import { fetchClassesForSchool } from '../../services/school/activities';
import { supabase } from '../../config/supabase';

export default function AddActivityScreen() {
    const { colors, spacing, typography, borderRadius, shadows } = useTheme();

const navigation = useNavigation();
  const route = useRoute();
  const { currentSchool } = useSchool();
  const activityToEdit = (route.params as any)?.activity;

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  // Form state
  const [date, setDate] = useState(activityToEdit?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(activityToEdit?.time || '09:00');
  const [classId, setClassId] = useState(activityToEdit?.class_id || '');
  const [grade, setGrade] = useState(activityToEdit?.grade || '');
  const [title, setTitle] = useState(activityToEdit?.title || '');
  const [description, setDescription] = useState(activityToEdit?.description || '');
  const [type, setType] = useState<'Meal' | 'Learning' | 'Play' | 'Rest'>(activityToEdit?.type || 'Learning');
  const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Completed'>(activityToEdit?.status || 'Pending');
  const [menuDetails, setMenuDetails] = useState(activityToEdit?.menu_details || '');

  const activityTypes: Array<'Meal' | 'Learning' | 'Play' | 'Rest'> = ['Meal', 'Learning', 'Play', 'Rest'];
  const activityStatuses: Array<'Pending' | 'In Progress' | 'Completed'> = ['Pending', 'In Progress', 'Completed'];

  useEffect(() => {
    loadClasses();
  }, []);

  // Auto-populate grade when class is selected
  useEffect(() => {
    if (classId && classes.length > 0) {
      const selectedClass = classes.find(c => c.id === classId);
      if (selectedClass?.grade_level) {
        setGrade(selectedClass.grade_level);
      }
    }
  }, [classId, classes]);

  const loadClasses = async () => {
    if (!currentSchool?.id) return;
    const fetchedClasses = await fetchClassesForSchool(currentSchool.id);
    setClasses(fetchedClasses);
    if (!classId && fetchedClasses.length > 0) {
      setClassId(fetchedClasses[0].id);
      // Set grade from first class
      if (fetchedClasses[0].grade_level) {
        setGrade(fetchedClasses[0].grade_level);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!classId) {
      Alert.alert('Error', 'Please select a class');
      return;
    }

    setLoading(true);
    try {
      // Resolve school ID (convert Airtable ID to UUID if needed)
      const resolveSchoolId = async (schoolId: string): Promise<string | null> => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(schoolId)) {
          return schoolId;
        }

        if (schoolId.startsWith('rec')) {
          const { data } = await supabase
            .from('schools')
            .select('id')
            .eq('name', 'Tuto Demo School')
            .single();
          return data?.id || null;
        }

        const { data } = await supabase
          .from('schools')
          .select('id')
          .eq('name', schoolId)
          .single();
        return data?.id || null;
      };

      const resolvedSchoolId = await resolveSchoolId(currentSchool?.id || '');
      if (!resolvedSchoolId) {
        Alert.alert('Error', 'Invalid school ID');
        setLoading(false);
        return;
      }

      const activityData = {
        school_id: resolvedSchoolId,
        date,
        time,
        class_id: classId,
        grade: grade || 'N/A', // Required field
        title,
        description,
        type,
        status,
        menu_details: type === 'Meal' ? menuDetails : null,
      };

      if (activityToEdit) {
        // Update existing
        const { error } = await supabase
          .from('school_daily_activities')
          .update(activityData)
          .eq('id', activityToEdit.id);

        if (error) throw error;
        Alert.alert('Success', 'Activity updated successfully');
      } else {
        // Create new
        const { error } = await supabase
          .from('school_daily_activities')
          .insert(activityData);

        if (error) throw error;
        Alert.alert('Success', 'Activity created successfully');
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', error.message || 'Failed to save activity');
    } finally {
      setLoading(false);
    }
  };


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
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  halfField: {
    flex: 1,
    marginRight: spacing.sm,
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
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  todayButton: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  todayButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
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
    <View style={styles.container}>
      <SchoolHeader />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activityToEdit ? 'Edit Activity' : 'Add Activity'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Date & Time */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Date</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
              <TouchableOpacity
                onPress={() => setDate(new Date().toISOString().split('T')[0])}
                style={styles.todayButton}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
            />
          </View>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Activity title"
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Activity description"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Class */}
        <View style={styles.field}>
          <Text style={styles.label}>Class *</Text>
          <View style={styles.chipContainer}>
            {classes.map((cls) => (
              <FilterChip
                key={cls.id}
                label={cls.name}
                selected={classId === cls.id}
                onPress={() => setClassId(cls.id)}
              />
            ))}
          </View>
        </View>

        {/* Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.chipContainer}>
            {activityTypes.map((t) => (
              <FilterChip
                key={t}
                label={t}
                selected={type === t}
                onPress={() => setType(t)}
              />
            ))}
          </View>
        </View>

        {/* Menu Details (only for Meal type) */}
        {type === 'Meal' && (
          <View style={styles.field}>
            <Text style={styles.label}>Menu Details</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={menuDetails}
              onChangeText={setMenuDetails}
              placeholder="Breakfast: Rice porridge, egg..."
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.chipContainer}>
            {activityStatuses.map((s) => (
              <FilterChip
                key={s}
                label={s}
                selected={status === s}
                onPress={() => setStatus(s)}
              />
            ))}
          </View>
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
              {activityToEdit ? 'Update Activity' : 'Create Activity'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

