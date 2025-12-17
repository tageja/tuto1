import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useAirtable } from '../../hooks/useAirtable';
import { translations } from '../../translations';
import SchoolHeader from '../../components/common/SchoolHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface DailyActivity {
  id: string;
  fields: {
    'Activity Title': string;
    'School Name': string;
    'Class Name': string;
    'Date': string;
    'Activity Type': string;
    'Description': string;
    'Location': string;
    'Start Time': string;
    'End Time': string;
    'Students Present': string;
    'Notes': string;
    'Status': string;
    'Created Date': string;
  };
}

const DailyActivitiesScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool, isSchoolMode } = useSchool();
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  const { fetchRecords, createRecord, updateRecord } = useAirtable();

  const t = translations.en.school;

  useEffect(() => {
    if (!isSchoolMode || !currentSchool) {
      navigation.goBack();
      return;
    }
    loadActivities();
  }, [isSchoolMode, currentSchool]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const records = await fetchRecords('TutoDailyActivities', {
        filterByFormula: `{School Name} = '${currentSchool?.name}'`,
        sort: [{ field: 'Date', direction: 'desc' }],
      });
      setActivities(records);
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert('Error', 'Failed to load daily activities');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getFilteredActivities = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (selectedFilter) {
      case 'today':
        return activities.filter(activity => activity.fields['Date'] === today);
      case 'upcoming':
        return activities.filter(activity => activity.fields['Date'] >= today);
      default:
        return activities;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return colors.primary;
      case 'In Progress':
        return '#FFA500';
      case 'Completed':
        return '#4CAF50';
      case 'Cancelled':
        return '#F44336';
      default:
        return colors.disabled;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString;
  };

  const renderActivityCard = (activity: DailyActivity) => (
    <TouchableOpacity
      key={activity.id}
      style={styles.activityCard}
      onPress={() => navigation.navigate('SchoolActivityDetail' as never, { activity } as never)}
    >
      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {activity.fields['Activity Title']}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.fields['Status']) }]}>
          <Text style={styles.statusText}>{activity.fields['Status']}</Text>
        </View>
      </View>

      <View style={styles.activityDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="class" size={16} color={colors.disabled} />
          <Text style={styles.detailText}>{activity.fields['Class Name']}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="event" size={16} color={colors.disabled} />
          <Text style={styles.detailText}>
            {formatDate(activity.fields['Date'])}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={16} color={colors.disabled} />
          <Text style={styles.detailText}>
            {formatTime(activity.fields['Start Time'])} - {formatTime(activity.fields['End Time'])}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color={colors.disabled} />
          <Text style={styles.detailText} numberOfLines={1}>
            {activity.fields['Location'] || 'No location specified'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="category" size={16} color={colors.disabled} />
          <Text style={styles.detailText}>{activity.fields['Activity Type']}</Text>
        </View>
      </View>

      {activity.fields['Description'] && (
        <Text style={styles.description} numberOfLines={2}>
          {activity.fields['Description']}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'all' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('all')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'all' && styles.filterButtonTextActive,
        ]}>
          {t.dailyActivities.all}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'today' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('today')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'today' && styles.filterButtonTextActive,
        ]}>
          {t.dailyActivities.today}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'upcoming' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('upcoming')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'upcoming' && styles.filterButtonTextActive,
        ]}>
          {t.dailyActivities.upcoming}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!isSchoolMode || !currentSchool) {
    return null;
  }

  const filteredActivities = getFilteredActivities();


  // Styles with dynamic theme


  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.onSurface,
  },
  addButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.disabled,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: colors.disabled,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.disabled,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  addFirstButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 24,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activitiesList: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  activityDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.onSurface,
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: colors.disabled,
    lineHeight: 20,
  },
});


  return (
    <View style={styles.container}>
      <SchoolHeader />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.dailyActivities.title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('SchoolActivityDetail' as never)}
        >
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {renderFilterButtons()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t.common.loading}</Text>
          </View>
        ) : filteredActivities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={64} color={colors.disabled} />
            <Text style={styles.emptyTitle}>{t.dailyActivities.noActivities}</Text>
            <Text style={styles.emptySubtitle}>{t.dailyActivities.noActivitiesSubtitle}</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => navigation.navigate('SchoolAddActivity' as never)}
            >
              <Text style={styles.addFirstButtonText}>{t.dailyActivities.addFirst}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activitiesList}>
            {filteredActivities.map(renderActivityCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DailyActivitiesScreen;

