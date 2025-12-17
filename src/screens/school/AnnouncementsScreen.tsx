import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useAirtable } from '../../hooks/useAirtable';
import { translations } from '../../translations';
import SchoolHeader from '../../components/common/SchoolHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface Announcement {
  id: string;
  fields: {
    'Announcement Title': string;
    'School Name': string;
    'Content': string;
    'Category': string;
    'Target Audience': string;
    'Priority': string;
    'Publish Date': string;
    'Expiry Date': string;
    'Author': string;
    'Status': string;
    'Created Date': string;
  };
}

const AnnouncementsScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool, isSchoolMode } = useSchool();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'urgent' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { fetchRecords, createRecord, updateRecord } = useAirtable();

  const t = translations.en.school;

  useEffect(() => {
    if (!isSchoolMode || !currentSchool) {
      navigation.goBack();
      return;
    }
    loadAnnouncements();
  }, [isSchoolMode, currentSchool]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const records = await fetchRecords('TutoAnnouncements', {
        filterByFormula: `{School Name} = '${currentSchool?.name}'`,
        sort: [{ field: 'Publish Date', direction: 'desc' }],
      });
      setAnnouncements(records);
    } catch (error) {
      console.error('Error loading announcements:', error);
      Alert.alert('Error', 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const getFilteredAnnouncements = () => {
    let filtered = announcements;
    const today = new Date().toISOString().split('T')[0];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(announcement =>
        announcement.fields['Announcement Title'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.fields['Content'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.fields['Category'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.fields['Author'].toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(announcement => 
          announcement.fields['Status'] === 'Published' &&
          (!announcement.fields['Expiry Date'] || announcement.fields['Expiry Date'] >= today)
        );
        break;
      case 'urgent':
        filtered = filtered.filter(announcement => 
          announcement.fields['Priority'] === 'Urgent' &&
          announcement.fields['Status'] === 'Published' &&
          (!announcement.fields['Expiry Date'] || announcement.fields['Expiry Date'] >= today)
        );
        break;
      case 'expired':
        filtered = filtered.filter(announcement => 
          announcement.fields['Expiry Date'] && announcement.fields['Expiry Date'] < today
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return '#F44336';
      case 'High':
        return '#FF9800';
      case 'Normal':
        return colors.primary;
      case 'Low':
        return '#4CAF50';
      default:
        return colors.disabled;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return '#4CAF50';
      case 'Draft':
        return colors.disabled;
      case 'Archived':
        return '#9E9E9E';
      default:
        return colors.disabled;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return expiryDate < today;
  };

  const renderAnnouncementCard = (announcement: Announcement) => (
    <TouchableOpacity
      key={announcement.id}
      style={styles.announcementCard}
      onPress={() => navigation.navigate('SchoolAnnouncementDetail' as never, { announcement } as never)}
    >
      <View style={styles.announcementHeader}>
        <Text style={styles.announcementTitle} numberOfLines={2}>
          {announcement.fields['Announcement Title']}
        </Text>
        <View style={styles.badgeContainer}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(announcement.fields['Priority']) }]}>
            <Text style={styles.priorityText}>{announcement.fields['Priority']}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(announcement.fields['Status']) }]}>
            <Text style={styles.statusText}>{announcement.fields['Status']}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.announcementContent} numberOfLines={3}>
        {announcement.fields['Content']}
      </Text>

      <View style={styles.announcementDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="category" size={16} color={colors.disabled} />
          <Text style={styles.detailText}>{announcement.fields['Category']}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={16} color={colors.disabled} />
          <Text style={styles.detailText}>{announcement.fields['Author']}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="event" size={16} color={colors.disabled} />
          <Text style={styles.detailText}>
            Published: {formatDate(announcement.fields['Publish Date'])}
          </Text>
        </View>

        {announcement.fields['Expiry Date'] && (
          <View style={styles.detailRow}>
            <MaterialIcons 
              name="schedule" 
              size={16} 
              color={isExpired(announcement.fields['Expiry Date']) ? '#F44336' : colors.disabled} 
            />
            <Text style={[
              styles.detailText,
              isExpired(announcement.fields['Expiry Date']) && styles.expiredText
            ]}>
              Expires: {formatDate(announcement.fields['Expiry Date'])}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <MaterialIcons name="group" size={16} color={colors.disabled} />
          <Text style={styles.detailText} numberOfLines={1}>
            {announcement.fields['Target Audience'] || 'All users'}
          </Text>
        </View>
      </View>

      {isExpired(announcement.fields['Expiry Date']) && (
        <View style={styles.expiredBanner}>
          <MaterialIcons name="warning" size={16} color="white" />
          <Text style={styles.expiredBannerText}>Expired</Text>
        </View>
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
          {t.announcements.all}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'active' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('active')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'active' && styles.filterButtonTextActive,
        ]}>
          {t.announcements.active}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'urgent' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('urgent')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'urgent' && styles.filterButtonTextActive,
        ]}>
          {t.announcements.urgent}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'expired' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('expired')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'expired' && styles.filterButtonTextActive,
        ]}>
          {t.announcements.expired}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!isSchoolMode || !currentSchool) {
    return null;
  }

  const filteredAnnouncements = getFilteredAnnouncements();


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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.onSurface,
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
    paddingHorizontal: 6,
    marginHorizontal: 2,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
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
  announcementsList: {
    padding: 16,
  },
  announcementCard: {
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
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    flex: 1,
    marginRight: 12,
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  announcementContent: {
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
    marginBottom: 12,
  },
  announcementDetails: {
    marginBottom: 8,
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
  expiredText: {
    color: '#F44336',
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  expiredBannerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
        <Text style={styles.headerTitle}>{t.announcements.title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('SchoolAddAnnouncement' as never)}
        >
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={colors.disabled} />
        <TextInput
          style={styles.searchInput}
          placeholder={t.announcements.searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.disabled}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color={colors.disabled} />
          </TouchableOpacity>
        )}
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
        ) : filteredAnnouncements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="campaign" size={64} color={colors.disabled} />
            <Text style={styles.emptyTitle}>{t.announcements.noAnnouncements}</Text>
            <Text style={styles.emptySubtitle}>{t.announcements.noAnnouncementsSubtitle}</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => navigation.navigate('SchoolAddAnnouncement' as never)}
            >
              <Text style={styles.addFirstButtonText}>{t.announcements.addFirst}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.announcementsList}>
            {filteredAnnouncements.map(renderAnnouncementCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AnnouncementsScreen;

