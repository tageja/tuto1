import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchool } from '../../contexts/SchoolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchRecentActivity, type ActivityItem } from '../../services/home-dashboard';

interface FeatureGridSectionProps {
  navigation?: any;
}

export const FeatureGridSection: React.FC<FeatureGridSectionProps> = ({ navigation }) => {
  const { currentSchool } = useSchool();
  const { colors, spacing, typography } = useTheme();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentSchool?.id) return;
    setLoading(true);
    fetchRecentActivity(currentSchool.id)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [currentSchool?.id]);

  const styles = StyleSheet.create({
    container: { paddingTop: spacing.md },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    sectionTitle: { fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text.primary },
    seeAll: { fontSize: 12, color: colors.primary, fontFamily: typography.fontFamily.semiBold },
    list: { paddingHorizontal: spacing.md, gap: 8 },
    item: {
      backgroundColor: colors.background.primary,
      borderRadius: 14,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    body: { flex: 1, minWidth: 0 },
    itemTitle: { fontSize: 12, fontFamily: typography.fontFamily.semiBold, color: colors.text.primary, marginBottom: 1 },
    itemSub: { fontSize: 10, color: colors.text.secondary },
    tag: { fontSize: 9, fontFamily: typography.fontFamily.semiBold, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100, marginTop: 4, alignSelf: 'flex-start' },
    timeText: { fontSize: 9, color: colors.text.light },
    emptyWrap: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg, alignItems: 'center' },
    emptyText: { fontSize: 13, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
  });

  if (!currentSchool) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Join a school to see recent activity</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {navigation && items.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('SchoolDashboard')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No recent activity yet</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                <MaterialIcons name={item.iconName as any} size={18} color={item.tagColor} />
              </View>
              <View style={styles.body}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{item.subtitle}</Text>
                <Text style={[styles.tag, { backgroundColor: item.tagBg, color: item.tagColor }]}>
                  {item.tag}
                </Text>
              </View>
              <Text style={styles.timeText}>{item.timeAgo}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
