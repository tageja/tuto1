import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface CTASectionProps {
  navigation: any;
}

const EXPLORE_ITEMS = [
  {
    key: 'tutors',
    icon: 'search' as const,
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    title: 'Find a Tutor',
    subtitle: 'Browse expert teachers near you',
    screen: 'AllSubjects',
  },
  {
    key: 'social',
    icon: 'dynamic-feed' as const,
    iconBg: '#FFF0F6',
    iconColor: '#DB2777',
    title: 'Tuto Social',
    subtitle: 'Community feed & updates',
    screen: 'Feed',
  },
];

export const CTASection: React.FC<CTASectionProps> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();

  const styles = StyleSheet.create({
    container: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
    header: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    sectionTitle: { fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text.primary },
    list: { paddingHorizontal: spacing.md, gap: 8 },
    item: {
      backgroundColor: colors.background.primary,
      borderRadius: 14,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    body: { flex: 1 },
    itemTitle: { fontSize: 13, fontFamily: typography.fontFamily.semiBold, color: colors.text.primary },
    itemSub: { fontSize: 11, color: colors.text.secondary, marginTop: 1 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Explore Tuto</Text>
      </View>
      <View style={styles.list}>
        {EXPLORE_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
              <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={styles.body}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSub}>{item.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.text.light} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
