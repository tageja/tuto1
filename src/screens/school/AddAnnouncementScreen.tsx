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
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import { FilterChip } from '../../components/school/FilterChip';
import { fetchClassesForSchool } from '../../services/school/activities';
import { supabase } from '../../config/supabase';
import type { AnnouncementPriority, AnnouncementStatus } from '../../types/school/announcements';

export default function AddAnnouncementScreen() {
    const { colors, spacing, typography, borderRadius, shadows } = useTheme();

const navigation = useNavigation();
  const route = useRoute();
  const { currentSchool } = useSchool();
  const { userData } = useUser();
  const announcementToEdit = (route.params as any)?.announcement;

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  // Form state
  const [title, setTitle] = useState(announcementToEdit?.title || '');
  const [body, setBody] = useState(announcementToEdit?.body || '');
  const [category, setCategory] = useState(announcementToEdit?.category || '');
  const [priority, setPriority] = useState<AnnouncementPriority>(announcementToEdit?.priority || 'Normal');
  const [status, setStatus] = useState<AnnouncementStatus>(announcementToEdit?.status || 'Draft');
  const [targetScope, setTargetScope] = useState<'School' | 'Classes'>(announcementToEdit?.target_scope || 'School');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(announcementToEdit?.class_ids || []);
  const [expiresAt, setExpiresAt] = useState(announcementToEdit?.expires_at || '');

  const priorities: AnnouncementPriority[] = ['Low', 'Normal', 'High', 'Urgent'];
  const statuses: AnnouncementStatus[] = ['Draft', 'Published'];

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    if (!currentSchool?.id) return;
    const fetchedClasses = await fetchClassesForSchool(currentSchool.id);
    setClasses(fetchedClasses);
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSubmit = async (statusToSave: AnnouncementStatus) => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!body.trim()) {
      Alert.alert('Error', 'Please enter announcement content');
      return;
    }
    if (targetScope === 'Classes' && selectedClassIds.length === 0) {
      Alert.alert('Error', 'Please select at least one class');
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

      const announcementData = {
        school_id: resolvedSchoolId,
        title,
        body,
        category: category || null,
        priority,
        status: statusToSave,
        target_scope: targetScope,
        class_ids: targetScope === 'Classes' ? selectedClassIds : null,
        expires_at: expiresAt || null,
        published_at: statusToSave === 'Published' ? new Date().toISOString() : null,
        created_by: userData?.id || null,
      };

      if (announcementToEdit) {
        // Update existing
        const { error } = await supabase
          .from('school_announcements')
          .update(announcementData)
          .eq('id', announcementToEdit.id);

        if (error) throw error;
        Alert.alert('Success', 'Announcement updated successfully');
      } else {
        // Create new
        const { error } = await supabase
          .from('school_announcements')
          .insert(announcementData);

        if (error) throw error;
        Alert.alert(
          'Success',
          statusToSave === 'Published'
            ? 'Announcement published successfully'
            : 'Announcement saved as draft'
        );
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving announcement:', error);
      Alert.alert('Error', error.message || 'Failed to save announcement');
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
    height: 120,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  draftButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  publishButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  draftButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  publishButtonText: {
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
          {announcementToEdit ? 'Edit Announcement' : 'New Announcement'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Announcement title"
          />
        </View>

        {/* Body */}
        <View style={styles.field}>
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={body}
            onChangeText={setBody}
            placeholder="Announcement content..."
            multiline
            numberOfLines={6}
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Category (optional)</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Academic, Event, General"
          />
        </View>

        {/* Priority */}
        <View style={styles.field}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipContainer}>
            {priorities.map((p) => (
              <FilterChip
                key={p}
                label={p}
                selected={priority === p}
                onPress={() => setPriority(p)}
              />
            ))}
          </View>
        </View>

        {/* Target Scope */}
        <View style={styles.field}>
          <Text style={styles.label}>Target Audience</Text>
          <View style={styles.chipContainer}>
            <FilterChip
              label="Entire School"
              selected={targetScope === 'School'}
              onPress={() => setTargetScope('School')}
            />
            <FilterChip
              label="Specific Classes"
              selected={targetScope === 'Classes'}
              onPress={() => setTargetScope('Classes')}
            />
          </View>
        </View>

        {/* Class Selection (if Classes scope) */}
        {targetScope === 'Classes' && (
          <View style={styles.field}>
            <Text style={styles.label}>Select Classes *</Text>
            <View style={styles.chipContainer}>
              {classes.map((cls) => (
                <FilterChip
                  key={cls.id}
                  label={cls.name}
                  selected={selectedClassIds.includes(cls.id)}
                  onPress={() => toggleClassSelection(cls.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Expires At */}
        <View style={styles.field}>
          <Text style={styles.label}>Expires At (optional)</Text>
          <TextInput
            style={styles.input}
            value={expiresAt}
            onChangeText={setExpiresAt}
            placeholder="YYYY-MM-DD or leave empty"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.draftButton, loading && styles.buttonDisabled]}
            onPress={() => handleSubmit('Draft')}
            disabled={loading}
          >
            {loading && status === 'Draft' ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={styles.draftButtonText}>
                {announcementToEdit ? 'Save as Draft' : 'Save Draft'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.publishButton, loading && styles.buttonDisabled]}
            onPress={() => handleSubmit('Published')}
            disabled={loading}
          >
            {loading && status === 'Published' ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.publishButtonText}>Publish</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

