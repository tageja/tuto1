/**
 * Moderation Screen
 * 
 * Admin interface for reviewing and managing content reports.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { ModerationService, Report, ReportType, ModerationStats } from '../services/moderation';

// Theme constants
const colors = {
  primary: '#0B5FFF',
  background: {
    primary: '#FFFFFF',
  },
  surface: '#F9FAFC',
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
  border: {
    light: '#E5E5E5',
  },
  error: '#FF3B30',
};

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface ModerationScreenProps {
  navigation: any;
}

export const ModerationScreen: React.FC<ModerationScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { userData } = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');

  // Check if user is admin
  const isAdmin = userData?.type === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadModerationQueue();
    }
  }, [isAdmin, selectedStatus]);

  const loadModerationQueue = async () => {
    try {
      setLoading(true);
      const result = await ModerationService.getModerationQueue(selectedStatus, 50);
      setReports(result.reports);
      setStats(result.stats);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
      Alert.alert('Error', 'Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadModerationQueue();
    setRefreshing(false);
  };

  const handleResolveReport = async (reportId: string, action: string) => {
    try {
      const status = action === 'dismiss' ? 'dismissed' : 'resolved';
      await ModerationService.resolveReport(reportId, status, undefined, action);
      
      Alert.alert('Success', 'Report resolved successfully');
      loadModerationQueue();
    } catch (error) {
      console.error('Error resolving report:', error);
      Alert.alert('Error', 'Failed to resolve report');
    }
  };

  const showResolveOptions = (report: Report) => {
    Alert.alert(
      'Resolve Report',
      `Report Type: ${ModerationService.getReportTypeDisplayName(report.reportType)}\n\nDescription: ${report.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Dismiss', onPress: () => handleResolveReport(report.id, 'dismiss') },
        { text: 'Remove Content', onPress: () => handleResolveReport(report.id, 'remove_content') },
        { text: 'Warn User', onPress: () => handleResolveReport(report.id, 'warn_user') },
        { text: 'Suspend User', onPress: () => handleResolveReport(report.id, 'suspend_user') },
      ]
    );
  };

  const renderReport = ({ item: report }: { item: Report }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => showResolveOptions(report)}
    >
      <View style={styles.reportHeader}>
        <Text style={styles.reportType}>
          {ModerationService.getReportTypeDisplayName(report.reportType)}
        </Text>
        <Text style={styles.reportTime}>
          {new Date(report.timestamp).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.reportDescription} numberOfLines={3}>
        {report.description}
      </Text>
      
      <View style={styles.reportMeta}>
        <Text style={styles.reportMetaText}>
          Reporter: {report.reporterId}
        </Text>
        {report.reportedUserId && (
          <Text style={styles.reportMetaText}>
            Reported User: {report.reportedUserId}
          </Text>
        )}
        {report.reportedPostId && (
          <Text style={styles.reportMetaText}>
            Post ID: {report.reportedPostId}
          </Text>
        )}
      </View>
      
      <View style={styles.reportActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dismissButton]}
          onPress={() => handleResolveReport(report.id, 'dismiss')}
        >
          <Text style={styles.actionButtonText}>Dismiss</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.resolveButton]}
          onPress={() => handleResolveReport(report.id, 'remove_content')}
        >
          <Text style={styles.actionButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Moderation Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalReports}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.pendingReports}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.resolvedReports}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.blockedUsers}</Text>
            <Text style={styles.statLabel}>Blocked Users</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="block" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorMessage}>
            You need admin privileges to access this screen.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading moderation queue...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Content Moderation</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {renderStats()}

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedStatus === 'pending' && styles.filterButtonActive]}
          onPress={() => setSelectedStatus('pending')}
        >
          <Text style={[styles.filterButtonText, selectedStatus === 'pending' && styles.filterButtonTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedStatus === 'resolved' && styles.filterButtonActive]}
          onPress={() => setSelectedStatus('resolved')}
        >
          <Text style={[styles.filterButtonText, selectedStatus === 'resolved' && styles.filterButtonTextActive]}>
            Resolved
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>No Reports</Text>
            <Text style={styles.emptyMessage}>
              No {selectedStatus} reports found.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  statsContainer: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.background.primary,
  },
  listContainer: {
    padding: spacing.lg,
  },
  reportCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportType: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  reportTime: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  reportDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  reportMeta: {
    marginBottom: spacing.md,
  },
  reportMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  dismissButton: {
    backgroundColor: colors.text.secondary,
  },
  resolveButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.background.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
