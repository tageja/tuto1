import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DashboardHeader } from '../../components/school/DashboardHeader';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchParentChildren,
  fetchParentMedicineReminders,
  fetchMedicineLogs,
  type ParentChild,
  type MedicineReminder,
  type MedicineLog,
} from '../../services/supabase-medicine';

const ParentMedicineScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [childDropdownVisible, setChildDropdownVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    scrollContent: {
      padding: spacing.md,
    },
    headerCard: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.md,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700' as any,
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    childSelectorCard: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    childSelectorLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600' as any,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    childSelectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    childSelectorText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      fontWeight: '500' as any,
    },
    sectionCard: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700' as any,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    medicationCard: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    medicationName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600' as any,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    medicationDetail: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs / 2,
    },
    medicationNote: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontStyle: 'italic',
      marginTop: spacing.xs,
    },
    logCard: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    logMedicineName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600' as any,
      color: colors.text.primary,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.full,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600' as any,
    },
    logTimestamp: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs / 2,
    },
    logNote: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontStyle: 'italic',
      marginTop: spacing.xs,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    emptyText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.lg,
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      marginTop: spacing.xs,
      maxHeight: 200,
      ...shadows.md,
      zIndex: 1000,
    },
    dropdownItem: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    dropdownItemText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
  });

  useEffect(() => {
    if (currentSchool) {
      loadChildren();
    }
  }, [currentSchool]);

  useEffect(() => {
    if (selectedChildId) {
      loadChildData();
    }
  }, [selectedChildId]);

  const loadChildren = async () => {
    if (!currentSchool) return;
    setLoading(true);
    try {
      const data = await fetchParentChildren(currentSchool.id || currentSchool.name);
      setChildren(data);
      if (data.length > 0 && !selectedChildId) {
        setSelectedChildId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert(
        t('common.error') || 'Error',
        t('school.medicine.parent.loadError') || 'Failed to load children'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async () => {
    if (!selectedChildId) return;
    try {
      const [remindersData, logsData] = await Promise.all([
        fetchParentMedicineReminders(selectedChildId),
        fetchMedicineLogs(selectedChildId),
      ]);
      setReminders(remindersData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading child data:', error);
      Alert.alert(
        t('common.error') || 'Error',
        t('school.medicine.parent.loadChildDataError') || 'Failed to load medicine data'
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadChildren(), selectedChildId ? loadChildData() : Promise.resolve()]);
    setRefreshing(false);
  };

  const formatFrequency = (freq: string) => {
    const map: Record<string, string> = {
      once: t('school.medicine.frequency.once') || 'Once',
      daily: t('school.medicine.frequency.daily') || 'Daily',
      twice_daily: t('school.medicine.frequency.twiceDaily') || 'Twice Daily',
      as_needed: t('school.medicine.frequency.asNeeded') || 'As Needed',
    };
    return map[freq] || freq;
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          backgroundColor: '#E8F5E9',
          color: '#4CAF50',
        };
      case 'missed':
        return {
          backgroundColor: '#FEECEC',
          color: '#D14343',
        };
      case 'skipped':
        return {
          backgroundColor: '#FFF3E0',
          color: '#FF9800',
        };
      default:
        return {
          backgroundColor: colors.background.secondary,
          color: colors.text.secondary,
        };
    }
  };

  const renderMedicationCard = ({ item }: { item: MedicineReminder }) => (
    <View style={styles.medicationCard}>
      <Text style={styles.medicationName}>{item.medicine_name}</Text>
      {item.dosage && (
        <Text style={styles.medicationDetail}>
          {t('school.medicine.dosage') || 'Dosage'}: {item.dosage}
        </Text>
      )}
      <Text style={styles.medicationDetail}>
        {t('school.medicine.frequency') || 'Frequency'}: {formatFrequency(item.frequency)}
      </Text>
      {item.time_of_day && item.time_of_day.length > 0 && (
        <Text style={styles.medicationDetail}>
          {t('school.medicine.time') || 'Time'}: {item.time_of_day.map(formatTime).join(', ')}
        </Text>
      )}
      {item.notes && (
        <Text style={styles.medicationNote}>
          {t('school.medicine.note') || 'Note'}: {item.notes}
        </Text>
      )}
    </View>
  );

  const renderLogCard = ({ item }: { item: MedicineLog }) => {
    const statusStyle = getStatusStyle(item.status);
    const medicineName =
      item.medicine_reminders?.medicine_name || t('school.medicine.unknownMedicine') || 'Unknown Medicine';

    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <Text style={styles.logMedicineName}>{medicineName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.logTimestamp}>
          {new Date(item.administered_at).toLocaleString()}
        </Text>
        {item.note && (
          <Text style={styles.logNote}>
            {t('school.medicine.note') || 'Note'}: {item.note}
          </Text>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <DashboardHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { marginTop: spacing.md }]}>
            {t('common.loading') || 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <View style={styles.container}>
        <DashboardHeader />
        <View style={styles.loadingContainer}>
          <MaterialIcons name="child-care" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyText}>
            {t('school.medicine.parent.noChildren') || 'No children found'}
          </Text>
        </View>
      </View>
    );
  }

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <View style={styles.container}>
      <DashboardHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            {t('school.medicine.parent.title') || 'Medicine Management'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('school.medicine.parent.subtitle') ||
              'View and manage medicine reminders for your child'}
          </Text>
        </View>

        {/* Child Selector */}
        {children.length > 1 && (
          <View style={styles.childSelectorCard}>
            <Text style={styles.childSelectorLabel}>
              {t('school.medicine.parent.selectChild') || 'Select Child'}
            </Text>
            <TouchableOpacity
              style={styles.childSelectorButton}
              onPress={() => setChildDropdownVisible(!childDropdownVisible)}
            >
              <Text style={styles.childSelectorText}>
                {selectedChild?.fullName || t('school.medicine.parent.selectChild') || 'Select Child'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            {childDropdownVisible && (
              <View style={styles.dropdown}>
                {children.map(child => (
                  <TouchableOpacity
                    key={child.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedChildId(child.id);
                      setChildDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{child.fullName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Active Medications Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {t('school.medicine.parent.activeMedications') || 'Active Medications'}
            {selectedChild && ` - ${selectedChild.fullName}`}
          </Text>
          {reminders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="local-pharmacy" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyText}>
                {t('school.medicine.parent.noActiveMedications') || 'No active medications'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={reminders}
              renderItem={renderMedicationCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Administration Log Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {t('school.medicine.parent.administrationLog') || 'Administration Log'}
          </Text>
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-note" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyText}>
                {t('school.medicine.parent.noLogs') || 'No administration logs yet'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={logs}
              renderItem={renderLogCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB - Optional: Allow parents to add reminders */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('AddMedicineReminderScreen' as never, {
            studentId: selectedChildId,
          } as never)
        }
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default ParentMedicineScreen;

